"use client";

import { useState, useEffect } from 'react';
import { Send, MessageCircle, X, Minimize2, Maximize2, AlertCircle } from 'lucide-react';

let supabase = null;

// Only initialize Supabase if credentials are available
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default function GlobalChat({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only allow chat if user is logged in
    if (!currentUser) {
      return;
    }
    
    setUsername(currentUser);

    // Only set up Supabase if it's available
    if (supabase) {
      fetchMessages();

      // Set up real-time subscription with better error handling
      try {
        const subscription = supabase
          .channel('public:messages')
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages' 
            }, 
            (payload) => {
              console.log('New message received:', payload.new);
              setMessages(prev => [...prev, payload.new]);
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
          });

        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    }
  }, [currentUser]);

  const fetchMessages = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase) return;

    try {
      console.log('Sending message:', { username, content: newMessage.trim() });
      
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            username: username,
            content: newMessage.trim(),
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error sending message:', error);
      } else {
        console.log('Message sent successfully');
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getInitials = (name) => {
    return name.slice(0, 2).toUpperCase();
  };

  if (!currentUser) {
    return null; // Don't show chat button for non-logged-in users
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#ec4899] to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-[#1f2937] border border-purple-500/30 rounded-lg shadow-2xl z-50 transition-all ${
      isMinimized ? 'w-80 h-12' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ec4899] to-purple-600 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-bold">Global Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {!supabase ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                <p className="text-gray-400 mb-2">Chat is disabled</p>
                <p className="text-xs text-gray-500">Configure Supabase to enable real-time chat</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3 items-start">
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(message.username)}
                  </div>
                  
                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-purple-400 text-sm">
                        {message.username}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={supabase ? "Type a message..." : "Chat disabled - configure Supabase"}
                className="flex-1 bg-[#111827] text-white border border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={200}
                disabled={!supabase}
              />
              <button
                type="submit"
                disabled={!supabase || !newMessage.trim()}
                className="bg-gradient-to-r from-[#ec4899] to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              Chatting as: <span className="text-purple-400 font-bold">{username}</span>
              {!supabase && (
                <span className="block text-yellow-400 mt-1">
                  ⚠️ Supabase not configured
                </span>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
