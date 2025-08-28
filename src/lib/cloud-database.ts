export interface DatabaseAdapter {
  get: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
  all: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  run: (sql: string, params?: any[]) => Promise<any>;
  exec: (sql: string) => Promise<void>;
  execute: (sql: string, params?: any[]) => Promise<any>;
  close: () => Promise<void>;
}

export class LocalSQLiteAdapter implements DatabaseAdapter {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    return await this.db.get(sql, params);
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return await this.db.all(sql, params);
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    return await this.db.run(sql, params);
  }

  async exec(sql: string): Promise<void> {
    return await this.db.exec(sql);
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    return await this.db.run(sql, params);
  }

  async close(): Promise<void> {
    if (this.db.close) {
      await this.db.close();
    }
  }
} 