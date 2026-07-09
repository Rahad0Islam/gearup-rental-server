import { RentalOrderWhereInput } from "../../../generated/prisma/models";

export interface IrentalOrder {
  customerId: string;
  pickupDate: Date;
  returnDate: Date;
  status: string;
  items: {
    gearItemId: string;
    quantity: number;
  }[];
  actualRentAmount: number;
  totalDiscount: number;
}



export interface IrentalOrderQuery extends RentalOrderWhereInput {
  page?: string;
  limit?: string;
  sortBy?: string;
  searchTerm?: string;
  sortOrder?: 'asc' | 'desc';
}