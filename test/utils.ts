import { sql } from "kysely";
import { db } from "../src/database";

export async function truncateTables() {
  await sql`truncate table ${sql.table("bookedAppointments")}`.execute(db);
  await sql`truncate table ${sql.table("openAppointments")}`.execute(db);
  await sql`truncate table ${sql.table("users")}`.execute(db);
}
