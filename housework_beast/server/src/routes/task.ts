import { Router } from 'express';
import {
  createTask,
  getTaskById,
  getTasksByFamily,
  getTasksByStatus,
  updateTaskStatus,
  deleteTask,
  TaskStatus
} from '../models/task';

const router = Router();

// 创建任务
router.post('/', (req, res) => {
  try {
    const { familyId, name, points, creatorId, isCustom } = req.body;
    if (!familyId || !name || points === undefined || !creatorId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const task = createTask(familyId, name, points, creatorId, isCustom || false);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// 获取任务信息
router.get('/:taskId', (req, res) => {
  try {
    const task = getTaskById(req.params.taskId);
    if (task) {
      res.json({ success: true, data: task });
    } else {
      res.status(404).json({ success: false, message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get task' });
  }
});

// 获取家庭所有任务
router.get('/family/:familyId', (req, res) => {
  try {
    const tasks = getTasksByFamily(req.params.familyId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get tasks' });
  }
});

// 获取家庭特定状态的任务
router.get('/family/:familyId/status/:status', (req, res) => {
  try {
    const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'pending_confirmation', 'completed'];
    const status = req.params.status as TaskStatus;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const tasks = getTasksByStatus(req.params.familyId, status);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get tasks' });
  }
});

// 更新任务状态
router.patch('/:taskId/status', (req, res) => {
  try {
    const { status, executorId, confirmedBy } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }
    const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'pending_confirmation', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    updateTaskStatus(req.params.taskId, status, executorId, confirmedBy);
    const task = getTaskById(req.params.taskId);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
});

// 删除任务
router.delete('/:taskId', (req, res) => {
  try {
    deleteTask(req.params.taskId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

export default router;