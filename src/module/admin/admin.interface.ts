import { ActiveStatus } from "../../../generated/prisma/client";
import { UserWhereInput } from "../../../generated/prisma/models";

export interface IuserSearchQuery extends UserWhereInput {
    activeStatus?: ActiveStatus;
    page?: string;
    limit?: string;
    sortBy?: string;
    searchTerm?: string;
    sortOrder?: 'asc' | 'desc';
}