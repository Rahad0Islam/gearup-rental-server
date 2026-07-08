import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import httpStatus from "http-status";


const getAllUser = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
     
    const queryParams = req.query;
     const usersList = await adminService.getAllUserFromDb( queryParams);
    
     return sendResponse(res,{
        success:true,
        message:"All users fetched successfully",
        statuscode: httpStatus.OK,
        data:usersList,
     })

})

const updateUserStatus = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{

    const { id } = req.params;
    const { status } = req.body;
    console.log(status,id)
    const updatedUser = await adminService.updateUserInDb(id as string, status as string);

    return sendResponse(res,{
        success:true,
        message:"User updated successfully",
        statuscode: httpStatus.OK,
        data:updatedUser, // Replace with actual updated user data
    })
})

export const adminController = {
    getAllUser,
    updateUserStatus
}