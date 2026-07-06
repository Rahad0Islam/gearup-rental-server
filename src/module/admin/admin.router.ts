import { Router } from "express";
import { adminController } from "./admin.controller";


const router = Router();

router.post("/addcategory",adminController.addCategory);
export const adminRouter = router;