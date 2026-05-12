import { Router } from 'express';
import familyRouter from './family';
import memberRouter from './member';
import beastRouter from './beast';
import taskRouter from './task';
import duelRouter from './duel';

const router = Router();

// 注册各模块路由
router.use('/family', familyRouter);
router.use('/member', memberRouter);
router.use('/beast', beastRouter);
router.use('/task', taskRouter);
router.use('/duel', duelRouter);

export default router;