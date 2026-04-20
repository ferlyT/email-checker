import sql from "mssql";
import { logger } from "../utils/logger";

export async function createDbConnection(url: string): Promise<sql.ConnectionPool> {
  try {
    const pool = await sql.connect(url);
    logger.info("✅ Connected to MS SQL Server");
    return pool;
  } catch (err: any) {
    logger.error("❌ Database connection failed: %s", err.message);
    throw err;
  }
}

export { sql };
