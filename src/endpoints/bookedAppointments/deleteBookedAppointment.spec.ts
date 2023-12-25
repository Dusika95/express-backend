import supertest from "supertest";
import app from "../../app";
import { sql } from "kysely";
import { db } from "../../database";
import { NewOpenAppointment, NewUser, NewBookedAppointment } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";
import { truncateTables } from "../../../test/utils";

describe("Test delete a booked appointments", () => {
  beforeEach(truncateTables);

  test("It should be a statuscode 200 and do the deletetion", async () => {
    //create a client
    const client: NewUser = {
      userName: "clientuser",
      firstName: "Clarance",
      lastName: "Client",
      role: "client",
      passwordHash: "dontcare",
      salt: "dontcare",
    };

    const { insertId: clientId } = await db
      .insertInto("users")
      .values(client)
      .executeTakeFirstOrThrow();
    //create a medic user
    const medic: NewUser = {
      userName: "medicuser",
      firstName: "Daniel",
      lastName: "Doctor",
      role: "medic",
      passwordHash: "dontcare",
      salt: "dontcare",
    };

    const { insertId: medicId } = await db
      .insertInto("users")
      .values(medic)
      .executeTakeFirstOrThrow();

    //create an open appointment
    const openAppointment: NewOpenAppointment = {
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 1, 2),
      mdId: Number(medicId),
    };
    const { insertId: openAppointmentId } = await db
      .insertInto("openAppointments")
      .values(openAppointment)
      .executeTakeFirstOrThrow();

    //create booked appointment

    const bookedAppointment: NewBookedAppointment = {
      clientId: Number(clientId),
      openAppointmentId: Number(openAppointmentId),
    };
    const { insertId: bookedAppointmentId } = await db
      .insertInto("bookedAppointments")
      .values(bookedAppointment)
      .executeTakeFirstOrThrow();

    // ACT
    const token = signAccessToken({
      id: Number(clientId!),
      userName: client.userName,
      role: client.role,
    });
    const response = await supertest(app)
      .delete(`/bookedappointments/${bookedAppointmentId}`)
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(200);
  });
});
