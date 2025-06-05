
import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/ollama/ChatInterface";
import { Sidebar } from "@/components/ollama/Sidebar";
import { RagInterface } from "@/components/ollama/RagInterface";
import { SettingsDialog } from "@/components/ollama/SettingsDialog";
import { useOllamaStore } from "@/hooks/useOllamaStore";
import { Settings, MessageSquare, Search } from "lucide-react";

const Index = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'rag'>('chat');
  const { currentChat, settings } = useOllamaStore();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <h1 className="text-xl font-semibold">Ollama Chat</h1>
                <p className="text-sm text-gray-300">
                  {settings.serverUrl ? `Connected to ${settings.serverUrl}` : 'Configure Ollama server'}
                </p>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex bg-black/20 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'chat' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('rag')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'rag' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Documents
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'chat' ? <ChatInterface /> : <RagInterface />}
      </div>

      {/* Settings Dialog */}
      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
    </div>
  );
};

export default Index;
