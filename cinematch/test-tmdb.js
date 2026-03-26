// Test TMDB API directly
const API_KEY = '61e7c417108a4dccaebf5e5b6a0d23ef';
const BASE_URL = 'https://api.themoviedb.org/3';

async function testTMDB() {
  console.log("🎬 Testing TMDB API...");
  
  try {
    // Test search for "The Office"
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=The Office&page=1`);
    console.log("📡 TMDB response status:", response.status);
    
    if (!response.ok) {
      console.log("❌ TMDB request failed");
      return;
    }
    
    const data = await response.json();
    console.log("📊 TMDB data results:", data.results?.length, "found");
    
    // Get the first result
    const result = data.results?.find(r => r.media_type === 'movie' || r.media_type === 'tv');
    
    if (result) {
      console.log("✅ Found result:", result.title || result.name);
      console.log("🎬 Poster path:", result.poster_path);
      console.log("⭐ Rating:", result.vote_average);
      console.log("📅 Year:", result.release_date || result.first_air_date);
    } else {
      console.log("⚠️ No results found");
    }
    
  } catch (error) {
    console.error("💥 TMDB Error:", error);
  }
}

testTMDB();
