import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { paymentMethod, paymentStatus, paymentType, rentalOrderStatus } from "../../../generated/prisma/client";
import config from "../../config/config";
import { stripe } from "../../lib/stripe";

export const sessionCompleted = async(session: Stripe.Checkout.Session)=>{
    const checkoutSessionId = session.id;

    const paymentRecord = await prisma.payments.findUnique({
        where: {
            checkOutSessionId: checkoutSessionId,
        },
    });

    if (!paymentRecord) {
        console.error(`Payment record not found for checkout session ID: ${checkoutSessionId}`);
        return;
    }
    await prisma.$transaction(async (tx) => {

         await tx.payments.update({
        where: {
            id: paymentRecord.id,
        },
        data: {
            status: paymentStatus.PAID,
            paymentDate: new Date(),
            transactionId: session.payment_intent as string,
        },
    });

    await tx.rentalOrder.update({
        where: {
            id: paymentRecord.rentalOrderId,
        },
        data: {
            status:rentalOrderStatus.PAID,
        },
    });
    })
  

    console.log(`Payment record updated to PAID for checkout session ID: ${checkoutSessionId}`);
}



export const rentalPaymentSession = async(userId: string, rentalOrderId: string) => {
     const transactionResult = await prisma.$transaction(async(tx) => {
        const rentalOrder = await tx.rentalOrder.findUniqueOrThrow({
            where: { id: rentalOrderId },
            include: {
                rentalOrderItems: {
                    include: {
                        gearItem: true,
                    },
                },
            },
        });
        
        
        // if (rentalOrder.customerId !== userId) {
        //     throw new Error("You do not have permission to create a checkout session for this rental order.");
        // }

        
        if(rentalOrder.status !== rentalOrderStatus.CONFIRMED ){
            throw new Error("Checkout session can only be created for rental orders with status 'CONFIRMED'.");
        }

         const status = await tx.payments.findFirst({
            where: {
                rentalOrderId,
                paymentMethod: paymentMethod.stripe,
                paymentType: paymentType.RENTAL,
            },
        });

        if(status && status?.status === paymentStatus.PAID){
            throw new Error("Payment has already been completed for this rental order.");
        }

        if(status){
            return status.checkoutUrl;
        }
        
        const billingData = rentalOrder.rentalOrderItems.map(item => ({
              itemName: item.gearItem.name,
              quantity: item.quantity,
              price: item.rentalPricePerDay,
              discount: item.discount,
              totalPrice: item.subtotal,
        }));    
        
         console.log(billingData)

        const session = await   stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items:[
        {
            price_data:{
                currency:"bdt",

                product_data:{
                    name:"Gear Rental",
                    description:`${billingData.map((item) => item.itemName).join(", ")} Rental Order #${rentalOrder.id}`
                },

                unit_amount:
                    rentalOrder.totalAmount! *100,
            },


            quantity:1
        }
    ],
            mode: "payment",
            success_url: `${config.app_url}/payment/payment-success`,
            cancel_url: `${config.app_url}/payment/payment-cancelled`,
            metadata: {
                rentalOrderId: rentalOrder.id,
                paymentType: paymentType.RENTAL,
            },
        });


       
        await tx.payments.create({
            data: {
                rentalOrderId: rentalOrder.id,
                customerId: rentalOrder.customerId,
                checkOutSessionId: session.id,
                amount: rentalOrder.totalAmount!,
                status: paymentStatus.PENDING,
                paymentMethod: paymentMethod.stripe,
                checkoutUrl: session.url!,
            },
        });

        return session.url;
    });

    return transactionResult;
}



export const lateFeePaymentSession = async(userId: string, rentalOrderId: string) => {
     const transactionResult = await prisma.$transaction(async(tx) => {
        const rentalOrder = await tx.rentalOrder.findUniqueOrThrow({
            where: { id: rentalOrderId },
            include: {
                rentalOrderItems: {
                    include: {
                        gearItem: true,
                    },
                },
            },
        });
        
        
        // if (rentalOrder.customerId !== userId) {
        //     throw new Error("You do not have permission to create a checkout session for this rental order.");
        // }

        
        if(rentalOrder.status !== rentalOrderStatus.LATE_RETURN){
            throw new Error("Checkout session can only be created for rental orders with status 'LATE_RETURN'.");
        }

         const status = await tx.payments.findFirst({
            where: {
                rentalOrderId,
                paymentMethod: paymentMethod.stripe,
                paymentType: paymentType.LATE_FEE,
            },
        });

        if(status && status?.status === paymentStatus.PAID){
            throw new Error("Payment has already been completed for this rental order.");
        }

        if(status){
            return status.checkoutUrl;
        }
        
        

        const session = await   stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items:[
        {
            price_data:{
                currency:"bdt",

                product_data:{
                    name:"Late fee of Gear Rental",
                    description:`Late fee for delayed return of rental items`
                },

                unit_amount:
                    rentalOrder.lateFee! *100,
            },


            quantity:1
        }
    ],
            mode: "payment",
            success_url: `${config.app_url}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.app_url}/payment-cancelled`,
            metadata: {
                rentalOrderId: rentalOrder.id,
                paymentType: paymentType.LATE_FEE,
            },
        });


       
        await tx.payments.create({
            data: {
                rentalOrderId: rentalOrder.id,
                customerId: rentalOrder.customerId,
                checkOutSessionId: session.id,
                amount: rentalOrder.lateFee!,
                status: paymentStatus.PENDING,
                paymentMethod: paymentMethod.stripe,
                paymentType: paymentType.LATE_FEE,
                checkoutUrl: session.url!,
            },
        });

        return session.url;
    });

    return transactionResult;
}



export const sessionCompletedLateFee = async(session: Stripe.Checkout.Session)=>{
    const checkoutSessionId = session.id;

    const paymentRecord = await prisma.payments.findUnique({
        where: {
            checkOutSessionId: checkoutSessionId,
        },
    });

    if (!paymentRecord) {
        console.error(`Payment record not found for checkout session ID: ${checkoutSessionId}`);
        return;
    }
    await prisma.$transaction(async (tx) => {

         await tx.payments.update({
        where: {
            id: paymentRecord.id,
        },
        data: {
            status: paymentStatus.PAID,
            paymentDate: new Date(),
            transactionId: session.payment_intent as string,
        },
    });

    await tx.rentalOrder.update({
        where: {
            id: paymentRecord.rentalOrderId,
        },
        data: {
            status:rentalOrderStatus.LATE_RETURN,
        },
    });
    })
  

    console.log(`Payment record updated to PAID for checkout session ID: ${checkoutSessionId}`);
}



export const sessionfailed = async(session: Stripe.Checkout.Session)=>{
    const checkoutSessionId = session.id;

    const paymentRecord = await prisma.payments.findUnique({
        where: {
            checkOutSessionId: checkoutSessionId,
        },
    });

    if (!paymentRecord) {
        console.error(`Payment record not found for checkout session ID: ${checkoutSessionId}`);
        return;
    }
    await prisma.$transaction(async (tx) => {

         await tx.payments.update({
        where: {
            id: paymentRecord.id,
        },
        data: {
            status: paymentStatus.FAILED,
            paymentDate: new Date(),
           
        },
    });

    await tx.rentalOrder.update({
        where: {
            id: paymentRecord.rentalOrderId,
        },
        data: {
            status:rentalOrderStatus.CONFIRMED,
        },
    });
    })
  

    console.log(`Payment record updated to FAILED for checkout session ID: ${checkoutSessionId}`);
}