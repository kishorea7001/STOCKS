/**
 * AI Client Infrastructure
 * Supports Google Gemini and OpenAI integrations for processing voice, audio, and text commands.
 */

export interface AIClientConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
}

export const getAIConfig = (): AIClientConfig => {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  };
};

/**
 * Placeholder for Gemini client initialization
 */
export async function parseVoicePrompt(input: { audioBuffer?: Buffer; text?: string; mimeType?: string }) {
  const config = getAIConfig();
  if (!config.geminiApiKey && !config.openaiApiKey) {
    throw new Error('Missing AI credentials. Please configure GEMINI_API_KEY or OPENAI_API_KEY in .env.local.');
  }

  // To be implemented with preferred AI SDK (@google/genai or openai)
  return {
    success: true,
    message: 'AI client initialized. Ready for parsing implementation.',
    input,
  };
}
