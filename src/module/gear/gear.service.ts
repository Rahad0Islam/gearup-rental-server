import { prisma } from "../../lib/prisma";
import { Igear } from "./gear.interface";

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

const getAllGears = async () => {
  const gears = await prisma.gearItems.findMany();
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
