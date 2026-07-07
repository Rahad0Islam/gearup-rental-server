import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = asyncHandler(async (req: Request, res: Response, next:NextFunction) => {
   
   const userId = req.user?.id;
   const rentalOrderId = req.body.rentalOrderId;
   const checkoutSession = await paymentService.createCheckoutSession( userId as string, rentalOrderId as string);

   return sendResponse(res,{
       success: true,
       statuscode: httpStatus.OK,
       message: "Checkout session created successfully",
       data: checkoutSession
   });
    
})


const handleStripeWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const event  = req.body as Buffer;
    const signature = req.headers['stripe-signature']!;

    await paymentService.handleStripeWebhook(event, signature as string);
    sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Webhook handled successfully",
        data: null
    }); 
});

export const paymentController = {
    createCheckoutSession,
    handleStripeWebhook
}