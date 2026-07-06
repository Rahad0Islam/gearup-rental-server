import { prisma } from "../../lib/prisma";
import { Icategory } from "./admin.interface";

const addCategoryToDb = async (categoryData: Icategory) => {
  const {name,description,image} = categoryData;
  const newCategory = await prisma.categories.create({
    data: {
      name,
      description,
      image,
      createdBy: "admin",
    },
  });
  return newCategory;
};

export const adminService = {
  addCategoryToDb,
};
