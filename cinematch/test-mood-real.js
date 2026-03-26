// Test real mood search with new API key
const { getMoodMovieRecommendations } = require('./app/actions/moodSearch.js');

async function testRealMoodSearch() {
  console.log("🎭 Testing real mood search with new Gemini API key");
  console.log("=" .repeat(55));
  
  const testMoods = [
    "Something space-themed but cozy",
    "Dark psychological thriller",
    "Funny workplace comedy"
  ];
  
  for (let i = 0; i < testMoods.length; i++) {
    const mood = testMoods[i];
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
        console.log(`🔍 Source: ${result.source || 'gemini'}`);
      } else {
        console.log("❌ FAILED");
        console.log(`🚨 Error: ${result.error}`);
      }
    } catch (error) {
      console.log("❌ EXCEPTION");
      console.log(`🚨 Error: ${error.message}`);
    }
    
    // Add delay between tests
    if (i < testMoods.length - 1) {
      console.log("⏳ Waiting 2 seconds...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log("\n🎉 Real mood search test complete!");
}

testRealMoodSearch().catch(console.error);
