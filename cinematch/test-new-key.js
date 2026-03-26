// Test new Gemini API key
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testNewKey() {
  console.log("🔑 Testing new Gemini API key...");
  
  try {
    const apiKey = 'AIzaSyDm6btrMow2qL0xC1fZeLZTOvKi0oYp4WI';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("📡 Sending test request to Gemini...");
    
    const prompt = "You are a JSON-only response engine. Return ONLY a raw JSON array of 3 movie titles. Example: [\"Movie 1\", \"Movie 2\", \"Movie 3\"]";
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log("✅ SUCCESS! Gemini responded:");
    console.log("Raw response:", text);
    
    // Try to parse as JSON
    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      console.log("✅ Valid JSON:", parsed);
    } catch (parseError) {
      console.log("⚠️ Response received but JSON parsing failed:", parseError.message);
    }
    
  } catch (error) {
    console.log("❌ ERROR:");
    console.log("Status:", error.status);
    console.log("Message:", error.message);
    
    if (error.status === 400 && error.message.includes('API key')) {
      console.log("🚨 API key issue detected - key may be invalid or expired");
    } else if (error.status === 503) {
      console.log("⚠️ Service temporarily unavailable - try again later");
    } else if (error.status === 429) {
      console.log("⚠️ Rate limit exceeded - wait and retry");
    } else {
      console.log("❓ Unknown error occurred");
    }
  }
}

testNewKey();
