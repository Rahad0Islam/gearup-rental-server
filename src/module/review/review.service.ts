import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createReviewInDb = async (userId: string, rentalOrderId: string, rating: number, comment: string, role: string, gearitemId: string) => {
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

    // const existingReview = await prisma.review.findFirst({
    //     where: {
    //         rentalOrderId: rentalOrderId,
    //         customerId: userId
    //     },
    // });

    // if (existingReview) {
    //     throw new Error("User has already reviewed this rental order");
    // }
   
   return await prisma.$transaction(async (tx) => {
        for(const item of rentalOrder.rentalOrderItems) {
        if(gearitemId){
            if(item.gearItemId !== gearitemId){
                continue;
            }
        }
       const reviewdetails =  await tx.review.findFirst({
            where: {
                customerId: userId,
                rentalOrderId,
                gearItemId: item.gearItemId,
                rating,
                comment
            }
        })

        if(reviewdetails){
            throw new Error("User has already reviewed this rental order item");
        }
        await tx.review.create({
            data: {
                customerId: userId,
                rentalOrderId,
                gearItemId: item.gearItemId,
                rating,
                comment,
            },
        });
    }

    const review = await tx.review.findMany({
        where: {
            rentalOrderId: rentalOrderId,
            customerId: userId
        },
    }); 

    return review;

   })
   
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
const getReviewsByGearItemIdInDb = async (gearitemId: string) => {
    const reviews = await prisma.review.findMany({
        where: { gearItemId: gearitemId },
    });

    if (!reviews) {
        throw new Error("No reviews found for this gear item");
    }
    
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    return { reviews, averageRating };
};

const getAllReviewsInDb = async () => {
     //group by gearItemId and get average rating for each gear item and return gearitem details not only id
    const reviews = await prisma.review.groupBy({
        by: ['gearItemId'],
        _avg: {
            rating: true,
        },
    });

    const reviewsWithGearItemDetails = await Promise.all(reviews.map(async (review) => {
        const gearItem = await prisma.gearItems.findUnique({
            where: { id: review.gearItemId },
        });
        return {
            gearItem,
            averageRating: review._avg.rating,
        };
    }));

    return reviewsWithGearItemDetails;
};



export const reviewService = {
    createReview: createReviewInDb,
    updateReview: updateReviewInDb,
    deleteReview: deleteReviewInDb,
    getReviewsByGearItemId: getReviewsByGearItemIdInDb,
    getAllReviews: getAllReviewsInDb
};