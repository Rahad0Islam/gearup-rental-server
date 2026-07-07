import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { rentalOrderService } from "./rentalOrder.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalOrder = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const rentalOrderData = req.body;
    const customerId = req.user?.id;
    // console.log(rentalOrderData.items)
    const newRentalOrder = await rentalOrderService.createRentalOrderInDb(rentalOrderData,customerId as string);
    
    return sendResponse(res,{
        success: true,
        statuscode: httpStatus.CREATED,
        message: "Rental order created successfully",
        data: newRentalOrder
    });
});  
  
const getRentalOrders = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const rentalOrders = await rentalOrderService.getRentalOrdersFromDb(userId as string, userRole as string);
    
    return sendResponse(res,{
        success: true,
        statuscode: httpStatus.OK,
        message: "Rental orders fetched successfully",
        data: rentalOrders
    });
});

export const rentalOrderController = {
  createRentalOrder,
  getRentalOrders,
};