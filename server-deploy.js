// 导入WebSocket库 - 用于创建WebSocket服务器
const WebSocket = require('ws');
// 导入HTTP库 - 用于创建HTTP服务器
const http = require('http');
// 导入文件系统库 - 用于读写文件
const fs = require('fs');
// 导入路径库 - 用于处理文件路径
const path = require('path');

console.log('Starting server...');

// 消息历史记录（持久化存储）- 存储所有聊天消息的数组
let messageHistory = [];
// 定义历史消息文件路径 - 用于存储消息到文件
const historyFilePath = path.join(__dirname, 'chat_history.json');

// 从文件加载历史消息（如果存在）
try {
  // 检查历史消息文件是否存在
  if (fs.existsSync(historyFilePath)) {
    // 读取历史消息文件内容
    const historyData = fs.readFileSync(historyFilePath, 'utf8');
    // 将JSON格式的文件内容解析为JavaScript对象数组
    messageHistory = JSON.parse(historyData);
    console.log(`Loaded ${messageHistory.length} messages from history`);
  } else {
    console.log('No history file found, starting fresh');
  }
} catch (error) {
  // 如果加载失败，输出错误信息并使用空数组
  console.log('未能加载历史消息，使用空历史记录:', error.message);
}

// 创建HTTP服务器用于提供静态文件 - 处理客户端请求，提供HTML、CSS、JS等文件
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // 健康检查端点
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  // 如果请求是获取历史消息的API - 客户端请求获取聊天历史
  if (req.url === '/api/history') {
    // 设置响应头 - 状态码200，内容类型为JSON
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // 发送历史消息 - 将消息历史转换为JSON格式发送给客户端
    res.end(JSON.stringify(messageHistory));
    return;
  }
  
  // 确定请求的文件路径 - 如果请求根路径，则默认为index.html
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // 确保路径不包含可能的安全问题
  filePath = path.normalize(filePath);
  if (filePath.startsWith('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // 构建完整文件路径 - 拼接当前目录路径
  const fullPath = path.join(__dirname, filePath);

  // 读取请求的文件内容
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      console.error(`File not found: ${fullPath}`);
      // 如果文件不存在，返回404错误
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    // 获取文件扩展名 - 用于设置正确的Content-Type
    const ext = path.extname(fullPath);
    // 默认内容类型为HTML
    let contentType = 'text/html';
    
    // 根据文件扩展名设置相应的内容类型
    switch(ext) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.ico':
        contentType = 'image/x-icon';
        break;
      default:
        contentType = 'text/html';
    }

    // 设置响应头 - 状态码200和相应的内容类型
    res.writeHead(200, { 'Content-Type': contentType });
    // 发送文件内容给客户端
    res.end(content);
  });
});

// 创建WebSocket服务器，绑定到HTTP服务器 - 处理实时聊天通信
const wss = new WebSocket.Server({ server });

// 存储所有活动连接 - 保存当前连接的客户端列表
const clients = new Set();

// 监听客户端连接事件 - 当有新客户端连接时触发
wss.on('connection', (ws) => {
  // 输出连接日志 - 记录新客户端连接
  console.log('New client connected');
  
  // 将新客户端添加到集合中 - 用于后续消息广播
  clients.add(ws);

  // 发送历史消息给新连接的客户端 - 让新用户看到之前的聊天记录
  if (messageHistory.length > 0) {
    // 发送历史消息 - 将消息历史作为JSON字符串发送
    ws.send(JSON.stringify({
      type: 'history',
      messages: messageHistory
    }));
  }

  // 发送欢迎消息给新连接的客户端 - 通知用户连接成功
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to chat server!',
    timestamp: new Date().toISOString() // 当前时间戳
  }));

  // 广播新用户加入消息 - 通知所有其他用户有新人加入
  broadcast({
    type: 'userJoined',
    message: 'A new user joined the chat',
    timestamp: new Date().toISOString() // 当前时间戳
  }, ws);

  // 监听客户端发送的消息事件 - 处理客户端发送的消息
  ws.on('message', (data) => {
    try {
      // 解析接收到的消息 - 将JSON字符串转换为JavaScript对象
      const message = JSON.parse(data.toString());
      
      // 验证消息格式 - 检查消息是否包含必要字段
      if (!message.type || !message.content) {
        // 发送错误消息 - 告诉客户端消息格式无效
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
        return;
      }

      // 构造广播消息 - 创建标准格式的消息对象
      const broadcastMessage = {
        type: 'chatMessage',
        username: message.username || 'Anonymous', // 如果没有用户名，默认为匿名
        content: message.content,
        timestamp: new Date().toISOString() // 添加当前时间戳
      };

      // 保存消息到历史记录 - 将消息添加到消息历史数组
      messageHistory.push(broadcastMessage);
      
      // 限制历史记录大小，保留最新的1000条消息 - 防止内存溢出
      if (messageHistory.length > 1000) {
        // 只保留最新的1000条消息 - 丢弃较早的消息
        messageHistory = messageHistory.slice(-1000);
      }
      
      // 保存历史记录到文件 - 持久化存储消息
      try {
        // 写入JSON格式的消息历史到文件
        fs.writeFileSync(historyFilePath, JSON.stringify(messageHistory));
      } catch (error) {
        // 如果保存失败，输出错误日志
        console.error('保存历史消息失败:', error);
        // 在生产环境中，可以考虑记录到外部服务而不是本地文件
        if (process.env.NODE_ENV === 'production') {
          console.warn('注意: Railway环境中的文件系统是临时的，重启后数据会丢失');
        }
      }

      // 广播消息给所有其他客户端 - 将消息发送给除发送者外的所有用户
      broadcast(broadcastMessage, ws);
    } catch (e) {
      // 如果消息解析失败，输出错误日志
      console.error('Error parsing message:', e);
      // 发送错误消息给客户端 - 告诉客户端JSON格式错误
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON format'
      }));
    }
  });

  // 监听连接关闭事件 - 当客户端断开连接时触发
  ws.on('close', () => {
    // 输出断开连接日志
    console.log('Client disconnected');
    // 从活动连接集合中移除客户端
    clients.delete(ws);
    
    // 广播用户离开消息 - 通知其他用户有人离开了
    broadcast({
      type: 'userLeft',
      message: 'A user left the chat',
      timestamp: new Date().toISOString() // 当前时间戳
    }, ws);
  });

  // 监听错误事件 - 处理WebSocket连接错误
  ws.on('error', (error) => {
    // 输出错误日志 - 记录WebSocket错误
    console.error('WebSocket error:', error);
    // 从活动连接集合中移除客户端
    clients.delete(ws);
  });
});

// 向除发送者外的所有客户端广播消息 - 将消息发送给所有连接的客户端，除了发送者本身
function broadcast(message, sender) {
  // 遍历所有活动连接
  clients.forEach(client => {
    // 检查客户端不是发送者且连接状态为OPEN
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      // 发送消息 - 将消息对象转换为JSON字符串发送
      client.send(JSON.stringify(message));
    }
  });
}

// 定义服务器端口 - 从环境变量获取端口，如果没有则使用默认值8080
const PORT = process.env.PORT || 8080;
// 启动服务器 - 监听指定端口，允许来自任何IP的连接
server.listen(PORT, '0.0.0.0', () => {
  // 输出服务器启动信息 - 显示服务器运行地址
  console.log(`Server running on port ${PORT}`);
  console.log(`Server listening on 0.0.0.0:${PORT}`);
  console.log('WebSocket server ready to accept connections');
  console.log('App is ready for connections');
});