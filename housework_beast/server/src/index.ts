import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { join } from 'path';
import { initSqlJsEngine, initDatabase } from './db/database';
import { registerSocketHandlers } from './socket/handlers';
import routes from './routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件（生产环境托管前端构建结果）
const clientDistPath = join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// 注册 REST API 路由
app.use('/api', routes);

// 基础健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 注册 Socket.IO 事件处理器
registerSocketHandlers(io);

const PORT = process.env.PORT || 3000;

// 异步启动服务器
async function startServer() {
  try {
    // 初始化 sql.js 引擎
    await initSqlJsEngine();

    // 初始化数据库
    initDatabase();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };