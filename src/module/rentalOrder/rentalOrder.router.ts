import { Router } from "express";
import { rentalOrderController } from "./rentalOrder.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post('/',auth(Role.CUSTOMER,Role.ADMIN), rentalOrderController.createRentalOrder);
router.get('/',auth(Role.CUSTOMER,Role.ADMIN,Role.PROVIDER), rentalOrderController.getRentalOrders);
router.get('/:rentalOrderId',auth(Role.CUSTOMER,Role.ADMIN,Role.PROVIDER), rentalOrderController.getRentalOrderById);
router.delete('/:rentalOrderId',auth(Role.ADMIN), rentalOrderController.deleteRentalOrder);
router.patch('/confirm/:rentalOrderId',auth(Role.ADMIN,Role.PROVIDER), rentalOrderController.confirmRentalOrder);

router.patch('/cancel/:rentalOrderId',auth(Role.ADMIN,Role.PROVIDER,Role.CUSTOMER), rentalOrderController.cancelRentalOrder);
router.patch('/pickup/:rentalOrderId',auth(Role.ADMIN,Role.PROVIDER), rentalOrderController.pickupRentalOrder);
router.patch('/return/:rentalOrderId',auth(Role.ADMIN,Role.PROVIDER), rentalOrderController.returnRentalOrder);


export const rentalOrderRouter = router;