// dotenv ko configure karna (yeh .env file ko load karega)
require('dotenv').config();

// 1. Zaroori packages ko import karna
const express = require('express');
const axios = require('axios'); // 'axios' ko import kiya

// 2. Express app ko initialize karna
const app = express();

// 3. Port define karna (jahan server chalega)
const PORT = process.env.PORT || 3000;

// .env file se API key haasil karna
const API_KEY = process.env.PERSPECTIVE_API_KEY;
// Google API ka URL
const API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`;

// Middleware: Express ko batana ke woh JSON ko parse (samajh) sake
app.use(express.json());

// API Endpoint (Route)
app.post('/moderate', async (req, res) => {
  
  const textToAnalyze = req.body.text;

  if (!textToAnalyze) {
    return res.status(400).json({ error: 'Text is required in the request body.' });
  }

  try {
    const requestData = {
      comment: { text: textToAnalyze },
      languages: ['en'], 
      requestedAttributes: {
        TOXICITY: {},
        SPAM: {},
        INSULT: {},
      },
    };

    const response = await axios.post(API_URL, requestData);

    // 1. Google ke response se scores nikalna
    const attributes = response.data.attributeScores;

    // 2. Scores ko round karna (e.g., 0.92345 ko 0.92 banana)
    const toxicityScore = parseFloat(attributes.TOXICITY.summaryScore.value.toFixed(2));
    const spamScore = parseFloat(attributes.SPAM.summaryScore.value.toFixed(2));
    const insultScore = parseFloat(attributes.INSULT.summaryScore.value.toFixed(2));

    // 3. Ek 'status' decide karna. Hum 0.7 ko threshold (had) rakhte hain.
    let finalStatus = 'safe';
    if (toxicityScore > 0.7 || insultScore > 0.7) {
      finalStatus = 'toxic';
    }

    // 4. Apna saaf (clean) JSON response tayyar karna
    const finalResponse = {
      status: finalStatus,
      scores: {
        TOXICITY: toxicityScore,
        SPAM: spamScore,
        INSULT: insultScore,
      },
    };

    // ----- NAYA CODE (Logging) -----
    // Kamyab request ko server console par log karna
    console.log(`[SUCCESS] Request processed. Status: ${finalStatus}, Toxicity: ${toxicityScore}`);
    // ----- NAYA CODE KHATAM -----

    // 5. Client ko final, clean response bhejna
    res.status(200).json(finalResponse);

  } catch (error) {
    // Error Handling
    // Hum error ki wajah log kar rahe hain
    console.error(`[ERROR] Failed to analyze. Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to analyze text. Check API key and server logs.' });
  }
});

// 4. Server ko "listen" (start) karna
app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});