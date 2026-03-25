'use server';

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function getLlamaConfig() {
  const apiKey =
    process.env.GOOGLE_GEMINI_API_KEY ||
    (() => {
      try {
        const p = path.join(process.cwd(), '.env.local');
        if (!fs.existsSync(p)) return '';
        const raw = fs.readFileSync(p, 'utf8');
        const m = raw.match(/^\s*GOOGLE_GEMINI_API_KEY\s*=\s*(.*)\s*$/m);
        if (!m) return '';
        const value = (m[1] || '').trim();
        return value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      } catch {
        return '';
      }
    })();
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GEMINI_API_KEY. Set it in `.env.local` and restart the dev server.');
  }
  return {
    apiKey,
    baseURL:
      process.env.GEMINI_BASE_URL ||
      'https://generativelanguage.googleapis.com/v1beta/openai',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  };
}

function normalizeBaseURL(baseURL) {
  return String(baseURL || '').replace(/\/+$/, '');
}

async function createChatCompletion({ messages, temperature, maxTokens }) {
  const { apiKey, baseURL, model } = getLlamaConfig();
  const url = `${normalizeBaseURL(baseURL)}/chat/completions`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (() => {
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        return first?.error?.message || first?.message || JSON.stringify(first);
      }
      return (
        data?.error?.message ||
        data?.message ||
        (typeof data === 'string' ? data : '') ||
        `AI request failed (${res.status})`
      );
    })();
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    err.url = url;
    throw err;
  }

  return data;
}

export async function submitReview(movieId, rating, reviewText, username) {
  try {
    // First, submit the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([
        {
          movie_id: movieId,
          rating: rating,
          review_text: reviewText,
          username: username,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (reviewError) {
      console.error('Error submitting review:', reviewError);
      return { success: false, error: reviewError.message };
    }

    // Analyze sentiment with AI
    let sentimentLabel = 'Neutral';
    let sentimentEmoji = '😐';
    
    if (reviewText && reviewText.trim()) {
      try {
        const sentimentPrompt = `Analyze the sentiment of this movie review and respond with ONLY one word: "Positive", "Neutral", or "Negative". Review: "${reviewText}"`;
        
        const response = await createChatCompletion({
          messages: [{ role: 'user', content: sentimentPrompt }],
          temperature: 0.1,
          maxTokens: 10,
        });

        const sentiment = response?.choices?.[0]?.message?.content?.trim().toLowerCase();
        
        if (sentiment === 'positive') {
          sentimentLabel = 'Positive';
          sentimentEmoji = '😊';
        } else if (sentiment === 'negative') {
          sentimentLabel = 'Negative';
          sentimentEmoji = '😞';
        } else {
          sentimentLabel = 'Neutral';
          sentimentEmoji = '😐';
        }
      } catch (sentimentError) {
        console.error('Error analyzing sentiment:', sentimentError);
        // Default to neutral if AI analysis fails
      }
    }

    // Update the review with sentiment analysis
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        sentiment_label: sentimentLabel,
        sentiment_emoji: sentimentEmoji
      })
      .eq('id', review.id);

    if (updateError) {
      console.error('Error updating sentiment:', updateError);
    }

    return { 
      success: true, 
      review: { ...review, sentiment_label: sentimentLabel, sentiment_emoji: sentimentEmoji }
    };
  } catch (error) {
    console.error('Error in submitReview:', error);
    return { success: false, error: error.message };
  }
}

export async function getMovieReviews(movieId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching reviews:', error);
      return { success: false, error: error.message };
    }

    return { success: true, reviews: data || [] };
  } catch (error) {
    console.error('Error in getMovieReviews:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserReviewForMovie(movieId, username) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('movie_id', movieId)
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user review:', error);
      return { success: false, error: error.message };
    }

    return { success: true, review: data };
  } catch (error) {
    console.error('Error in getUserReviewForMovie:', error);
    return { success: false, error: error.message };
  }
}
