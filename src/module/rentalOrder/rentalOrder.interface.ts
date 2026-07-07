export interface IrentalOrder {
  customerId: string;
  pickupDate: Date;
  returnDate: Date;
  items: {
    gearItemId: string;
    quantity: number;
  }[];
  actualRentAmount: number;
  totalDiscount: number;
}