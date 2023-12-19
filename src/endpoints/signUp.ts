import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { db } from "../database";
import { NewUser } from "../types";
import { pbkdf2Sync, randomBytes } from "crypto";

const User = z
  .object({
    userName: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z.string().min(1),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

export default asyncHandler(async (req: Request, res: Response) => {
  const dto = User.parse(req.body);

  const salt = randomBytes(16);
  const passwordHash = pbkdf2Sync(dto.password, salt, 310000, 32, "sha256");

  let user: NewUser = {
    userName: dto.userName,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: "client",
    passwordHash: passwordHash.toString("base64"),
    salt: salt.toString("base64"),
  };

  await db.insertInto("users").values(user).executeTakeFirstOrThrow();

  res.sendStatus(200);
});
