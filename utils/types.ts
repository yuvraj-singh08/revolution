export interface CreateDriverProps {
    email: string,
    password: string,
    name: string,
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

export type StopStatusType = "PENDING" | "COMPLETED" | "EXCEPTION_HANDLED" | "EXCEPTION"

export type GetRouteProps = {
    date: string,
    status?: string,
    driverId?: string,
}