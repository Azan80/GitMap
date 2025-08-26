import fs from 'fs';
import path from 'path';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  // For Vercel deployment, use a simple in-memory database with fallback
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    // Use in-memory database for Vercel
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });
  } else {
    // Use local file database for development
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'gitmap.db');
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }

                // Create tables if they don't exist
              await db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  password_hash TEXT NOT NULL,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS user_sessions (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER NOT NULL,
                  token TEXT UNIQUE NOT NULL,
                  expires_at DATETIME NOT NULL,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id)
                );

                CREATE TABLE IF NOT EXISTS repositories (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER NOT NULL,
                  name TEXT NOT NULL,
                  description TEXT,
                  is_private BOOLEAN DEFAULT 0,
                  git_url TEXT UNIQUE NOT NULL,
                  git_data TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id)
                );

                CREATE TABLE IF NOT EXISTS repository_files (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  repository_id INTEGER NOT NULL,
                  file_path TEXT NOT NULL,
                  file_name TEXT NOT NULL,
                  file_content TEXT,
                  file_size INTEGER DEFAULT 0,
                  file_type TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (repository_id) REFERENCES repositories (id) ON DELETE CASCADE
                );
              `);

              // Migration: Add git_url column if it doesn't exist
              try {
                await db.run('ALTER TABLE repositories ADD COLUMN git_url TEXT');
                console.log('Added git_url column to repositories table');
              } catch (error) {
                // Column already exists, ignore error
                console.log('git_url column already exists');
              }

              // Add UNIQUE constraint if it doesn't exist
              try {
                await db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_repositories_git_url ON repositories(git_url)');
                console.log('Added unique constraint to git_url column');
              } catch (error) {
                console.log('Unique constraint already exists or failed');
              }

              // Update existing repositories with git_url if they don't have one
              try {
                const reposWithoutUrl = await db.all('SELECT r.*, u.username FROM repositories r JOIN users u ON r.user_id = u.id WHERE r.git_url IS NULL OR r.git_url = ""');
                
                for (const repo of reposWithoutUrl) {
                  const gitUrl = `git://localhost:3001/${repo.username}/${repo.name}.git`;
                  await db.run('UPDATE repositories SET git_url = ? WHERE id = ?', [gitUrl, repo.id]);
                  console.log(`Updated repository ${repo.name} with git_url: ${gitUrl}`);
                }
              } catch (error) {
                console.log('Error updating existing repositories:', error);
              }

              // Add sample data for new installations
              try {
                // Check if sample user exists
                const existingUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@gitmap.com']);
                if (!existingUser) {
                  // Create admin user
                  await db.run(
                    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                    ['admin', 'admin@gitmap.com', '$2b$10$demo.hash.for.testing.purposes.only']
                  );
                  console.log('Created admin user for new installation');
                }
              } catch (error) {
                console.log('Error creating sample data:', error);
              }

  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface Repository {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  is_private: boolean;
  git_url: string;
  git_data?: string;
  created_at: string;
  updated_at: string;
}

export interface RepositoryFile {
  id: number;
  repository_id: number;
  file_path: string;
  file_name: string;
  file_content?: string;
  file_size: number;
  file_type?: string;
  created_at: string;
  updated_at: string;
}
