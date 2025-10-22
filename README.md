# Comment Vibe Analyzer ✨

[![Deployed with Vercel](https://vercel.com/button)](YOUR_VERCEL_DEPLOYMENT_URL) A full-stack web application that analyzes the "vibe" (sentiment and tone) of user-provided text using the Google Perspective API, presenting results in a user-friendly interface.



## Live Demo

Check out the live application here: **[YOUR_VERCEL_DEPLOYMENT_URL](YOUR_VERCEL_DEPLOYMENT_URL)** ---

## The Problem

Understanding the underlying tone and potential toxicity of online comments is crucial for maintaining healthy conversations. Raw API scores (like toxicity percentages) can be confusing for end-users. This tool aims to provide a more intuitive and engaging analysis of comment "vibes".

---

## Features

* **📈 Real-time Vibe Analysis:** Instantly analyzes text input using the Google Perspective API.
* **🌍 Language Auto-Detection:** Automatically detects the language of the input text (best effort by the API).
* **😊 Engaging UI:** Presents results using clear language and emojis (e.g., "Friendly & Safe", "Aggressive", "Threatening") instead of raw scores.
* **📊 Detailed Report:** Shows the percentage scores for key analyzed attributes (Toxicity, Insult, Threat, etc.).
* **⚙️ Robust Error Handling:** Gracefully handles API limitations, such as language detection failures or character limits, providing clear user feedback.
* **✂️ Long Text Handling:** Automatically truncates input text exceeding the API's limit and notifies the user.
* **💻 Simple Frontend:** Built with vanilla HTML, CSS, and JavaScript for easy understanding and modification.
* **🚀 Deployable:** Ready for deployment on platforms like Vercel.

---

## Tech Stack

* **Backend:** Node.js, Express.js
* **Frontend:** HTML, CSS, Vanilla JavaScript
* **API:** Google Perspective API
* **Deployment:** Vercel

---

## Getting Started (Local Setup)

To run this project on your local machine:

### Prerequisites

* Node.js (v18 or later recommended)
* npm (usually comes with Node.js)
* A **Google Perspective API Key**.
    * You need a Google Cloud Project.
    * Enable the "Perspective Comment Analyzer API".
    * Create API credentials. Get your key [here](https://developers.google.com/codelabs/setup-perspective-api).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/TextModerator-API.git](https://github.com/your-username/TextModerator-API.git) # Replace with your repo URL
    cd TextModerator-API
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env` file in the root directory of the project.
2.  Add your Google Perspective API Key to the `.env` file:
    ```env
    # .env
    PERSPECTIVE_API_KEY=YOUR_GOOGLE_API_KEY_GOES_HERE
    ```

### Running the Application

1.  **Start the server:**
    ```bash
    node index.js
    ```
2.  Open your web browser and navigate to `http://localhost:3000`.

---

## API Endpoint

While this is a full-stack app, the core backend logic resides in a single endpoint:

* **`POST /moderate`**
    * **Request Body:** `{ "text": "User comment to analyze" }`
    * **Response Body:** (Success) `{ status: "safe" | "toxic" | "unknown" | "error", totalAggression: number, scores: {...}, wasTruncated: boolean, apiError?: string }`

---

## Deployment

This application is configured for easy deployment on **Vercel**.

1.  Ensure you have a `vercel.json` file (provided in the repository).
2.  Push your code to a GitHub repository.
3.  Import the repository into Vercel.
4.  Add the `PERSPECTIVE_API_KEY` as an Environment Variable in your Vercel project settings.
5.  Deploy! Vercel will automatically build and serve the application.
