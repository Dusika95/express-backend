import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { db } from "../../database";
import { OpenAppointmentUpdate } from "../../types";

const OpenAppointment = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

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
