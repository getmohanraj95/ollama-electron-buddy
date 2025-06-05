
import { useState, useRef, useEffect } from "react";
import { useOllamaStore } from "@/hooks/useOllamaStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { useOllamaApi } from "@/hooks/useOllamaApi";
import { toast } from "sonner";

export const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentChat, createNewChat, settings, models } = useOllamaStore();
  const { sendMessage, fetchModels, isConnected } = useOllamaApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  useEffect(() => {
    if (isConnected) {
      fetchModels();
    }
  }, [isConnected, fetchModels]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    let chatId = currentChat?.id;
    if (!chatId) {
      chatId = createNewChat("New Chat", settings.selectedModel);
    }

    const userMessage = message.trim();
    setMessage("");

    try {
      await sendMessage(chatId, userMessage);
    } catch (error) {
      toast.error("Failed to send message. Check your Ollama connection.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!settings.serverUrl) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Configure Ollama Server</h2>
          <p className="text-gray-300">Please configure your Ollama server URL in settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Model Selection */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center gap-4">
          <Select value={settings.selectedModel} onValueChange={(value) => useOllamaStore.getState().updateSettings({ selectedModel: value })}>
            <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={fetchModels}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Models
          </Button>

          {!isConnected && (
            <div className="text-red-400 text-sm">
              ⚠️ Cannot connect to Ollama server
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              
              <div className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-white border border-white/20'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-xs opacity-70 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {currentChat?.messages.length === 0 && (
          <div className="text-center text-gray-400 mt-16">
            <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
            <p>Send a message to begin chatting with {settings.selectedModel || 'your model'}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="flex gap-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || !settings.selectedModel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
