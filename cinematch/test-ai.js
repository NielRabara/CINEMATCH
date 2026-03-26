// AI Tester Script
// Run with: node test-ai.js

const { getMoodMovieRecommendations, getGroupRecommendation } = require('./app/actions/moodSearch.js');

// Test data
const moodTests = [
  "Something space-themed but cozy",
  "Feel-good romantic comedy",
  "Dark psychological thriller",
  "Family-friendly adventure",
  "80s nostalgia action",
  "Mind-bending sci-fi mystery",
  "Heartwarming drama",
  "Scary horror movie night",
  "Epic fantasy adventure",
  "Funny workplace comedy"
];

const groupTests = [
  // Test 1: Diverse group
  [
    {
      username: "Alice",
      liked_genres: ["Action", "Sci-Fi", "Thriller"],
      disliked_genres: ["Romance", "Musical"]
    },
    {
      username: "Bob", 
      liked_genres: ["Comedy", "Romance", "Drama"],
      disliked_genres: ["Horror", "Action"]
    },
    {
      username: "Carol",
      liked_genres: ["Fantasy", "Adventure", "Family"],
      disliked_genres: ["Thriller", "Crime"]
    }
  ],
  // Test 2: Similar tastes
  [
    {
      username: "Dave",
      liked_genres: ["Sci-Fi", "Action", "Adventure"],
      disliked_genres: ["Romance"]
    },
    {
      username: "Eve",
      liked_genres: ["Sci-Fi", "Thriller", "Mystery"],
      disliked_genres: ["Musical"]
    },
    {
      username: "Frank",
      liked_genres: ["Action", "Adventure", "Fantasy"],
      disliked_genres: ["Drama"]
    }
  ],
  // Test 3: Conflicting tastes
  [
    {
      username: "Grace",
      liked_genres: ["Horror", "Thriller", "Crime"],
      disliked_genres: ["Romance", "Comedy"]
    },
    {
      username: "Henry",
      liked_genres: ["Romance", "Comedy", "Family"],
      disliked_genres: ["Horror", "Thriller"]
    },
    {
      username: "Ivy",
      liked_genres: ["Action", "War", "Western"],
      disliked_genres: ["Musical", "Romance"]
    }
  ],
  // Test 4: Large group
  [
    {
      username: "User1",
      liked_genres: ["Action", "Comedy"],
      disliked_genres: ["Horror"]
    },
    {
      username: "User2",
      liked_genres: ["Drama", "Romance"],
      disliked_genres: ["Action"]
    },
    {
      username: "User3",
      liked_genres: ["Sci-Fi", "Fantasy"],
      disliked_genres: ["Musical"]
    },
    {
      username: "User4",
      liked_genres: ["Thriller", "Mystery"],
      disliked_genres: ["Comedy"]
    },
    {
      username: "User5",
      liked_genres: ["Family", "Adventure"],
      disliked_genres: ["Horror"]
    }
  ]
];

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test Mood Search AI
async function testMoodSearch() {
  console.log("\n🎭 TESTING MOOD SEARCH AI");
  console.log("=" .repeat(50));
  
  for (let i = 0; i < moodTests.length; i++) {
    const mood = moodTests[i];
    console.log(`\n📝 Test ${i + 1}: "${mood}"`);
    console.log("-".repeat(40));
    
    try {
      const result = await getMoodMovieRecommendations(mood);
      
      if (result.success) {
        console.log("✅ SUCCESS");
        console.log(`📊 Found ${result.titles.length} titles:`);
        result.titles.forEach((title, index) => {
          console.log(`   ${index + 1}. ${title}`);
        });
        
        // Validate output format
        const isValid = Array.isArray(result.titles) && 
                       result.titles.length > 0 && 
                       result.titles.every(title => typeof title === 'string' && title.trim().length > 0);
        
        if (isValid) {
          console.log("✅ Output format: VALID JSON array");
        } else {
          console.log("❌ Output format: INVALID");
        }
      } else {
        console.log("❌ FAILED");
        console.log(`🚨 Error: ${result.error}`);
      }
    } catch (error) {
      console.log("❌ EXCEPTION");
      console.log(`🚨 Error: ${error.message}`);
    }
    
    // Add delay to avoid rate limiting
    if (i < moodTests.length - 1) {
      console.log("⏳ Waiting 2 seconds...");
      await delay(2000);
    }
  }
}

// Test Group Recommendation AI
async function testGroupRecommendation() {
  console.log("\n👥 TESTING GROUP RECOMMENDATION AI");
  console.log("=" .repeat(50));
  
  for (let i = 0; i < groupTests.length; i++) {
    const group = groupTests[i];
    console.log(`\n📝 Test ${i + 1}: Group of ${group.length} users`);
    console.log("-".repeat(40));
    
    // Display group preferences
    group.forEach(user => {
      console.log(`   👤 ${user.username}`);
      console.log(`      ❤️ Likes: ${user.liked_genres.join(", ")}`);
      console.log(`      💔 Dislikes: ${user.disliked_genres.join(", ")}`);
    });
    
    try {
      const result = await getGroupRecommendation(group);
      
      if (result.success) {
        console.log("\n✅ SUCCESS");
        console.log(`📊 Found ${result.titles.length} "Golden Middle" recommendations:`);
        result.titles.forEach((title, index) => {
          console.log(`   ${index + 1}. ${title}`);
        });
        
        // Validate output format
        const isValid = Array.isArray(result.titles) && 
                       result.titles.length === 3 && 
                       result.titles.every(title => typeof title === 'string' && title.trim().length > 0);
        
        if (isValid) {
          console.log("✅ Output format: VALID JSON array (exactly 3 titles)");
        } else {
          console.log("❌ Output format: INVALID (expected exactly 3 titles)");
        }
      } else {
        console.log("\n❌ FAILED");
        console.log(`🚨 Error: ${result.error}`);
      }
    } catch (error) {
      console.log("\n❌ EXCEPTION");
      console.log(`🚨 Error: ${error.message}`);
    }
    
    // Add delay to avoid rate limiting
    if (i < groupTests.length - 1) {
      console.log("\n⏳ Waiting 3 seconds...");
      await delay(3000);
    }
  }
}

// Random Test Generator
function generateRandomMood() {
  const adjectives = ["cozy", "intense", "mind-bending", "heartwarming", "dark", "uplifting", "nostalgic", "thrilling", "peaceful", "chaotic"];
  const themes = ["space", "romance", "mystery", "adventure", "comedy", "drama", "horror", "fantasy", "sci-fi", "action"];
  const qualifiers = ["but funny", "with twists", "for family", "night", "marathon", "vibes", "experience", "journey", "story", "tale"];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const qual = qualifiers[Math.floor(Math.random() * qualifiers.length)];
  
  return `${adj} ${theme}-themed ${qual}`;
}

function generateRandomGroup() {
  const allGenres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Fantasy", "Thriller", "Romance", "Mystery", "Adventure", "Family", "Crime"];
  const groupSize = Math.floor(Math.random() * 4) + 2; // 2-5 users
  
  const group = [];
  for (let i = 0; i < groupSize; i++) {
    const likedCount = Math.floor(Math.random() * 3) + 1; // 1-3 liked genres
    const dislikedCount = Math.floor(Math.random() * 2); // 0-1 disliked genres
    
    const liked = [];
    const disliked = [];
    
    // Generate liked genres
    while (liked.length < likedCount) {
      const genre = allGenres[Math.floor(Math.random() * allGenres.length)];
      if (!liked.includes(genre)) liked.push(genre);
    }
    
    // Generate disliked genres
    while (disliked.length < dislikedCount) {
      const genre = allGenres[Math.floor(Math.random() * allGenres.length)];
      if (!liked.includes(genre) && !disliked.includes(genre)) disliked.push(genre);
    }
    
    group.push({
      username: `User${i + 1}`,
      liked_genres: liked,
      disliked_genres: disliked
    });
  }
  
  return group;
}

// Random Tests
async function runRandomTests() {
  console.log("\n🎲 RUNNING RANDOM TESTS");
  console.log("=" .repeat(50));
  
  // Test 5 random moods
  console.log("\n🎭 Random Mood Tests (5 tests)");
  for (let i = 0; i < 5; i++) {
    const mood = generateRandomMood();
    console.log(`\n📝 Random Test ${i + 1}: "${mood}"`);
    console.log("-".repeat(40));
    
    try {
      const result = await getMoodMovieRecommendations(mood);
      if (result.success) {
        console.log(`✅ Found ${result.titles.length} titles: ${result.titles.join(", ")}`);
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    await delay(1000);
  }
  
  // Test 3 random groups
  console.log("\n👥 Random Group Tests (3 tests)");
  for (let i = 0; i < 3; i++) {
    const group = generateRandomGroup();
    console.log(`\n📝 Random Group Test ${i + 1}: ${group.length} users`);
    console.log("-".repeat(40));
    
    group.forEach(user => {
      console.log(`   👤 ${user.username}: ❤️ ${user.liked_genres.join(", ")} 💔 ${user.disliked_genres.join(", ")}`);
    });
    
    try {
      const result = await getGroupRecommendation(group);
      if (result.success) {
        console.log(`✅ Golden Middle: ${result.titles.join(", ")}`);
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    await delay(2000);
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 AI OUTPUT TESTER");
  console.log("Testing Mood Search and Group Recommendation AI");
  console.log("=" .repeat(60));
  
  try {
    await testMoodSearch();
    await delay(3000); // Pause between test types
    await testGroupRecommendation();
    await delay(3000);
    await runRandomTests();
    
    console.log("\n🎉 ALL TESTS COMPLETED");
    console.log("=" .repeat(50));
    console.log("Check the outputs above for:");
    console.log("✅ Valid JSON arrays");
    console.log("✅ Correct number of results (5 for mood, 3 for group)");
    console.log("✅ No conversational text or markdown");
    console.log("✅ Relevant movie titles");
    
  } catch (error) {
    console.error("\n💥 TEST RUNNER ERROR:", error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testMoodSearch, testGroupRecommendation };
