import sql from "mssql";
import { logger } from "../utils/logger";

export class DatabaseService {
  constructor(private pool: sql.ConnectionPool) { }

  async checkContainerStatus(number: string) {
    try {
      logger.debug("[Database] Checking container: '%s'", number);
      const result = await this.pool.request()
        .input("number", sql.VarChar(15), number)
        .query("SELECT fdMarkingCode FROM tbMarking WHERE fdContNo LIKE '%' + @number + '%'");

      logger.debug("[Database] Found %d rows for '%s'", result.recordset.length, number);

      if (result.recordset.length > 0) {
        const markingCode = result.recordset[0].fdMarkingCode;

        if (!markingCode || String(markingCode).trim() === "") {
          logger.warn("[Database] fdMarkingCode is empty for '%s'", number);
          return { found: true, markingCode: "-", details: "-" };
        }

        const cleanMarkingCode = String(markingCode).trim();
        logger.debug("[Database] Found fdMarkingCode: '%s'. Querying tbEntrylist...", cleanMarkingCode);

        const entryResult = await this.pool.request()
          .input("markingCode", sql.VarChar(50), cleanMarkingCode)
          .query("SELECT fdCustName, b.fdInvNo, b.fdGive FROM tbEntrylist e LEFT JOIN tbCustomers c ON e.fdCustCode=c.fdCustCode LEFT JOIN tbBilling b ON e.fdListCode = b.fdListCode WHERE e.fdMarkingCode = @markingCode");

        if (entryResult.recordset.length > 0) {
          const detailsList = entryResult.recordset.map((row) => {
            const name = row.fdCustName || "-";
            const inv = row.fdInvNo || "-";
            const status = row.fdGive === 1 ? "Submitted" : "Not Submitted";
            return `👤 *Customer:* ${name}\n📄 *Invoice:* ${inv}\n📌 *Status:* ${status}`;
          }).join('\n\n');

          return { 
            found: true, 
            markingCode: cleanMarkingCode, 
            details: detailsList
          };
        }

        return { found: true, markingCode: cleanMarkingCode, details: "Tidak ada data Entrylist" };
      }

      return { found: false, markingCode: "-", details: "NOT FOUND" };
    } catch (error: any) {
      logger.error("[Database Error] Details for %s: %s", number, error.message);
      return { found: false, markingCode: "-", details: "DB ERROR" };
    }
  }
}
