import { ActiveStatus, Role } from "../../../generated/prisma/client";

export interface Iregister {
    name: string;
    email: string;
    password: string;
    role? : Role
}

export interface Ilogin {
    email: string;
    password: string;
}

export interface IjwtPayload {
     id: string;
     name: string;
     email: string;
     role: Role;
     activeStatus: ActiveStatus;
}