import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post('/checkout',auth(Role.CUSTOMER,Role.ADMIN), paymentController.createCheckoutSession);
router.post('/webhook', paymentController.handleStripeWebhook);



export const paymentRouter = router;