import { NextFunction, Request, RequestHandler, Response } from "express";
export const asyncHandler = (fn : RequestHandler)=>{
    return async(req:Request , res:Response , next: NextFunction)=>{
        try {
          await fn(req,res,next);
        } catch (error:any) {

        next(error);
    }
}
}