import moment from "moment";
import ActiveRoutes from "../models/ActiveRoutes.model";
import AssignedRoute from "../models/AssignedRoutes.model";
import Driver from "../models/Driver.model";
import Route from "../models/Route.model"
import Stop from "../models/Stop.model"
import HttpError from "../utils/httpError";
import { AssignRouteProps, GetRouteProps } from "../utils/types";
import { Op, where } from 'sequelize';

export const getAllRouteService = async (startDate: string, endDate: string): Promise<any | null> => {
    try {
        const allDrivers = await Route.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });
        return allDrivers.length > 0 ? allDrivers : null;
    } catch (error) {
        console.error('Error fetching routes:', error);
        throw error;
    }
};

export const getRouteService = async ({
    date,
    status,
    driverId,
    routeId,
}: GetRouteProps) => {
    try {
        const whereClause: any = {
            uploadDate: date
        }
        if (status) {
            whereClause.status = status
        }
        if (routeId) {
            whereClause.id = routeId
        }

        // Fetch all routes based on the provided query parameters (date, status, driverId)
        const allRoutes = await Route.findAll({
            where: whereClause,
            order: [
                ['routeId', 'ASC'],   // Order the routes by 'routeId' in ascending order
                [{ model: Stop, as: 'stops' }, 'stopId', 'ASC'],  // Order the stops by 'stopId' in ascending order
            ],
            include: [
                {
                    model: AssignedRoute,
                    as: 'assignedRoutes',
                    required: false,  // Only include routes that have assigned routes
                    include: [
                        {
                            model: Driver,
                            as: 'assignedDriver',  // Include the associated driver if necessary
                        }
                    ]
                },
                {
                    model: Stop,
                    as: 'stops',
                }
            ],
        });

        let faultyStops: any = [];
        const routes = allRoutes.map((routeData: any) => {
            let filteredStops: any = [];
            routeData.get("stops").forEach((stop: any) => {
                if (!stop.faulty) {
                    filteredStops.push({
                        ...(stop.get()),
                        routeNo: routeData.routeId
                    });  // Collect valid stops, and return them
                } else {
                    faultyStops.push({
                        ...(stop.get()),
                        routeNo: routeData.routeId
                    });  // Collect faulty stops, but don't return anything
                }
            });

            return {
                ...routeData.get(),
                stops: filteredStops
            };
        });
        return { data: routes, faultyStops };
    } catch (error) {
        throw error;
    }
}

export const assignRouteService = async ({ driverId, routeId }: AssignRouteProps) => {
    try {
        const assigneAlready = await AssignedRoute.findOne({
            where: {
                routeId
            }
        })
        if (assigneAlready) {
            if (assigneAlready.get('driverId') === driverId) {
                throw new Error('Driver is already assigned to this route')
            }
            throw new Error('Route is assigned to other driver')
        }
        const assignedRoute = await AssignedRoute.create({
            routeId,
            driverId,
        })
        return assignedRoute;
    } catch (error: any) {
        throw (error?.errors?.[0]?.message) ? new HttpError((error?.errors?.[0]?.message), 409) : error
    }
}

export const getAssignedRoutesService = async (driverId: string | undefined, date: string | undefined) => {
    try {
        let whereClause: any = {}, dateFilter = {}
        if (driverId) {
            whereClause = {
                driverId
            }
        }
        if (date) {
            dateFilter = {
                uploadDate: date
            }
        }

        const assignedRoutes = await Route.findAll({
            where: dateFilter,
            order: [
                ['routeId', 'ASC'],   // Order the routes by 'routeId' in ascending order
                [{ model: Stop, as: 'stops' }, 'stopId', 'ASC'],  // Order the stops by 'stopId' in ascending order
            ],
            include: [
                {
                    model: AssignedRoute,
                    as: 'assignedRoutes',
                    where: whereClause,
                    required: true,  // Only include routes that have assigned routes
                    include: [
                        {
                            model: Driver,
                            as: 'assignedDriver',  // Include the associated driver if necessary
                        }
                    ]
                },
                {
                    model: Stop,
                    as: 'stops',
                }
            ],
        });

        let faultyStops: any = [];
        const routes = assignedRoutes.map((routeData: any) => {
            let filteredStops: any = [];
            routeData.get("stops").forEach((stop: any) => {
                if (!stop.faulty) {
                    filteredStops.push({
                        ...(stop.get()),
                        routeNo: routeData.routeId
                    });  // Collect valid stops, and return them
                } else {
                    faultyStops.push({
                        ...(stop.get()),
                        routeNo: routeData.routeId
                    });  // Collect faulty stops, but don't return anything
                }
            });

            return {
                ...routeData.get(),
                stops: filteredStops
            };

        });
        return { data: routes, faultyStops };
        // const assignedRoutes = await AssignedRoute.findAll({
        //     where: whereClause,
        //     order: [
        //         // First, sort by 'routeId' from the 'Route' model (aliased as 'assignedRoute')
        //         [{ model: Route, as: 'assignedRoute' }, 'routeId', 'ASC'],   
        //         // Sort by 'stopId' within the 'stops' association inside 'assignedRoute'
        //         [ { model: Route, as: 'assignedRoute' }, { model: Stop, as: 'stops' }, 'stopId', 'ASC' ],
        //     ],
        //     include: [
        //         {
        //             model: Route,
        //             as: 'assignedRoute', // Alias must match the association definition
        //             include: [
        //                 {
        //                     model: Stop,
        //                     as: 'stops',  // Alias for the Stop model
        //                 }
        //             ]
        //         },
        //         {
        //             model: Driver,
        //             as: 'assignedDriver',
        //         }
        //     ]
        // });


        return assignedRoutes;
    } catch (error) {
        throw error;
    }
}

export const createActiveRouteService = async (driverId: string, routeId: string) => {
    try {
        const [assignedRoute, alreadyActive] = await Promise.all([
            AssignedRoute.findOne({
                where: {
                    routeId,
                    driverId
                }
            }),
            ActiveRoutes.findOne({
                where: {
                    routeId,
                    driverId
                }
            })
        ])
        if (!assignedRoute) {
            throw new HttpError('Driver is not assigned to this route', 409)
        }
        if (alreadyActive) {
            throw new HttpError('Route is already active for this driver', 409)
        }
        const activeRoute = await ActiveRoutes.create({
            routeId,
            driverId,
        })
        return activeRoute;
    } catch (error: any) {
        console.log(error);
        throw (error?.errors?.[0]?.message) ? new HttpError((error?.errors?.[0]?.message), 409) : error
    }
}

export const getActiveRoutesService = async (driverId: string | undefined) => {
    try {
        let whereClause: any = {
            finishedAt: null
        }
        if (driverId) {
            whereClause.driverId = driverId
        }

        const activeRoutes = await Route.findAll({
            order: [
                ['routeId', 'ASC'],   // Order the routes by 'routeId' in ascending order
                [{ model: Stop, as: 'stops' }, 'stopId', 'ASC'],
            ],
            include: [
                {
                    model: ActiveRoutes,
                    as: 'route',
                    where: whereClause,
                    required: true,  // Only include routes that have assigned routes
                    include: [
                        {
                            model: Driver,
                            as: 'driver',  // Include the associated driver if necessary
                        }
                    ]
                },
                {
                    model: Stop,
                    as: 'stops',
                }
            ],
        });

        return activeRoutes;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const finishRouteService = async (driverId: string, routeId: string) => {
    try {
        let whereClause: any = {
            routeId
        }
        if (driverId) {
            whereClause.driverId = driverId
        }

        const [[updatedRows], destroyed] = await Promise.all([
            ActiveRoutes.update({
                finishedAt: new Date(),
            }, {
                where: whereClause
            }),
            AssignedRoute.destroy({
                where: whereClause
            }),
            Route.update({
                status: 'COMPLETED',
                completionTime: new Date()
            }, {
                where: {
                    id: routeId,
                }
            })
        ])

        if (updatedRows === 0) {
            throw new HttpError('No active route found for this driver and route', 400)
        }

        console.log("destroyed: ", destroyed);

        return updatedRows;

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const unAssignRouteService = async (driverId: string, routeId: string) => {
    try {
        const destroy = AssignedRoute.destroy({
            where: {
                driverId,
                routeId
            }
        })
        return destroy;
    } catch (error) {
        throw error;
    }
}