import { rentalOrderStatus, Role } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IrentalOrder, IrentalOrderQuery } from "./rentalOrder.interface";

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
  
  //  if(pickup < new Date()) {
  //   throw new Error("Pickup date cannot be in the past.");
  // }

  if (pickup >= returned) {
    throw new Error("Return date must be after pickup date.");
  }

  const daysRented = Math.ceil(
    (returned.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24),
  );

  for (const item of gearItems) {
    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0.");
    }
  }

  return await prisma.$transaction(async (tx) => {

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


const getRentalOrdersFromDb = async (userId: string, userRole: string,query:IrentalOrderQuery) => {
     // ADMIN can see all orders, CUSTOMER can see their own orders, PROVIDER can see orders for their gear
      
        const limit = query.limit ? Number(query.limit) : 10;
               const page = query.page ? Number(query.page) : 1;
               const skip = (page - 1) * limit;
               const sortBy = query.sortBy ? query.sortBy : "createdAt";
               const sortOrder = query.sortOrder ? query.sortOrder : "desc";
           
                const andCondition : IrentalOrderQuery[] = [];
           
               
       
           
           
               if(query.status){
                   andCondition.push({
                       status:query.status
                   })
               }
                
                if(query.pickupDate){
                   andCondition.push({
                       pickupDate:query.pickupDate  
                   })
               }

               if(query.returnDate){
                andCondition.push({
                    returnDate:query.returnDate  
                })
            }
       
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
   

  andCondition.push(whereClause);

  const rentalorders =  await prisma.rentalOrder.findMany({
    where: {
      AND: andCondition,
    },
     take:limit,
        skip:skip,
        orderBy:{
            [sortBy]:sortOrder
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
  }
  
);
     return {
        data:rentalorders,
        meta:{
            page,
            limit,
            total:rentalorders.length,
            totalPage:Math.ceil(rentalorders.length / limit)
        }
     }
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

const deleteRentalOrderFromDb = async (rentalOrderId: string,role:string) => {
   
  if(role !== Role.ADMIN){
    throw new Error("Only ADMIN can delete the rental order.");
  }

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
    throw new Error("Only rental orders with status 'PLACED' can be confirmed.");
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
  
  if(rentalOrder.returnDate < new Date()){
    throw new Error("Pickup date cannot be after the return date.");
  }
  if(rentalOrder.pickupDate > new Date()){
    throw new Error("Pickup date is later than the current date.");
  }

  if(rentalOrder.status === rentalOrderStatus.PICKED_UP){
    throw new Error("This rental order has already been marked as 'PICKED_UP'.");
  }

  if(rentalOrder.status === rentalOrderStatus.RETURNED){
    throw new Error("This rental order has already been marked as 'RETURNED'.");
  }

  if(rentalOrder.status === rentalOrderStatus.LATE_RETURN){
    throw new Error("This rental order has already been marked as 'LATE_RETURN'.");
  }

  if(rentalOrder.status === rentalOrderStatus.CANCELLED){
    throw new Error("This rental order has already been marked as 'CANCELLED'.");
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


const returnRentalOrderInDb = async (rentalOrderId: string, role: string) => {

  if(role === Role.CUSTOMER){
    throw new Error("Only ADMIN or PROVIDER can update the rental order status to 'RETURNED'.");
  }

  return await prisma.$transaction(async (tx) => {
      const rentalOrder = await tx.rentalOrder.findUniqueOrThrow({
      where: { id: rentalOrderId },
      include: {
        rentalOrderItems: true,
      },
    
   });

  if(rentalOrder.status === rentalOrderStatus.LATE_RETURN){
    throw new Error("This rental order has already been marked as 'LATE_RETURN'.");
  }
  
  if(rentalOrder.status !== rentalOrderStatus.PICKED_UP){
     throw new Error("Only rental orders with status 'PICKED_UP' can be updated to 'RETURNED'.");
  }

  if(rentalOrder.returnDate < new Date()){
    const extraDays = Math.ceil((new Date().getTime() - rentalOrder.returnDate.getTime()) / (1000 * 60 * 60 * 24));
    const rentalDays = Math.ceil((rentalOrder.returnDate.getTime() - rentalOrder.pickupDate!.getTime()) / (1000 * 60 * 60 * 24)); 

    const extraCharge = Math.ceil((rentalOrder.totalAmount!/rentalDays) * extraDays * 1.1); // 10% of actual rent amount per extra day

    
    await tx.rentalOrder.update({
      where: { id: rentalOrderId },
      data:{
        
        lateFee: extraCharge,
        status: rentalOrderStatus.LATE_RETURN,
        totalAmount: rentalOrder.totalAmount! + extraCharge,
      }
    });

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

    return `Rental order returned late. Extra charge of ${extraCharge} has been added to the total amount.`;
  }
  
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

  return await tx.rentalOrder.update({
    where: { id: rentalOrderId },
    data:{
      status: rentalOrderStatus.RETURNED,
      actualReturnDate: new Date()
    }
  });

 

  });
 
}


const cancelRentalOrderInDb = async(rentalOrderId: string,role: string,userId: string)=>{
   
   console.log({rentalOrderId,role,userId})

  return await prisma.$transaction(async (tx) => {
     const rentalOrder = await tx.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
    include: {
      rentalOrderItems: true,
    },
  });
  
   if(role === Role.CUSTOMER && rentalOrder.customerId !== userId){
    throw new Error("You do not have permission to cancel this rental order.");
  }

  if(role === Role.PROVIDER){
    throw new Error("Only ADMIN or CUSTOMER can cancel the rental order.");
  }
  
  if(rentalOrder.status === rentalOrderStatus.CANCELLED){
    throw new Error("This rental order has already been cancelled.");
  } 
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

 

  await tx.rentalOrder.update({
    where: { id: rentalOrderId },
    data:{
      status:rentalOrderStatus.CANCELLED
    }
  });

  return { message: "Rental order cancelled successfully." };

  });


}


const getRentalOrderStatusFromDb = async (rentalOrderId: string, userId: string, userRole: string) => {

  const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
    
  });
  
  if(userRole === Role.ADMIN){
    return rentalOrder.status;
  } 
  if(userRole === Role.PROVIDER){
    const rentalOrderItem = await prisma.rentalOrderItems.findFirstOrThrow({
      where: { rentalOrderId },
    });
    const gearItem = await prisma.gearItems.findUniqueOrThrow({
      where: { id: rentalOrderItem.gearItemId },
    });
    if(gearItem.providerId !== userId){
      throw new Error("You do not have permission to view this rental order status.");
    }
    return rentalOrder.status;
  }
  
  if(rentalOrder.customerId !== userId){
    throw new Error("You do not have permission to view this rental order status.");
  }

  return rentalOrder.status;
  
} 
export const rentalOrderService = {
  createRentalOrderInDb,
  getRentalOrdersFromDb,
  getRentalOrderByIdFromDb,
  deleteRentalOrderFromDb,
  confirmRentalOrderInDb,
  pickupRentalOrderInDb,
  returnRentalOrderInDb,
  cancelRentalOrderInDb,
  getRentalOrderStatusFromDb
};

