import { Router } from 'express';
import { createFamily, getFamilyById, getFamilyByCode, getAllFamilies } from '../models/family';

const router = Router();

// 创建新家庭
router.post('/', (req, res) => {
  try {
    const family = createFamily();
    res.json({ success: true, data: family });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create family' });
  }
});

// 获取家庭信息
router.get('/:familyId', (req, res) => {
  try {
    const family = getFamilyById(req.params.familyId);
    if (family) {
      res.json({ success: true, data: family });
    } else {
      res.status(404).json({ success: false, message: 'Family not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get family' });
  }
});

// 通过家庭码查询
router.get('/code/:familyCode', (req, res) => {
  try {
    const family = getFamilyByCode(req.params.familyCode);
    if (family) {
      res.json({ success: true, data: family });
    } else {
      res.status(404).json({ success: false, message: 'Family code not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get family by code' });
  }
});

// 获取所有家庭（调试用）
router.get('/', (req, res) => {
  try {
    const families = getAllFamilies();
    res.json({ success: true, data: families });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get families' });
  }
});

export default router;