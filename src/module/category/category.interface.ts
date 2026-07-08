import { categoriesWhereInput } from "../../../generated/prisma/models";

 export interface Icategory  {
    id?: string;
    name: string;
    description?: string;
    image?: string;
}


export interface IcategorySearchQuery  extends categoriesWhereInput {
   page?: string;
    limit?: string;
    sortBy?: string;
    searchTerm?: string;
    sortOrder?: 'asc' | 'desc';
}