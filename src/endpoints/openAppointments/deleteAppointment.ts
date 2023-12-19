import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { db } from "../../database";

export default asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const userId = req.user!.id;

  await db
    .deleteFrom("openAppointments")
    .where("id", "=", id)
    .where("mdId", "=", userId)
    .executeTakeFirst();

  res.sendStatus(200);
});
