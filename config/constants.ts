export const resources = {
    DRIVER: 'driver',
    CSV: 'csv'
}

export const actions = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete'
}

export const stopStatus = {
    pending: 'PENDING',
    completed: 'COMPLETED',
    exception: 'EXCEPTION',
    exceptionHandled: 'EXCEPTION_HANDLED'
}

export const officeCoordinate = {
    latitude: process.env.OFFICE_LAT || 0,
    longitude: process.env.OFFICE_LNG || 0
}