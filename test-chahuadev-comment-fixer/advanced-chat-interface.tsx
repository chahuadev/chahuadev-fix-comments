interface User {
    id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
    status?: 'online' | 'away' | 'busy' | 'offline';
}

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'image' | 'file' | 'emoji';
    replyTo?: string;
    isEdited?: boolean;
    reactions?: MessageReaction[];
}

interface MessageReaction {
    emoji: string;
    users: string[];
    count: number;
}

interface ChatRoom {
    id: string;
    name: string;
    description?: string;
    members: User[];
    isPrivate: boolean;
    createdAt: Date;
    lastActivity: Date;
}

interface WebSocketMessage {
    type: 'message' | 'user_join' | 'user_leave' | 'typing' | 'reaction' | 'edit';
    payload: any;
    timestamp: Date;
}

interface ChatState {
    currentUser: User;
    users: User[];
    messages: Message[];
    typingUsers: User[];
    isConnected: boolean;
}

interface ChatActions {
    sendMessage: (content: string, type?: Message['type']) => void;
    editMessage: (messageId: string, newContent: string) => void;
    deleteMessage: (messageId: string) => void;
    addReaction: (messageId: string, emoji: string) => void;
    setTyping: (isTyping: boolean) => void;
    connectWebSocket: () => void;
    disconnectWebSocket: () => void;
}

class WebSocketManager {
    private socket: WebSocket | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 1000;
    private messageQueue: WebSocketMessage[] = [];
    private isConnecting: boolean = false;

    constructor(
        private url: string,
        private onMessage: (message: WebSocketMessage) => void,
        private onConnectionChange: (connected: boolean) => void
    ) { }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
                resolve();
                return;
            }

            this.isConnecting = true;

            try {
                this.socket = new WebSocket(this.url);

                this.socket.onopen = () => {
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    this.onConnectionChange(true);
                    this.processMessageQueue();
                    resolve();
                };

                this.socket.onclose = () => {
                    this.isConnecting = false;
                    this.onConnectionChange(false);
                    this.attemptReconnect();
                };

                this.socket.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data);
                        this.onMessage(message);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                this.socket.onerror = (error) => {
                    this.isConnecting = false;
                    console.error('WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.onConnectionChange(false);
    }

    send(message: WebSocketMessage): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect().catch(() => {
                    console.error('Reconnection failed');
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    private processMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                this.send(message);
            }
        }
    }
}

class MessageValidator {
    static validateMessage(content: string, type: Message['type']): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!content || content.trim().length === 0) {
            errors.push('Message content cannot be empty');
        }

        if (content.length > 2000) {
            errors.push('Message content cannot exceed 2000 characters');
        }

        if (type === 'text' && content.includes('<script>')) {
            errors.push('Script tags are not allowed in messages');
        }

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);
        if (urls && urls.length > 5) {
            errors.push('Too many URLs in message');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static sanitizeMessage(content: string): string {
        return content
            .replace(/</g, '')
            .replace(/>/g, '')
            .replace(/"/g, '')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    static validateUser(user: Partial<User>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!user.username || user.username.trim().length === 0) {
            errors.push('Username is required');
        }

        if (user.username && user.username.length > 50) {
            errors.push('Username cannot exceed 50 characters');
        }

        if (user.username && !/^[a-zA-Z0-9_-]+$/.test(user.username)) {
            errors.push('Username can only contain letters, numbers, underscores, and hyphens');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

class EmojiManager {
    private static readonly EMOJI_CATEGORIES = {
        'Smileys & Emotion': [
            '', '', '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', '', ''
        ],
        'People & Body': [
            '', '', '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', '', ''
        ],
        'Animals & Nature': [
            '', '', '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', '', ''
        ],
        'Food & Drink': [
            '', '', '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', '', ''
        ],
        'Objects': [
            '', '', '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', '', ''
        ]
    };

    static getAllEmojis(): string[] {
        return Object.values(this.EMOJI_CATEGORIES).flat();
    }

    static getEmojisByCategory(category: string): string[] {
        return this.EMOJI_CATEGORIES[category as keyof typeof this.EMOJI_CATEGORIES] || [];
    }

    static getCategories(): string[] {
        return Object.keys(this.EMOJI_CATEGORIES);
    }

    static isValidEmoji(emoji: string): boolean {
        return this.getAllEmojis().includes(emoji);
    }

    static getRandomEmoji(): string {
        const allEmojis = this.getAllEmojis();
        return allEmojis[Math.floor(Math.random() * allEmojis.length)];
    }
}

class MessageFormatter {
    private static readonly URL_REGEX = /(https?:\/\/[^\s]+)/g;
    private static readonly MENTION_REGEX = /@(\w+)/g;
    private static readonly HASHTAG_REGEX = /#(\w+)/g;

    static formatMessage(content: string, users: User[]): string {
        let formatted = content;

        formatted = this.formatUrls(formatted);
        formatted = this.formatMentions(formatted, users);
        formatted = this.formatHashtags(formatted);
        formatted = this.formatEmojis(formatted);

        return formatted;
    }

    private static formatUrls(content: string): string {
        return content.replace(this.URL_REGEX, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
        });
    }

    private static formatMentions(content: string, users: User[]): string {
        return content.replace(this.MENTION_REGEX, (match, username) => {
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            if (user) {
                return `<span class="bg-blue-100 text-blue-800 px-1 rounded">@${user.username}</span>`;
            }
            return match;
        });
    }

    private static formatHashtags(content: string): string {
        return content.replace(this.HASHTAG_REGEX, (match, tag) => {
            return `<span class="text-blue-600 hover:underline cursor-pointer">#${tag}</span>`;
        });
    }

    private static formatEmojis(content: string): string {
        const emojiRegex = /:(\w+):/g;
        return content.replace(emojiRegex, (match, emojiName) => {
            const emojiMap: { [key: string]: string } = {
                'smile': '',
                'laugh': '',
                'heart': '',
                'thumbsup': '',
                'thumbsdown': '',
                'fire': '',
                'star': '',
                'check': '',
                'cross': '',
                'warning': ''
            };

            return emojiMap[emojiName.toLowerCase()] || match;
        });
    }

    static truncateMessage(content: string, maxLength: number = 100): string {
        if (content.length <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength - 3) + '...';
    }

    static getMessagePreview(message: Message): string {
        switch (message.type) {
            case 'text':
                return this.truncateMessage(message.content);
            case 'image':
                return ' Image';
            case 'file':
                return ` ${message.content}`;
            case 'emoji':
                return message.content;
            default:
                return 'Message';
        }
    }
}

class ChatStatistics {
    static calculateUserActivity(messages: Message[], userId: string): {
        messageCount: number;
        averageMessageLength: number;
        mostActiveHour: number;
        reactionCount: number;
    } {
        const userMessages = messages.filter(m => m.senderId === userId);

        const messageCount = userMessages.length;
        const totalLength = userMessages.reduce((sum, m) => sum + m.content.length, 0);
        const averageMessageLength = messageCount > 0 ? totalLength / messageCount : 0;

        const hourCounts: { [hour: number]: number } = {};
        userMessages.forEach(m => {
            const hour = m.timestamp.getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const mostActiveHour = Object.keys(hourCounts).reduce((a, b) =>
            hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b, '0'
        );

        const reactionCount = messages.reduce((count, m) => {
            if (m.reactions) {
                return count + m.reactions.reduce((reactionSum, r) => {
                    return reactionSum + (r.users.includes(userId) ? 1 : 0);
                }, 0);
            }
            return count;
        }, 0);

        return {
            messageCount,
            averageMessageLength,
            mostActiveHour: parseInt(mostActiveHour),
            reactionCount
        };
    }

    static getChatMetrics(messages: Message[], users: User[]): {
        totalMessages: number;
        activeUsers: number;
        averageResponseTime: number;
        messageFrequency: { [hour: number]: number };
        topEmojis: { emoji: string; count: number }[];
    } {
        const totalMessages = messages.length;
        const activeUsers = users.filter(u => u.isOnline).length;

        const messageFrequency: { [hour: number]: number } = {};
        messages.forEach(m => {
            const hour = m.timestamp.getHours();
            messageFrequency[hour] = (messageFrequency[hour] || 0) + 1;
        });

        const emojiCounts: { [emoji: string]: number } = {};
        messages.forEach(m => {
            if (m.reactions) {
                m.reactions.forEach(r => {
                    emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + r.count;
                });
            }
        });

        const topEmojis = Object.entries(emojiCounts)
            .map(([emoji, count]) => ({ emoji, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const responseTimes: number[] = [];
        for (let i = 1; i < messages.length; i++) {
            const currentMessage = messages[i];
            const previousMessage = messages[i - 1];

            if (currentMessage.senderId !== previousMessage.senderId) {
                const responseTime = currentMessage.timestamp.getTime() - previousMessage.timestamp.getTime();
                responseTimes.push(responseTime);
            }
        }

        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

        return {
            totalMessages,
            activeUsers,
            averageResponseTime,
            messageFrequency,
            topEmojis
        };
    }
}

class FileManager {
    private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024;
    private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private static readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword'];

    static validateFile(file: File): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (file.size > this.MAX_FILE_SIZE) {
            errors.push(`File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        }

        const isValidType = [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOCUMENT_TYPES]
            .includes(file.type);

        if (!isValidType) {
            errors.push('File type not supported');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static async processFile(file: File): Promise<{ url: string; type: 'image' | 'file' }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type);
                resolve({
                    url: reader.result as string,
                    type: isImage ? 'image' : 'file'
                });
            };

            reader.onerror = () => reject(new Error('Failed to read file'));

            if (this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    static generateThumbnail(imageUrl: string, maxWidth: number = 200): Promise<string> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const ratio = img.height / img.width;
                canvas.width = maxWidth;
                canvas.height = maxWidth * ratio;

                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL());
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageUrl;
        });
    }
}

class NotificationManager {
    private static instance: NotificationManager;
    private notifications: Map<string, Notification> = new Map();
    private permission: NotificationPermission = 'default';

    private constructor() {
        this.requestPermission();
    }

    static getInstance(): NotificationManager {
        if (!this.instance) {
            this.instance = new NotificationManager();
        }
        return this.instance;
    }

    private async requestPermission(): Promise<void> {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
        }
    }

    showNotification(title: string, options: NotificationOptions & { id?: string } = {}): void {
        if (this.permission !== 'granted') return;

        const { id, ...notificationOptions } = options;
        const notificationId = id || `notification-${Date.now()}`;

        const notification = new Notification(title, {
            icon: '/chat-icon.png',
            badge: '/chat-badge.png',
            ...notificationOptions
        });

        this.notifications.set(notificationId, notification);

        notification.onclick = () => {
            window.focus();
            notification.close();
            this.notifications.delete(notificationId);
        };

        setTimeout(() => {
            notification.close();
            this.notifications.delete(notificationId);
        }, 5000);
    }

    closeNotification(id: string): void {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.close();
            this.notifications.delete(id);
        }
    }

    closeAllNotifications(): void {
        this.notifications.forEach(notification => notification.close());
        this.notifications.clear();
    }
}

class AdvancedChatInterface {
    private state: ChatState;
    private websocketManager: WebSocketManager | null = null;
    private messageCache: Map<string, Message> = new Map();
    private userTypingTimeouts: Map<string, number> = new Map();
    private searchIndex: Map<string, string[]> = new Map();
    private unreadCounts: Map<string, number> = new Map();
    private notificationManager: NotificationManager;
    private eventListeners: Map<string, Function[]> = new Map();

    constructor() {
        this.state = {
            currentUser: {
                id: 'user-1',
                username: 'CurrentUser',
                avatar: '/default-avatar.png',
                isOnline: true,
                status: 'online'
            },
            users: [],
            messages: [],
            typingUsers: [],
            isConnected: false
        };

        this.notificationManager = NotificationManager.getInstance();
        this.initializeChat();
    }

    private initializeChat(): void {
        this.loadInitialData();
        this.setupWebSocket();
        this.buildSearchIndex();
        this.setupEventListeners();
    }

    private loadInitialData(): void {
        this.state.users = [
            this.state.currentUser,
            {
                id: 'user-2',
                username: 'AliceBot',
                avatar: '/alice-avatar.png',
                isOnline: true,
                status: 'online'
            },
            {
                id: 'user-3',
                username: 'BobModerator',
                avatar: '/bob-avatar.png',
                isOnline: false,
                lastSeen: new Date(Date.now() - 3600000),
                status: 'offline'
            },
            {
                id: 'user-4',
                username: 'CharlieAdmin',
                avatar: '/charlie-avatar.png',
                isOnline: true,
                status: 'busy'
            }
        ];

        this.state.messages = [
            {
                id: 'msg-1',
                senderId: 'user-2',
                content: 'Welcome to the advanced chat interface! ',
                timestamp: new Date(Date.now() - 600000),
                type: 'text',
                reactions: [
                    { emoji: '', users: ['user-1', 'user-4'], count: 2 }
                ]
            },
            {
                id: 'msg-2',
                senderId: 'user-4',
                content: 'This chat supports real-time messaging, file uploads, and emoji reactions.',
                timestamp: new Date(Date.now() - 480000),
                type: 'text'
            },
            {
                id: 'msg-3',
                senderId: 'user-1',
                content: 'Thanks for the introduction! Looking forward to using all the features.',
                timestamp: new Date(Date.now() - 360000),
                type: 'text',
                replyTo: 'msg-2'
            }
        ];

        this.state.messages.forEach(message => {
            this.messageCache.set(message.id, message);
        });
    }

    private setupWebSocket(): void {
        this.websocketManager = new WebSocketManager(
            'ws://localhost:8080/chat',
            this.handleWebSocketMessage.bind(this),
            this.handleConnectionChange.bind(this)
        );

        this.websocketManager.connect().catch(error => {
            console.error('Failed to connect to WebSocket:', error);
        });
    }

    private setupEventListeners(): void {
        this.addEventListener('message_received', (message: Message) => {
            if (message.senderId !== this.state.currentUser.id) {
                const sender = this.state.users.find(u => u.id === message.senderId);
                this.notificationManager.showNotification(
                    `New message from ${sender?.username || 'Unknown User'}`,
                    {
                        body: MessageFormatter.getMessagePreview(message),
                        icon: sender?.avatar
                    }
                );
            }
        });

        this.addEventListener('user_joined', (user: User) => {
            this.notificationManager.showNotification(
                `${user.username} joined the chat`,
                { body: 'User is now online' }
            );
        });
    }

    private handleWebSocketMessage(message: WebSocketMessage): void {
        switch (message.type) {
            case 'message':
                this.addMessage(message.payload);
                this.emit('message_received', message.payload);
                break;
            case 'user_join':
                this.updateUserStatus(message.payload.userId, true, 'online');
                const joinedUser = this.state.users.find(u => u.id === message.payload.userId);
                if (joinedUser) {
                    this.emit('user_joined', joinedUser);
                }
                break;
            case 'user_leave':
                this.updateUserStatus(message.payload.userId, false, 'offline');
                break;
            case 'typing':
                this.handleTypingStatus(message.payload.userId, message.payload.isTyping);
                break;
            case 'reaction':
                this.handleReaction(message.payload.messageId, message.payload.emoji, message.payload.userId);
                break;
            case 'edit':
                this.handleMessageEdit(message.payload.messageId, message.payload.newContent);
                break;
        }
    }

    private handleConnectionChange(connected: boolean): void {
        this.state.isConnected = connected;
        this.emit('connection_changed', connected);
        this.notifyStateChange();
    }

    private addMessage(message: Message): void {
        const validation = MessageValidator.validateMessage(message.content, message.type);
        if (!validation.isValid) {
            console.error('Invalid message:', validation.errors);
            return;
        }

        const sanitizedMessage = {
            ...message,
            content: MessageValidator.sanitizeMessage(message.content)
        };

        this.state.messages.push(sanitizedMessage);
        this.messageCache.set(sanitizedMessage.id, sanitizedMessage);
        this.updateSearchIndex(sanitizedMessage);
        this.notifyStateChange();
    }

    private updateUserStatus(userId: string, isOnline: boolean, status: User['status']): void {
        this.state.users = this.state.users.map(user =>
            user.id === userId
                ? { ...user, isOnline, status, lastSeen: isOnline ? undefined : new Date() }
                : user
        );
        this.notifyStateChange();
    }

    private handleTypingStatus(userId: string, isTyping: boolean): void {
        if (userId === this.state.currentUser.id) return;

        const existingTimeout = this.userTypingTimeouts.get(userId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        if (isTyping) {
            const user = this.state.users.find(u => u.id === userId);
            if (user) {
                this.state.typingUsers = [...this.state.typingUsers.filter(u => u.id !== userId), user];
            }

            const timeout = setTimeout(() => {
                this.state.typingUsers = this.state.typingUsers.filter(u => u.id !== userId);
                this.userTypingTimeouts.delete(userId);
                this.notifyStateChange();
            }, 3000);

            this.userTypingTimeouts.set(userId, timeout);
        } else {
            this.state.typingUsers = this.state.typingUsers.filter(u => u.id !== userId);
            this.userTypingTimeouts.delete(userId);
        }

        this.notifyStateChange();
    }

    private handleReaction(messageId: string, emoji: string, userId: string): void {
        if (!EmojiManager.isValidEmoji(emoji)) {
            console.error('Invalid emoji:', emoji);
            return;
        }

        this.state.messages = this.state.messages.map(message => {
            if (message.id === messageId) {
                const reactions = message.reactions || [];
                const existingReaction = reactions.find(r => r.emoji === emoji);

                if (existingReaction) {
                    const userHasReacted = existingReaction.users.includes(userId);
                    if (userHasReacted) {
                        existingReaction.users = existingReaction.users.filter(id => id !== userId);
                        existingReaction.count = existingReaction.users.length;
                    } else {
                        existingReaction.users.push(userId);
                        existingReaction.count = existingReaction.users.length;
                    }
                } else {
                    reactions.push({
                        emoji,
                        users: [userId],
                        count: 1
                    });
                }

                const updatedMessage = {
                    ...message,
                    reactions: reactions.filter(r => r.count > 0)
                };

                this.messageCache.set(messageId, updatedMessage);
                return updatedMessage;
            }
            return message;
        });

        this.notifyStateChange();
    }

    private handleMessageEdit(messageId: string, newContent: string): void {
        const validation = MessageValidator.validateMessage(newContent, 'text');
        if (!validation.isValid) {
            console.error('Invalid edited message:', validation.errors);
            return;
        }

        this.state.messages = this.state.messages.map(message => {
            if (message.id === messageId) {
                const updatedMessage = {
                    ...message,
                    content: MessageValidator.sanitizeMessage(newContent),
                    isEdited: true
                };

                this.messageCache.set(messageId, updatedMessage);
                return updatedMessage;
            }
            return message;
        });

        this.notifyStateChange();
    }

    private buildSearchIndex(): void {
        this.searchIndex.clear();
        this.state.messages.forEach(message => {
            this.updateSearchIndex(message);
        });
    }

    private updateSearchIndex(message: Message): void {
        const words = message.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 2) {
                const messageIds = this.searchIndex.get(word) || [];
                if (!messageIds.includes(message.id)) {
                    messageIds.push(message.id);
                    this.searchIndex.set(word, messageIds);
                }
            }
        });
    }

    private addEventListener(event: string, listener: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(listener);
    }

    private emit(event: string, data: any): void {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    public searchMessages(query: string): Message[] {
        if (query.length < 3) return [];

        const words = query.toLowerCase().split(/\s+/);
        const messageIdSets = words.map(word => new Set(this.searchIndex.get(word) || []));

        if (messageIdSets.length === 0) return [];

        const commonMessageIds = Array.from(messageIdSets.reduce((acc, set) => {
            return new Set([...acc].filter(id => set.has(id)));
        }));

        return commonMessageIds
            .map(id => this.messageCache.get(id))
            .filter((message): message is Message => message !== undefined)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    public sendMessage(content: string, type: Message['type'] = 'text', replyTo?: string): boolean {
        const validation = MessageValidator.validateMessage(content, type);
        if (!validation.isValid) {
            console.error('Cannot send message:', validation.errors);
            return false;
        }

        const message: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            senderId: this.state.currentUser.id,
            content: MessageValidator.sanitizeMessage(content),
            timestamp: new Date(),
            type,
            replyTo
        };

        this.addMessage(message);

        if (this.websocketManager) {
            this.websocketManager.send({
                type: 'message',
                payload: message,
                timestamp: new Date()
            });
        }

        return true;
    }

    public async sendFile(file: File): Promise<boolean> {
        const validation = FileManager.validateFile(file);
        if (!validation.isValid) {
            console.error('Cannot send file:', validation.errors);
            return false;
        }

        try {
            const processedFile = await FileManager.processFile(file);
            return this.sendMessage(processedFile.url, processedFile.type);
        } catch (error) {
            console.error('Failed to process file:', error);
            return false;
        }
    }

    public editMessage(messageId: string, newContent: string): boolean {
        const message = this.messageCache.get(messageId);
        if (!message || message.senderId !== this.state.currentUser.id) {
            return false;
        }

        this.handleMessageEdit(messageId, newContent);

        if (this.websocketManager) {
            this.websocketManager.send({
                type: 'edit',
                payload: { messageId, newContent },
                timestamp: new Date()
            });
        }

        return true;
    }

    public deleteMessage(messageId: string): boolean {
        const message = this.messageCache.get(messageId);
        if (!message || message.senderId !== this.state.currentUser.id) {
            return false;
        }

        this.state.messages = this.state.messages.filter(m => m.id !== messageId);
        this.messageCache.delete(messageId);
        this.notifyStateChange();

        return true;
    }

    public addReaction(messageId: string, emoji: string): boolean {
        if (!EmojiManager.isValidEmoji(emoji)) {
            return false;
        }

        this.handleReaction(messageId, emoji, this.state.currentUser.id);

        if (this.websocketManager) {
            this.websocketManager.send({
                type: 'reaction',
                payload: { messageId, emoji, userId: this.state.currentUser.id },
                timestamp: new Date()
            });
        }

        return true;
    }

    public setTyping(isTyping: boolean): void {
        if (this.websocketManager) {
            this.websocketManager.send({
                type: 'typing',
                payload: { userId: this.state.currentUser.id, isTyping },
                timestamp: new Date()
            });
        }
    }

    public getState(): ChatState {
        return { ...this.state };
    }

    public getChatStatistics(): ReturnType<typeof ChatStatistics.getChatMetrics> {
        return ChatStatistics.getChatMetrics(this.state.messages, this.state.users);
    }

    public getUserActivity(userId: string): ReturnType<typeof ChatStatistics.calculateUserActivity> {
        return ChatStatistics.calculateUserActivity(this.state.messages, userId);
    }

    public exportChatHistory(): string {
        const exportData = {
            exportDate: new Date().toISOString(),
            chatData: {
                users: this.state.users,
                messages: this.state.messages,
                statistics: this.getChatStatistics()
            }
        };

        return JSON.stringify(exportData, null, 2);
    }

    public importChatHistory(jsonData: string): boolean {
        try {
            const importData = JSON.parse(jsonData);

            if (importData.chatData && importData.chatData.messages && importData.chatData.users) {
                this.state.messages = importData.chatData.messages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));

                this.state.users = importData.chatData.users.map((user: any) => ({
                    ...user,
                    lastSeen: user.lastSeen ? new Date(user.lastSeen) : undefined
                }));

                this.messageCache.clear();
                this.state.messages.forEach(message => {
                    this.messageCache.set(message.id, message);
                });

                this.buildSearchIndex();
                this.notifyStateChange();
                return true;
            }
        } catch (error) {
            console.error('Failed to import chat history:', error);
        }

        return false;
    }

    public disconnect(): void {
        if (this.websocketManager) {
            this.websocketManager.disconnect();
        }

        this.userTypingTimeouts.forEach(timeout => clearTimeout(timeout));
        this.userTypingTimeouts.clear();
        this.notificationManager.closeAllNotifications();
    }

    private notifyStateChange(): void {
        this.emit('state_changed', this.state);
    }
}

const advancedChatInstance = new AdvancedChatInterface();

declare const module: any;
declare const exports: any;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        AdvancedChatInterface,
        WebSocketManager,
        MessageValidator,
        EmojiManager,
        MessageFormatter,
        ChatStatistics,
        FileManager,
        NotificationManager
    };
} else if (typeof window !== 'undefined') {
    (window as any).AdvancedChatInterface = AdvancedChatInterface;
    (window as any).advancedChatInstance = advancedChatInstance;
}

export {
    AdvancedChatInterface,
    WebSocketManager,
    MessageValidator,
    EmojiManager,
    MessageFormatter,
    ChatStatistics,
    FileManager,
    NotificationManager
};

export type {
    User,
    Message,
    MessageReaction,
    ChatRoom,
    WebSocketMessage,
    ChatState,
    ChatActions
};