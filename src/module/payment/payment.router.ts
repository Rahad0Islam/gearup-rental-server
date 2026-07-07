import { Router } from "express";
import { paymentController } from "./payment.controller";

const router = Router();

router.post('/checkout', paymentController.createCheckoutSession);
router.post('/webhook', paymentController.handleStripeWebhook);

export const paymentRouter = router;