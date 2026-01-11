// 聊天应用程序类 - 封装聊天功能的所有逻辑
class ChatApp {
  // 构造函数 - 初始化聊天应用实例
  constructor() {
    // WebSocket连接对象 - 用于与服务器通信
    this.ws = null;
    // 连接状态标志 - 表示是否已连接到服务器
    this.isConnected = false;
    // 用户名 - 存储当前用户的名称
    this.username = '';
    
    // 获取DOM元素 - 获取页面上的各个元素以便操作
    this.statusSpan = document.getElementById('status'); // 状态文本元素
    this.statusDot = document.getElementById('statusDot'); // 状态指示灯元素
    this.messagesArea = document.getElementById('messagesArea'); // 消息显示区域
    this.usernameInput = document.getElementById('usernameInput'); // 用户名输入框
    this.messageInput = document.getElementById('messageInput'); // 消息输入框
    this.sendButton = document.getElementById('sendButton'); // 发送按钮
    this.serverAddress = document.getElementById('serverAddress'); // 服务器地址显示元素
    
    // 绑定事件 - 为各种用户交互绑定事件处理器
    this.bindEvents();
    
    // 初始化WebSocket连接 - 连接到聊天服务器
    this.connect();
  }
  
  // 绑定事件 - 为用户交互元素绑定事件处理器
  bindEvents() {
    // 用户名输入事件 - 当用户输入用户名时更新用户名变量
    this.usernameInput.addEventListener('input', (e) => {
      // 更新用户名 - 获取输入框的值并去除前后空格
      this.username = e.target.value.trim();
      // 更新发送按钮状态 - 根据输入内容启用或禁用发送按钮
      this.updateSendButtonState();
    });
    
    // 消息输入事件 - 当用户在消息输入框中按键时
    this.messageInput.addEventListener('keypress', (e) => {
      // 如果按下了回车键，则发送消息
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    // 发送按钮点击事件 - 当用户点击发送按钮时
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
  }
  
  // 连接到聊天服务器 - 建立WebSocket连接
  connect() {
    // 在生产环境中，我们通常会从服务器获取WebSocket地址
    // 但在本地开发中，我们使用固定的地址
    // 构建WebSocket连接URL - 根据当前协议决定WebSocket协议
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    // 更新页面上显示的服务器地址
    this.serverAddress.textContent = wsUrl;
    
    try {
      // 创建WebSocket连接 - 连接到聊天服务器
      this.ws = new WebSocket(wsUrl);
      
      // 连接打开事件 - 当WebSocket连接成功建立时
      this.ws.onopen = () => {
        // 输出连接成功日志
        console.log('WebSocket连接已建立');
        // 设置连接状态为已连接
        this.isConnected = true;
        // 更新页面上的连接状态显示
        this.updateConnectionStatus(true);
        // 显示连接成功消息
        this.showMessage('已连接到服务器', 'system');
      };
      
      // 接收消息事件 - 当从服务器接收到消息时
      this.ws.onmessage = (event) => {
        try {
          // 解析接收到的消息 - 将JSON字符串转换为JavaScript对象
          const data = JSON.parse(event.data);
          // 处理接收到的消息
          this.handleMessage(data);
        } catch (e) {
          // 如果消息解析失败，输出错误日志
          console.error('解析消息失败:', e);
        }
      };
      
      // 连接关闭事件 - 当WebSocket连接关闭时
      this.ws.onclose = () => {
        // 输出连接关闭日志
        console.log('WebSocket连接已关闭');
        // 设置连接状态为未连接
        this.isConnected = false;
        // 更新页面上的连接状态显示
        this.updateConnectionStatus(false);
        // 显示连接断开消息
        this.showMessage('与服务器的连接已断开', 'system');
        
        // 尝试重连 - 3秒后自动重新连接
        setTimeout(() => {
          this.connect();
        }, 3000);
      };
      
      // 连接错误事件 - 当WebSocket连接发生错误时
      this.ws.onerror = (error) => {
        // 输出错误日志
        console.error('WebSocket错误:', error);
        // 显示错误消息
        this.showMessage('连接发生错误', 'system');
      };
    } catch (e) {
      // 如果创建连接失败，输出错误日志
      console.error('创建WebSocket连接失败:', e);
      // 显示连接失败消息
      this.showMessage('无法连接到服务器', 'system');
    }
  }
  
  // 更新连接状态显示 - 根据连接状态更新页面上的状态指示
  updateConnectionStatus(isConnected) {
    if (isConnected) {
      // 如果已连接，更新状态文本为'已连接'并添加连接样式类
      this.statusSpan.textContent = '连接状态: 已连接';
      this.statusDot.classList.add('connected');
    } else {
      // 如果未连接，更新状态文本为'断开'并移除连接样式类
      this.statusSpan.textContent = '连接状态: 断开';
      this.statusDot.classList.remove('connected');
    }
  }
  
  // 更新发送按钮状态 - 根据连接状态和输入内容启用或禁用发送按钮
  updateSendButtonState() {
    // 只有在连接状态下且用户名和消息都不为空时才能发送
    // 检查是否可以发送消息 - 连接状态、用户名和消息内容都有效
    const canSend = this.isConnected && 
                   this.username.length > 0 && 
                   this.messageInput.value.trim().length > 0;
    // 根据条件启用或禁用发送按钮
    this.sendButton.disabled = !canSend;
  }
  
  // 发送消息 - 将用户输入的消息发送到服务器
  sendMessage() {
    // 检查是否已连接到服务器
    if (!this.isConnected) {
      // 如果未连接，显示提示并返回
      alert('请先连接到服务器');
      return;
    }
      
    // 检查用户名是否有效
    if (!this.username || this.username.trim().length === 0) {
      // 如果用户名为空，显示提示并返回
      alert('请输入用户名');
      return;
    }
      
    // 获取并清理消息内容
    const content = this.messageInput.value.trim();
    // 检查消息内容是否为空
    if (!content) {
      // 如果消息为空，显示提示并返回
      alert('请输入消息内容');
      return;
    }
      
    // 构造消息对象 - 准备发送到服务器的消息
    const message = {
      type: 'chat',
      username: this.username,
      content: content
    };
      
    try {
      // 发送消息到服务器 - 将消息对象转换为JSON字符串发送
      this.ws.send(JSON.stringify(message));
        
      // 在本地显示发送的消息 - 让用户立即看到自己发送的消息
      this.showMessage(content, 'sent', this.username);
        
      // 清空输入框 - 发送后清空消息输入框
      this.messageInput.value = '';
      // 更新发送按钮状态 - 由于输入框已清空，禁用发送按钮
      this.updateSendButtonState();
    } catch (e) {
      // 如果发送失败，输出错误日志
      console.error('发送消息失败:', e);
      // 显示发送失败消息
      this.showMessage('发送消息失败', 'system');
    }
  }
    
  // 处理接收到的消息 - 根据消息类型执行相应的操作
  handleMessage(data) {
    // 根据消息类型进行不同的处理
    switch (data.type) {
      case 'welcome':
        // 处理欢迎消息 - 服务器发送的连接成功消息
        this.showMessage(data.message, 'system');
        break;
        
      case 'history':
        // 处理历史消息 - 服务器发送的聊天历史记录
        if (data.messages && data.messages.length > 0) {
          // 清空欢迎消息 - 清除初始欢迎消息
          this.messagesArea.innerHTML = '';
            
          // 遍历历史消息并显示
          data.messages.forEach(msg => {
            if (msg.type === 'chatMessage') {
              // 显示聊天消息 - 其他用户发送的聊天内容
              this.showMessage(msg.content, 'received', msg.username, msg.timestamp);
            } else if (msg.type === 'userJoined' || msg.type === 'userLeft') {
              // 显示系统消息 - 用户加入或离开的通知
              this.showMessage(msg.message, 'system', '', msg.timestamp);
            }
          });
        }
        break;
        
      case 'userJoined':
        // 处理用户加入消息 - 有新用户加入聊天室
        this.showMessage(data.message, 'system');
        break;
        
      case 'userLeft':
        // 处理用户离开消息 - 有用户离开聊天室
        this.showMessage(data.message, 'system');
        break;
        
      case 'chatMessage':
        // 处理聊天消息 - 其他用户发送的聊天内容
        this.showMessage(data.content, 'received', data.username);
        break;
        
      case 'error':
        // 处理错误消息 - 服务器返回的错误信息
        this.showMessage(`错误: ${data.message}`, 'system');
        break;
        
      default:
        // 处理未知消息类型 - 记录警告信息
        console.warn('未知消息类型:', data.type);
        break;
    }
  }
  
  // 显示消息 - 在聊天区域显示一条消息
  showMessage(content, type, username = '', timestamp = null) {
    // 创建消息容器元素 - 用于包裹整个消息
    const messageDiv = document.createElement('div');
    // 设置消息元素的CSS类名 - 根据消息类型应用不同样式
    messageDiv.className = `message ${type}`;
    
    // 创建消息内容元素 - 用于显示消息文本
    const contentDiv = document.createElement('div');
    // 设置内容元素的CSS类名
    contentDiv.className = 'message-content';
    
    // 检查是否需要显示用户名
    if (username && type !== 'system') {
      // 如果是普通消息，显示用户名和内容
      contentDiv.innerHTML = `<strong>${this.escapeHtml(username)}:</strong> ${this.escapeHtml(content)}`;
    } else {
      // 如果是系统消息，只显示内容
      contentDiv.textContent = content;
    }
    
    // 创建时间显示元素 - 用于显示消息时间
    const timeDiv = document.createElement('div');
    // 设置时间元素的CSS类名
    timeDiv.className = 'message-time';
    
    // 检查是否有时间戳
    if (timestamp) {
      // 如果提供了时间戳，则格式化该时间戳
      const date = new Date(timestamp);
      timeDiv.textContent = date.toLocaleTimeString();
    } else {
      // 否则使用当前时间
      timeDiv.textContent = new Date().toLocaleTimeString();
    }
    
    // 将内容和时间元素添加到消息容器
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    
    // 将消息添加到消息区域
    this.messagesArea.appendChild(messageDiv);
    
    // 自动滚动到底部 - 确保最新消息始终可见
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
  }
  
  // 转义HTML - 防止XSS攻击，将特殊字符转换为HTML实体
  escapeHtml(text) {
    // 创建一个临时div元素 - 用于安全地转换文本
    const div = document.createElement('div');
    // 使用textContent属性设置内容 - 自动转义HTML标签
    div.textContent = text;
    // 返回转义后的内容 - 获取HTML实体形式的字符串
    return div.innerHTML;
  }
}

// 页面加载完成后初始化应用 - 确保DOM元素已加载后再创建聊天应用实例
document.addEventListener('DOMContentLoaded', () => {
  // 创建聊天应用实例 - 初始化并启动聊天功能
  new ChatApp();
});