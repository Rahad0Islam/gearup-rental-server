import { Router } from "express";
import { gearController } from "./gear.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/client";

const router = Router();

router.post("/:categoryId",auth(Role.ADMIN,Role.PROVIDER), gearController.addGear);
router.put("/:id",auth(Role.ADMIN,Role.PROVIDER), gearController.updateGear);
router.delete("/:id",auth(Role.ADMIN,Role.PROVIDER), gearController.deleteGear);

router.get("/:id", gearController.getGearById);
router.get("/", gearController.getAllGears);
router.get("/category/:categoryId", gearController.getGearsByCategoryId);
router.get("/provider/:providerId",auth(Role.ADMIN,Role.PROVIDER), gearController.getGearsByProviderId);

export const gearRouter = router;