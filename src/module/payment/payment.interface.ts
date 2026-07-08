import { paymentsWhereInput } from "../../../generated/prisma/models";

export interface IpaymentQuery extends paymentsWhereInput {
  page?: string;
  limit?: string;
  sortBy?: string;
  searchTerm?: string;
  sortOrder?: 'asc' | 'desc';
}