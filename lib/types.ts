export interface Message {
  role: "user" | "assistant";
  content: string;
  image?: {
    data: string;
    mimeType: string;
    preview?: string;
  };
  document?: {
    data: string;
    mimeType: string;
    name: string;
  };
  searchQueries?: string[];
  searchEntryPoint?: string;
} 