import { ActiveStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma"

const getAllUserFromDb = async()=>{
    
    const getAllUser = await prisma.user.findMany({
        omit:{
            password:true
        }
    });

    return getAllUser;
    
}

const updateUserInDb = async(id:string, status:string)=>{
    const userExists = await prisma.user.findUnique({
        where: { id },
    });

    if (!userExists) {
        throw new Error("User not found");
    }
    if(status === userExists.activeStatus){
        throw new Error("User already has the " + status + " status");
    }
    const updatedUser = await prisma.user.update({
        where: { id },
        data: { activeStatus: status as ActiveStatus },
        omit: {
            password: true
        }
    });

    return updatedUser;
}
export const adminService = {
    getAllUserFromDb,
    updateUserInDb
}