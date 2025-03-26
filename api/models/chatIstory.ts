export type ChatHistory = {
  role: string;
  parts: {
    text: string;
  }[];
};
