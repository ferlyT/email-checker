import sql from "mssql";

export class DatabaseService {
  constructor(private pool: sql.ConnectionPool) {}

  async checkContainerStatus(number: string) {
    try {
      const result = await this.pool.request()
        .input("number", sql.VarChar(11), number)
        .query("SELECT status FROM containers WHERE number = @number");

      if (result.recordset.length > 0) {
        return { found: true, status: result.recordset[0].status };
      }
      
      return { found: false, status: "NOT FOUND" };
    } catch (error: any) {
      console.error(`[Database Error] Details for ${number}:`, error.message);
      return { found: false, status: "DB ERROR" };
    }
  }
}
