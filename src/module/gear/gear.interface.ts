import { gearItemStatus } from "../../../generated/prisma/enums";
import { gearItemsWhereInput } from "../../../generated/prisma/models";

export interface Igear {
  name: string;
  description: string;
  rentPricePerDay: number;
  discountPrice?: number;
  stock: number;
  availableStock?: number;
  status?: gearItemStatus;
  image?: string;
}


export interface IgearSearchQuery extends gearItemsWhereInput {
  page?: string;
  limit?: string;
  sortBy?: string;
  searchTerm?: string;
  sortOrder?: 'asc' | 'desc';
}
