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