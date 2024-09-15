export interface CreateDriverProps {
    email: string,
    password: string,
    name: string,
}

export interface UpdateDriverProps {
    id?:string;
    licenseNo?: string;
    name?: string;
    ssnNo?: string;
    dob?: Date;
    driverType?: string;
    status?: string;
    mobileNo?: string;
    email?: string;
    password?:string;
    active?:Boolean;
    truckNo?:string;
}

export interface CreateAdminProps {
    email: string,
    password: string,
    name: string,
}

export type UserActionType = {
    type: "create" | "read" | "update" | "delete"
}

export type ResourceType = "driver" | "csv"


export interface LoginAdminProps {
    email: string,
    password: string,
}

export interface LoginDriverProps {
    email: string,
    password: string,
}

export type StopStatusType = "PENDING" | "COMPLETED" | "EXCEPTION_HANDLED" | "EXCEPTION"

export type GetRouteProps = {
    date: string,
    status?: string,
    driverId?: string,
    routeId?: string,
}

export type AssignRouteProps = {
    routeId: string,
    driverId: string,
}

export type AddStopParams = {
    routeId: number,
    latitude: number,
    date: string,
    longitude: number,
    status: StopStatusType,
    stopId: number,
    serveAddress?: string,
    accountNumber: string,
}