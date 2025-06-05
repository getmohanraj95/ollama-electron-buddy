
import { useCallback, useState, useEffect } from "react";
import { useOllamaStore } from "./useOllamaStore";
import { toast } from "sonner";

export const useOllamaApi = () => {
  const { settings, addMessage, setModels, setLoading } = useOllamaStore();
  const [isConnected, setIsConnected] = useState(false);

  // Check connection to Ollama server
  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(`${settings.serverUrl}/api/version`);
      if (response.ok) {
        setIsConnected(true);
        return true;
      }
    } catch (error) {
      console.log("Ollama connection failed:", error);
    }
    setIsConnected(false);
    return false;
  }, [settings.serverUrl]);

  // Fetch available models
  const fetchModels = useCallback(async () => {
    if (!settings.serverUrl) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${settings.serverUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setModels(data.models || []);
      
      // Auto-select first model if none selected
      if (data.models?.length > 0 && !settings.selectedModel) {
        useOllamaStore.getState().updateSettings({ selectedModel: data.models[0].name });
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
      toast.error("Failed to fetch models. Is Ollama running?");
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [settings.serverUrl, settings.selectedModel, setModels, setLoading]);

  // Send message to Ollama
  const sendMessage = useCallback(async (chatId: string, message: string) => {
    if (!settings.selectedModel) {
      toast.error("Please select a model first");
      return;
    }

    // Add user message
    addMessage(chatId, { role: 'user', content: message });

    try {
      const response = await fetch(`${settings.serverUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: settings.selectedModel,
          prompt: message,
          stream: false,
          options: {
            temperature: settings.temperature,
            num_predict: settings.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant response
      addMessage(chatId, { 
        role: 'assistant', 
        content: data.response || "Sorry, I couldn't generate a response."
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      addMessage(chatId, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error while processing your message. Please check your Ollama connection."
      });
      toast.error("Failed to send message");
    }
  }, [settings, addMessage]);

  // Check connection on mount and when server URL changes
  useEffect(() => {
    if (settings.serverUrl) {
      checkConnection();
    }
  }, [settings.serverUrl, checkConnection]);

  return {
    sendMessage,
    fetchModels,
    checkConnection,
    isConnected,
  };
};
