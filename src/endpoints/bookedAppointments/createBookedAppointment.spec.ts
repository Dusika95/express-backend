import supertest from "supertest";
import app from "../../app";
import { sql } from "kysely";
import { db } from "../../database";
import { NewOpenAppointment, NewUser, NewBookedAppointment } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";

describe("Test create a new bookedappointment on an openappointment", () => {
  beforeEach(async () => {
    await sql`truncate table ${sql.table("bookedAppointments")}`.execute(db);
    await sql`truncate table ${sql.table("openAppointments")}`.execute(db);
    await sql`truncate table ${sql.table("users")}`.execute(db);
  });

  test("It should return 400 because the user choose an apointment which is already booked", async () => {
    //create a client user
    const client: NewUser = {
      userName: "clientuser",
      firstName: "Clarance",
      lastName: "Client",
      role: "client",
      passwordHash: "dontcare",
      salt: "dontcare",
    };
    const { insertId: clientId } = await db
      //itt mindent kilehet nyerni ezzel a insert es szétbontással?
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
      startDate: new Date(2024, 1, 1, 8, 0),
      endDate: new Date(2024, 1, 2),
      mdId: Number(medicId!),
    };
    const { insertId: openAppointmentId } = await db
      .insertInto("openAppointments")
      .values(openAppointment)
      .executeTakeFirstOrThrow();

    //create the booked appointment
    const bookedAppointment: NewBookedAppointment = {
      openAppointmentId: Number(openAppointmentId!),
      clientId: Number(clientId!),
    };
    await db
      .insertInto("bookedAppointments")
      .values(bookedAppointment)
      .executeTakeFirstOrThrow();

    //ACT
    const token = signAccessToken({
      id: Number(clientId!),
      userName: client!.userName,
      role: client.role,
    });

    const requestBody = {
      openAppointmentId: Number(openAppointmentId),
    };

    const response = await supertest(app)
      .post("/bookedappointments")
      .set("Authorization", "Bearer " + token)
      .send(requestBody);
    //assert

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: "This time is already taken!",
    });
  });

  test("It should return 200 because the user choose an empty open appointment", async () => {
    //create a client user
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
      startDate: new Date(2024, 1, 1, 8, 0),
      endDate: new Date(2024, 1, 2),
      mdId: Number(medicId!),
    };
    const { insertId: openAppointmentId } = await db
      .insertInto("openAppointments")
      .values(openAppointment)
      .executeTakeFirstOrThrow();

    //ACT
    const token = signAccessToken({
      id: Number(clientId!),
      userName: client!.userName,
      role: client.role,
    });

    const requestBody = {
      openAppointmentId: Number(openAppointmentId),
    };

    const response = await supertest(app)
      .post("/bookedappointments")
      .set("Authorization", "Bearer " + token)
      .send(requestBody);

    // Assert
    expect(response.statusCode).toBe(200);
  });
});
