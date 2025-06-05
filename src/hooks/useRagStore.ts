
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Document {
  id: string;
  name: string;
  content: string;
  chunks: DocumentChunk[];
  uploadedAt: Date;
}

export interface DocumentChunk {
  id: string;
  content: string;
  embedding?: number[];
  documentId: string;
}

export interface RagContext {
  chunks: DocumentChunk[];
  query: string;
}

interface RagStore {
  documents: Document[];
  isProcessing: boolean;
  
  // Actions
  addDocument: (name: string, content: string) => Promise<string>;
  deleteDocument: (id: string) => void;
  setProcessing: (processing: boolean) => void;
  searchSimilarChunks: (query: string, limit?: number) => DocumentChunk[];
}

// Simple text chunking function
const chunkText = (text: string, chunkSize: number = 500): string[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

// Simple embedding function (TF-IDF-like)
const createSimpleEmbedding = (text: string): number[] => {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCounts: { [key: string]: number } = {};
  
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Create a fixed-size vector (100 dimensions)
  const embedding = new Array(100).fill(0);
  const uniqueWords = Object.keys(wordCounts);
  
  uniqueWords.forEach((word, index) => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const dimension = Math.abs(hash) % 100;
    embedding[dimension] = wordCounts[word];
  });
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
};

// Cosine similarity function
const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const useRagStore = create<RagStore>()(
  persist(
    (set, get) => ({
      documents: [],
      isProcessing: false,

      addDocument: async (name: string, content: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        
        set({ isProcessing: true });
        
        try {
          // Chunk the document
          const textChunks = chunkText(content);
          
          // Create chunks with embeddings
          const chunks: DocumentChunk[] = textChunks.map((chunk, index) => ({
            id: `${id}_chunk_${index}`,
            content: chunk,
            embedding: createSimpleEmbedding(chunk),
            documentId: id,
          }));
          
          const document: Document = {
            id,
            name,
            content,
            chunks,
            uploadedAt: new Date(),
          };
          
          set((state) => ({
            documents: [...state.documents, document],
            isProcessing: false,
          }));
          
          return id;
        } catch (error) {
          console.error('Error processing document:', error);
          set({ isProcessing: false });
          throw error;
        }
      },

      deleteDocument: (id: string) => {
        set((state) => ({
          documents: state.documents.filter(doc => doc.id !== id),
        }));
      },

      setProcessing: (processing: boolean) => {
        set({ isProcessing: processing });
      },

      searchSimilarChunks: (query: string, limit: number = 5) => {
        const queryEmbedding = createSimpleEmbedding(query);
        const allChunks = get().documents.flatMap(doc => doc.chunks);
        
        if (allChunks.length === 0) return [];
        
        // Calculate similarities and sort
        const chunksWithSimilarity = allChunks
          .map(chunk => ({
            chunk,
            similarity: chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0,
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
        
        return chunksWithSimilarity.map(item => item.chunk);
      },
    }),
    {
      name: 'rag-storage',
      partialize: (state) => ({
        documents: state.documents,
      }),
    }
  )
);
