import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, runSql } from '../db/database';

export interface Family {
  family_id: string;
  family_code: string;
  created_at: string;
}

export function createFamily(): Family {
  const familyId = uuidv4();
  const familyCode = generateFamilyCode();
  const createdAt = new Date().toISOString();

  runSql(`
    INSERT INTO families (family_id, family_code, created_at)
    VALUES (?, ?, ?)
  `, [familyId, familyCode, createdAt]);

  return {
    family_id: familyId,
    family_code: familyCode,
    created_at: createdAt
  };
}

export function getFamilyById(familyId: string): Family | null {
  const row = queryOne('SELECT * FROM families WHERE family_id = ?', [familyId]);
  return row as Family | null;
}

export function getFamilyByCode(familyCode: string): Family | null {
  const row = queryOne('SELECT * FROM families WHERE family_code = ?', [familyCode]);
  return row as Family | null;
}

export function getAllFamilies(): Family[] {
  const rows = queryAll('SELECT * FROM families');
  return rows as Family[];
}

function generateFamilyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}