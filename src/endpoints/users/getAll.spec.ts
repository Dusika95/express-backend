import supertest from "supertest";
import app from "../../app";
import { sql } from "kysely";
import { db } from "../../database";
import { NewUser } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";
import { UserListDto } from "./getAll";
import { truncateTables } from "../../../test/utils";

describe("Test get all user", () => {
  beforeEach(truncateTables);

  test("admin user should reach get all user endpoint", async () => {
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

    const token = signAccessToken({
      id: Number(adminId!),
      userName: admin!.userName,
      role: admin.role,
    });
    const response = await supertest(app)
      .get("/users")
      .set("Authorization", "Bearer " + token);

    const data: UserListDto[] = response.body;

    expect(response.statusCode).toBe(200);
    expect(data.length).toBe(1);
  });
  test("client user should not reach get all user list", async () => {
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

    const token = signAccessToken({
      id: Number(clientId!),
      userName: client!.userName,
      role: client.role,
    });

    const response = await supertest(app)
      .get("/users")
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(403);
  });
});
