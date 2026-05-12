import { Router } from 'express';
import {
  createBeast,
  getBeastById,
  getBeastByMember,
  updateBeastStage,
  updateBeastSkills,
  updateBeastEp,
  calculateStage,
  getUnlockedSkillsCount,
  BeastType
} from '../models/beast';

const router = Router();

// 创建神兽
router.post('/', (req, res) => {
  try {
    const { memberId, beastType } = req.body;
    if (!memberId || !beastType) {
      return res.status(400).json({ success: false, message: 'Missing memberId or beastType' });
    }
    const validTypes: BeastType[] = ['qinglong', 'zhuque', 'baihu', 'xuanwu', 'qilin'];
    if (!validTypes.includes(beastType)) {
      return res.status(400).json({ success: false, message: 'Invalid beast type' });
    }
    const beast = createBeast(memberId, beastType);
    res.json({ success: true, data: beast });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create beast' });
  }
});

// 获取神兽信息
router.get('/:beastId', (req, res) => {
  try {
    const beast = getBeastById(req.params.beastId);
    if (beast) {
      res.json({ success: true, data: beast });
    } else {
      res.status(404).json({ success: false, message: 'Beast not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get beast' });
  }
});

// 获取成员的神兽
router.get('/member/:memberId', (req, res) => {
  try {
    const beast = getBeastByMember(req.params.memberId);
    if (beast) {
      res.json({ success: true, data: beast });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get beast' });
  }
});

// 更新神兽阶段
router.patch('/:beastId/stage', (req, res) => {
  try {
    const { stage } = req.body;
    if (stage === undefined) {
      return res.status(400).json({ success: false, message: 'Missing stage' });
    }
    updateBeastStage(req.params.beastId, stage);
    const beast = getBeastById(req.params.beastId);
    res.json({ success: true, data: beast });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stage' });
  }
});

// 更新神兽技能
router.patch('/:beastId/skills', (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'Missing or invalid skills' });
    }
    updateBeastSkills(req.params.beastId, skills);
    const beast = getBeastById(req.params.beastId);
    res.json({ success: true, data: beast });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update skills' });
  }
});

// 更新神兽能量
router.patch('/:beastId/ep', (req, res) => {
  try {
    const { ep } = req.body;
    if (ep === undefined) {
      return res.status(400).json({ success: false, message: 'Missing ep' });
    }
    updateBeastEp(req.params.beastId, ep);
    const beast = getBeastById(req.params.beastId);
    res.json({ success: true, data: beast });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ep' });
  }
});

// 根据积分计算阶段
router.post('/calculate-stage', (req, res) => {
  try {
    const { totalPoints } = req.body;
    if (totalPoints === undefined) {
      return res.status(400).json({ success: false, message: 'Missing totalPoints' });
    }
    const stage = calculateStage(totalPoints);
    const skillsCount = getUnlockedSkillsCount(stage);
    res.json({ success: true, data: { stage, skillsCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate stage' });
  }
});

export default router;