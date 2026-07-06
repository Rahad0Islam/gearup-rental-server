import { Response } from "express";

type Tmeta={
  page:number;
  limit:number;
  total:number;
}
type Tresponse<T> =  {
  success:boolean;
  statuscode : number;
  message : string;
  data : T;
  meta? : Tmeta
}

export const sendResponse = <T>(res:Response,data : Tresponse<T>)=>{
   res.status(data.statuscode).json({
      success : data.success,
      statuscode:data.statuscode,
      message:data.message,
      data:data.data,
      meta:data.meta
   })
}