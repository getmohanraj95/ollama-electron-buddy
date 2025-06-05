
import { useState, useRef } from "react";
import { useRagStore } from "@/hooks/useRagStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const RagInterface = () => {
  const { documents, isProcessing, addDocument, deleteDocument } = useRagStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        toast.error(`File ${file.name} is not a text file. Only .txt files are supported.`);
        continue;
      }
      
      try {
        const content = await file.text();
        await addDocument(file.name, content);
        toast.success(`Document ${file.name} uploaded and processed successfully`);
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">RAG Documents</h2>
      </div>

      {/* Upload Area */}
      <Card 
        className={`bg-white/5 border-white/20 transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-400/10' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Upload Documents</h3>
            <p className="text-gray-300 mb-4">
              Drag and drop text files here or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Processing..." : "Select Files"}
            </Button>
            <p className="text-sm text-gray-400 mt-2">
              Only .txt files are supported
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="bg-white/5 border-white/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <CardTitle className="text-white text-sm">{doc.name}</CardTitle>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(doc.content)} • {doc.chunks.length} chunks
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteDocument(doc.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-300">
                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {doc.content.substring(0, 150)}...
              </p>
            </CardContent>
          </Card>
        ))}

        {documents.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
            <p>Upload text files to enable RAG-powered conversations</p>
          </div>
        )}
      </div>
    </div>
  );
};
