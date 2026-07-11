import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = asyncHandler(async (req: Request, res: Response, next:NextFunction) => {
   
   const userId = req.user?.id;
   const rentalOrderId = req.body.rentalOrderId;
   const paymentType = req.body.paymentType;
   if(!rentalOrderId || !paymentType){
    return sendResponse(res,{
        success: false,
        statuscode: httpStatus.BAD_REQUEST,
        message: "rentalOrderId and paymentType are required",
        data: null
    });
   }

   if(paymentType !== "RENTAL" && paymentType !== "LATE_FEE"){
    return sendResponse(res,{
        success: false,
        statuscode: httpStatus.BAD_REQUEST,
        message: "Invalid paymentType. Must be either 'RENTAL' or 'LATE_FEE'",
        data: null
    });
   }
   const checkoutSession = await paymentService.createCheckoutSession( userId as string, rentalOrderId as string,paymentType as string  );

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


const getPaymentHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;
    const queryParams = req.query;
    const paymentHistory = await paymentService.getPaymentHistory(userId as string,role as string,queryParams);

    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Payment history fetched successfully",
        data: paymentHistory.data,
        meta: paymentHistory.meta
    });
});

const paymentSuccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => { 

     return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Payment success page",
        data: null
    });
})

const paymentCancelled = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Payment cancelled page",
        data: null
    });
})
export const paymentController = {
    createCheckoutSession,
    handleStripeWebhook,
    getPaymentHistory,
    paymentSuccess,
    paymentCancelled
}