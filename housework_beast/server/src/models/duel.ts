import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, runSql } from '../db/database';

export type DuelResult = 'ongoing' | 'challenger_win' | 'defender_win' | 'draw';

export interface Duel {
  duel_id: string;
  challenger_id: string;
  defender_id: string;
  winner_id: string | null;
  result: DuelResult;
  rounds: number;
  created_at: string;
  ended_at: string | null;
}

export function createDuel(challengerId: string, defenderId: string): Duel {
  const duelId = uuidv4();
  const createdAt = new Date().toISOString();

  runSql(`
    INSERT INTO duels (duel_id, challenger_id, defender_id, winner_id, result, rounds, created_at)
    VALUES (?, ?, ?, NULL, 'ongoing', 0, ?)
  `, [duelId, challengerId, defenderId, createdAt]);

  return {
    duel_id: duelId,
    challenger_id: challengerId,
    defender_id: defenderId,
    winner_id: null,
    result: 'ongoing' as DuelResult,
    rounds: 0,
    created_at: createdAt,
    ended_at: null
  };
}

export function getDuelById(duelId: string): Duel | null {
  const row = queryOne('SELECT * FROM duels WHERE duel_id = ?', [duelId]);
  return row as Duel | null;
}

export function getDuelsByMember(memberId: string): Duel[] {
  const rows = queryAll(`
    SELECT * FROM duels WHERE challenger_id = ? OR defender_id = ? ORDER BY created_at DESC
  `, [memberId, memberId]);
  return rows as Duel[];
}

export function getOngoingDuels(): Duel[] {
  const rows = queryAll('SELECT * FROM duels WHERE result = \'ongoing\'');
  return rows as Duel[];
}

export function updateDuelResult(
  duelId: string,
  result: DuelResult,
  winnerId?: string,
  rounds?: number
): void {
  runSql(`
    UPDATE duels SET result = ?, winner_id = ?, rounds = ?, ended_at = ? WHERE duel_id = ?
  `, [result, winnerId || null, rounds || 0, new Date().toISOString(), duelId]);
}

export function incrementDuelRounds(duelId: string): number {
  const duel = getDuelById(duelId);
  if (!duel) return 0;

  const newRounds = duel.rounds + 1;
  runSql('UPDATE duels SET rounds = ? WHERE duel_id = ?', [newRounds, duelId]);

  return newRounds;
}