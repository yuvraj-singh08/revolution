import { officeCoordinate } from "../config/constants";
import Route from "../models/Route.model";
import Stop from "../models/Stop.model";
import { readCsv } from "../utils/readCsv"
import csvParser from 'csv-parser';
import { StopStatusType } from "../utils/types";
import HttpError from "../utils/httpError";

export const createCsvStopService = async (fileBuffer: any, date: string): Promise<any> => {
    try {
        let savedStops: any = []
        let faultyStops: any = []
        const fileStream = readCsv(fileBuffer);
        const csvData = await new Promise<any[]>((resolve, reject) => {
            const rows: any[] = [];
            fileStream.pipe(csvParser())
                .on('data', (data) => rows.push(data))
                .on('end', () => resolve(rows))
                .on('error', (error) => reject(error));
        });

        let errorCount = 0
        let stopsRepeated = 0
        let createdRouteId: Map<string, string> = new Map(); // Map to store ROUTE as key and newRoute id as value

        console.log("Reading done");
        const routePromises = csvData.map(async (data) => {
            try {
                if (createdRouteId.has(data.ROUTE)) {
                    return; // Skip if the route is already processed
                }
        
                // const existingRoute = await Route.findOne({
                //     where: {
                //         routeId: data.ROUTE,
                //         uploadDate: date
                //     }
                // });
        
                // if (!existingRoute) {
                const newRoute = await Route.create({
                    routeId: data.ROUTE,
                    uploadDate: date,
                });
        
                // Store ROUTE and corresponding db id in the hash map
                const newRouteData = newRoute.get() as unknown as any
                
                createdRouteId.set(data.ROUTE, newRouteData.id);
                return newRoute;
                // }
            } catch (error) {
                console.log(error);
            }
        });
        
        const newRoutes = await Promise.all(routePromises);
        console.log("Routes created");

        const promises = csvData.map( async (data) => {
            try {
                const  routeId = createdRouteId.get(data.ROUTE)

                const record = {
                    stopId: data.ROUTESTOP || null,
                    latitude: data.SGPSLAT || null,
                    longitude: data.SGPSLON || null,
                    routeId: routeId || null,
                    serveAddress: data.SERVADDR || null,
                    accountNumber: data['ACCT#'] || null,
                    uploadDate: date,
                    city: data['W-CITY'] || null,
                    serveName: data.SERVNAME || null,
                    serveQty: data.SERVQTY || null,
                    serveType: data.SERVTYPE || null,
                    phone: data.SERVPHONE || null,
                    containerId: data.CONTAINER1 || null,
                    oneTimePickup: !!data.WLIN3,
                    message: data['W-MSG1'] || null,
                    faulty: false,
                };

                // const existingRecord = await Stop.findOne({
                //     where: {
                //         latitude: record.latitude,
                //         longitude: record.longitude,
                //         routeId: record.routeId,
                //         serveAddress: record.serveAddress,
                //         uploadDate: record.uploadDate,
                //     }
                // });

                // if (!existingRecord) {
                    if (record.latitude === null || record.longitude === null) {
                        record.faulty = true
                        faultyStops.push(record);
                    } else {
                        savedStops.push(record);
                    }
                    const newStop = await Stop.create(record);
                // } else {
                //     stopsRepeated++;
                //     console.log('Stop already exists, skipping');
                // }
            } catch (err) {
                console.log(err);
                errorCount++;
                // Handle individual record processing errors here
            }
        })

        const result = await Promise.allSettled(promises)

        return { stopsRepeated, errorCount, data: savedStops, faultyStops };

    } catch (error) {
        throw error;
    }
}

// export const createCsvStopService = async (fileBuffer: any, date: string): Promise<any> => {
//     try {
//         let savedStops: any = []
//         let faultyStops: any = []
//         const fileStream = readCsv(fileBuffer);
//         const csvData = await new Promise<any[]>((resolve, reject) => {
//             const rows: any[] = [];
//             fileStream.pipe(csvParser())
//                 .on('data', (data) => rows.push(data))
//                 .on('end', () => resolve(rows))
//                 .on('error', (error) => reject(error));
//         });

//         let errorCount = 0
//         let stopsRepeated = 0

//         for (const data of csvData) {
//             try {
//                 let routeId;
//                 const existingRoute = await Route.findOne({
//                     where: {
//                         routeId: data.ROUTE,
//                         uploadDate: date
//                     }
//                 });

//                 if (existingRoute) {
//                     routeId = existingRoute.get("id");
//                 } else {
//                     const newRoute = await Route.create({
//                         routeId: data.ROUTE,
//                         uploadDate: date
//                     });
//                     routeId = newRoute.get("id");
//                 }

//                 const record = {
//                     stopId: data.ROUTESTOP || null,
//                     latitude: data.SGPSLAT || null,
//                     longitude: data.SGPSLON || null,
//                     routeId: routeId || null,
//                     serveAddress: data.SERVADDR || null,
//                     accountNumber: data['ACCT#'] || null,
//                     uploadDate: date,
//                     city: data['W-CITY'] || null,
//                     serveName: data.SERVNAME || null,
//                     serveQty: data.SERVQTY || null,
//                     serveType: data.SERVTYPE || null,
//                     phone: data.SERVPHONE || null,
//                     containerId: data.CONTAINER1 || null,
//                     oneTimePickup: !!data.WLIN3,
//                     message: data['W-MSG1'] || null,
//                     faulty: false,
//                 };

//                 const existingRecord = await Stop.findOne({
//                     where: {
//                         latitude: record.latitude,
//                         longitude: record.longitude,
//                         routeId: record.routeId,
//                         serveAddress: record.serveAddress,
//                         uploadDate: record.uploadDate,
//                     }
//                 });

//                 if (!existingRecord) {
//                     if (record.latitude === null || record.longitude === null) {
//                         record.faulty = true
//                         faultyStops.push(record);
//                     } else {
//                         savedStops.push(record);
//                     }
//                     const newStop = await Stop.create(record);
//                 } else {
//                     stopsRepeated++;
//                     console.log('Stop already exists, skipping');
//                 }
//             } catch (err) {
//                 console.log(err);
//                 errorCount++;
//                 // Handle individual record processing errors here
//             }
//         }

//         return { stopsRepeated, errorCount, data: savedStops, faultyStops };

//     } catch (error) {
//         throw error;
//     }
// }

export const updateBulkStopService = async (data: any) => {
    try {
        if (!data || data.length === 0) {
            console.log("No data provided for updates.");
            return;
        }

        const promises = data.map((stop: { id: number;[key: string]: any }) => {
            const { id, ...rest } = stop; // Destructure and exclude id
            if (!id) {
                return Promise.reject(new Error("Missing id for stop"));
            }
            return Stop.update(rest, { where: { id } });
        });

        const result = await Promise.allSettled(promises);

        // Handle results
        result.forEach((res, index) => {
            if (res.status === "rejected") {
                console.error(`Failed to update stop at index ${index}:`, res.reason);
            }
        });
    } catch (error) {
        throw error;
    }
}

export const updateStopService = async (data: any) => {
    try {
        if (!data) {
            throw new Error("No data provided");
        }
        const id = data.id;
        delete data.id;
        const [updatedStop] = await Stop.update({
            ...data
        },
            {
                where: {
                    id
                }
            })
        if (updatedStop === 0) {
            throw new Error("Failed to update")
        }
        return updatedStop;
    } catch (error) {
        throw error;
    }
}

export const getStopsService  = async (date: string | undefined, status:string | undefined) => {
    try {
        let whereClause:any = {}
        if (date) {
            whereClause['uploadDate'] = date;
        }
        if(status){
            whereClause['status'] = status;
        }
        const stops = await Stop.findAll({
            where:whereClause
        })
        return stops;
    } catch (error: any) {
        console.log(error);
        throw new HttpError(error.message, 400);
    }
} 

// export const addStopService = async (stopData: any) => {
//     try {
//         const newStop = 
//     } catch (error) {
        
//     }
// }

// export const createCsvStopService = async (fileBuffer: any, date: string): Promise<any> => {
//     try {
//         let savedStops: any = []
//         let faultyStops: any = []
//         const fileStream = readCsv(fileBuffer);
//         const csvData = await new Promise<any[]>((resolve, reject) => {
//             const rows: any[] = [];
//             fileStream.pipe(csvParser())
//                 .on('data', (data) => rows.push(data))
//                 .on('end', () => resolve(rows))
//                 .on('error', (error) => reject(error));
//         });

//         const promises = csvData.map(async (data) => {
//            try {
//             let routeId;
//             const existingRoute = await Route.findOne({
//                 where: {
//                     routeId: data.ROUTE,
//                     uploadDate: date
//                 }
//             });

//             if (existingRoute) {
//                 routeId = existingRoute.get("id");
//             } else {
//                 const newRoute = await Route.create({
//                     routeId: data.ROUTE,
//                     uploadDate: date
//                 });
//                 routeId = newRoute.get("id");
//             }

//             const record = {
//                 stopId: data.ROUTESTOP || null,
//                 latitude: data.SGPSLAT || null,
//                 longitude: data.SGPSLON || null,
//                 routeId: routeId || null,
//                 serveAddress: data.SERVADDR || null,
//                 accountNumber: data['ACCT#'] || null,
//                 uploadDate: date,
//                 city: data['W-CITY'] || null,
//                 serveName: data.SERVNAME || null,
//                 serveQty: data.SERVQTY || null,
//                 serveType: data.SERVTYPE || null,
//                 phone: data.SERVPHONE || null,
//                 containerId: data.CONTAINER1 || null,
//                 oneTimePickup: !!data.WLIN3,
//                 message: data['W-MSG1'] || null,
//                 faulty: false
//             };

//             const existingRecord = await Stop.findOne({
//                 where: {
//                     latitude: record.latitude,
//                     longitude: record.longitude,
//                     routeId: record.routeId,
//                     serveAddress: record.serveAddress,
//                     uploadDate: record.uploadDate,
//                 }
//             });

//             if (!existingRecord) {
//                 if (record.latitude === null || record.longitude === null) {
//                     record.faulty = true
//                     faultyStops.push(record);
//                 } else {
//                     savedStops.push(record);
//                 }
//                 console.log(record);
//                 const newStop = await Stop.create(record);
//                 return newStop;
//             } else {
//                 console.log('Stop already exists, skipping');

//             }
//            } catch (error) {
//             console.log(error);
//            }
//         })
//         try {
//             const result = await Promise.all(promises)
//         } catch (error) {
//             console.log(error);
//         }
//         return { data:savedStops, faultyStops };
//         // fileStream.pipe(csvParser())
//         //     .on('data', async (data) => {
//         //         try {
//         //             let routeId;
//         //             const existingRoute = await Route.findOne({
//         //                 where: {
//         //                     routeId: data.ROUTE,
//         //                     uploadDate: date
//         //                 }
//         //             })
//         //             if (existingRoute) {
//         //                 routeId = existingRoute.get("id");
//         //             }
//         //             else {
//         //                 const newRoute = await Route.create({
//         //                     routeId: data.ROUTE,
//         //                     uploadDate: date
//         //                 });
//         //                 routeId = newRoute.get("id");
//         //             }
//         //             const record = {
//         //                 stopId: data.ROUTESTOP || null,
//         //                 latitude: data.SGPSLAT || null,
//         //                 longitude: data.SGPSLON || null,
//         //                 // longitude: data.SGPSLON ? data.SGPSLON.replace(/-$/, '') : null,
//         //                 routeId: routeId || null,
//         //                 serveAddress: data.SERVADDR || null,
//         //                 accountNumber: data['ACCT#'] || null,
//         //                 uploadDate: date,
//         //                 city: data['W-CITY'] || null,
//         //                 serveName: data.SERVNAME || null,
//         //                 serveQty: data.SERVQTY || null,
//         //                 serveType: data.SERVTYPE || null,
//         //                 phone: data.SERVPHONE || null,
//         //                 containerId: data.CONTAINER1 || null,
//         //                 oneTimePickup: data.WLIN3 ? true : false,
//         //                 message: data['W-MSG1'] || null,
//         //             };
//         //             const existingRecord = await Stop.findOne({
//         //                 where: record
//         //             })
//         //             if (existingRecord) {
//         //                 console.log('Stop already exists, skipping')
//         //                 return;
//         //             }

//         //             const newStop = await Stop.create(record);
//         //             if (record.latitude === null || record.longitude === null)
//         //                 faultyStops.push(newStop);
//         //             else
//         //                 savedStops.push(newStop);

//         //         } catch (err) {
//         //             console.log(err)
//         //             // errors.push({ message: 'Error processing record', data, error: err.message });
//         //         }
//         //     })
//         //     // .on('end', async () => {
//         //     //     try {
//         //     //         if (errors.length > 0) {
//         //     //             return res.status(400).json({ message: 'Errors found in file processing', errors, error: true });
//         //     //         }

//         //     //         if (existingData.length > 0) {

//         //     //             await Promise.all(
//         //     //                 results.map(async (record) => {
//         //     //                     await Map.update(record, { where: { id: record.id, upload_date: date } });
//         //     //                 })
//         //     //             );
//         //     //             return res.status(200).json({ message: 'Data updated successfully', error: false });
//         //     //         } else {

//         //     //             await Map.bulkCreate(results);
//         //     //             return res.status(201).json({ message: 'Data uploaded successfully', error: false });
//         //     //         }
//         //     //     } catch (err) {
//         //     //         console.log(err)
//         //     //         return res.status(500).json({ message: 'Failed to process data', error: true });
//         //     //     }
//         //     // })
//         //     .on('error', (error) => {
//         //         throw new Error('Error processing file stream')
//         //     });
//         // return { faultyStops, savedStops };
//     } catch (error) {
//         throw error;
//     }
// }