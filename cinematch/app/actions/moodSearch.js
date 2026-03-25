'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'node:fs';
import path from 'node:path';

function readEnvLocalValue(name) {
  try {
    const p = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(p)) return '';
    const raw = fs.readFileSync(p, 'utf8');
    const re = new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`, 'm');
    const m = raw.match(re);
    if (!m) return '';
    const value = (m[1] || '').trim();
    // Strip surrounding quotes if present
    return value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  } catch {
    return '';
  }
}

function getGeminiConfig() {
  const apiKey =
    process.env.GOOGLE_GEMINI_API_KEY ||
    readEnvLocalValue('GOOGLE_GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GEMINI_API_KEY. Set it in `.env.local` and restart the dev server.');
  }
  return { apiKey };
}

function safeParseJsonArray(text) {
  if (!text) return null;
  const trimmed = String(text).trim();

  // Remove common markdown fences
  const unfenced = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Try direct parse
  try {
    return JSON.parse(unfenced);
  } catch {
    // Try extracting the first JSON array in the response
    const start = unfenced.indexOf('[');
    const end = unfenced.lastIndexOf(']');
    if (start >= 0 && end > start) {
      const slice = unfenced.slice(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error('AI returned an invalid JSON array');
  }
}

export async function getMoodMovieRecommendations(mood) {
  try {
    const { apiKey } = getGeminiConfig();
    
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try multiple models with retry logic (most stable first)
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
    let lastError = null;
    
    for (const modelName of models) {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount <= maxRetries) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });

          const prompt = `Based on the mood "${mood}", suggest 6 popular titles that match this feeling.
Include movies and TV series (including anime if appropriate).
Return ONLY a JSON array of title strings, nothing else.
Example: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5", "Title 6"]`;

          const result = await model.generateContent(prompt);
          const text = result.response.text();

          // Clean up the response (sometimes Gemini adds markdown ```json)
          const cleanedJson = text.replace(/```json|```/g, "").trim();
          
          const titles = safeParseJsonArray(cleanedJson);
          if (!Array.isArray(titles) || titles.length === 0) {
            throw new Error('AI returned an empty list');
          }
          
          return { success: true, titles: titles.filter(Boolean).slice(0, 10) };
          
        } catch (error) {
          lastError = error;
          
          // If it's a 503 error and we haven't exhausted retries, wait and retry
          if (error.status === 503 && retryCount < maxRetries) {
            const delayMs = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
            console.warn(`Model ${modelName} failed (attempt ${retryCount + 1}/${maxRetries + 1}), retrying in ${delayMs}ms:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            retryCount++;
            continue;
          }
          
          console.warn(`Model ${modelName} failed:`, error.message);
          
          // If it's not a 503 or we've exhausted retries, try next model
          if (error.status !== 503 || retryCount >= maxRetries) {
            break;
          }
        }
      }
    }
    
    // If we get here, all models failed
    throw lastError;
    
  } catch (error) {
    console.error("Gemini SDK Error:", error);
    const msg = error?.message || 'AI request failed';
    
    // Enhanced error handling for 503 and 429 errors
    if (error?.status === 503 || /high demand|service unavailable/i.test(msg)) {
      return { 
        success: false, 
        error: 'Gemini API is currently experiencing high demand. Please try again in a few moments.' 
      };
    }
    
    if (error?.status === 429 || /quota|too many requests/i.test(msg)) {
      return { 
        success: false, 
        error: 'API quota exceeded. The free tier has limited requests per day. Please try again tomorrow or upgrade your plan.' 
      };
    }
    
    if (error?.status === 403 || /permission/i.test(msg)) {
      return { success: false, error: 'Gemini API permission denied. Check your API key and model access in Google AI Studio.' };
    }
    if (error?.status === 404 || /not found/i.test(msg)) {
      return { success: false, error: 'Model not found. Available models: gemini-2.5-flash, gemini-2.0-flash, gemini-2.0-flash-lite' };
    }
    
    return { success: false, error: msg };
  }
}

export async function fetchMoviesByTitles(titles) {
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  
  const movies = [];
  
  for (const title of titles) {
    try {
      // Use multi-search so we can return TV series too
      const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(title)}&page=1`);
      const data = await response.json();

      const hit = (data.results || []).find(r => r.media_type === 'movie' || r.media_type === 'tv');
      if (hit) movies.push(hit);
    } catch (error) {
      console.error(`Error fetching movie "${title}":`, error);
    }
  }
  
  return movies;
}
