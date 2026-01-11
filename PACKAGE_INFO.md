# package.json 详细说明

这是一个Node.js项目的配置文件，包含了项目的基本信息、依赖管理和脚本配置。

## 文件内容及说明

```json
{
  // 项目名称 - 项目的唯一标识符
  "name": "websocket-chat-app",
  
  // 项目版本号 - 遵循语义化版本控制规范
  "version": "1.0.0",
  
  // 项目描述 - 简短说明项目的作用
  "description": "A real-time chat application using WebSocket",
  
  // 主入口文件 - Node.js应用的启动文件
  "main": "server/server.js",
  
  // 脚本命令 - 定义可执行的命令
  "scripts": {
    // 生产环境启动命令 - 使用node直接运行服务器
    "start": "node server/server.js",
    
    // 开发环境启动命令 - 使用nodemon运行服务器（文件变化时自动重启）
    "dev": "nodemon server/server.js"
  },
  
  // 生产依赖 - 项目运行必需的包
  "dependencies": {
    // ws库 - 提供WebSocket功能，用于实现实时双向通信
    "ws": "^8.14.2"
  },
  
  // 开发依赖 - 开发过程中使用的工具包
  "devDependencies": {
    // nodemon - 开发工具，监视文件变化并自动重启服务器
    "nodemon": "^3.0.1"
  },
  
  // 关键词 - 描述项目特性的关键词
  "keywords": [
    "websocket",    // WebSocket技术
    "chat",         // 聊天功能
    "real-time",    // 实时通信
    "messaging"     // 消息传递
  ],
  
  // 作者信息 - 项目开发者信息
  "author": "Chat Application",
  
  // 许可证 - 项目开源许可证
  "license": "MIT"
}
```

## 各部分详细说明

### 1. 基本信息
- **name**: 项目名称，用于npm包注册和引用
- **version**: 版本号，遵循MAJOR.MINOR.PATCH格式
- **description**: 项目简介，帮助他人理解项目用途

### 2. 入口文件
- **main**: 指定应用的主入口文件，require()时默认加载此文件

### 3. 脚本命令
- **start**: 生产环境启动命令，适用于部署上线
- **dev**: 开发环境命令，便于开发调试

### 4. 依赖管理
- **dependencies**: 生产环境依赖，部署时需要安装
- **devDependencies**: 开发环境依赖，仅开发时需要

### 5. 重要依赖说明
- **ws**: WebSocket库，提供WebSocket服务器和客户端功能
- **nodemon**: 开发辅助工具，提高开发效率

## 常用命令

```bash
# 安装所有依赖
npm install

# 启动生产环境
npm start

# 启动开发环境
npm run dev

# 安装特定依赖
npm install <package-name>

# 安装开发依赖
npm install <package-name> --save-dev
```