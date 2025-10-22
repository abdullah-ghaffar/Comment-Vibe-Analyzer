// DOM Elements ko pakarna
const textInput = document.getElementById('text-input');
const analyzeButton = document.getElementById('analyze-button');
const resultsDiv = document.getElementById('results');
const jsonOutput = document.getElementById('json-output');

const resultEmoji = document.getElementById('result-emoji');
const resultMessage = document.getElementById('result-message');
const vibeList = document.getElementById('vibe-list');
const warningMessage = document.getElementById('warning-message');
const resultHeader = document.getElementById('result-header'); // Ensure this element is correctly selected

const API_ENDPOINT = '/moderate';

// Vibe Dictionary
const vibeDictionary = {
    THREAT: { name: 'Threatening', emoji: '😱' },
    IDENTITY_ATTACK: { name: 'Hateful (Attack)', emoji: '😡' },
    INSULT: { name: 'Rude / Insulting', emoji: '😠' },
    PROFANITY: { name: 'Harsh Language', emoji: '🤬' },
    TOXICITY: { name: 'Aggressive', emoji: '🤢' },
    SAFE: { name: 'Friendly & Safe', emoji: '✅' },
    ERROR: { name: 'Analysis Failed', emoji: '🤔' },
    // NAYA: Unknown status ke liye
    UNKNOWN: { name: 'Unable to Analyze Language', emoji: '❓' }
};

// Button click event
analyzeButton.addEventListener('click', async () => {

    const textToAnalyze = textInput.value;
    if (!textToAnalyze) {
        alert('Please enter some text to analyze.');
        return;
    }

    analyzeButton.disabled = true;
    analyzeButton.textContent = 'Analyzing...';
    resultsDiv.style.display = 'none'; // Hide previous results
    warningMessage.style.display = 'none';

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textToAnalyze })
        });

        const data = await response.json();

        if (!response.ok) { // Handles 500 server errors
            throw new Error(data.error || 'Server error occurred');
        }

        displayResults(data); // Display whatever the backend sent (could be 'safe', 'toxic', 'error', 'unknown')

    } catch (error) {
        console.error('Fetch Error:', error);
        // Display fetch/network errors
        displayErrorState('Error: ' + error.message);

    } finally {
        analyzeButton.disabled = false;
        analyzeButton.textContent = 'Analyze Vibe';
    }
});

// Helper function to display error states consistently
function displayErrorState(errorMessage) {
    if (!resultsDiv || !resultHeader || !resultEmoji || !resultMessage || !vibeList || !jsonOutput) return; // Defensive check

    resultsDiv.style.display = 'block';
    resultHeader.className = 'toxic'; // Use toxic (red) style for errors
    resultEmoji.textContent = '⚠️';
    resultMessage.textContent = errorMessage;
    vibeList.innerHTML = ''; // Clear vibe list on error
    jsonOutput.textContent = ''; // Clear raw data on error
    warningMessage.style.display = 'none'; // Hide warning on error
}


function displayResults(data) {
    if (!resultsDiv || !resultHeader || !resultEmoji || !resultMessage || !vibeList || !jsonOutput) return; // Defensive check
    resultsDiv.style.display = 'block';

    // Warning Check (Truncation)
    if (warningMessage) {
        warningMessage.style.display = data.wasTruncated ? 'block' : 'none';
        if(data.wasTruncated) warningMessage.textContent = '⚠️ Your text was too long. Only the first part was analyzed.';
    }

    // ----- CORRECTED LOGIC: Prioritize API Error/Unknown Status -----
    // 1. Check for API-reported error first
    if (data.status === 'error') {
        const vibe = vibeDictionary.ERROR;
        resultHeader.className = 'toxic';
        resultEmoji.textContent = vibe.emoji;
        resultMessage.textContent = data.apiError || vibe.name; // Show Google's error
        vibeList.innerHTML = '<p style="text-align: center; color: #555;">The AI reported an issue processing this text.</p>';
        jsonOutput.textContent = JSON.stringify(data, null, 2);
        return; // Stop here if it's an API error
    }

    // 2. Check for Unknown language status next
    if (data.status === 'unknown') {
        const vibe = vibeDictionary.UNKNOWN;
        resultHeader.className = ''; // Use neutral background for unknown
        resultEmoji.textContent = vibe.emoji;
        resultMessage.textContent = data.apiError || vibe.name; // Show specific 'und' error message
        vibeList.innerHTML = '<p style="text-align: center; color: #555;">Please use more text or a supported language.</p>';
        jsonOutput.textContent = JSON.stringify(data, null, 2);
        return; // Stop here if language is unknown
    }
    // ----- CORRECTED LOGIC END -----


    // 3. If no errors and language is known, proceed with normal vibe analysis
    const scores = data.scores || {}; // Ensure scores is an object
    const totalAggression = data.totalAggression;

    let scoreArray = [];
    for (const attr in scores) {
        scoreArray.push({ name: attr, score: scores[attr] });
    }
    scoreArray.sort((a, b) => b.score - a.score);

    let primaryVibe = scoreArray.length > 0 ? scoreArray[0] : null;
    let primaryVibeInfo = vibeDictionary.SAFE;

    // Determine header based on backend status and primary vibe
    if (data.status === 'toxic' && primaryVibe) {
        resultHeader.className = 'toxic';
        primaryVibeInfo = vibeDictionary[primaryVibe.name] || { emoji: '🤔', name: primaryVibe.name };
    } else { // Includes 'safe' status
        resultHeader.className = 'safe';
        primaryVibeInfo = vibeDictionary.SAFE;
    }

    resultEmoji.textContent = primaryVibeInfo.emoji;

    // Display appropriate message
    if (data.status === 'toxic' && primaryVibe) {
        resultMessage.textContent = `This sounds ${primaryVibeInfo.name}!`;
    } else {
        resultMessage.textContent = primaryVibeInfo.name; // Just "Friendly & Safe"
    }


    // Build Vibe Report List
    vibeList.innerHTML = '';
    const topVibes = scoreArray.filter(vibe => vibe.score > 0.15); // Show traits above 15%

    if (topVibes.length === 0) { // If no scores above threshold, show Safe
        const vibe = vibeDictionary.SAFE;
        vibeList.innerHTML = `
            <li class="vibe-item">
                <span class="emoji">${vibe.emoji}</span>
                <span class="name">${vibe.name}</span>
                <span class="percentage">100%</span>
            </li>
        `;
    } else {
        topVibes.forEach(vibe => {
            const vibeInfo = vibeDictionary[vibe.name];
            if (vibeInfo) { // Only display known vibes
                const percentage = (vibe.score * 100).toFixed(0);
                vibeList.innerHTML += `
                    <li class="vibe-item">
                        <span class="emoji">${vibeInfo.emoji}</span>
                        <span class="name">${vibeInfo.name}</span>
                        <span class="percentage">${percentage}%</span>
                    </li>
                `;
            }
        });
         // Fallback if after filtering known vibes, list is empty
        if (vibeList.innerHTML === '') {
             const vibe = vibeDictionary.SAFE;
             vibeList.innerHTML = `
                 <li class="vibe-item">
                     <span class="emoji">${vibe.emoji}</span>
                     <span class="name">${vibe.name}</span>
                     <span class="percentage">100%</span>
                 </li>
             `;
         }
    }

    // Display Raw JSON
    jsonOutput.textContent = JSON.stringify(data, null, 2);
}