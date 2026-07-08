import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createReviewInDb = async (userId: string, rentalOrderId: string, rating: number, comment: string, role: string) => {
    const rentalOrder = await prisma.rentalOrder.findUnique({
        where: { id: rentalOrderId },
        include: {
            rentalOrderItems: true,
        },
    });
    if(rating && (rating < 1 || rating > 5)) {
        throw new Error("Rating must be between 1 and 5");
    }
    if (!rentalOrder) {
        throw new Error("Rental order not found");
    }
     
    if(role !== Role.ADMIN){
    if (rentalOrder.customerId !== userId) {
        throw new Error("User is not authorized to review this rental order");
    }
}

    const existingReview = await prisma.review.findFirst({
        where: {
            rentalOrderId: rentalOrderId,
            customerId: userId
        },
    });

    if (existingReview) {
        throw new Error("User has already reviewed this rental order");
    }

    const review = await prisma.review.create({
        data: {
            customerId: userId,
            rentalOrderId,
            gearItemId: rentalOrder.rentalOrderItems[0]?.gearItemId!,
            rating,
            comment,
        },
    });

    return review;
};

const updateReviewInDb = async (userId: string, reviewId: string, rating: number, comment: string, role: string) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new Error("Review not found");
    }

    if(role !== Role.ADMIN){
    if (review.customerId !== userId) {
        throw new Error("User is not authorized to update this review");
    }
}

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
            rating,
            comment,
        },
    });

    return updatedReview;
}

const deleteReviewInDb = async (userId: string, reviewId: string, role: string) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new Error("Review not found");
    }

    if(role === Role.PROVIDER){
        throw new Error("User is not authorized to delete this review");
    }

    await prisma.review.delete({
        where: { id: reviewId },
    });

    return { message: "Review deleted successfully" };
};
export const reviewService = {
    createReview: createReviewInDb,
    updateReview: updateReviewInDb,
    deleteReview: deleteReviewInDb
};