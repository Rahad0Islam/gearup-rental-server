import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();
router.get("/getalluser",auth(Role.ADMIN),adminController.getAllUser);
router.patch("/updateuser-status/:id",auth(Role.ADMIN),adminController.updateUserStatus);

export const adminRouter = router;