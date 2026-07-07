import { paymentMethod, paymentStatus, paymentType, rentalOrderStatus } from "../../../generated/prisma/enums";
import config from "../../config/config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import { lateFeePaymentSession, rentalPaymentSession, sessionCompleted, sessionCompletedLateFee } from "./payment.utils";

const createCheckoutSession = async (userId: string, rentalOrderId: string, paymentTypes: string) => {
     
      if(paymentTypes === paymentType.RENTAL){
        return await rentalPaymentSession(userId, rentalOrderId);
      }
      else if(paymentTypes === paymentType.LATE_FEE){
        return await lateFeePaymentSession(userId, rentalOrderId);
      }
   
}


const handleStripeWebhook = async (payload: Buffer, signature: string) => {
   
     const endpointSecret = config.stripe_webhook_secret;
        const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );


      console.log("Received Stripe event:", event.type);
      const paymentTypes = (event.data.object as Stripe.Checkout.Session)?.metadata?.paymentType;
      if(paymentTypes === paymentType.RENTAL){
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await sessionCompleted(session);

          console.log(`Checkout session completed: ${session.id}`);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    }
    else if(paymentTypes === paymentType.LATE_FEE){
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await sessionCompletedLateFee(session);

          console.log(`Checkout session completed: ${session.id}`);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    }

    
};

export const paymentService = {
    createCheckoutSession,
    handleStripeWebhook
}