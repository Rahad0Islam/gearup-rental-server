import { rentalOrderStatus } from "../../../generated/prisma/enums";
import config from "../../config/config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";

const createCheckoutSession = async (userId: string, rentalOrderId: string) => {

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

        
        if(rentalOrder.status !== rentalOrderStatus.CONFIRMED){
            throw new Error("Checkout session can only be created for rental orders with status 'CONFIRMED'.");
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
            success_url: `${config.app_url}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.app_url}/payment-cancelled`,
        });

        return session.url;
    });

    return transactionResult;
}


export const paymentService = {
    createCheckoutSession
}