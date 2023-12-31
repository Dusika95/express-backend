import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { db } from "../../database";

export default asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const userId = req.user!.id;
  console.log(userId);

  await db
    .deleteFrom("bookedAppointments")
    .where("id", "=", id)
    .where("clientId", "=", userId)
    .execute();

  res.sendStatus(200);
});
