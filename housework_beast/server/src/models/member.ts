import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, runSql } from '../db/database';

export type MemberStatus = 'online' | 'offline';

export interface Member {
  member_id: string;
  family_id: string;
  name: string;
  beast_id: string | null;
  total_points: number;
  status: MemberStatus;
  created_at: string;
}

export function createMember(familyId: string, name: string): Member {
  const memberId = uuidv4();
  const createdAt = new Date().toISOString();

  runSql(`
    INSERT INTO members (member_id, family_id, name, beast_id, total_points, status, created_at)
    VALUES (?, ?, ?, NULL, 0, 'offline', ?)
  `, [memberId, familyId, name, createdAt]);

  return {
    member_id: memberId,
    family_id: familyId,
    name: name,
    beast_id: null,
    total_points: 0,
    status: 'offline' as MemberStatus,
    created_at: createdAt
  };
}

export function getMemberById(memberId: string): Member | null {
  const row = queryOne('SELECT * FROM members WHERE member_id = ?', [memberId]);
  return row as Member | null;
}

export function getMembersByFamily(familyId: string): Member[] {
  const rows = queryAll('SELECT * FROM members WHERE family_id = ?', [familyId]);
  return rows as Member[];
}

export function updateMemberStatus(memberId: string, status: MemberStatus): void {
  runSql('UPDATE members SET status = ? WHERE member_id = ?', [status, memberId]);
}

export function updateMemberPoints(memberId: string, points: number): void {
  runSql('UPDATE members SET total_points = ? WHERE member_id = ?', [points, memberId]);
}

export function updateMemberBeast(memberId: string, beastId: string): void {
  runSql('UPDATE members SET beast_id = ? WHERE member_id = ?', [beastId, memberId]);
}

export function deleteMember(memberId: string): void {
  runSql('DELETE FROM members WHERE member_id = ?', [memberId]);
}