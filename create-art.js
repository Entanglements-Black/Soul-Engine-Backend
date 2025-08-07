// This is an example of a server-side script using Node.js and Express.
// You would deploy this to a service like Vercel, Netlify, or any Node.js host.
// File: /api/create-art.js

import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

// IMPORTANT: Store your API key in an environment variable, NOT in the code.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This is the endpoint our frontend will call
app.post('/api/create-art', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log(`Generating image for prompt: "${prompt}"`);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A beautiful, hopeful, artistic digital painting of: ${prompt}`, // Enhance the prompt for better results
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    console.log(`Image generated: ${imageUrl}`);
    
    // Send the image URL back to the frontend
    res.status(200).json({ imageUrl: imageUrl });

  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate image.' });
  }
});

// This makes the script runnable
// On a platform like Vercel, this file would be automatically handled.
// For local testing:
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// To run this locally:
// 1. Install dependencies: npm install express openai
// 2. Set your environment variable: export OPENAI_API_KEY='your_new_secret_key'
// 3. Run the server: node api/create-art.js
