/**
 * app.js
 * Application Entry Point
 */

import { GameEngine } from './game_engine.js';
import { SPRUNKI_CHARACTERS } from './character_data.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sprunki Game Initializing...");

    // Setup Custom Upload Modal Logic
    const modal = document.getElementById('upload-modal');
    const uploadBtn = document.getElementById('upload-toggle-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const customForm = document.getElementById('custom-char-form');

    // Elements for Dynamic Modal
    const modalTitle = document.getElementById('modal-title');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');
    const editCharIdInput = document.getElementById('edit-char-id');
    const nameInput = document.getElementById('char-name');
    const imageInput = document.getElementById('char-image');
    const soundInput = document.getElementById('char-sound');

    // Handler for "Edit" Request from Game Engine
    const handleEditRequest = (char) => {
        // Set Mode to Edit
        editCharIdInput.value = char.id;
        modalTitle.textContent = `Edit Character: ${char.name}`;
        modalSubmitBtn.textContent = 'Save Changes';

        // Pre-fill Name
        nameInput.value = char.name;

        // Reset File inputs (they can't be pre-filled with values for security, but aren't required in Edit)
        imageInput.value = '';
        soundInput.value = '';
        imageInput.required = false;
        soundInput.required = false;

        modal.classList.remove('hidden');
    };

    // Initialize Game Engine
    const engine = new GameEngine();
    engine.onEditRequest = handleEditRequest;

    // Start Engine with seeded default characters
    // The engine will check if DB is empty; if so, it seeds these. 
    // If DB has data (even if modified), it loads from DB.
    engine.start(SPRUNKI_CHARACTERS);

    // Open Modal for "New" (Reset Mode)
    uploadBtn.addEventListener('click', () => {
        editCharIdInput.value = ''; // Empty = New
        modalTitle.textContent = 'Create Custom Character';
        modalSubmitBtn.textContent = 'Create';
        customForm.reset();

        // Required for new
        imageInput.required = true;
        soundInput.required = true;

        modal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    customForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editingId = editCharIdInput.value;
        const name = nameInput.value;
        const imgFile = imageInput.files.length ? imageInput.files[0] : null;
        const audioFile = soundInput.files.length ? soundInput.files[0] : null;

        if (editingId) {
            // EDIT MODE
            await engine.editCharacter(editingId, name, imgFile, audioFile);
        } else {
            // CREATE MODE
            if (imgFile && audioFile) {
                await engine.addCustomCharacter(name, imgFile, audioFile);
            }
        }

        // Reset and close
        customForm.reset();
        modal.classList.add('hidden');
    });

    // Stop Button
    document.getElementById('stop-btn').addEventListener('click', () => {
        engine.stopAll();
    });
});
