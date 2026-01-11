# 爱宠之家即时通讯WebSocket聊天应用

这是一个实时聊天应用程序，使用WebSocket技术实现实时消息传递功能，并集成了MongoDB以实现消息持久化。

## 功能特性

- 实时WebSocket聊天
- 消息历史记录（持久化存储）
- 用户连接/断开通知
- 响应式界面设计

## 技术栈

- Node.js
- WebSocket (ws库)
- MongoDB
- HTML/CSS/JavaScript (前端)

## 部署到Render（推荐）

### 自动部署

1. 访问 https://render.com
2. 注册账户并连接GitHub
3. 点击"New +"按钮，选择"Web Service"
4. 连接您的GitHub账户并选择此仓库
5. 配置如下：
   - 服务名称：输入唯一名称
   - 运行时：Node
   - 构建命令：`npm ci --only=production`
   - 启动命令：`npm start`
6. 在环境变量部分添加：
   - `MONGODB_URI`: 您的MongoDB连接字符串
7. 点击"Create Web Service"

### 部署到Railway

如果您的Railway账户允许Web服务部署：

1. 访问 https://railway.app
2. 注册账户并连接GitHub
3. 点击"New Project"
4. 选择"Deploy from GitHub repo"
5. 选择您的仓库
6. 在"Variables"选项卡中添加：
   - `MONGODB_URI`: 您的MongoDB连接字符串

## 获取MongoDB连接字符串

### 使用MongoDB Atlas（推荐）

1. 访问 https://www.mongodb.com/atlas
2. 创建免费账户
3. 创建集群
4. 设置数据库用户和密码
5. 在"Network Access"中添加IP白名单（或允许所有IP）
6. 获取连接字符串并替换用户名和密码

连接字符串格式：
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

1. 首先设置环境变量（创建`.env`文件）：
```
MONGODB_URI=your-mongodb-connection-string
```

2. 启动开发服务器：
```bash
npm run dev
```

### 启动生产服务器

```bash
npm start
```

## 项目结构

```
├── server-db.js        # 支持数据库的主服务器文件
├── server-deploy.js    # 原始服务器文件（备选）
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

## 持久化存储

- 消息现在存储在MongoDB数据库中
- 即使应用重启，聊天历史也会保留
- 自动清理超过1000条的历史消息以节省空间

## 故障排除

如果部署遇到问题：

1. 检查日志输出以查看错误信息
2. 确认`MONGODB_URI`环境变量正确配置
3. 验证数据库连接字符串格式正确
4. 确认`PORT`环境变量正在使用
5. 验证WebSocket连接在生产环境中正常工作

## 许可证

MIT