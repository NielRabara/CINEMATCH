'use server';

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Simple password hashing (in production, use bcrypt or similar)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hashedPassword) {
  const hash = hashPassword(password);
  return hash === hashedPassword;
}

export async function signUp(username, email, password) {
  try {
    // Validate inputs
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    
    if (username.trim().length > 20) {
      return { success: false, error: 'Username must be less than 20 characters' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', cleanUsername)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking username:', checkError);
      return { success: false, error: 'Database error occurred' };
    }

    if (existingUser) {
      return { success: false, error: 'Username already taken' };
    }

    // Check if email already exists
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', cleanEmail)
      .single();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Error checking email:', emailCheckError);
      return { success: false, error: 'Database error occurred' };
    }

    if (existingEmail) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user with password
    const hashedPassword = hashPassword(password);
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert([
        {
          username: cleanUsername,
          email: cleanEmail,
          password_hash: hashedPassword,
          display_name: cleanUsername,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return { success: false, error: createError.message };
    }

    return { success: true, user: newProfile, isNewUser: true };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error: error.message };
  }
}

export async function signIn(username, password) {
  try {
    // Validate inputs
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    if (!password) {
      return { success: false, error: 'Password is required' };
    }

    const cleanUsername = username.trim();

    // Find user by username or email
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`username.eq.${cleanUsername},email.eq.${cleanUsername.toLowerCase()}`)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error finding profile:', profileError);
      return { success: false, error: 'Database error occurred' };
    }

    if (!profile) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Check if user has password (legacy users might not)
    if (!profile.password_hash) {
      return { success: false, error: 'This account uses legacy login. Please sign up with a new password.' };
    }

    // Verify password
    if (!verifyPassword(password, profile.password_hash)) {
      return { success: false, error: 'Invalid username or password' };
    }

    return { success: true, user: profile, isNewUser: false };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    // Clear any server-side session data if needed
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(username, updates) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('username', username)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

export async function getProfile(username) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success: false, error: error.message };
  }
}

export async function addToWatchlist(username, movie) {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .insert([
        {
          username: username,
          movie_id: movie.id,
          movie_title: movie.title,
          movie_poster: movie.poster_path,
          added_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding to watchlist:', error);
      return { success: false, error: error.message };
    }

    return { success: true, item: data };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false, error: error.message };
  }
}

export async function removeFromWatchlist(username, movieId) {
  try {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('username', username)
      .eq('movie_id', movieId);

    if (error) {
      console.error('Error removing from watchlist:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return { success: false, error: error.message };
  }
}

export async function getWatchlist(username) {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('username', username)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching watchlist:', error);
      return { success: false, error: error.message };
    }

    return { success: true, items: data || [] };
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return { success: false, error: error.message };
  }
}

export async function isInWatchlist(username, movieId) {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('username', username)
      .eq('movie_id', movieId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking watchlist:', error);
      return { success: false, error: error.message };
    }

    return { success: true, isInWatchlist: !!data };
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return { success: false, error: error.message };
  }
}
