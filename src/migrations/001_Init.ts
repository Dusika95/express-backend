import { Kysely, sql } from "kysely";
import { pbkdf2Sync, randomBytes } from "crypto";
import { hashPassword } from "../middlewares/authentication";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "bigint", (col) => col.notNull().autoIncrement())
    .addColumn("firstName", "varchar(255)", (col) => col.notNull())
    .addColumn("lastName", "varchar(255)", (col) => col.notNull())
    .addColumn("userName", "varchar(255)", (col) => col.notNull())
    .addColumn("role", "varchar(255)", (col) => col.notNull())
    .addColumn("passwordHash", "varchar(255)", (col) => col.notNull())
    .addColumn("salt", "varchar(255)", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP()`).notNull()
    )
    .addPrimaryKeyConstraint("PK_User", ["id"])
    .addUniqueConstraint("users_user_name", ["userName"])
    .execute();

  const salt = randomBytes(16).toString("base64");
  const passwordHash = hashPassword(salt, "addminpassword");
  await db
    .insertInto("users")
    .values({
      firstname: "Admin",
      lastName: "Aladár",
      userName: "admin",
      role: "admin",
      passwordHash: passwordHash,
      salt: salt,
    })
    .executeTakeFirstOrThrow();

  await db.schema
    .createTable("openAppointments")
    .addColumn("id", "bigint", (col) => col.notNull().autoIncrement())
    .addColumn("startDate", "timestamp", (col) => col.notNull())
    .addColumn("endDate", "timestamp", (col) => col.notNull())
    .addColumn("mdId", "bigint", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addPrimaryKeyConstraint("PK_User", ["id"])
    .execute();

  await db.schema
    .createTable("bookedAppointments")
    .addColumn("id", "bigint", (col) => col.notNull().autoIncrement())
    .addColumn("clientId", "bigint", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("openAppointmentId", "bigint", (col) =>
      col.references("openAppointment.id").onDelete("cascade").notNull()
    )
    .addPrimaryKeyConstraint("PK_User", ["id"])
    .execute();

  await db.schema
    .createIndex("openAppointment_creator_id_index")
    .on("openAppointments")
    .column("mdId")
    .execute();

  await db.schema
    .createIndex("appointment_taker_id_index")
    .on("bookedAppointments")
    .column("clientId")
    .execute();

  await db.schema
    .createIndex("choose_open_appointment_id_index")
    .on("bookedAppointments")
    .column("openAppointmentId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("users").execute();
  await db.schema.dropTable("openAppointments").execute();
  await db.schema.dropTable("bookedAppointments").execute();
}
