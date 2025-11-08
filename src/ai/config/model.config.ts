import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import config from '../../config/env';

export const createModel = (temperature: number = 0.7) => {
  return new ChatGoogleGenerativeAI({
    apiKey: config.geminiApiKey,
    model: 'gemini-2.0-flash-lite',
    temperature,
  });
};

export const createFastModel = (temperature: number = 0.7) => {
  return new ChatGoogleGenerativeAI({
    apiKey: config.geminiApiKey,
    model: 'gemini-2.5-flash',
    temperature,
  });
};

export default {
  createModel,
  createFastModel,
};
