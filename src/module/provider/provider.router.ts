import { Router } from "express";
import { providerController } from "./provider.controller";

const router = Router();

router.post("/addgear", providerController.addGear);
export const providerRouter = router;