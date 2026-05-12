import { Router } from 'express';
import {
  createDuel,
  getDuelById,
  getDuelsByMember,
  getOngoingDuels,
  updateDuelResult,
  incrementDuelRounds,
  DuelResult
} from '../models/duel';

const router = Router();

// 创建决斗
router.post('/', (req, res) => {
  try {
    const { challengerId, defenderId } = req.body;
    if (!challengerId || !defenderId) {
      return res.status(400).json({ success: false, message: 'Missing challengerId or defenderId' });
    }
    const duel = createDuel(challengerId, defenderId);
    res.json({ success: true, data: duel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create duel' });
  }
});

// 获取决斗信息
router.get('/:duelId', (req, res) => {
  try {
    const duel = getDuelById(req.params.duelId);
    if (duel) {
      res.json({ success: true, data: duel });
    } else {
      res.status(404).json({ success: false, message: 'Duel not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get duel' });
  }
});

// 获取成员的决斗记录
router.get('/member/:memberId', (req, res) => {
  try {
    const duels = getDuelsByMember(req.params.memberId);
    res.json({ success: true, data: duels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get duels' });
  }
});

// 获取所有进行中的决斗
router.get('/ongoing', (req, res) => {
  try {
    const duels = getOngoingDuels();
    res.json({ success: true, data: duels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get ongoing duels' });
  }
});

// 更新决斗结果
router.patch('/:duelId/result', (req, res) => {
  try {
    const { result, winnerId, rounds } = req.body;
    if (!result) {
      return res.status(400).json({ success: false, message: 'Missing result' });
    }
    const validResults: DuelResult[] = ['ongoing', 'challenger_win', 'defender_win', 'draw'];
    if (!validResults.includes(result)) {
      return res.status(400).json({ success: false, message: 'Invalid result' });
    }
    updateDuelResult(req.params.duelId, result, winnerId, rounds);
    const duel = getDuelById(req.params.duelId);
    res.json({ success: true, data: duel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update duel result' });
  }
});

// 增加决斗回合数
router.patch('/:duelId/rounds/increment', (req, res) => {
  try {
    const newRounds = incrementDuelRounds(req.params.duelId);
    res.json({ success: true, data: { rounds: newRounds } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to increment rounds' });
  }
});

export default router;