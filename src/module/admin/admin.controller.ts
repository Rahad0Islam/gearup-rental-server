import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminService } from "./admin.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const addCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const categoryData = req.body;
  const newCategory = await adminService.addCategoryToDb(categoryData);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.CREATED,
    message: "Category added successfully",
    data: newCategory,
  });
});

export const adminController = {
  addCategory,
};