import { rentalOrderStatus, Role } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IrentalOrder } from "./rentalOrder.interface";

const createRentalOrderInDb = async (rentalOrderData: IrentalOrder,customerId: string,) => {
  const { pickupDate, returnDate, items:gearItems } = rentalOrderData;
 
  if (!pickupDate || !returnDate) {
    throw new Error("Pickup date and return date are required.");
  }
  
  // console.log(gearItems)
  if (!gearItems || gearItems.length === 0) {
    throw new Error("At least one gear item is required.");
  }

  const pickup = new Date(pickupDate);
  const returned = new Date(returnDate);

   if(pickup < new Date()) {
    throw new Error("Pickup date cannot be in the past.");
  }

  if (pickup >= returned) {
    throw new Error("Return date must be after pickup date.");
  }

  const daysRented = Math.ceil(
    (returned.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Validate quantity first
  for (const item of gearItems) {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0.");
    }
  }

  return await prisma.$transaction(async (tx) => {
    // Fetch all gear in one query
    const gearIds = gearItems.map((item) => item.gearItemId);
    // console.log({gearItems})

    const gears = await tx.gearItems.findMany({
      where: {
        id: {
          in: gearIds,
        },
      },
    });

    const gearMap = new Map();

    gears.forEach((gear) => {
      gearMap.set(gear.id, gear);
    });

    let actualRentalPrice = 0;
    let totalDiscount = 0;
    let totalAmount = 0;

    // Calculate totals
    for (const item of gearItems) {
      const gear = gearMap.get(item.gearItemId);

      if (!gear) {
        throw new Error(`Gear ${item.gearItemId} not found.`);
      }

      if (gear.availableStock < item.quantity) {
        throw new Error(`${gear.name} has insufficient stock.`);
      }

      const originalPrice = gear.rentPricePerDay;
    
      actualRentalPrice += originalPrice * item.quantity * daysRented;

      totalDiscount += gear.discountPrice * item.quantity * daysRented;

      totalAmount += (originalPrice - gear.discountPrice) * item.quantity * daysRented;
    }

    // Create rental order
    const order = await tx.rentalOrder.create({
      data: {
        customerId,
        pickupDate: pickup,
        returnDate: returned,
        actualRentalPrice,
        totalDiscount,
        totalAmount,
      },
    });

    // Create order items + decrease stock
    for (const item of gearItems) {
      const gear = gearMap.get(item.gearItemId)!;

      

      const discount = gear.discountPrice;

      await tx.rentalOrderItems.create({
        data: {
          rentalOrderId: order.id,
          gearItemId: gear.id,
          quantity: item.quantity,
          rentalPricePerDay: gear.rentPricePerDay,
          discount,
          daysRented,
          subtotal:  (gear.rentPricePerDay - gear.discountPrice) * item.quantity * daysRented
        },
      });

      await tx.gearItems.update({
        where: {
          id: gear.id,
        },
        data: {
          availableStock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return await tx.rentalOrder.findUnique({
      where: {
        id: order.id,
      },
      include: {
        rentalOrderItems: {
          include: {
            gearItem: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });
};


const getRentalOrdersFromDb = async (userId: string, userRole: string) => {
     // ADMIN can see all orders, CUSTOMER can see their own orders, PROVIDER can see orders for their gear
  let whereClause = {};

  if (userRole === Role.CUSTOMER) {
    whereClause = { customerId: userId };
  } else if (userRole === Role.PROVIDER) {
    const providerGearItems = await prisma.gearItems.findMany({
      where: { providerId: userId },
      select: { id: true },
    });

    const providerGearItemIds = providerGearItems.map((item) => item.id);

    whereClause = {
      rentalOrderItems: {
        some: {
          gearItemId: { in: providerGearItemIds },
        },
      },
    };
  }

  return await prisma.rentalOrder.findMany({
    where: whereClause,
    include: {
      rentalOrderItems: {
        include: {
          gearItem: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};


const getRentalOrderByIdFromDb = async (rentalOrderId: string, userId: string, userRole: string) => {
    
    const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
      where: { id: rentalOrderId },
      include: {
        rentalOrderItems: {
          include: {
            gearItem: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if(userRole === Role.ADMIN){
      return rentalOrder;
    } 
    
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
     

    //for customer, check if the order belongs to them
    if( rentalOrder.customerId === userId){
       return rentalOrder;
    }

    const rentalOrderItemId = rentalOrder.rentalOrderItems[0]?.gearItem.providerId;
    if(rentalOrderItemId === userId){
      return rentalOrder;
    }

    throw new Error("You do not have permission to view this rental order.");

    

}

const deleteRentalOrderFromDb = async (rentalOrderId: string) => {

  return await prisma.$transaction(async (tx) => {
     const rentalOrder = await tx.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
    include: {
      rentalOrderItems: true,
    },
  });

  // Restore stock for each gear item in the order
  for (const item of rentalOrder.rentalOrderItems) {
    await tx.gearItems.update({
      where: { id: item.gearItemId },
      data: {
        availableStock: {
          increment: item.quantity,
        },
      },
    });
  }

  // Delete the rental order and its items
  await tx.rentalOrderItems.deleteMany({
    where: { rentalOrderId },
  });

  await tx.rentalOrder.delete({
    where: { id: rentalOrderId },
  });

  return { message: "Rental order deleted successfully." };

  });
  
};

const confirmRentalOrderInDb = async (rentalOrderId: string) => {

   
   const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
  });

  if(rentalOrder.status !== rentalOrderStatus.PLACED){
    throw new Error("Only rental orders with status 'PENDING' can be confirmed.");
  }

  return await prisma.rentalOrder.update({
    where: { id: rentalOrderId },
    data:{
      status: rentalOrderStatus.CONFIRMED
    }
  });
};


const pickupRentalOrderInDb = async (rentalOrderId: string, role: string) => {

  if(role === Role.CUSTOMER){
    throw new Error("Only ADMIN or PROVIDER can update the rental order status to 'PICKED_UP'.");
  }

  const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
  });
  
  if(rentalOrder.returnDate > new Date()){
    throw new Error("Pickup date cannot be after the return date.");
  }
  if(rentalOrder.status !== rentalOrderStatus.PAID){
     throw new Error("Only rental orders with status 'PAID' can be updated to 'PICKED_UP'.");
  }

  return await prisma.rentalOrder.update({
    where: { id: rentalOrderId },
    data:{
      status: rentalOrderStatus.PICKED_UP,
      actualPickupDate: new Date()
    }
  });
};

export const rentalOrderService = {
  createRentalOrderInDb,
  getRentalOrdersFromDb,
  getRentalOrderByIdFromDb,
  deleteRentalOrderFromDb,
  confirmRentalOrderInDb,
  pickupRentalOrderInDb
};

