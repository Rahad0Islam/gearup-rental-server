import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { providerService } from "./provider.service";


const addGear = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
  const gearData = req.body;
  const newGear = await providerService.addGearToDb(gearData);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.CREATED,
    message: "Gear added successfully",
    data: newGear,
  });
});

export const providerController = {
  addGear,
};