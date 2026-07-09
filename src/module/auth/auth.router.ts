import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router= Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.login);
router.post('/refreshtoken', authController.refreshAccessToken);
router.get('/me',auth(Role.ADMIN,Role.CUSTOMER,Role.PROVIDER), authController.me);
router.post('/logout',auth(Role.ADMIN,Role.CUSTOMER,Role.PROVIDER), authController.logout);

export const authRouter = router;