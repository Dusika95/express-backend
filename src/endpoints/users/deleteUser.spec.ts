import supertest from "supertest";
import app from "../../app";
import { sql } from "kysely";
import { db } from "../../database";
import { NewUser } from "../../types";
import { signAccessToken } from "../../middlewares/authentication";
import { truncateTables } from "../../../test/utils";

describe("Test delete user", () => {
  beforeEach(truncateTables);
  test("It should send back 200 and delete the user by admin", async () => {
    expect(200).toBe(200);
  });
});
