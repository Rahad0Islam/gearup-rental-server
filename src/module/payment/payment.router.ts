import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post('/checkout',auth(Role.CUSTOMER,Role.ADMIN), paymentController.createCheckoutSession);
router.post('/webhook', paymentController.handleStripeWebhook);
router.get('/payment-history', auth(Role.CUSTOMER,Role.ADMIN), paymentController.getPaymentHistory);
router.get('/payment-success', paymentController.paymentSuccess);
router.get('/payment-cancelled', paymentController.paymentCancelled);

export const paymentRouter = router;