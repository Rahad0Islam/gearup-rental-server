import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { gearService } from "./gear.service";


const addGear = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
  const gearData = req.body;
  const newGear = await gearService.addGearToDb(gearData);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.CREATED,
    message: "Gear added successfully",
    data: newGear,
  });
});

// const updateGear = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   const { id } = req.params;
//   const gearData = req.body;
//   const updatedGear = await gearService.updateGearInDb(id, gearData);

//   return sendResponse(res, {
//     success: true,
//     statuscode: httpStatus.OK,
//     message: "Gear updated successfully",
//     data: updatedGear,
//   });
// });

// const deleteGear = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   const { id } = req.params;
//   const deletedGear = await gearService.deleteGearFromDb(id);

//   return sendResponse(res, {
//     success: true,
//     statuscode: httpStatus.OK,
//     message: "Gear deleted successfully",
//     data: deletedGear,
//   });
// });

export const gearController = {
  addGear,
  // updateGear,
  // deleteGear,
};