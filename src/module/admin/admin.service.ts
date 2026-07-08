import { ActiveStatus } from "../../../generated/prisma/client";
import { UserWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"
import { IuserSearchQuery } from "./admin.interface";

const getAllUserFromDb = async(query: IuserSearchQuery)=>{
    
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";

     const andCondition : UserWhereInput[] = [];

    if(query.searchTerm){
    andCondition.push({
        OR:[
            {
                name:{
                    contains:query.searchTerm,
                    mode:"insensitive"
                }
            }
        ]
    })
    }




    if(query.name){
        andCondition.push({
            name:query.name
        })
    }

     if(query.id){
        andCondition.push({
            id:query.id
        })
    }

    if(query.activeStatus){
        andCondition.push({
            activeStatus:query.activeStatus as ActiveStatus
        })
    }


    const getAllUser = await prisma.user.findMany({
        where:{
            AND:andCondition
        },
        take:limit,
        skip:skip,
        orderBy:{
            [sortBy]:sortOrder
        },
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