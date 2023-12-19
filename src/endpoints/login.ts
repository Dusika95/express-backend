import { Request, Response, query } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { db } from "../database";
import { pbkdf2Sync } from "crypto";
import { sign } from "jsonwebtoken";
import { signAccessToken } from "../middlewares/authentication";

const UserLoginModel = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export default asyncHandler(async (req: Request, res: Response) => {
  const dto = UserLoginModel.parse(req.body);

  const user = await db
    .selectFrom("users")
    .where("userName", "=", dto.username)
    .selectAll()
    .executeTakeFirst();

  if (!user) {
    console.log("user not found");
    res.status(401).json({
      message: "Incorrect username or password.",
    });
    return;
  }

  const salt = Buffer.from(user.salt, "base64");
  const passwordHash = pbkdf2Sync(
    dto.password,
    salt,
    310000,
    32,
    "sha256"
  ).toString("base64");

  if (passwordHash !== user.passwordHash) {
    console.log("Incorrect username or password.");
    res.status(401).json({
      message: "Incorrect username or password.",
    });
    return;
  }

  res.json({
    accessToken: signAccessToken({ id: user.id, userName: user.userName }),
  });
});
