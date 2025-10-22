// dotenv ko configure karna (yeh .env file ko load karega)
require('dotenv').config();

// 1. Zaroori packages ko import karna
const express = require('express');
const axios = require('axios'); // 'axios' ko import kiya
const cors = require('cors'); // CORS package import kiya
const path = require('path'); // File paths ke liye zaroori

// 2. Express app ko initialize karna
const app = express();

// 3. Port/Host define karna
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// 4. API Keys aur URLs
const API_KEY = process.env.PERSPECTIVE_API_KEY;
const API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`;
const CHAR_LIMIT = 19000; // Google API ki limit

// 5. Middleware Setup
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Large requests ke liye
app.use(express.static(path.join(__dirname, 'public')));

// 6. API Endpoint (Route)
app.post('/moderate', async (req, res) => {

  let textToAnalyze = req.body.text;
  let wasTruncated = false;

  if (!textToAnalyze) {
    return res.status(400).json({ error: 'Text is required in the request body.' });
  }

  // Handle empty string specifically, as API might fail
  if (textToAnalyze.trim() === '') {
      console.log('[INFO] Empty text received. Returning safe.');
      return res.status(200).json({
          status: 'safe',
          totalAggression: 0,
          scores: {},
          wasTruncated: false
      });
  }


  if (Buffer.byteLength(textToAnalyze, 'utf8') > CHAR_LIMIT) {
    textToAnalyze = Buffer.from(textToAnalyze, 'utf8').slice(0, CHAR_LIMIT).toString('utf8');
    wasTruncated = true;
    console.log(`[WARNING] Text was too long. Truncated to ${CHAR_LIMIT} bytes.`);
  }

  try {
    const requestData = {
      comment: { text: textToAnalyze },
      requestedAttributes: {
        TOXICITY: {},
        // SEVERE_TOXICITY is removed
        IDENTITY_ATTACK: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {}
      },
    };

    const response = await axios.post(API_URL, requestData);
    const attributes = response.data.attributeScores || {};

    const scores = {};
    for (const attr in attributes) {
        if (attributes[attr] && attributes[attr].summaryScore && attributes[attr].summaryScore.value !== undefined) {
          scores[attr] = parseFloat(attributes[attr].summaryScore.value.toFixed(2));
        } else {
            // It's normal for some attributes to be missing if undetected, don't warn
            scores[attr] = 0;
        }
    }

    const aggressionScore =
        (scores.TOXICITY || 0) +
        (scores.IDENTITY_ATTACK || 0) +
        (scores.INSULT || 0) +
        (scores.PROFANITY || 0) +
        (scores.THREAT || 0);

    let finalStatus = 'safe';
    if (aggressionScore > 0.7 || (scores.THREAT || 0) > 0.6) {
      finalStatus = 'toxic';
    }

    const finalResponse = {
      status: finalStatus,
      totalAggression: parseFloat(aggressionScore.toFixed(2)),
      scores: scores,
      wasTruncated: wasTruncated
    };

    console.log(`[SUCCESS] Request processed. Status: ${finalStatus}, Aggression: ${aggressionScore}`);
    res.status(200).json(finalResponse);

  } catch (error) {
    // ----- UPDATED PROFESSIONAL ERROR HANDLING -----
    console.error(`[ERROR] Failed to analyze. Full error: ${error.message}`);

    let userErrorMessage = 'Could not analyze this text due to an API issue.';
    let responseStatus = 'error'; // Use 'error' status for frontend

    // Check if it's a Google API error
    if (error.response && error.response.data && error.response.data.error) {
      const googleError = error.response.data.error;
      console.warn(`[HANDLED] Google API Error ${googleError.code}: ${googleError.message}`);

      // Check specifically for the "und" language error
      if (googleError.message && googleError.message.includes('languages: und')) {
        userErrorMessage = 'The AI cannot determine the language of this input. Please use more text.';
        responseStatus = 'unknown'; // Use 'unknown' for this specific case
      } else {
        // Use Google's message for other API errors
        userErrorMessage = googleError.message;
      }

      // Send a successful (200) response with error info for the frontend
      res.status(200).json({
        status: responseStatus,
        totalAggression: 0,
        scores: {},
        wasTruncated: false,
        apiError: userErrorMessage // Send the user-friendly message
      });

    } else {
      // If it's some other server error (not from Google API)
      res.status(500).json({
        error: 'Failed to analyze text due to an internal server issue.',
        details: error.message
      });
    }
    // ----- UPDATED CODE KHATAM -----
  }
});

// 7. Server ko "listen" (start) karna
app.listen(PORT, HOST, () => {
  console.log(`Server is running successfully on http://${HOST}:${PORT}`);
});