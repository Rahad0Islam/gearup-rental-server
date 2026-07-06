import { Router } from "express";
import { gearController } from "./gear.controller";

const router = Router();

router.post("/addgear", gearController.addGear);
export const gearRouter = router;