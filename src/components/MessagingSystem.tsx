"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  date: string;
  status: "read" | "unread" | "sent";
  priority: "low" | "normal" | "high" | "urgent";
  messageType: string;
  attachments: any[];
  replyCount: number;
  isSent: boolean;
}

interface User {
  id: string;
  name: string;
  username: string;
  userType: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  displayName: string;
  email?: string;
}

interface MessagingSystemProps {
  className?: string;
}

const MessagingSystem = ({ className = "" }: MessagingSystemProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState({
    status: "all",
    priority: "all",
    messageType: "all"
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // New message form state
  const [newMessage, setNewMessage] = useState({
    recipients: [] as User[],
    subject: "",
    content: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    messageType: "direct" as "direct" | "broadcast"
  });

  // Load messages and users on component mount
  useEffect(() => {
    fetchMessages();
    fetchUsers();
    fetchUnreadCount();
  }, []);

  // Apply filters when messages or filters change
  useEffect(() => {
    let filtered = messages;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((message) =>
        message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter.status !== "all") {
      filtered = filtered.filter(message => message.status === filter.status);
    }

    // Apply priority filter
    if (filter.priority !== "all") {
      filtered = filtered.filter(message => message.priority === filter.priority);
    }

    // Apply message type filter
    if (filter.messageType !== "all") {
      filtered = filtered.filter(message => message.messageType === filter.messageType);
    }

    setFilteredMessages(filtered);
  }, [searchTerm, messages, filter]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages?action=unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.content.trim() || newMessage.recipients.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          content: newMessage.content,
          subject: newMessage.subject,
          priority: newMessage.priority.toUpperCase(),
          messageType: newMessage.messageType.toUpperCase(),
          recipients: newMessage.recipients.map(user => ({
            userId: user.id,
            userType: user.userType,
            userName: user.name,
          })),
        }),
      });

      if (response.ok) {
        toast.success('Message sent successfully');
        setNewMessage({
          recipients: [],
          subject: "",
          content: "",
          priority: "normal",
          messageType: "direct"
        });
        setIsModalOpen(false);
        fetchMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark-read',
          messageId,
        }),
      });

      if (response.ok) {
        fetchMessages();
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          messageId,
        }),
      });

      if (response.ok) {
        toast.success('Message deleted successfully');
        fetchMessages();
        fetchUnreadCount();
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "read":
        return "text-green-600 bg-green-100";
      case "unread":
        return "text-red-600 bg-red-100";
      case "sent":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-800 bg-red-200";
      case "high":
        return "text-red-600 bg-red-100";
      case "normal":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MessageRow = ({ message }: { message: Message }) => (
    <tr
      key={message.id}
      className={`border-b border-gray-200 text-sm hover:bg-primary-50 cursor-pointer ${
        message.status === 'unread' ? 'bg-blue-50 font-semibold' : 'even:bg-slate-50'
      }`}
      onClick={() => {
        setSelectedMessage(message);
        if (message.status === 'unread') {
          handleMarkAsRead(message.id);
        }
      }}
    >
      <td className="p-4">
        <div className="flex items-center gap-2">
          {message.status === 'unread' && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
          {message.sender}
        </div>
      </td>
      <td className="p-4">{message.recipient}</td>
      <td className="p-4">
        <div className="max-w-xs truncate">{message.subject}</div>
      </td>
      <td className="p-4">{formatDate(message.date)}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
        </span>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
          {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
        </span>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMessage(message.id);
            }}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  const UserSelector = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Recipients
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {newMessage.recipients.map((user) => (
          <span
            key={user.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {user.displayName}
            <button
              onClick={() => setNewMessage(prev => ({
                ...prev,
                recipients: prev.recipients.filter(r => r.id !== user.id)
              }))}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <select
        onChange={(e) => {
          const userId = e.target.value;
          if (userId) {
            const user = users.find(u => u.id === userId);
            if (user && !newMessage.recipients.some(r => r.id === userId)) {
              setNewMessage(prev => ({
                ...prev,
                recipients: [...prev.recipients, user]
              }));
            }
          }
        }}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Select a recipient...</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.displayName}
          </option>
        ))}
      </select>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-white to-primary-50/30 p-6 rounded-2xl shadow-soft border border-primary-100/50 flex-1 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Messages</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            New Message
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="sent">Sent</option>
        </select>
        <select
          value={filter.priority}
          onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Messages Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 text-left text-sm font-medium text-gray-700">From</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">To</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Subject</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Priority</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
          </tbody>
        </table>
      </div>

      {/* New Message Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-strong border border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">New Message</h2>
            
            <UserSelector />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter subject"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                placeholder="Enter your message"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={newMessage.priority}
                onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-strong border border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">Message Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <p className="p-2 bg-gray-50 rounded-md">{selectedMessage.sender}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <p className="p-2 bg-gray-50 rounded-md">{selectedMessage.recipient}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="p-2 bg-gray-50 rounded-md">{selectedMessage.subject}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="p-2 bg-gray-50 rounded-md">{formatDate(selectedMessage.date)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                  {selectedMessage.priority.charAt(0).toUpperCase() + selectedMessage.priority.slice(1)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="p-2 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // TODO: Implement reply functionality
                  toast.info('Reply functionality coming soon!');
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingSystem;
