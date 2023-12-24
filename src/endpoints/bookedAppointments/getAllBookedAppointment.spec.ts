import supertest from "supertest";
import app from "../../app";
import { BookedAppointmentsListDto } from "./getAllBookedAppointment";
import { sql } from "kysely";
import { db } from "../../database";
import { NewOpenAppointment, NewUser, NewBookedAppointment } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";

describe("Test get all booked appointments", () => {
  beforeEach(async () => {
    await sql`truncate table ${sql.table("bookedAppointments")}`.execute(db);
    await sql`truncate table ${sql.table("openAppointments")}`.execute(db);
    await sql`truncate table ${sql.table("users")}`.execute(db);
  });

  test("It should return an empty list", async () => {
    // ACT
    const token = signAccessToken({
      id: 1,
      userName: "dummy",
      role: "client",
    });
    const response = await supertest(app)
      .get("/bookedappointments")
      .set("Authorization", "Bearer " + token);

    // ASSERT
    const data: BookedAppointmentsListDto[] = response.body;

    expect(response.statusCode).toBe(200);
    expect(data.length).toBe(0);
  });

  test("It should return an the rows", async () => {
    // ARRANGE
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

    const openAppointment: NewOpenAppointment = {
      startDate: new Date(2024, 1, 1, 8, 0),
      endDate: new Date(2024, 1, 2),
      mdId: Number(medicId!),
    };
    const { insertId: openAppointmentId } = await db
      .insertInto("openAppointments")
      .values(openAppointment)
      .executeTakeFirstOrThrow();

    const bookedAppointment: NewBookedAppointment = {
      openAppointmentId: Number(openAppointmentId!),
      clientId: Number(clientId!),
    };
    await db
      .insertInto("bookedAppointments")
      .values(bookedAppointment)
      .executeTakeFirstOrThrow();

    // ACT
    const token = signAccessToken({
      id: Number(clientId!),
      userName: client!.userName,
      role: client.role,
    });
    const response = await supertest(app)
      .get("/bookedappointments")
      .set("Authorization", "Bearer " + token);

    // ASSERT
    const data: BookedAppointmentsListDto[] = response.body;

    expect(response.statusCode).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].startDate).toBe(new Date(2024, 1, 1, 8, 0).toISOString());
    expect(data[0].endDate).toBe(new Date(2024, 1, 2).toISOString());
    expect(data[0].mdName).toBe("Daniel Doctor");
    expect(data[0].clientName).toBe("Clarance Client");
  });
});
