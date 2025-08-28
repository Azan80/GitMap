import { createClient } from '@supabase/supabase-js';
import { DatabaseAdapter } from './cloud-database';

export class SupabaseAdapter implements DatabaseAdapter {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const { table, whereClause } = this.parseSQL(sql);
    
    if (!table) return null;

    let query = this.supabase.from(table).select('*');
    
    if (whereClause) {
      query = this.applyWhereClause(query, whereClause, params);
    }

    const { data, error } = await query.limit(1);
    
    if (error) {
      console.error('Supabase query error:', error);
      return null;
    }

    return data?.[0] || null;
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const { table, whereClause } = this.parseSQL(sql);
    
    if (!table) return [];

    let query = this.supabase.from(table).select('*');
    
    if (whereClause) {
      query = this.applyWhereClause(query, whereClause, params);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return [];
    }

    return data || [];
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
    // For CREATE TABLE statements, we'll create the table in Supabase
    const tableMatch = sql.match(/CREATE TABLE (\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      console.log(`Table ${tableName} would be created in Supabase`);
    }
  }

  async close(): Promise<void> {
    // Supabase doesn't need explicit closing
  }

  private parseSQL(sql: string): { table: string | null; whereClause: string | null } {
    const tableMatch = sql.match(/FROM (\w+)|INTO (\w+)|UPDATE (\w+)/i);
    const table = tableMatch ? (tableMatch[1] || tableMatch[2] || tableMatch[3]) : null;
    
    const whereMatch = sql.match(/WHERE (.+?)(?:ORDER BY|GROUP BY|LIMIT|$)/i);
    const whereClause = whereMatch ? whereMatch[1].trim() : null;
    
    return { table, whereClause };
  }

  private applyWhereClause(query: any, whereClause: string, params: any[]): any {
    if (whereClause.includes('id = ?')) {
      return query.eq('id', params[0]);
    }
    
    if (whereClause.includes('email = ?')) {
      return query.eq('email', params[0]);
    }
    
    if (whereClause.includes('user_id = ?')) {
      return query.eq('user_id', params[0]);
    }
    
    if (whereClause.includes('repository_id = ?')) {
      return query.eq('repository_id', params[0]);
    }
    
    if (whereClause.includes('token = ?')) {
      return query.eq('token', params[0]);
    }
    
    if (whereClause.includes('AND')) {
      const conditions = whereClause.split('AND').map(c => c.trim());
      conditions.forEach((condition, index) => {
        if (condition.includes('id = ?')) {
          query = query.eq('id', params[index]);
        } else if (condition.includes('user_id = ?')) {
          query = query.eq('user_id', params[index]);
        }
      });
    }
    
    return query;
  }

  private async insert(sql: string, params: any[]): Promise<any> {
    const { table } = this.parseSQL(sql);
    if (!table) return { lastID: 0, changes: 0 };

    const columns = this.extractColumnsFromInsert(sql);
    const data: any = {};

    columns.forEach((col, index) => {
      if (params[index] !== undefined) {
        data[col] = params[index];
      }
    });

    // Add timestamps
    if (!data.created_at) {
      data.created_at = new Date().toISOString();
    }
    if (!data.updated_at) {
      data.updated_at = new Date().toISOString();
    }

    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return { lastID: 0, changes: 0 };
    }

    return { lastID: result.id, changes: 1 };
  }

  private async update(sql: string, params: any[]): Promise<any> {
    const { table, whereClause } = this.parseSQL(sql);
    if (!table) return { lastID: 0, changes: 0 };

    const columns = this.extractColumnsFromUpdate(sql);
    const data: any = {};

    // Update fields (excluding the last param which is usually the ID)
    const updateParams = params.slice(0, -1);
    columns.forEach((col, index) => {
      if (updateParams[index] !== undefined) {
        data[col] = updateParams[index];
      }
    });

    data.updated_at = new Date().toISOString();

    let query = this.supabase.from(table).update(data);
    
    if (whereClause) {
      query = this.applyWhereClause(query, whereClause, params.slice(0, -1));
    }

    const { data: result, error } = await query.select();

    if (error) {
      console.error('Supabase update error:', error);
      return { lastID: 0, changes: 0 };
    }

    return { lastID: result?.[0]?.id || 0, changes: result?.length || 0 };
  }

  private async delete(sql: string, params: any[]): Promise<any> {
    const { table, whereClause } = this.parseSQL(sql);
    if (!table) return { lastID: 0, changes: 0 };

    let query = this.supabase.from(table).delete();
    
    if (whereClause) {
      query = this.applyWhereClause(query, whereClause, params);
    }

    const { data: result, error } = await query.select();

    if (error) {
      console.error('Supabase delete error:', error);
      return { lastID: 0, changes: 0 };
    }

    return { lastID: 0, changes: result?.length || 0 };
  }

  private extractColumnsFromInsert(sql: string): string[] {
    const match = sql.match(/INSERT INTO \w+ \(([^)]+)\)/i);
    return match ? match[1].split(',').map(col => col.trim()) : [];
  }

  private extractColumnsFromUpdate(sql: string): string[] {
    const match = sql.match(/UPDATE \w+ SET ([^W]+)/i);
    return match ? match[1].split(',').map(col => col.trim().split('=')[0].trim()) : [];
  }
}
