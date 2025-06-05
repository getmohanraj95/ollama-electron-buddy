
import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/ollama/ChatInterface";
import { Sidebar } from "@/components/ollama/Sidebar";
import { SettingsDialog } from "@/components/ollama/SettingsDialog";
import { useOllamaStore } from "@/hooks/useOllamaStore";
import { Settings } from "lucide-react";

const Index = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { currentChat, settings } = useOllamaStore();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4 flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-xl font-semibold">Ollama Chat</h1>
            <p className="text-sm text-gray-300">
              {settings.serverUrl ? `Connected to ${settings.serverUrl}` : 'Configure Ollama server'}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Interface */}
        <ChatInterface />
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
