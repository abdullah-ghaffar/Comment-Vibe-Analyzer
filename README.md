# TextModerator API

A simple, high-speed API for analyzing and moderating user-generated text. It returns a clean JSON response identifying toxicity, spam, and other attributes.

## The Problem

Manually moderating user comments is slow, expensive, and inefficient. This API automates the process, protecting your platform from harmful content in real-time before it becomes a problem.

## Features

* **Real-time Analysis:** Get moderation results in milliseconds.
* **Multi-Attribute Detection:** Scores text for `TOXICITY`, `SPAM`, `INSULT`, and more.
* **Simple JSON Endpoint:** Clean, predictable request and response format.
* **Powered By:** Google Perspective API (for high-accuracy detection).

## Tech Stack

* **Backend:** Node.js, Express
* **AI Moderation:** Google Perspective API

## Getting Started

Follow these steps to run the project locally.

### 1. Prerequisites

* Node.js (v18 or later)
* NPM
* A Google Perspective API Key. You can get a free key from the [Perspective API website](https://www.perspectiveapi.com/).

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/abdullah-ghaffar/TextModerator-API.git)
    cd TextModerator-API
    ```

2.  Install all required packages:
    ```bash
    npm install
    ```

### 3. Configuration

1.  Create a `.env` file in the root of the project.
2.  Add your API key to this file:
    ```env
    PERSPECTIVE_API_KEY=your_google_api_key_goes_here
    ```

### 4. Run the Server

Start the local development server:
```bash
npm start
The API will now be running at http://localhost:3000.

API Usage
The API has one primary endpoint for all moderation tasks.

POST /moderate
Analyzes a string of text and returns the moderation scores.

Request Body: (application/json)

JSON

{
  "text": "This is a wonderful example comment."
}
Success Response (200 OK): The API returns a simple status (safe, toxic) and a detailed scores object.

JSON

{
  "status": "safe",
  "scores": {
    "TOXICITY": 0.08,
    "SPAM": 0.1,
    "INSULT": 0.05
  }
}
Example (Toxic Text):

Request:

JSON

{
  "text": "You are a stupid idiot, I hate this."
}
Response:

JSON

{
  "status": "toxic",
  "scores": {
    "TOXICITY": 0.92,
    "SPAM": 0.2,
    "INSULT": 0.88
  }
}