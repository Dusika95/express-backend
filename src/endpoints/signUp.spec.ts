import supertest from "supertest";
import app from "../app";
import { sql } from "kysely";
import { db } from "../database";
import { NewUser } from "../types";
import { signAccessToken } from "../middlewares/authentication";
import { truncateTables } from "../../test/utils";
//ezt a User cuccot lehet/kell használni
import { User } from "./signUp";

describe("Test get all booked appointments", () => {
  beforeEach(truncateTables);

  test("It should create a new client user", async () => {
    const client = {
      userName: "clientuser",
      firstName: "Clerence",
      lastName: "Client",
      passwordHash: "dontcare",
      confirmPassword: "dontcare",
    };
    const response = await supertest(app).post("/users");

    expect(response.statusCode).toBe(200);
  });
});
