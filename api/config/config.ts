import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = [
  "http://localhost:4200", // Angular
  "http://localhost:3001", // Svelte
  "http://localhost:5173", // React
  "https://lexi.pharaon.me", // prod
];

export const config = {
  port: process.env.PORT || 3000,
  firebase: {
    credential: process.env.FIREBASE_CREDENTIAL,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
  },
  cors: {
    origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  }
};
