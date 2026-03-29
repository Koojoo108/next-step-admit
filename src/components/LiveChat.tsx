import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const LiveChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Welcome! How can we help you today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');

    // Auto-reply placeholder
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: 'Thank you for your message. Our admissions team will get back to you shortly.',
        isUser: false,
        timestamp: new Date(),
      }]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isOpen ? 'w-96 h-[500px]' : 'w-16 h-16'}`}>
      {isOpen && (
        <div className="bg-card border border-border shadow-2xl rounded-xl h-full flex flex-col overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="font-bold">Support Chat</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/30">
              <ChevronDown size={20} />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 mb-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${
                  msg.isUser
                    ? 'bg-primary text-primary-foreground rounded-bl-none'
                    : 'bg-muted text-muted-foreground rounded-br-none'
                }`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="p-4 border-t border-border flex items-center gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              size="icon"
              className="rounded-full"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full p-3 shadow-xl bg-primary hover:bg-primary/90 shadow-primary/30 w-16 h-16"
          aria-label="Open chat"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary-foreground text-primary">?</AvatarFallback>
          </Avatar>
        </Button>
      )}
    </div>
  );
};

export default LiveChat;
