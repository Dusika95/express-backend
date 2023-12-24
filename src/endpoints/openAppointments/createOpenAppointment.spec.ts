import supertest from "supertest";
import app from "../../app";
import { db } from "../../database";
import { NewUser, NewOpenAppointment } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";
import { truncateTables } from "../../../test/utils";

describe("Test create a new openappointment", () => {
  beforeEach(truncateTables);

  test("It should return 200 because the user choose free time to create a new appointment", async () => {
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

    //ACT
    const token = signAccessToken({
      id: Number(medicId!),
      userName: medic.userName,
      role: medic.role,
    });

    const requestBody = {
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 1, 2),
    };
    const response = await supertest(app)
      .post("/openappointments")
      .set("Authorization", "Bearer " + token)
      .send(requestBody);

    expect(response.statusCode).toBe(200);
  });

  test("It should be send back 400 beacuse the time is already taken by same doctor", async () => {
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
      mdId: Number(medicId!),
    };
    const { insertId: openAppointmentId } = await db
      .insertInto("openAppointments")
      .values(openAppointment)
      .executeTakeFirstOrThrow();

    //ACT
    const token = signAccessToken({
      id: Number(medicId!),
      userName: medic!.userName,
      role: medic.role,
    });

    const requestBody = {
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 1, 2),
    };
    const response = await supertest(app)
      .post("/openappointments")
      .set("Authorization", "Bearer " + token)
      .send(requestBody);

    expect(response.statusCode).toBe(400);
  });
});
