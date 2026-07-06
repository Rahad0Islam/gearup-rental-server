import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {categoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const addCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const categoryData = req.body;
  const adminId = req.user?.id; 
  const newCategory = await categoryService.addCategoryToDb(categoryData, adminId!);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.CREATED,
    message: "Category added successfully",
    data: newCategory,
  });
});

const updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const categoryData = req.body;
  const updatedCategory = await categoryService.updateCategoryInDb(id as string, categoryData);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

const deleteCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const deletedCategory = await categoryService.deleteCategoryFromDb(id as string);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Category deleted successfully",
    data: deletedCategory,
  });
});

const getCategoryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id as string);

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Category fetched successfully",
    data: category,
  });
});

const getAllCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await categoryService.getAllCategories();

  return sendResponse(res, {
    success: true,
    statuscode: httpStatus.OK,
    message: "Categories fetched successfully",
    data: categories,
  });
});


export const categoryController = {
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
};