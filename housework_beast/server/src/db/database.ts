import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic } from 'sql.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';

const DB_DIR = join(__dirname, '../../data');
const DB_PATH = join(DB_DIR, 'housework.db');

let SQL: SqlJsStatic | null = null;
let db: SqlJsDatabase | null = null;

export async function initSqlJsEngine(): Promise<void> {
  SQL = await initSqlJs();
  console.log('sql.js engine initialized');
}

export function getDatabase(): SqlJsDatabase {
  if (!SQL) {
    throw new Error('sql.js not initialized. Call initSqlJsEngine() first.');
  }
  if (!db) {
    // 确保数据目录存在
    if (!existsSync(DB_DIR)) {
      mkdirSync(DB_DIR, { recursive: true });
    }

    // 如果数据库文件存在，加载它
    if (existsSync(DB_PATH)) {
      const fileBuffer = readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  }
  return db;
}

export function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

export function initDatabase(): void {
  const database = getDatabase();
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

  // 执行 schema 创建表（sql.js 需要逐条执行）
  const statements = schema.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    try {
      database.run(stmt.trim());
    } catch (e) {
      // 忽略 "table already exists" 错误
      const error = e as Error;
      if (!error.message.includes('already exists')) {
        console.error('Schema error:', error.message, 'Statement:', stmt.trim().substring(0, 50));
      }
    }
  }

  saveDatabase();
  console.log('Database initialized successfully');
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

// 清空所有数据（用于测试）
export function clearAllTables(): void {
  const database = getDatabase();
  database.run('DELETE FROM duels');
  database.run('DELETE FROM tasks');
  database.run('DELETE FROM beasts');
  database.run('DELETE FROM members');
  database.run('DELETE FROM families');
  saveDatabase();
}

// 辅助函数：运行查询并返回结果
export function queryAll(sql: string, params: any[] = []): any[] {
  const database = getDatabase();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}

export function queryOne(sql: string, params: any[] = []): any | null {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

export function runSql(sql: string, params: any[] = []): void {
  const database = getDatabase();
  database.run(sql, params);
  saveDatabase();
}