import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { db } from "../../database";
import { NewBookedAppointment } from "../../types";

export const BookedAppointment = z.object({
  openAppointmentId: z.number(),
});

export default asyncHandler(async (req: Request, res: Response) => {
  const dto = BookedAppointment.parse(req.body);

  const targetBookedAppointment = await db
    .selectFrom("bookedAppointments")
    .where("bookedAppointments.openAppointmentId", "=", dto.openAppointmentId)
    .selectAll()
    .executeTakeFirst();
  //a message átjön de 200 a status code
  if (targetBookedAppointment) {
    res.json({ message: "This time is already taken!" }).status(400);
    return;
  }

  const clientId: number = req.user!.id;
  const bookedAppointment: NewBookedAppointment = {
    openAppointmentId: dto.openAppointmentId,
    clientId: clientId,
  };

  await db
    .insertInto("bookedAppointments")
    .values(bookedAppointment)
    .executeTakeFirstOrThrow();

  res.sendStatus(200);
});
