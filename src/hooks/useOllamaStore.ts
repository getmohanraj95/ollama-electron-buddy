
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface Settings {
  serverUrl: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
}

interface OllamaStore {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  models: OllamaModel[];
  settings: Settings;
  isLoading: boolean;
  
  // Actions
  createNewChat: (title?: string, model?: string) => string;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setModels: (models: OllamaModel[]) => void;
  setLoading: (loading: boolean) => void;
  updateChatTitle: (chatId: string, title: string) => void;
}

export const useOllamaStore = create<OllamaStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      currentChat: null,
      models: [],
      settings: {
        serverUrl: 'http://localhost:11434',
        selectedModel: '',
        temperature: 0.7,
        maxTokens: 2048,
      },
      isLoading: false,

      createNewChat: (title = 'New Chat', model = '') => {
        const id = Math.random().toString(36).substr(2, 9);
        const newChat: Chat = {
          id,
          title,
          messages: [],
          model: model || get().settings.selectedModel,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: id,
          currentChat: newChat,
        }));

        return id;
      },

      selectChat: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId);
        set({ currentChatId: chatId, currentChat: chat || null });
      },

      deleteChat: (chatId: string) => {
        set((state) => {
          const newChats = state.chats.filter(c => c.id !== chatId);
          const newCurrentId = state.currentChatId === chatId ? null : state.currentChatId;
          const newCurrentChat = newCurrentId ? newChats.find(c => c.id === newCurrentId) || null : null;
          
          return {
            chats: newChats,
            currentChatId: newCurrentId,
            currentChat: newCurrentChat,
          };
        });
      },

      addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        };

        set((state) => {
          const updatedChats = state.chats.map(chat => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, newMessage],
                updatedAt: new Date(),
              };
              return updatedChat;
            }
            return chat;
          });

          const currentChat = state.currentChatId === chatId 
            ? updatedChats.find(c => c.id === chatId) || null 
            : state.currentChat;

          return { chats: updatedChats, currentChat };
        });
      },

      updateSettings: (newSettings: Partial<Settings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setModels: (models: OllamaModel[]) => {
        set({ models });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => {
          const updatedChats = state.chats.map(chat => 
            chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
          );
          const currentChat = state.currentChatId === chatId 
            ? updatedChats.find(c => c.id === chatId) || null 
            : state.currentChat;

          return { chats: updatedChats, currentChat };
        });
      },
    }),
    {
      name: 'ollama-storage',
      partialize: (state) => ({
        chats: state.chats,
        settings: state.settings,
      }),
    }
  )
);
