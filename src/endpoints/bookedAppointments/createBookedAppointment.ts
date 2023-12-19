import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { db } from "../../database";
import { NewBookedAppointment } from "../../types";

const BookedAppointment = z.object({
  openAppointmentId: z.number(),
});

export default asyncHandler(async (req: Request, res: Response) => {
  const dto = BookedAppointment.parse(req.body);

  //megkeresem az össze nyitott időpontot és megnézem h nincs e már le foglalás ID-k alapján
  const allOpenAppointment = await db
    .selectFrom("openAppointments")
    .selectAll()
    .execute();

  for (let i = 0; i < allOpenAppointment.length; i++) {
    if (allOpenAppointment[i].id === dto.openAppointmentId) {
      res.sendStatus(400);
      return;
    }
  }
  //ha nincs akkor itt mehet tovább
  const clientId: number = req.user!.id;
  const bookedAppointment: NewBookedAppointment = {
    openAppointmentId: dto.openAppointmentId,
    clientId: clientId,
  };
  //de persze vmi szar...
  await db
    .insertInto("bookedAppointments")
    .values(bookedAppointment)
    .executeTakeFirstOrThrow();

  res.sendStatus(200);
});
