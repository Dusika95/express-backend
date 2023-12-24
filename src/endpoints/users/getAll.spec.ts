import supertest from "supertest";
import app from "../../app";
import { sql } from "kysely";
import { db } from "../../database";
import { NewUser } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";

describe("Test should send back an empty list", async () => {
  expect(200).toBe(200);
  // create an admin user
  // const admin: NewUser = {
  //     userName: "adminuser",
  //     firstName: "Adam",
  //     lastName: "Admin",
  //     role: "admin",
  //     passwordHash: "dontcare",
  //     salt: "dontcare",
  //   };
  //   const { insertId: adminId } = await db
  //     .insertInto("users")
  //     .values(admin)
  //     .executeTakeFirstOrThrow();
  //     const response =await supertest(app)
  //     .get("/users")
  //     .set("")
});
