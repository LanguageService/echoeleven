<p align="center">
  <img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/132/995/datas/small.png" alt="ECHO Logo" width="150">
</p>

<h1 align="center">ECHO</h1>

<p align="center">
  <strong>Translating your words. Preserving your voice.</strong>
  <br />
  <br />
  <a href="https://letusecho.com"><strong>View Demo »</strong></a>
  <br />
  <br />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
</p>

---

## About The Project

ECHO is a real-time voice translation application built to break down the communication barriers faced by foreigners in Rwanda. This project was created for the **AI Partner Catalyst Hackathon**, specifically for the **ElevenLabs Challenge**, to create a truly human-centric conversational experience.

Our app doesn't just translate words; it translates *personalities*. By integrating **Google's Gemini API** with **ElevenLabs' cutting-edge voice cloning technology**, ECHO allows users to speak in another language while preserving their own unique vocal identity.

### Key Features

| Language Selection | Main Interface | The Magic: Voice Cloning |
| :---: | :---: | :---: |
| <img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/132/993/datas/small.png" alt="Language Selection Screen" width="250"/> | <img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/132/994/datas/small.png" alt="Main Translation Interface" width="250"/> | <img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/004/132/991/datas/small.png" alt="Translation Settings" width="250"/> |
| Choose your source and target languages. | A clean, minimalist interface for easy translation. | Our settings panel where users can record a sample to clone their voice. |

---

### Built With

Our application is a powerful synergy between Google's AI and ElevenLabs, built as a mobile-first Progressive Web App (PWA).

*   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
*   **Backend:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **AI & APIs:**
    *   **Google Gemini API:** For core Speech-to-Text and Text-to-Text translation.
    *   **ElevenLabs API:** For hyper-realistic Text-to-Speech and our breakthrough Voice Cloning feature.

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn
*   A PostgreSQL database instance

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/echo.git
    ```

2.  **Setup the Backend (`/server`)**
    ```sh
    cd server
    npm install
    ```
    Create a `.env` file in the `/server` directory and add the following variables:
    ```env
    PORT=3001
    DATABASE_URL="your_postgresql_connection_string"
    GEMINI_API_KEY="your_google_gemini_api_key"
    ELEVENLABS_API_KEY="your_elevenlabs_api_key"
    ```
    Start the backend server:
    ```sh
    npm start
    ```

3.  **Setup the Frontend (`/client`)**
    In a new terminal, navigate to the client directory:
    ```sh
    cd client
    npm install
    ```
    Create a `.env` file in the `/client` directory and add the backend API URL:
    ```env
    VITE_API_BASE_URL="http://localhost:3001"
    ```
    Start the frontend development server:
    ```sh
    npm run dev
    ```
    Your application should now be running on `http://localhost:5173` (or another port if specified).

---

## Usage

1.  **Create an Account:** Sign up for a new account.
2.  **Clone Your Voice:** Navigate to `Settings` -> `Clone Your Voice` and record a 10-30 second audio sample.
3.  **Select Languages:** Choose your source and target languages (e.g., English to Kinyarwanda).
4.  **Translate:** Tap and hold the microphone button to speak. The app will play back the translation in your cloned voice!

---

## Hackathon Submission

This project was built for the **AI Partner Catalyst** hackathon on Devpost, competing in the **ElevenLabs Challenge**. Our goal was to push the boundaries of what a "conversational" AI could be by creating a deeply personal and human-centric experience.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgments
*   The [Devpost](https://devpost.com/) team for organizing the hackathon.
*   [Google](https://cloud.google.com/) for their powerful Gemini models.
*   [ElevenLabs](https://elevenlabs.io/) for their incredible voice generation technology.
