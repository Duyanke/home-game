import { Router } from 'express';
import {
  createMember,
  getMemberById,
  getMembersByFamily,
  updateMemberStatus,
  updateMemberPoints,
  updateMemberBeast,
  deleteMember
} from '../models/member';

const router = Router();

// 创建成员
router.post('/', (req, res) => {
  try {
    const { familyId, name } = req.body;
    if (!familyId || !name) {
      return res.status(400).json({ success: false, message: 'Missing familyId or name' });
    }
    const member = createMember(familyId, name);
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create member' });
  }
});

// 获取成员信息
router.get('/:memberId', (req, res) => {
  try {
    const member = getMemberById(req.params.memberId);
    if (member) {
      res.json({ success: true, data: member });
    } else {
      res.status(404).json({ success: false, message: 'Member not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get member' });
  }
});

// 获取家庭所有成员
router.get('/family/:familyId', (req, res) => {
  try {
    const members = getMembersByFamily(req.params.familyId);
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get members' });
  }
});

// 更新成员状态
router.patch('/:memberId/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }
    updateMemberStatus(req.params.memberId, status);
    const member = getMemberById(req.params.memberId);
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// 更新成员积分
router.patch('/:memberId/points', (req, res) => {
  try {
    const { points } = req.body;
    if (points === undefined) {
      return res.status(400).json({ success: false, message: 'Missing points' });
    }
    updateMemberPoints(req.params.memberId, points);
    const member = getMemberById(req.params.memberId);
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update points' });
  }
});

// 更新成员神兽
router.patch('/:memberId/beast', (req, res) => {
  try {
    const { beastId } = req.body;
    if (!beastId) {
      return res.status(400).json({ success: false, message: 'Missing beastId' });
    }
    updateMemberBeast(req.params.memberId, beastId);
    const member = getMemberById(req.params.memberId);
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update beast' });
  }
});

// 删除成员
router.delete('/:memberId', (req, res) => {
  try {
    deleteMember(req.params.memberId);
    res.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete member' });
  }
});

export default router;