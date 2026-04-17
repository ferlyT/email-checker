import sql from "mssql";
import { CONFIG } from "../src/config";

async function checkDB() {
  try {
    const pool = await sql.connect(CONFIG.DATABASE_URL);
    console.log("Connected to DB");
    
    const testNumber = "WHSU5827472";
    console.log(`Testing parameterized query for ${testNumber}`);
    const result = await pool.request()
      .input("number", sql.VarChar(11), testNumber)
      .query("SELECT fdMarkingCode, fdStatus FROM tbMarking WHERE fdContNo = @number");
    
    console.log("Result using VarChar(11):");
    console.log(result.recordset);
    
    const result2 = await pool.request()
      .input("number", sql.Char(12), testNumber)
      .query("SELECT fdMarkingCode, fdStatus FROM tbMarking WHERE fdContNo = @number");
      
    const result4 = await pool.request().query("SELECT TOP 5 * FROM tbEntrylist");
    console.log("tbEntrylist sample:");
    console.dir(result4.recordset, { depth: null });
    await pool.close();
  } catch (err) {
    console.error("DB Error:", err);
  }
}
checkDB();
