const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // Create a dummy 1x1 transparent PNG buffer
    const dummyImageBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
    
    const imageParts = [
      {
        inlineData: {
          data: dummyImageBuffer.toString("base64"),
          mimeType: "image/png"
        }
      }
    ];

    const result = await model.generateContent(["What is this?", ...imageParts]);
    console.log("SUCCESS:", result.response.text());
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}
test();
