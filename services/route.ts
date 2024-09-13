import Route from "../models/Route.model"
import Stop from "../models/Stop.model"
import { GetRouteProps, StopStatusType } from "../utils/types";

export const getRouteService = async ({
    date,
    status,
    driverId,
}: GetRouteProps) => {
    try {
        const whereClause: any = {
            uploadDate: date
        }
        if (status) {
            whereClause.status = status
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
                    faultyStops.push(stop);  // Collect faulty stops, but don't return anything
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