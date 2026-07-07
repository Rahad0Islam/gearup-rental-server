import { Request , Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import httpStatus from "http-status";
import { reviewService } from "./review.service";


const createReview = asyncHandler(async (req: Request, res: Response) => {
    const { rentalOrderId, rating, comment } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!rentalOrderId || !rating) {
        return sendResponse(res, {
            success: false,
            statuscode: httpStatus.BAD_REQUEST,
            message: "rentalOrderId and rating are required",
            data: null
        });
    }

    const review = await reviewService.createReview(userId as string, rentalOrderId, rating, comment,role as string);

    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.CREATED,
        message: "Review created successfully",
        data: review
    });
});


const updateReview = asyncHandler(async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!reviewId) {
        return sendResponse(res, {
            success: false,
            statuscode: httpStatus.BAD_REQUEST,
            message: "reviewId is required",
            data: null
        });
    }

    const updatedReview = await reviewService.updateReview(userId as string, reviewId as string, rating, comment, role as string);

    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Review updated successfully",
        data: updatedReview
    });
});

export const reviewController = {
    createReview,
    updateReview
}