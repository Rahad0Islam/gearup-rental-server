import { Router } from "express";
import { rentalOrderController } from "./rentalOrder.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post('/',auth(Role.CUSTOMER,Role.ADMIN), rentalOrderController.createRentalOrder);

export const rentalOrderRouter = router;