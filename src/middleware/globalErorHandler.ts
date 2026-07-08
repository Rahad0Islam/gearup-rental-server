import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import httpStatus from "http-status";

export const globalerrorhandler = (err:any, req:Request, res:Response, next:NextFunction) => {

let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
let errorMessage = err.message || "Internal Server Error";
let errorName = err.name || "Error";
let errorDetails = err.stack || "No additional details available";

if(err instanceof Prisma.PrismaClientKnownRequestError  ){
     statusCode = httpStatus.BAD_REQUEST;
     errorMessage = "You have provided incorrect fields or data. Please check your request and try again.";
}

else if(err instanceof Prisma.PrismaClientKnownRequestError ) {
    if(err.code === "P2002") {
        statusCode = httpStatus.CONFLICT;
        errorMessage = "Duplicate entry detected. Please ensure that the data you are trying to create is unique.";
    }
    else if(err.code === "P2003") {
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage = "foreign key constraint failed. The related record does not exist.";
    }
    else if(err.code === "P2025") {
        statusCode = httpStatus.NOT_FOUND;
        errorMessage = "The requested record was not found. Please check the provided identifier and try again.";
    }
}

else if(err instanceof Prisma.PrismaClientInitializationError ) {
   if(err.errorCode === "P1000") {
    statusCode = httpStatus.UNAUTHORIZED;
    errorMessage = "Database connection failed. Please check your database configuration and ensure that the database server is running.";
   }
   else if(err.errorCode === "P1001") {
    statusCode = httpStatus.SERVICE_UNAVAILABLE;
    errorMessage = "Database server is not available. Please try again later.";
   }
}

else if(err instanceof Prisma.PrismaClientUnknownRequestError ) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "An unknown error occurred while processing your request. Please try again later.";
}
return res.status(statusCode).json({
    success:false,
    statusCode:statusCode,
    message: errorMessage,
    name: errorName,
    errorCode: err.code || "No error code available",
    error: errorDetails
  });
}