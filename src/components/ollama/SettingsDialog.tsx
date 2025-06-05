
import { useState, useEffect } from "react";
import { useOllamaStore } from "@/hooks/useOllamaStore";
import { useOllamaApi } from "@/hooks/useOllamaApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { settings, updateSettings } = useOllamaStore();
  const { checkConnection } = useOllamaApi();
  const [localSettings, setLocalSettings] = useState(settings);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    onOpenChange(false);
    toast.success("Settings saved successfully");
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const connected = await checkConnection();
    if (connected) {
      toast.success("Successfully connected to Ollama!");
    } else {
      toast.error("Failed to connect to Ollama. Please check your server URL.");
    }
    setTesting(false);
  };

  const exportChats = () => {
    const { chats } = useOllamaStore.getState();
    const dataStr = JSON.stringify(chats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ollama-chats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Chats exported successfully");
  };

  const importChats = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const chats = JSON.parse(e.target?.result as string);
        // Merge with existing chats (you might want to implement a more sophisticated merge strategy)
        const { chats: existingChats } = useOllamaStore.getState();
        const allChats = [...chats, ...existingChats];
        useOllamaStore.setState({ chats: allChats });
        toast.success("Chats imported successfully");
      } catch (error) {
        toast.error("Failed to import chats. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Server Configuration */}
          <div className="space-y-3">
            <Label htmlFor="serverUrl">Ollama Server URL</Label>
            <div className="flex gap-2">
              <Input
                id="serverUrl"
                value={localSettings.serverUrl}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, serverUrl: e.target.value }))}
                placeholder="http://localhost:11434"
                className="bg-gray-800 border-gray-600"
              />
              <Button 
                onClick={handleTestConnection}
                disabled={testing}
                variant="outline"
                className="border-gray-600"
              >
                {testing ? "Testing..." : "Test"}
              </Button>
            </div>
          </div>

          {/* Model Parameters */}
          <div className="space-y-4">
            <h3 className="font-semibold">Model Parameters</h3>
            
            <div className="space-y-2">
              <Label>Temperature: {localSettings.temperature}</Label>
              <Slider
                value={[localSettings.temperature]}
                onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, temperature: value }))}
                max={2}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                value={localSettings.maxTokens}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 2048 }))}
                className="bg-gray-800 border-gray-600"
              />
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-3">
            <h3 className="font-semibold">Data Management</h3>
            <div className="flex gap-2">
              <Button onClick={exportChats} variant="outline" className="border-gray-600">
                Export Chats
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importChats}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="border-gray-600">
                  Import Chats
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-600">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
