import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { gearService } from "./gear.service";


const addGear = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
  const gearData = req.body;
  const categoryId = req.params.categoryId as string;
  const providerId = req.user?.id;
  const newGear = await gearService.addGearToDb(gearData, categoryId, providerId as string);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.CREATED,
    message: "Gear added successfully",
    data: newGear,
  });
});

const updateGear = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const gearData = req.body;
  const updatedGear = await gearService.updateGearInDb(id as string, gearData);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Gear updated successfully",
    data: updatedGear,
  });
});

const deleteGear = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const deletedGear = await gearService.deleteGearFromDb(id as string);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Gear deleted successfully",
    data: deletedGear,
  });
});

const getGearById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const gear = await gearService.getGearById(id as string);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Gear fetched successfully",
    data: gear,
  });
});

const getAllGears = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const gears = await gearService.getAllGears(query);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Gears fetched successfully",
    data: gears,
  });
});

const getGearsByCategoryId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { categoryId } = req.params;
  const gears = await gearService.getGearsByCategoryId(categoryId as string);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Gears fetched successfully",
    data: gears,
  });
});

const getGearsByProviderId = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const providerId = req.params.providerId;
  const gears = await gearService.getGearsByProviderId(providerId as string);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Gears fetched successfully",
    data: gears,
  });
});

export const gearController = {
  addGear,
  updateGear,
  deleteGear,
  getGearById,
  getAllGears,
  getGearsByCategoryId,
  getGearsByProviderId,
};
