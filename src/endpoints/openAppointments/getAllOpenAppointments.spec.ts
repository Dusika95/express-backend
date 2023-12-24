import supertest from "supertest";
import app from "../../app";
import { OpenAppointmentListDto } from "./getAllOpenAppointment";
import { sql } from "kysely";
import { db } from "../../database";
import { NewOpenAppointment, NewUser, NewBookedAppointment } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";

describe("Test get all Open appointment", () => {
  beforeEach(async () => {
    await sql`truncate table ${sql.table("bookedAppointments")}`.execute(db);
    await sql`truncate table ${sql.table("openAppointments")}`.execute(db);
    await sql`truncate table ${sql.table("users")}`.execute(db);
  });

  test("It should return empty list", async () => {
    const token = signAccessToken({
      id: 1,
      userName: "dummy",
      role: "client",
    });
    const response = await supertest(app)
      .get("/openappointments")
      .set("Authorization", "Bearer" + token);

    const data: OpenAppointmentListDto[] = response.body;

    expect(response.statusCode).toBe(200);
    expect(data.length).toBe(0);
  });

  test("it should retrurn a row", async () => {
    //create medic user
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
      startDate: new Date(2024, 1, 1, 8, 0),
      endDate: new Date(2024, 1, 2),
      mdId: Number(medicId!),
    };
    const { insertId: openAppointmentId } = await db
      .insertInto("openAppointments")
      .values(openAppointment)
      .executeTakeFirstOrThrow();

    // ACT
    const token = signAccessToken({
      id: Number(medicId!),
      userName: medic!.userName,
      role: medic.role,
    });
    const response = await supertest(app)
      .get("/openappointments")
      .set("Authorization", "Bearer " + token);
    //console.log(response);
    // ASSERT
    const data: OpenAppointmentListDto[] = response.body;

    expect(response.statusCode).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].mdName).toBe("Daniel Doctor");
  });
});
