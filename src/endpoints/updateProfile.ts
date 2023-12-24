import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { db } from "../database";
import { UserUpdate } from "../types";
import { pbkdf2Sync } from "crypto";

const User = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

export default asyncHandler(async (req: Request, res: Response) => {
  const dto = User.parse(req.body);

  const id = req.user!.id;
  const targetUser = await db
    .selectFrom("users")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  if (!targetUser) {
    res.send("user not found on id: " + id);
    return;
  }

  let passwordHash: string | undefined = undefined;

  if (dto.password) {
    passwordHash = pbkdf2Sync(
      dto.password,
      targetUser.salt,
      310000,
      32,
      "sha256"
    ).toString("base64");
  }

  const user: UserUpdate = {
    firstName: dto.firstName,
    lastName: dto.lastName,
    passwordHash: passwordHash,
  };

  await db.updateTable("users").set(user).where("id", "=", id).execute();

  res.sendStatus(200);
});
