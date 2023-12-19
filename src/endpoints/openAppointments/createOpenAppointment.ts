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
//ez így full szar mivel valahogy gondoloma headerből kéne kiszedni
// egy user id-t amjd csekkolni h egyáltalán orvos e
export default asyncHandler(async (req: Request, res: Response) => {
  const dto = OpenAppointment.parse(req.body);
  const userId = req.user!.id;

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
