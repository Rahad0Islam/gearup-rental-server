import { paymentMethod, paymentStatus, rentalOrderStatus } from "../../../generated/prisma/enums";
import config from "../../config/config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import { sessionCompleted } from "./payment.utils";

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

         const status = await tx.payments.findFirst({
            where: {
                rentalOrderId,
                paymentMethod: paymentMethod.stripe
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
            success_url: `${config.app_url}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.app_url}/payment-cancelled`,
        });


       
        await tx.payments.create({
            data: {
                rentalOrderId: rentalOrder.id,
                customerId: rentalOrder.customerId,
                checkOutSessionId: session.id,
                amount: rentalOrder.totalAmount!,
                status: paymentStatus.PENDING,
                paymentMethod:paymentMethod.stripe,
                checkoutUrl: session.url!,
            },
        });

        return session.url;
    });

    return transactionResult;
}


const handleStripeWebhook = async (payload: Buffer, signature: string) => {
   
     const endpointSecret = config.stripe_webhook_secret;
        const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );


      console.log("Received Stripe event:", event.type);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await sessionCompleted(session);

          console.log(`Checkout session completed: ${session.id}`);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

    
};

export const paymentService = {
    createCheckoutSession,
    handleStripeWebhook
}