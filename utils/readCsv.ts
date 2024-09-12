import { PassThrough } from 'stream';

export const readCsv = (fileBuffer: any) => {
    try {
        const fileStream = new PassThrough();
        fileStream.end(fileBuffer);
        return fileStream
    } catch (error) {
        throw error
    }
}