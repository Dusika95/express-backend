import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { db } from "../../database";
import { OpenAppointmentUpdate } from "../../types";

const OpenAppointment = z.object({
  startDate: z.date(),
  endDate: z.date(),
});
//nem tudom h ennek az API-nak van e létjogosultsága
//ha igen akkor ide is bekéne rakni egy olyan logikát mint amit a createbe akarok
//a való életbe egyszerübb lenne egy törlés újra kreálás esetleg ha majd bővitem egyszer az egészet
//egy vizsgálóterem váltózóval akkor jó cucc lehet ez
//de akkor majd kell bele olyan logika is a h az orvosok ne túrják ki egymást
export default asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const targetOpenAppointment = await db
    .selectFrom("openAppointments")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
  const dto = OpenAppointment.parse(req.body);
  const openappointment: OpenAppointmentUpdate = {
    id: id,
    startDate: dto.startDate,
    endDate: dto.endDate,
    mdId: targetOpenAppointment?.mdId,
  };
  await db
    .updateTable("openAppointments")
    .set(openappointment)
    .where("id", "=", id)
    .execute();
  res.sendStatus(200);
});
