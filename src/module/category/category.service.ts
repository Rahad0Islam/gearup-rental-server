import { categoriesWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { Icategory, IcategorySearchQuery } from "./category.interface";

const addCategoryToDb = async (categoryData: Icategory, adminId: string) => {
  const {name,description,image} = categoryData;
  const newCategory = await prisma.categories.create({
    data: {
      name,
      description,
      image,
      createdBy: adminId,
    },
  });
  return newCategory;
};

const updateCategoryInDb = async (id: string, categoryData: Partial<Icategory>) => {
    const existingCategory = await prisma.categories.findUnique({
        where: { id },
    });
    if (!existingCategory) {
        throw new Error("Category not found");
    }
    const updatedCategory = await prisma.categories.update({
        where: { id },
        data: {
            ...categoryData,
        }
    });
  return updatedCategory;
};


const deleteCategoryFromDb = async (id: string) => {
    const existingCategory = await prisma.categories.findUnique({
        where: { id },
    });
    if (!existingCategory) {
        throw new Error("Category not found");
    }
    const deletedCategory = await prisma.categories.delete({
        where: { id },
    });
    return deletedCategory;
};

const getCategoryById = async (id: string) => {
    const category = await prisma.categories.findUnique({
        where: { id },
    });
    if (!category) {
        throw new Error("Category not found");
    }
    return category;
};

const getAllCategories = async (query:IcategorySearchQuery) => {
        const limit = query.limit ? Number(query.limit) : 10;
        const page = query.page ? Number(query.page) : 1;
        const skip = (page - 1) * limit;
        const sortBy = query.sortBy ? query.sortBy : "createdAt";
        const sortOrder = query.sortOrder ? query.sortOrder : "desc";
    
         const andCondition : categoriesWhereInput[] = [];
    
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

    
       

    const categories = await prisma.categories.findMany({
         where:{
            AND:andCondition
        },
        take:limit,
        skip:skip,
        orderBy:{
            [sortBy]:sortOrder
        },
    });
     return {
        data:categories,
        meta:{
            page,
            limit,
            total:categories.length,
            totalPage:Math.ceil(categories.length / limit)
        }
    };
};

export const categoryService = {
  addCategoryToDb,
  updateCategoryInDb,
  deleteCategoryFromDb,
  getCategoryById,
  getAllCategories,
};      

