/*
-- Manual SQL for creating the table in MSSQL
CREATE TABLE containers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    number VARCHAR(11) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    updated_at DATETIME DEFAULT GETDATE()
);
*/

export const schema_info = "Using raw mssql queries. See SQL comment above for table creation.";
