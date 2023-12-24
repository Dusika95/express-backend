import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { db } from "../../database";
import { NewOpenAppointment } from "../../types";

const OpenAppointment = z
  .object({
    startDate: z
      .string()
      .datetime()
      .pipe(
        z.coerce
          .date()
          .min(new Date(), { message: "The start date cannot be in the past." })
      ),
    endDate: z.string().datetime().pipe(z.coerce.date()),
  })
  .refine((data) => data.startDate.getTime() - data.endDate.getTime() < 0, {
    message: "End date should be later than start date.",
    path: ["endDate"], // path of error
  });
/*const myDateSchema = z.date({
  required_error: "Please select a date and time",
  invalid_type_error: "That's not a date!",
});*/

export default asyncHandler(async (req: Request, res: Response) => {
  const dto = OpenAppointment.parse(req.body);
  const userId = req.user!.id;
  //ide kéne egy logika ami megnézi h az orvosnak nincs e már időpontja
  // ebben az idő intervallumba

  const currentMedicOppenAppointment = await db
    .selectFrom("openAppointments")
    .where("mdId", "=", userId)
    .where("startDate", "<", dto.endDate)
    .where("endDate", ">", dto.startDate)
    .selectAll()
    .executeTakeFirst();

  if (currentMedicOppenAppointment) {
    console.log(currentMedicOppenAppointment);
    res
      .json({
        message: "You already have an open appointment for this period.",
      })
      .sendStatus(400);
    return;
  }

  const openAppointment: NewOpenAppointment = {
    startDate: dto.startDate,
    endDate: dto.endDate,
    mdId: userId,
  };

  await db
    .insertInto("openAppointments")
    .values(openAppointment)
    .executeTakeFirstOrThrow();

  res.sendStatus(200);
});
