import { connect } from '@planetscale/database';

export interface DatabaseAdapter {
  get: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
  all: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  run: (sql: string, params?: any[]) => Promise<any>;
  exec: (sql: string) => Promise<void>;
  execute: (sql: string, params?: any[]) => Promise<any>;
}

export class PlanetScaleAdapter implements DatabaseAdapter {
  private db: any;

  constructor() {
    const config = {
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
    };

    this.db = connect(config);
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const result = await this.db.execute(sql, params);
    return result.rows[0] || null;
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.db.execute(sql, params);
    return result.rows || [];
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    const result = await this.db.execute(sql, params);
    return {
      lastID: result.insertId,
      changes: result.affectedRows
    };
  }

  async exec(sql: string): Promise<void> {
    await this.db.execute(sql);
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    return await this.db.execute(sql, params);
  }
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
} 