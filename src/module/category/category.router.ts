import { Router } from "express";
import { categoryController } from "./category.controller";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middleware/auth";


const router = Router();

router.post("/addcategory",auth(Role.ADMIN),categoryController.addCategory);
router.put("/updatecategory/:id",auth(Role.ADMIN),categoryController.updateCategory);
router.delete("/deletecategory/:id",auth(Role.ADMIN),categoryController.deleteCategory);
router.get("/:id",categoryController.getCategoryById);
router.get("/",categoryController.getAllCategories);

export const categoryRouter = router;