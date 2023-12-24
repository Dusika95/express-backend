import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { db } from "../../database";

export interface BookedAppointmentsListDto {
  clientName: string;
  mdName: string;
  startDate: string;
  endDate: string;
}

export default asyncHandler(async (req: Request, res: Response) => {
  const result = await db
    .selectFrom("bookedAppointments")
    .leftJoin(
      "openAppointments",
      "openAppointments.id",
      "bookedAppointments.openAppointmentId"
    )
    .leftJoin("users as muser", "muser.id", "openAppointments.mdId")
    .leftJoin("users as cuser", "cuser.id", "bookedAppointments.clientId")
    .select([
      "cuser.firstName as clientFirstName",
      "cuser.lastName as clientLastName",
      "muser.firstName as medicFirstName",
      "muser.lastName as medicLastName",
      "startDate",
      "endDate",
    ])
    .execute();

  var response: BookedAppointmentsListDto[] = result.map((x) => ({
    clientName: `${x.clientFirstName} ${x.clientLastName}`,
    mdName: `${x.medicFirstName} ${x.medicLastName}`,
    startDate: x.startDate!.toISOString(),
    endDate: x.endDate!.toISOString(),
  }));

  res.json(response);
});
