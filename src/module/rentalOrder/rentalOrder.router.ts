import { Router } from "express";
import { rentalOrderController } from "./rentalOrder.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post('/',auth(Role.CUSTOMER,Role.ADMIN), rentalOrderController.createRentalOrder);
router.get('/',auth(Role.CUSTOMER,Role.ADMIN,Role.PROVIDER), rentalOrderController.getRentalOrders);
router.get('/:rentalOrderId',auth(Role.CUSTOMER,Role.ADMIN,Role.PROVIDER), rentalOrderController.getRentalOrderById);
router.delete('/:rentalOrderId',auth(Role.ADMIN), rentalOrderController.deleteRentalOrder);
router.patch('/:rentalOrderId',auth(Role.ADMIN,Role.PROVIDER), rentalOrderController.confirmRentalOrder);
router.patch('/pickup/:rentalOrderId',auth(Role.ADMIN,Role.PROVIDER), rentalOrderController.pickupRentalOrder);


export const rentalOrderRouter = router;