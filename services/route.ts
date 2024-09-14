import AssignedRoute from "../models/AssignedRoutes.model";
import Driver from "../models/Driver.model";
import Route from "../models/Route.model"
import Stop from "../models/Stop.model"
import { AssignRouteProps, GetRouteProps, StopStatusType } from "../utils/types";

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
                ['routeId', 'ASC'],
            ],
            include: [
                {
                    model: Stop,
                    as: 'stops',
                }
            ]
        })
        let faultyStops: any = [];
        const routes = allRoutes.map((routeData: any) => {
            const filteredStops = routeData.get("stops").filter((stop: any) => {
                if (!stop.faulty) {
                    return true;  // Include in the filtered array
                } else {
                    faultyStops.push({
                        ...(stop.get()),
                        routeNo: routeData.routeId
                    });  // Collect faulty stops, but don't return anything
                    return false;  // Exclude from the filtered array
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
    } catch (error) {
        throw error;
    }
}

export const getAssignedRoutesService = async (driverId: string | undefined) => {
    try {
        let whereClause: any = {}
        if (driverId) {
            whereClause = {
                driverId
            }
        }
        const assignedRoutes = await AssignedRoute.findAll({
            where: whereClause,
            include: [
                {
                    model: Route,
                    as: 'assignedRoute',// Same as assigned in association
                },
                {
                    model: Driver,
                    as: 'assignedDriver',
                }
            ]
        })
        return assignedRoutes;
    } catch (error) {
        throw error;
    }
}