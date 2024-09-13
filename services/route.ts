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
        const routes = await Route.findAll({
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
        return routes;
    } catch (error) {
        throw error;
    }
}