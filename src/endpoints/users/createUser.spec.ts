import supertest from "supertest";
import app from "../../app";
import { sql } from "kysely";
import { db } from "../../database";
import { NewUser } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";

describe("Test get all booked appointments", () => {
  beforeEach(async () => {
    await sql`truncate table ${sql.table("bookedAppointments")}`.execute(db);
    await sql`truncate table ${sql.table("openAppointments")}`.execute(db);
    await sql`truncate table ${sql.table("users")}`.execute(db);
  });

  test("It should create a new medic user by admin", async () => {
    //create an admin user
    const admin: NewUser = {
      userName: "adminuser",
      firstName: "Adam",
      lastName: "Admin",
      role: "admin",
      passwordHash: "dontcare",
      salt: "dontcare",
    };
    const { insertId: adminId } = await db
      .insertInto("users")
      .values(admin)
      .executeTakeFirstOrThrow();

    //ACT
    const token = signAccessToken({
      id: Number(adminId!),
      userName: admin!.userName,
      role: admin.role,
    });
    const requestBody = {
      userName: "userdoctor",
      firstName: "Daniel",
      lastName: "Doctor",
      password: "idontcare",
      confirmPassword: "idontcare",
    };

    const response = await supertest(app)
      .post("/users")
      .set("Authorization", "Bearer " + token)
      .send(requestBody);

    const data: NewUser = response.body;

    expect(response.statusCode).toBe(200);
  });
});
