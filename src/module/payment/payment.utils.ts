import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { paymentStatus, rentalOrderStatus } from "../../../generated/prisma/client";

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

  