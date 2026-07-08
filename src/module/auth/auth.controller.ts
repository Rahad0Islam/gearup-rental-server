import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const registerUser = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const userData = req.body;
    
    const user = await authService.registerIntoDb(userData);

  return  sendResponse(res, {
        success: true,
        statuscode: httpStatus.CREATED,
        message: "User registered successfully",
        data: user,
    });

});

const login = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const userData = req.body;
    const { user, accessToken, refreshToken } = await authService.loginIntoDb(userData);
      
       res.cookie("accessToken",accessToken,{
         httpOnly:true,
         secure:false,
         sameSite:"none",
         maxAge:1000* 60 * 60 * 24 
       })

        res.cookie("refreshToken",refreshToken,{
         httpOnly:true,
         secure:false,
         sameSite:"none",
         maxAge:1000* 60 * 60 * 24 
       })

    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "User logged in successfully",
        data: {
          user,
          accessToken,
          refreshToken,
        },
    });
});

const refreshAccessToken = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return sendResponse(res,{
            success: false,
            statuscode: httpStatus.UNAUTHORIZED,
            message: "Refresh token is missing",
            data: null
        });
    }

    const newAccessToken = await authService.refreshToken(refreshToken);
      res.cookie("accessToken",newAccessToken,{
         httpOnly:true,
         secure:false,
         sameSite:"none",
         maxAge:1000* 60 * 60 * 24 
       })


    return sendResponse(res,{
        success: true,
        statuscode: httpStatus.OK,
        message: "Access token refreshed successfully",
        data: {
            accessToken:newAccessToken
        }
    });
});
const me = asyncHandler(async (req: Request, res: Response,next:NextFunction) => {
    const userId = req.user?.id;
    const user = await authService.meFromDb(userId!);

    return sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "User fetched successfully",
        data: user,
    });
});

export const authController = {
  registerUser,
  login,
  refreshAccessToken,
  me,
};