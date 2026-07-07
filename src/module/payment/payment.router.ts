import { Router } from "express";
import { paymentController } from "./payment.controller";

const router = Router();

router.post('/checkout', paymentController.createCheckoutSession);

export const paymentRouter = router;