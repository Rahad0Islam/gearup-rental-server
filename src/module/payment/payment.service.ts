import { paymentMethod, paymentStatus, paymentType, rentalOrderStatus, Role } from "../../../generated/prisma/enums";
import config from "../../config/config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import { lateFeePaymentSession, rentalPaymentSession, sessionCompleted, sessionCompletedLateFee, sessionfailed } from "./payment.utils";
import { IpaymentQuery } from "./payment.interface";
import { paymentsWhereInput } from "../../../generated/prisma/models";

const createCheckoutSession = async (userId: string, rentalOrderId: string, paymentTypes: string) => {
      const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: rentalOrderId },
        include: {
          rentalOrderItems: {
            include: {
              gearItem: true,
            },
          },
        },
      });

      if (!rentalOrder) {
        throw new Error("Rental order not found");
      }

      if (rentalOrder.customerId !== userId) {
        throw new Error("You are not authorized to make a payment for this rental order");
      }
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

          // console.log(`Checkout session completed: ${session.id}`);
          break;
          case 'checkout.session.expired':
          const expiredSession = event.data.object as Stripe.Checkout.Session;
          await sessionfailed(expiredSession);
          break;

          case 'checkout.session.async_payment_failed':
          const failedSession = event.data.object as Stripe.Checkout.Session;
          await sessionfailed(failedSession);
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
           case 'checkout.session.expired':
          const expiredSession = event.data.object as Stripe.Checkout.Session;
          await sessionfailed(expiredSession);
          break;

          case 'checkout.session.async_payment_failed':
          const failedSession = event.data.object as Stripe.Checkout.Session;
          await sessionfailed(failedSession);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    }

    
};


const getPaymentHistory = async (userId: string, role: string, query: IpaymentQuery) => {
    
   const limit = query.limit ? Number(query.limit) : 10;
          const page = query.page ? Number(query.page) : 1;
          const skip = (page - 1) * limit;
          const sortBy = query.sortBy ? query.sortBy : "createdAt";
          const sortOrder = query.sortOrder ? query.sortOrder : "desc";
      
           const andCondition : paymentsWhereInput[] = [];
      
          
  
      
      
          if(query.status){
              andCondition.push({
                  status:query.status
              })
          }
           
           if(query.id){
              andCondition.push({
                  id:query.id
              })
          }
  
       
         
        if(query.paymentType){
            andCondition.push({
                paymentType:query.paymentType
            })
        }

        if(query.paymentMethod){
            andCondition.push({
                paymentMethod:query.paymentMethod
            })
        }

        

  let paymentHistory;
  if (role === Role.CUSTOMER) {
      andCondition.push({customerId: userId});
      
      paymentHistory = await prisma.payments.findMany({

      where: {
        AND: andCondition
      },

       take:limit,
        skip:skip,
        orderBy:{
            [sortBy]:sortOrder
        },

          omit:{
            checkoutUrl:true,
          }
    });
  }
  else if (role === Role.ADMIN) {
    paymentHistory = await prisma.payments.findMany({
      where: {
        AND: andCondition
      },
       take:limit,
      skip:skip,
      orderBy:{
          [sortBy]:sortOrder
      },
       omit:{
            checkoutUrl:true,
          }
    });
  }
  return paymentHistory;
};

export const paymentService = {
    createCheckoutSession,
    handleStripeWebhook,
    getPaymentHistory
}