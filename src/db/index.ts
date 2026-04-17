import sql from "mssql";

export async function createDbConnection(url: string): Promise<sql.ConnectionPool> {
  try {
    const pool = await sql.connect(url);
    console.log("✅ Connected to MS SQL Server");
    return pool;
  } catch (err: any) {
    console.error("❌ Database connection failed:", err.message);
    throw err;
  }
}

export { sql };
