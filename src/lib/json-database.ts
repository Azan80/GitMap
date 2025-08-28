// Simple JSON-based database for deployment
// Uses in-memory storage with optional persistence

import { DatabaseAdapter } from './cloud-database';

interface DatabaseRecord {
  id: number;
  [key: string]: any;
}

interface DatabaseTables {
  users: DatabaseRecord[];
  user_sessions: DatabaseRecord[];
  repositories: DatabaseRecord[];
  repository_files: DatabaseRecord[];
}

class JSONDatabase implements DatabaseAdapter {
  private data: DatabaseTables;
  private nextIds: { [table: string]: number };

  constructor() {
    this.data = {
      users: [],
      user_sessions: [],
      repositories: [],
      repository_files: []
    };
    this.nextIds = {
      users: 1,
      user_sessions: 1,
      repositories: 1,
      repository_files: 1
    };
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const table = this.extractTableFromSQL(sql);
    const whereClause = this.extractWhereClause(sql);
    
    if (!table || !this.data[table as keyof DatabaseTables]) {
      return null;
    }

    const records = this.data[table as keyof DatabaseTables];
    
    if (whereClause) {
      return this.findRecord(records, whereClause, params) as T;
    }
    
    return records[0] as T || null;
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const table = this.extractTableFromSQL(sql);
    const whereClause = this.extractWhereClause(sql);
    
    if (!table || !this.data[table as keyof DatabaseTables]) {
      return [];
    }

    const records = this.data[table as keyof DatabaseTables];
    
    if (whereClause) {
      return this.findRecords(records, whereClause, params) as T[];
    }
    
    return records as T[];
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    const sqlLower = sql.toLowerCase();
    
    if (sqlLower.includes('insert into')) {
      return this.insert(sql, params);
    } else if (sqlLower.includes('update')) {
      return this.update(sql, params);
    } else if (sqlLower.includes('delete')) {
      return this.delete(sql, params);
    }
    
    return { lastID: 0, changes: 0 };
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    return this.run(sql, params);
  }

  async exec(sql: string): Promise<void> {
    // For CREATE TABLE statements, we'll just ignore them
    // as our JSON structure is already defined
    console.log('Executing:', sql);
  }

  async close(): Promise<void> {
    // No cleanup needed for in-memory database
  }

  private extractTableFromSQL(sql: string): string | null {
    const match = sql.match(/FROM (\w+)|INTO (\w+)|UPDATE (\w+)/i);
    return match ? (match[1] || match[2] || match[3]) : null;
  }

  private extractWhereClause(sql: string): string | null {
    const match = sql.match(/WHERE (.+?)(?:ORDER BY|GROUP BY|LIMIT|$)/i);
    return match ? match[1].trim() : null;
  }

  private findRecord(records: DatabaseRecord[], whereClause: string, params: any[]): DatabaseRecord | null {
    return records.find(record => this.matchesWhereClause(record, whereClause, params)) || null;
  }

  private findRecords(records: DatabaseRecord[], whereClause: string, params: any[]): DatabaseRecord[] {
    return records.filter(record => this.matchesWhereClause(record, whereClause, params));
  }

  private matchesWhereClause(record: DatabaseRecord, whereClause: string, params: any[]): boolean {
    // Simple WHERE clause parsing for common cases
    if (whereClause.includes('id = ?')) {
      const id = params[0];
      return record.id === id;
    }
    
    if (whereClause.includes('email = ?')) {
      const email = params[0];
      return record.email === email;
    }
    
    if (whereClause.includes('user_id = ?')) {
      const userId = params[0];
      return record.user_id === userId;
    }
    
    if (whereClause.includes('repository_id = ?')) {
      const repoId = params[0];
      return record.repository_id === repoId;
    }
    
    if (whereClause.includes('token = ?')) {
      const token = params[0];
      return record.token === token;
    }
    
    // Handle AND conditions
    if (whereClause.includes('AND')) {
      const conditions = whereClause.split('AND').map(c => c.trim());
      return conditions.every(condition => this.matchesWhereClause(record, condition, params));
    }
    
    return true;
  }

  private insert(sql: string, params: any[]): Promise<any> {
    const table = this.extractTableFromSQL(sql);
    if (!table || !this.data[table as keyof DatabaseTables]) {
      return Promise.resolve({ lastID: 0, changes: 0 });
    }

    const columns = this.extractColumnsFromInsert(sql);
    const newRecord: DatabaseRecord = {
      id: this.nextIds[table as keyof DatabaseTables]++
    };

    columns.forEach((col, index) => {
      if (params[index] !== undefined) {
        newRecord[col] = params[index];
      }
    });

    // Add timestamps
    if (!newRecord.created_at) {
      newRecord.created_at = new Date().toISOString();
    }
    if (!newRecord.updated_at) {
      newRecord.updated_at = new Date().toISOString();
    }

    this.data[table as keyof DatabaseTables].push(newRecord);
    
    return Promise.resolve({ lastID: newRecord.id, changes: 1 });
  }

  private update(sql: string, params: any[]): Promise<any> {
    const table = this.extractTableFromSQL(sql);
    const whereClause = this.extractWhereClause(sql);
    
    if (!table || !this.data[table as keyof DatabaseTables]) {
      return Promise.resolve({ lastID: 0, changes: 0 });
    }

    const records = this.data[table as keyof DatabaseTables];
    const record = this.findRecord(records, whereClause!, params.slice(0, -1));
    
    if (!record) {
      return Promise.resolve({ lastID: 0, changes: 0 });
    }

    // Update fields (excluding the last param which is usually the ID)
    const updateParams = params.slice(0, -1);
    const columns = this.extractColumnsFromUpdate(sql);
    
    columns.forEach((col, index) => {
      if (updateParams[index] !== undefined) {
        record[col] = updateParams[index];
      }
    });

    record.updated_at = new Date().toISOString();
    
    return Promise.resolve({ lastID: record.id, changes: 1 });
  }

  private delete(sql: string, params: any[]): Promise<any> {
    const table = this.extractTableFromSQL(sql);
    const whereClause = this.extractWhereClause(sql);
    
    if (!table || !this.data[table as keyof DatabaseTables]) {
      return Promise.resolve({ lastID: 0, changes: 0 });
    }

    const records = this.data[table as keyof DatabaseTables];
    const initialLength = records.length;
    
    // Remove records that match the WHERE clause
    const filteredRecords = records.filter(record => !this.matchesWhereClause(record, whereClause!, params));
    this.data[table as keyof DatabaseTables] = filteredRecords;
    
    return Promise.resolve({ lastID: 0, changes: initialLength - filteredRecords.length });
  }

  private extractColumnsFromInsert(sql: string): string[] {
    const match = sql.match(/INSERT INTO \w+ \(([^)]+)\)/i);
    return match ? match[1].split(',').map(col => col.trim()) : [];
  }

  private extractColumnsFromUpdate(sql: string): string[] {
    const match = sql.match(/UPDATE \w+ SET ([^W]+)/i);
    return match ? match[1].split(',').map(col => col.trim().split('=')[0].trim()) : [];
  }

  // Method to get all data (for debugging)
  getAllData(): DatabaseTables {
    return this.data;
  }

  // Method to reset data (for testing)
  reset(): void {
    this.data = {
      users: [],
      user_sessions: [],
      repositories: [],
      repository_files: []
    };
    this.nextIds = {
      users: 1,
      user_sessions: 1,
      repositories: 1,
      repository_files: 1
    };
  }
}

export const jsonDatabase = new JSONDatabase();
