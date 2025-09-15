import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json());
app.use(cors());

// IMPORTANT: Store your Google AI API key in an environment variable on Render
// The variable should be named GOOGLE_API_KEY
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// This is the endpoint our frontend will call
app.post('/api/create-art', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log(`Generating image with Gemini for prompt: "${prompt}"`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    // Enhance the prompt for better results with Gemini
    const enhancedPrompt = `A beautiful, hopeful, artistic digital painting of peace on Earth, inspired by the vision: ${prompt}. Cinematic, vibrant colors, high detail.`;
    
    const result = await model.generateContent([enhancedPrompt]);
    const response = result.response;
    
    // Gemini returns image data differently. We need to extract it.
    const part = response.candidates?.[0]?.content?.parts?.[0];

    if (!part || !part.inlineData) {
        throw new Error("Image data was not returned from the API.");
    }
    
    // Create a Base64 Data URL to send back to the frontend
    const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    
    console.log(`Image generated successfully.`);
    
    // Send the image URL back to the frontend
    res.status(200).json({ imageUrl: imageUrl });

  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate image.' });
  }
});

// This makes the script runnable
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Soul Engine (Gemini) server running on port ${PORT}`));
