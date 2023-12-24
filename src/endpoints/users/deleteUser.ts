import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { db } from "../../database";

export default asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const deleteItem = await db
    .deleteFrom("users")
    .where("id", "=", id)
    .executeTakeFirst();
  res.json("ok");
});
