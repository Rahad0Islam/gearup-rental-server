import { prisma } from "../../lib/prisma";

const addGearToDb = async (gearData: any) => {
  const newGear = await prisma.gearItems.create({
    data: gearData,
  });

  return newGear;
};

export const gearService = {
  addGearToDb,
};