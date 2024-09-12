import Route from "../models/Route.model";
import Stop from "../models/Stop.model";
import { readCsv } from "../utils/readCsv"
import csvParser from 'csv-parser';

export const createCsvStopService = async (fileBuffer: any, date: string) => {
    try {
        let savedStops = []
        const fileStream = readCsv(fileBuffer);
        fileStream.pipe(csvParser())
            .on('data', async (data) => {
                try {
                    let routeId;
                    const existingRoute = await Route.findOne({
                        where: {
                            routeId: data.ROUTE,
                            uploadDate: date
                        }
                    })
                    if (existingRoute) {
                        routeId = existingRoute.get("id");
                    }
                    else {
                        const newRoute = await Route.create({
                            routeId: data.ROUTE,
                            uploadDate: date
                        });
                        routeId = newRoute.get("id");
                    }
                    const record = {
                        stopId: data.ROUTESTOP || null,
                        latitude: data.SGPSLAT || null,
                        longitude: data.SGPSLON || null,
                        // longitude: data.SGPSLON ? data.SGPSLON.replace(/-$/, '') : null,
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
                        oneTimePickup: data.WLIN3 ? true : false,
                        message: data['W-MSG1'] || null,
                    };

                    const newStop = await Stop.create(record);
                    savedStops.push(newStop);

                } catch (err) {
                    console.log(err)
                    // errors.push({ message: 'Error processing record', data, error: err.message });
                }
            })
            // .on('end', async () => {
            //     try {
            //         if (errors.length > 0) {
            //             return res.status(400).json({ message: 'Errors found in file processing', errors, error: true });
            //         }

            //         if (existingData.length > 0) {

            //             await Promise.all(
            //                 results.map(async (record) => {
            //                     await Map.update(record, { where: { id: record.id, upload_date: date } });
            //                 })
            //             );
            //             return res.status(200).json({ message: 'Data updated successfully', error: false });
            //         } else {

            //             await Map.bulkCreate(results);
            //             return res.status(201).json({ message: 'Data uploaded successfully', error: false });
            //         }
            //     } catch (err) {
            //         console.log(err)
            //         return res.status(500).json({ message: 'Failed to process data', error: true });
            //     }
            // })
            .on('error', (error) => {
                throw new Error('Error processing file stream')
            });
    } catch (error) {
        throw error;
    }
}