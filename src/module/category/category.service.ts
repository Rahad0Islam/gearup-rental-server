import { prisma } from "../../lib/prisma";
import { Icategory } from "./category.interface";

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

const getAllCategories = async () => {
    const categories = await prisma.categories.findMany();
    return categories;
};
export const categoryService = {
  addCategoryToDb,
  updateCategoryInDb,
  deleteCategoryFromDb,
  getCategoryById,
  getAllCategories,
};      

