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

const getRentalOrderById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { rentalOrderId } = req.params;

    const rentalOrder = await rentalOrderService.getRentalOrderByIdFromDb(rentalOrderId as string, userId as string, userRole as string);

    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Rental order fetched successfully",
        data: rentalOrder
    });
});

const deleteRentalOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { rentalOrderId } = req.params;
    const deletedRentalOrder = await rentalOrderService.deleteRentalOrderFromDb(rentalOrderId as string);

    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Rental order deleted successfully",
        data: []
    });
});

const confirmRentalOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { rentalOrderId } = req.params;
    const updateData = req.body;

    const updatedRentalOrder = await rentalOrderService.confirmRentalOrderInDb(rentalOrderId as string, updateData);

    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Rental order confirmed successfully",
        data: updatedRentalOrder
    });
});


export const rentalOrderController = {
    createRentalOrder,
    getRentalOrders,
    getRentalOrderById,
    deleteRentalOrder,
    confirmRentalOrder
};  
