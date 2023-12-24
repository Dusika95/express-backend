import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { db } from "../../database";

export interface OpenAppointmentListDto {
  startDate: Date;
  endDate: Date;
  mdName: string;
}

export default asyncHandler(async (_: Request, res: Response) => {
  let result = await db
    .selectFrom("openAppointments")
    .innerJoin("users", "users.id", "mdId")
    .selectAll()
    .execute();

  var response: OpenAppointmentListDto[] = result.map((x) => ({
    startDate: x.startDate,
    endDate: x.endDate,
    mdName: `${x.firstName} ${x.lastName}`,
  }));

  res.json(response);
});
