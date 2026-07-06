import { SignOptions } from "jsonwebtoken";
import { ActiveStatus, Role } from "../../../generated/prisma/client";
import config from "../../config/config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwtutils";
import { IjwtPayload, Ilogin, Iregister } from "./auth.interface";
import bcrypt from "bcrypt";

const registerIntoDb = async (userData: Iregister) => {
  const { name, email, password, role } = userData;
  
  const isExistEmail = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (isExistEmail) {
    throw new Error("Email already exists");
  }

  if(role && role.toUpperCase() === Role.ADMIN){
    throw new Error("You are not allowed to register as an admin");
  }
  
  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role:role?role.toUpperCase() as Role:Role.CUSTOMER
    },
  });
  
  const newUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id,
    },
    omit: {
      password: true,
    },
  });
  return newUser;
 
};

const loginIntoDb = async (userData: Ilogin) => {
  const { email, password } = userData;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Password is incorrect");
  }

  const loggedInUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.id,
    },
    omit: {
      password: true,
    },
  });
   
  if(loggedInUser.activeStatus === ActiveStatus.SUSPENDED){
    throw new Error("Your account is suspended. Please contact support for assistance.");
  }
  
  const jwtPayload : IjwtPayload= {
    id: loggedInUser.id,
    name: loggedInUser.name,
    email: loggedInUser.email,
    role: loggedInUser.role,
    activeStatus: loggedInUser.activeStatus,

  };
 
  const accessToken = jwtUtils.token(jwtPayload, config.jwt_access_secret , config.jwt_access_expires_in as SignOptions);
  const refreshToken = jwtUtils.token(jwtPayload, config.jwt_refresh_secret , config.jwt_refresh_expires_in as SignOptions);

  return {
    user: loggedInUser,
    accessToken,
    refreshToken,
  };
 
};

const meFromDb = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const authService = {
    registerIntoDb,
    loginIntoDb,
    meFromDb
}