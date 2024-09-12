export interface CreateDriverProps{
    email: string,
    password: string,
    name: string,
}

export interface CreateAdminProps{
    email: string,
    password: string,
    name: string,
}

export type UserActionType = {
    type: "create" | "read" | "update" | "delete"
}

export type ResourceType = "driver" | "csv"


export interface LoginAdminProps{
    email: string,
    password: string,
}