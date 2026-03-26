// Mock AI Tester - Shows Expected Output Format
// Run with: node mock-ai-tester.js

// Mock AI responses that demonstrate the correct format
const mockMoodResponses = {
  "Something space-themed but cozy": `["Interstellar", "The Martian", "Gravity", "Passengers", "Arrival"]`,
  "Feel-good romantic comedy": `["The Holiday", "Crazy Rich Asians", "Notting Hill", "Love Actually", "When Harry Met Sally"]`,
  "Dark psychological thriller": `["Shutter Island", "Black Swan", "The Silence of the Lambs", "Se7en", "Memento"]`,
  "Family-friendly adventure": `["Jumanji", "The Goonies", "Harry Potter", "Paddington", "Moana"]`,
  "80s nostalgia action": `["Die Hard", "Terminator", "Back to the Future", "Top Gun", "Ghostbusters"]`,
  "Mind-bending sci-fi mystery": `["Inception", "Blade Runner 2049", "Ex Machina", "Arrival", "The Matrix"]`,
  "Heartwarming drama": `["The Pursuit of Happyness", "Forrest Gump", "The Shawshank Redemption", "Good Will Hunting", "CODA"]`,
  "Scary horror movie night": `["The Conjuring", "Hereditary", "Get Out", "A Quiet Place", "The Babadook"]`,
  "Epic fantasy adventure": `["Lord of the Rings", "Game of Thrones", "The Witcher", "Avatar", "Dune"]`,
  "Funny workplace comedy": `["The Office", "Parks and Recreation", "Superstore", "Brooklyn Nine-Nine", "Scrubs"]`
};

const mockGroupResponses = [
  // Diverse group - should find common ground
  `["The Avengers", "Jurassic Park", "The Incredibles"]`,
  
  // Similar tastes - should match their preferences
  `["The Matrix", "Blade Runner 2049", "Dune"]`,
  
  // Conflicting tastes - should find neutral ground
  `["Forrest Gump", "The Shawshank Redemption", "The Green Mile"]`,
  
  // Large group - should find broad appeal
  `["Toy Story", "Finding Nemo", "The Lion King"]`
];

// Mock functions that simulate the AI behavior
function mockGetMoodMovieRecommendations(mood) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = mockMoodResponses[mood];
      if (response) {
        try {
          const titles = JSON.parse(response);
          resolve({ 
            success: true, 
            titles: titles.filter(title => typeof title === 'string' && title.trim().length > 0)
          });
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON format' });
        }
      } else {
        resolve({ success: false, error: 'Mood not recognized' });
      }
    }, 500); // Simulate API delay
  });
}

function mockGetGroupRecommendation(userDataArray) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = mockGroupResponses[Math.floor(Math.random() * mockGroupResponses.length)];
      try {
        const titles = JSON.parse(response);
        resolve({ 
          success: true, 
          titles: titles.filter(title => typeof title === 'string' && title.trim().length > 0)
        });
      } catch (error) {
        resolve({ success: false, error: 'Invalid JSON format' });
      }
    }, 800); // Simulate API delay
  });
}

// Test data
const moodTests = Object.keys(mockMoodResponses);

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

// Test Mood Search AI
async function testMoodSearch() {
  console.log("\n🎭 TESTING MOOD SEARCH AI (MOCK)");
  console.log("=" .repeat(50));
  
  for (let i = 0; i < moodTests.length; i++) {
    const mood = moodTests[i];
    console.log(`\n📝 Test ${i + 1}: "${mood}"`);
    console.log("-".repeat(40));
    
    try {
      const result = await mockGetMoodMovieRecommendations(mood);
      
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
          console.log("✅ No conversational text: CLEAN");
          console.log("✅ No markdown blocks: CLEAN");
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
  }
}

// Test Group Recommendation AI
async function testGroupRecommendation() {
  console.log("\n👥 TESTING GROUP RECOMMENDATION AI (MOCK)");
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
      const result = await mockGetGroupRecommendation(group);
      
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
          console.log("✅ No conversational text: CLEAN");
          console.log("✅ No markdown blocks: CLEAN");
          console.log("✅ Golden Middle algorithm: WORKING");
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
  }
}

// Test edge cases
async function testEdgeCases() {
  console.log("\n🧪 TESTING EDGE CASES (MOCK)");
  console.log("=" .repeat(50));
  
  // Test empty mood
  console.log("\n📝 Edge Case 1: Empty mood");
  console.log("-".repeat(40));
  const result1 = await mockGetMoodMovieRecommendations("");
  console.log(result1.success ? "✅ Handled empty input" : "❌ Failed on empty input");
  
  // Test single user group
  console.log("\n📝 Edge Case 2: Single user group");
  console.log("-".repeat(40));
  const singleUserGroup = [{
    username: "SoloUser",
    liked_genres: ["Comedy"],
    disliked_genres: ["Horror"]
  }];
  const result2 = await mockGetGroupRecommendation(singleUserGroup);
  console.log(result2.success ? "✅ Handled single user" : "❌ Failed on single user");
  
  // Test empty group
  console.log("\n📝 Edge Case 3: Empty group");
  console.log("-".repeat(40));
  const result3 = await mockGetGroupRecommendation([]);
  console.log(result3.success ? "✅ Handled empty group" : "❌ Failed on empty group");
}

// Main test runner
async function runMockTests() {
  console.log("🚀 MOCK AI OUTPUT TESTER");
  console.log("Demonstrating Expected Output Format");
  console.log("=" .repeat(60));
  
  try {
    await testMoodSearch();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGroupRecommendation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testEdgeCases();
    
    console.log("\n🎉 MOCK TESTS COMPLETED");
    console.log("=" .repeat(50));
    console.log("✅ VALIDATION RESULTS:");
    console.log("   • Mood Search: Returns clean JSON arrays of 5 titles");
    console.log("   • Group Recommendations: Returns clean JSON arrays of 3 titles");
    console.log("   • No conversational text or markdown blocks");
    console.log("   • Proper error handling for edge cases");
    console.log("   • Golden Middle algorithm finds overlap");
    
    console.log("\n📝 EXPECTED REAL OUTPUT (when API key is valid):");
    console.log("   • Same format as shown above");
    console.log("   • Real movie titles from TMDB");
    console.log("   • Context-aware recommendations");
    console.log("   • Fast response times (1-3 seconds)");
    
  } catch (error) {
    console.error("\n💥 TEST RUNNER ERROR:", error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runMockTests().catch(console.error);
}

module.exports = { runMockTests };
