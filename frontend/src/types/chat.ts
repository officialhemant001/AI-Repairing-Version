export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  created_at?: string;
}

export interface ChatSession {
  id: number;
  title: string;
  message_count: number;
  last_message: {
    role: string;
    content: string;
    created_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionDetail {
  id: number;
  title: string;
  scan?: number;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}
