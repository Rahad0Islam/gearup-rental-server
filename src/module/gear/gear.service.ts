import { gearItemsWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { Igear, IgearSearchQuery } from "./gear.interface";

const addGearToDb = async (gearData: Igear,categoryId: string,providerId: string) => {
  const { name, description, rentPricePerDay, discountPrice, stock, availableStock, status, image } = gearData;
  const existingCategory = await prisma.categories.findUnique({
    where: { id: categoryId },
  });
  if (!existingCategory) {
    throw new Error("Category not found");
  }
  const newGear = await prisma.gearItems.create({
    data: {
      name,
      description,
      rentPricePerDay,
      discountPrice,
      stock,
      availableStock:stock,
      status,
      image,
      categoryId,
      providerId 
    }
  });

  return newGear;
};

const updateGearInDb = async (id: string, gearData: Partial<Igear>) => {
  const existingGear = await prisma.gearItems.findUnique({
    where: { id },
  });
  if (!existingGear) {
    throw new Error("Gear not found");
  }
  const updatedGear = await prisma.gearItems.update({
    where: { id },
    data: {
      ...gearData,
    }
  });
  return updatedGear;
};

const deleteGearFromDb = async (id: string) => {
  const existingGear = await prisma.gearItems.findUnique({
    where: { id },
  });
  if (!existingGear) {
    throw new Error("Gear not found");
  }
  const deletedGear = await prisma.gearItems.delete({
    where: { id },
  });
  return deletedGear;
}

const getGearById = async (id: string) => {
  const gear = await prisma.gearItems.findUnique({
    where: { id },
  });
  if (!gear) {
    throw new Error("Gear not found");
  }
  return gear;
}

const getAllGears = async (query: IgearSearchQuery) => {
   const limit = query.limit ? Number(query.limit) : 10;
           const page = query.page ? Number(query.page) : 1;
           const skip = (page - 1) * limit;
           const sortBy = query.sortBy ? query.sortBy : "createdAt";
           const sortOrder = query.sortOrder ? query.sortOrder : "desc";
       
            const andCondition : gearItemsWhereInput[] = [];
       
           if(query.searchTerm){
           andCondition.push({
           OR:[
               {
                   name:{
                       contains:query.searchTerm,
                       mode:"insensitive"
                   }
               },
               {
                   description:{
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
            if(query.description){
               andCondition.push({
                   description:query.description
               })
           }
            if(query.id){
               andCondition.push({
                   id:query.id
               })
           }

           if(query.status){
            andCondition.push({
                status:query.status
            })
        }

        if(query.rentPricePerDay){
            //create a range for rentPricePerDay 0 to query.rentPricePerDay
            andCondition.push({
                rentPricePerDay:{
                    lte: Number(query.rentPricePerDay)
                }
            })
        }
            
       
          
   
  
  const gears = await prisma.gearItems.findMany({
     where:{
        AND:andCondition
    },
    take:limit,
    skip:skip,
    orderBy:{
        [sortBy]:sortOrder
    },
  });
  return gears;
}


const getGearsByCategoryId = async (categoryId: string) => {
  const existingCategory = await prisma.categories.findUnique({
    where: { id: categoryId },
  });
  if (!existingCategory) {
    throw new Error("Category not found");
  }
  const gears = await prisma.gearItems.findMany({
    where: { categoryId },
  });
  return gears;
}

const getGearsByProviderId = async (providerId: string) => {
  const existingProvider = await prisma.user.findUnique({
    where: { id: providerId },
  });
  if (!existingProvider) {
    throw new Error("Provider not found");
  }
  const gears = await prisma.gearItems.findMany({
    where: { providerId },
  });
  return gears;
}
export const gearService = {
  addGearToDb,
  updateGearInDb,
  deleteGearFromDb,
  getGearById,
  getAllGears,
  getGearsByCategoryId,
  getGearsByProviderId
};
