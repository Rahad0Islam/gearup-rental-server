import { gearItemStatus } from "../../../generated/prisma/enums";

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

