'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'node:fs';
import path from 'node:path';

const TMDB_API_KEY = '61e7c417108a4dccaebf5e5b6a0d23ef';
const BASE_URL = 'https://api.themoviedb.org/3';

// Load presets from JSON file
function loadPresets() {
  try {
    const presetsPath = path.join(process.cwd(), 'app', 'data', 'presets.json');
    const presetsData = fs.readFileSync(presetsPath, 'utf8');
    return JSON.parse(presetsData);
  } catch (error) {
    console.error('Error loading presets:', error);
    return {};
  }
}

// Get Gemini API key from environment
function getGeminiApiKey() {
  return process.env.GOOGLE_GEMINI_API_KEY;
}

// Keyword matching engine
function findPresetMatch(userInput) {
  const presets = loadPresets();
  const input = userInput.toLowerCase();
  
  for (const [mood, data] of Object.entries(presets)) {
    for (const keyword of data.keywords) {
      if (input.includes(keyword)) {
        console.log(`🎯 Found preset match: ${keyword} -> ${mood}`);
        return { mood, data };
      }
    }
  }
  
  return null; // No preset match found
}

// Randomly select up to 20 media items from array
function getRandomMedia(mediaArray, count = 20) {
  const shuffled = [...mediaArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Fetch TMDB details for mixed media (movies and TV)
async function fetchMediaDetails(mediaItems) {
  const fetchPromises = mediaItems.map(async (item) => {
    const endpoint = item.type === 'movie' ? 'movie' : 'tv';
    const url = `${BASE_URL}/${endpoint}/${item.id}?api_key=${TMDB_API_KEY}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch ${item.type} ${item.id}:`, response.status);
        return null;
      }
      
      const data = await response.json();
      
      // Normalize data structure for consistent UI rendering
      return {
        id: data.id,
        title: data.title || data.name, // Movies use title, TV uses name
        poster_path: data.poster_path,
        vote_average: data.vote_average,
        release_date: data.release_date || data.first_air_date, // Movies use release_date, TV uses first_air_date
        media_type: item.type,
        is_tv: item.type === 'tv',
        overview: data.overview,
        backdrop_path: data.backdrop_path
      };
    } catch (error) {
      console.error(`Error fetching ${item.type} ${item.id}:`, error);
      return null;
    }
  });
  
  // Execute all fetches concurrently
  const results = await Promise.all(fetchPromises);
  
  // Filter out null results (failed fetches)
  return results.filter(item => item !== null);
}

export async function getMoodMovieRecommendations(mood) {
  // First try preset matching
  const presetMatch = findPresetMatch(mood);
  if (presetMatch) {
    // Handle both media arrays and titles arrays
    if (presetMatch.data.media) {
      // Media array format (TMDB IDs)
      const selectedMedia = getRandomMedia(presetMatch.data.media, 20);
      console.log(`⚡ Fast preset match: ${selectedMedia.length} items for mood: ${presetMatch.mood}`);
      
      // Fetch detailed TMDB data for all media items
      const detailedMedia = await fetchMediaDetails(selectedMedia);
      console.log(`🎬 Fetched ${detailedMedia.length} detailed media items`);
      
      return { 
        success: true, 
        titles: detailedMedia.map(m => m.title), 
        source: 'preset',
        mood: presetMatch.mood,
        media: detailedMedia // Return ALL media items, not just 5
      };
    } else if (presetMatch.data.titles) {
      // Titles array format - use all 20 titles
      const titles = presetMatch.data.titles; // Use ALL titles, don't limit
      console.log(`⚡ Fast preset match: ${titles.length} titles for mood: ${presetMatch.mood}`);
      
      return { 
        success: true, 
        titles: titles, 
        source: 'preset',
        mood: presetMatch.mood
      };
    }
  }
  
  // Fallback to Gemini if no preset match
  console.log("🤖 No preset match, falling back to Gemini...");
  try {
    const geminiApiKey = getGeminiApiKey();
    if (!geminiApiKey) {
      throw new Error('Google Gemini API key not found');
    }
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a movie recommendation expert. Based on the mood "${mood}", suggest exactly 20 movies or TV shows that match this mood.
    
    Return ONLY a JSON array with titles. No explanations, no extra text, just the JSON array.
    
    Example output format: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5", "Title 6", "Title 7", "Title 8", "Title 9", "Title 10", "Title 11", "Title 12", "Title 13", "Title 14", "Title 15", "Title 16", "Title 17", "Title 18", "Title 19", "Title 20"]`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    const titles = JSON.parse(cleanedJson);
    
    if (!Array.isArray(titles) || titles.length === 0) {
      throw new Error('AI returned an empty list');
    }
    
    return { 
      success: true, 
      titles: titles.filter(Boolean).slice(0, 20), 
      source: 'gemini',
      originalQuery: mood, // Store original query for Load More
      isGeminiSearch: true // Flag for Load More handling
    };
    
  } catch (error) {
    console.error("❌ Gemini Error:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchMoviesByTitles(titles) {
  const movies = [];
  const seenIds = new Set(); // Track seen movie IDs to prevent duplicates
  
  for (const title of titles) {
    try {
      const response = await fetch(`${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&page=1`);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const result = data.results?.find(r => r.media_type === 'movie' || r.media_type === 'tv');
      
      if (result && !seenIds.has(result.id)) {
        movies.push({
          id: result.id,
          title: result.title || result.name,
          poster_path: result.poster_path,
          vote_average: result.vote_average,
          release_date: result.release_date || result.first_air_date,
          media_type: result.media_type,
          is_tv: result.media_type === 'tv',
          overview: result.overview
        });
        seenIds.add(result.id); // Mark this ID as seen
      }
    } catch (error) {
      console.error("Error fetching", title, ":", error);
    }
  }
  
  return movies;
}
