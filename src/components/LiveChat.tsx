import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ChevronDown, ChevronUp, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  user_id: string;
  sender_id: string;
  content: string;
  is_admin_reply: boolean;
  created_at: string;
}

const LiveChat: React.FC = () => {
  const { user, userRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);

  const currentUserId = user?.id;
  const isAdmin = userRole === 'admin';

  const fetchMessages = useCallback(async () => {
    if (!currentUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`user_id.eq.${currentUserId},sender_id.eq.${currentUserId}`) // Fetch messages related to the current user or sent by them
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error.message);
      toast.error("Failed to load chat history.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchMessages();

    if (currentUserId) {
      const channelName = `chat_messages_realtime_${currentUserId}`;
      channelRef.current = supabase.channel(channelName, {
        config: {
          presence: { key: `user_presence_${currentUserId}` },
        },
      });

      channelRef.current.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `user_id=eq.${currentUserId}`, // Filter for messages related to the current user
      }, (payload: { new: ChatMessage }) => {
        if (payload.new) {
          setMessages((prev) => [...prev, payload.new].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
          // Optionally play a sound or show a notification if chat is not open
          if (!isOpen && payload.new.sender_id !== currentUserId) {
            // Simple notification if chat is closed and message is from someone else
            toast(payload.new.is_admin_reply ? "Admin replied" : "New message", {
              description: payload.new.content,
              duration: 3000,
            });
          }
        }
      });

      channelRef.current.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to chat channel: ${channelName}`);
        }
      });
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUserId, isOpen, fetchMessages]);

  useEffect(() => {
    // Auto-scroll to bottom when messages update
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    setLoading(true); // Indicate sending state
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: currentUserId,
          sender_id: currentUserId, // Student sends
          content: newMessage.trim(),
          is_admin_reply: false, // Default for student message
        }]);

      if (error) throw error;
      setNewMessage(''); // Clear input on success
      toast.success("Message sent!");
    } catch (error: any) {
      console.error("Error sending message:", error.message);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  if (!user) {
    // Optionally show a prompt to login if not authenticated
    return null; 
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'w-96 h-[500px]' : 'w-16 h-16'} `}>
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-card border border-border shadow-2xl rounded-xl h-full flex flex-col overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/path/to/support-avatar.png" alt="Support Avatar" /> {/* Placeholder */}
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="font-bold">Support Chat</div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="text-primary-foreground hover:bg-primary/30">
              <ChevronDown size={20} />
            </Button>
          </div>
          <ScrollArea ref={chatWindowRef} className="flex-1 p-4 space-y-4">
            {loading && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            )}
            {!loading && messages.length === 0 && (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                Start a conversation with our support team.
              </div>
            )}
            {!loading && messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                {msg.sender_id !== currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/path/to/support-avatar.png" alt="Support Avatar" /> {/* Placeholder */}
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-xs p-3 rounded-lg ${
                  msg.sender_id === currentUserId 
                    ? 'bg-primary text-primary-foreground rounded-bl-none' 
                    : 'bg-muted text-muted-foreground rounded-br-none'
                }`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.sender_id === currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="User Avatar" />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </ScrollArea>
          <div className="p-4 border-t border-border flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!currentUserId || loading}
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || !currentUserId || loading} 
              size="icon" 
              className="rounded-full disabled:opacity-50"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Button 
        onClick={toggleChat} 
        size="lg" 
        className={`rounded-full p-3 shadow-xl transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'bg-primary/90 hover:bg-primary/80' 
            : 'bg-primary hover:bg-primary/90 shadow-primary/30'
        } ${!currentUserId ? 'bg-red-500 hover:bg-red-600' : ''}`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <ChevronDown size={28} className="text-primary-foreground" />
        ) : (
          !currentUserId ? (
            <X size={28} className="text-white" /> // Prompt to login if not authenticated
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarImage src="/path/to/support-avatar.png" alt="Support Avatar" /> {/* Placeholder */}
              <AvatarFallback className="bg-primary-foreground text-primary">?</AvatarFallback>
            </Avatar>
          )
        )}
      </Button>
    </div>
  );
};

export default LiveChat;
