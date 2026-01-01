
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Users, Info } from 'lucide-react';
import { Activity, ChatMessage, User } from '../types';

interface ChatViewProps {
  activity: Activity;
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  allUsers: User[];
}

const ChatView: React.FC<ChatViewProps> = ({ 
  activity, 
  messages, 
  currentUser, 
  onSendMessage, 
  onBack,
  allUsers
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-gray-900">{activity.title} Group</h3>
            <p className="text-[10px] text-green-500 font-bold uppercase flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> Live coordination
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-indigo-600">
            <Users className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-indigo-600">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">
            No messages yet. Say hi to your fellow companions!
          </div>
        )}
        {messages.map((msg) => {
          const isSystem = msg.senderId === 'system';
          const isMe = msg.senderId === currentUser.id;
          const sender = allUsers.find(u => u.id === msg.senderId);

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 max-w-[80%] ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isMe && <img src={sender?.avatar} className="w-8 h-8 rounded-full border border-gray-100" />}
                <div>
                  {!isMe && <p className="text-[10px] font-bold text-gray-400 mb-1 ml-1">{sender?.name}</p>}
                  <div className={`p-4 rounded-2xl text-sm ${
                    isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[9px] mt-1 text-gray-400 ${isMe ? 'text-right' : ''}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-gray-50">
        <div className="flex items-center space-x-4">
          <input 
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-5 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;