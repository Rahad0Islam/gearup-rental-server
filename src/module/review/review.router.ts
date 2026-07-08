import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post('/',auth(Role.CUSTOMER,Role.ADMIN), reviewController.createReview);
router.patch('/:reviewId',auth(Role.CUSTOMER,Role.ADMIN), reviewController.updateReview);
router.delete('/:reviewId',auth(Role.CUSTOMER,Role.ADMIN), reviewController.deleteReview);  
router.get('/:gearitemid', reviewController.getReviewsByGearItemId);
export const reviewRouter = router;