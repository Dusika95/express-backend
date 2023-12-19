import * as path from "path";
import { promises as fs } from "fs";
import { createPool } from "mysql2";
import {
  Kysely,
  Migrator,
  FileMigrationProvider,
  MysqlDialect,
  MigrationResult,
} from "kysely";
import { Database } from "./types";

import * as dotenv from "dotenv";
dotenv.config();

//ez itt lent most pontosan micsoda?furán nézz ki nekem aza function szerkezet
function getMigrator(): { migrator: Migrator; db: Kysely<Database> } {
  const dialect = new MysqlDialect({
    pool: createPool({
      database: process.env.DATABASE,
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD,
      port: Number(process.env.DB_PORT),
      connectionLimit: 10,
    }),
  });

  const db = new Kysely<Database>({
    dialect,
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "./migrations"),
    }),
  });

  return { migrator, db };
}
//ezt sem igazán értem itt lejebb
function handleMigrationError(
  results: MigrationResult[] | undefined,
  error: unknown
) {
  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }
}

async function migrateToLatest() {
  const { migrator, db } = getMigrator();

  const { error, results } = await migrator.migrateToLatest();

  handleMigrationError(results, error);

  await db.destroy();
}

async function migrateDown() {
  const { migrator, db } = getMigrator();

  const { error, results } = await migrator.migrateDown();

  handleMigrationError(results, error);

  await db.destroy();
}

if (process.argv[2] === "up") {
  console.info("Running migratins up...");
  migrateToLatest();
} else if (process.argv[2] === "down") {
  console.info("Running migratins down...");
  migrateDown();
}
