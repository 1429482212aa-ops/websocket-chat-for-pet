# 爱宠之家即时通讯WebSocket聊天应用

这是一个实时聊天应用程序，使用WebSocket技术实现实时消息传递功能。

## 功能特性

- 实时WebSocket聊天
- 消息历史记录
- 用户连接/断开通知
- 响应式界面设计

## 技术栈

- Node.js
- WebSocket (ws库)
- HTML/CSS/JavaScript (前端)

## 部署到Railway

### 自动部署

点击下方按钮一键部署到Railway：

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/your-repo/websocket-chat-app)

### 手动部署

1. 将代码推送到GitHub仓库
2. 在Railway上创建新项目
3. 选择"Deploy from GitHub"
4. 选择您的仓库
5. Railway将自动检测配置并开始部署

### 环境要求

- Node.js 18+
- 依赖项将在构建过程中自动安装

### 配置说明

- **端口**: 应用会自动使用Railway提供的`PORT`环境变量
- **健康检查**: `/health` 端点可用于健康检查
- **API端点**: `/api/history` 提供历史消息访问

### 注意事项

1. **数据持久性**: 由于Railway的文件系统是临时的，聊天历史将在应用重启后丢失。对于生产环境，建议集成数据库解决方案。
2. **WebSocket支持**: Railway完全支持WebSocket连接
3. **静态文件**: 所有前端文件将被正确服务

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 启动生产服务器

```bash
npm start
```

## 项目结构

```
├── server-deploy.js     # 主服务器文件
├── index.html          # 前端页面
├── script.js           # 前端JavaScript
├── style.css           # 前端样式
├── package.json        # 项目配置
├── Procfile            # 部署配置
├── Dockerfile          # 容器化配置
└── railway.toml        # Railway配置
```

## API端点

- `GET /` - 主页
- `GET /health` - 健康检查
- `GET /api/history` - 获取聊天历史

## 故障排除

如果在Railway上部署遇到问题：

1. 检查日志输出以查看错误信息
2. 确认`PORT`环境变量正在使用
3. 验证WebSocket连接在生产环境中正常工作
4. 注意临时文件系统限制

## 许可证

MIT