# Sprunki Incredibox Clone

A web-based interactive music mixing game inspired by Incredibox/Sprunki. Create your own musical loops by dragging characters onto the stage!

## 🎮 Features

*   **Interactive Stage**: Drag and drop visual characters to start playing their unique sound loops.
*   **Audio Synchronization**: Advanced audio engine ensures all loops stay perfectly synchronized (120 BPM, 2-second bars). No matter when you drop a character, they join the mix on the beat.
*   **Custom Character Creator**:
    *   Upload your own Images and Audio files to create unique characters.
    *   **Edit Mode**: Modify existing characters (Change their name, picture, or sound).
*   **Persistence**: Uses **IndexedDB** to save your custom characters and edits locally in your browser. Your creations are remembered even if you close the tab.
*   **Responsive Design**: Built with Tailwind CSS for a modern, clean interface.

## 🛠️ Technology Stack

*   **HTML5 & CSS3**: Core structure and styling.
*   **Vanilla JavaScript (ES6+)**: No heavy frameworks. Pure, performant JS.
*   **Web Audio API**: For precise audio playback, looping, and mixing.
*   **IndexedDB**: Local browser storage for persisting large image/audio blobs.
*   **Tailwind CSS**: Utility-first styling (loaded via CDN).

## 🚀 How to Run Locally

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ian-iania/sprunki-game-ian.git
    cd sprunki-game-ian
    ```

2.  **Start a Local Server**:
    Because the game uses ES Modules (`import/export`), it must be run via a local server (opening `index.html` directly won't work due to CORS policies).

    We have provided a helper script for macOS/Linux/WSL (requires Python 3):
    ```bash
    ./start_game.sh
    ```
    Or manually:
    ```bash
    python3 -m http.server 8000
    ```

3.  **Play**:
    Open your browser and navigate to `http://localhost:8000`.

## 📂 Project Structure

*   `index.html`: Main game interface.
*   `css/styles.css`: Custom animations and specific styles.
*   `js/app.js`: Main entry point. Handles DOM events and modal logic.
*   `js/game_engine.js`: Core game logic (Drag & Drop, UI rendering, State).
*   `js/audio_manager.js`: Web Audio API wrapper. Handles sync and playback.
*   `js/storage_manager.js`: IndexedDB wrapper for saving custom assets.
*   `js/character_data.js`: Configuration for default characters.

## 💾 Saving & Data

This application uses the browser's **IndexedDB** to store custom characters.
*   **Note**: Custom characters you create are saved **locally in your specific browser**. They are not uploaded to a central server or GitHub. If you clear your browser data or switch computers, your custom characters will not appear.
*   The source code on GitHub includes the game engine and default character logic.

## 📄 License

This project is a fan-made clone for educational purposes. 
