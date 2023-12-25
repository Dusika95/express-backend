import supertest from "supertest";
import app from "../../app";
import { sql } from "kysely";
import { db } from "../../database";
import { NewUser } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";
import { truncateTables } from "../../../test/utils";

describe("Test get all booked appointments", () => {
  beforeEach(truncateTables);

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
  test("It should send back a 403 status because client cant create a medic user", async () => {
    //create a client user
    const client: NewUser = {
      userName: "clientuser",
      firstName: "Clerence",
      lastName: "Client",
      role: "client",
      passwordHash: "dontcare",
      salt: "dontcare",
    };
    const { insertId: clientId } = await db
      .insertInto("users")
      .values(client)
      .executeTakeFirstOrThrow();

    //ACT
    const token = signAccessToken({
      id: Number(clientId!),
      userName: client!.userName,
      role: client.role,
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

    expect(response.statusCode).toBe(403);
  });
});
