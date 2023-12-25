import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { db } from "../../database";

export default asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const targetUser = await db
    .selectFrom("users")
    .where("id", "=", id)
    .selectAll()
    .execute();

  if (
    targetUser[0].role !== "admin" &&
    (req.user!.role === "admin" || req.user!.id === id)
  ) {
    await db.deleteFrom("users").where("id", "=", id).executeTakeFirst();
    res.sendStatus(200);
  } else {
    res
      .json({ message: "you dont have the permisson to delete that user" })
      .sendStatus(403);
  }
});
