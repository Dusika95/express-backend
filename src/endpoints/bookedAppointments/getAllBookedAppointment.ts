import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { db } from "../../database";

interface BookedAppointmentsListDto {
  clientName: string;
  mdName: string;
  startDate: Date;
  endDate: Date;
}
//vidd a resultra az egeret és fuzll mást add vissza mint a typeba lévő deffiniálás
export default asyncHandler(async (req: Request, res: Response) => {
  const result = await db
    .selectFrom("bookedAppointments")
    //.innerJoin("openAppointments","openAppointments.id","openAppointmentsId")
    //.leftjoin("users","users.id","openAppointments.mdId")
    .selectAll()
    .execute();

  var response: BookedAppointmentsListDto[] = result.map((x) => ({
    clientName: "bela",
    mdName: "belaba",
    startDate: x.startDate,
    endDate: x.endDate,
  }));
  res.json(response);
});
