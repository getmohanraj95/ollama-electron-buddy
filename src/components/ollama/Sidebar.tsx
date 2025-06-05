
import { useState } from "react";
import { useOllamaStore } from "@/hooks/useOllamaStore";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const { chats, currentChatId, createNewChat, selectChat, deleteChat, updateChatTitle } = useOllamaStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleNewChat = () => {
    createNewChat();
  };

  const handleEditStart = (chat: any) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = () => {
    if (editingId && editTitle.trim()) {
      updateChatTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Button 
          onClick={handleNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors mb-1",
              currentChatId === chat.id 
                ? "bg-blue-600/30 border border-blue-500/50" 
                : "hover:bg-white/10"
            )}
            onClick={() => selectChat(chat.id)}
          >
            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
            
            {editingId === chat.id ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave();
                  if (e.key === 'Escape') handleEditCancel();
                }}
                onBlur={handleEditSave}
                className="flex-1 bg-transparent text-white border-b border-white/30 outline-none"
                autoFocus
              />
            ) : (
              <div className="flex-1 text-white text-sm truncate">
                {chat.title}
              </div>
            )}

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditStart(chat);
                }}
                className="p-1 hover:bg-white/20 rounded text-gray-400 hover:text-white"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {chats.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm">Create a new chat to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
