import { JwtPayload, SignOptions } from "jsonwebtoken"
import jwt from 'jsonwebtoken'

const token = (payload : JwtPayload,secret : string,expiresIn : SignOptions)=>{

    return  jwt.sign(payload,secret,{
      expiresIn: expiresIn
    } as SignOptions);
}

const verifyToken = (token:string , secret : string)=>{
     try {
        const verifiedToken =  jwt.verify(token,secret);
        return {
            success:true,
            data : verifiedToken
        }
     } catch (error:any) {
         return {
            success:false,
            error:error.message
         }
     }
}


export const jwtUtils = {
    token,
    verifyToken
}