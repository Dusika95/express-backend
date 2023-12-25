import supertest from "supertest";
import app from "../../app";
import { sql } from "kysely";
import { db } from "../../database";
import { NewOpenAppointment, NewUser } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";
import { truncateTables } from "../../../test/utils";

describe("Test delete open appointments", () => {
  beforeEach(truncateTables);

  test("It should be send back a statuscode 200 and do the deletion", async () => {
    //create a medic user
    const medic: NewUser = {
      userName: "medicuser",
      firstName: "Doctor",
      lastName: "Daniel",
      role: "medic",
      passwordHash: "dontcare",
      salt: "dontcare",
    };
    const { insertId: medicId } = await db
      .insertInto("users")
      .values(medic)
      .executeTakeFirstOrThrow();

    const openAppointment: NewOpenAppointment = {
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 1, 2),
      mdId: Number(medicId),
    };
    const { insertId: openAppointmentId } = await db
      .insertInto("openAppointments")
      .values(openAppointment)
      .executeTakeFirstOrThrow();

    // ACT
    const token = signAccessToken({
      id: Number(medicId!),
      userName: medic.userName,
      role: medic.role,
    });
    const response = await supertest(app)
      .delete(`/openappointments/${openAppointmentId}`)
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(200);
  });
});
