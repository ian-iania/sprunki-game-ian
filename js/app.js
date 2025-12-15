/**
 * app.js
 * Application Entry Point
 */

import { GameEngine } from './game_engine.js';
import { SPRUNKI_CHARACTERS } from './character_data.js';
import { AssetLoader } from './asset_loader.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sprunki Game Initializing...");

    const assetLoader = new AssetLoader();

    // Setup Custom Upload Modal Logic
    const modal = document.getElementById('upload-modal');
    const uploadBtn = document.getElementById('upload-toggle-btn');
    const phaseToggleBtn = document.getElementById('phase-toggle-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const customForm = document.getElementById('custom-char-form');

    // Modes & Views
    const modeLibraryBtn = document.getElementById('mode-library-btn');
    const modeCustomBtn = document.getElementById('mode-custom-btn');
    const libraryView = document.getElementById('library-view');
    const libraryGrid = document.getElementById('library-grid');
    const customView = document.getElementById('custom-view');
    const imageInputContainer = document.getElementById('image-input-container');

    // Elements for Dynamic Modal
    const modalTitle = document.getElementById('modal-title');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');
    const editCharIdInput = document.getElementById('edit-char-id');
    const nameInput = document.getElementById('char-name');
    const imageInput = document.getElementById('char-image');
    const soundInput = document.getElementById('char-sound');

    // State for Library Selection
    let selectedLibraryChar = null;

    // --- library logic ---
    const renderLibrary = (phase) => {
        libraryGrid.innerHTML = '';
        const chars = assetLoader.getLibraryCharacters(phase);

        if (chars.length === 0) {
            libraryGrid.innerHTML = '<p class="text-gray-500 col-span-3 text-center">No characters found for this phase.</p>';
            return;
        }

        chars.forEach(char => {
            const thumb = document.createElement('div');
            thumb.className = 'cursor-pointer border-2 border-transparent hover:border-blue-500 rounded p-1 transition bg-gray-700 flex flex-col items-center';
            thumb.innerHTML = `
                <img src="${char.image}" class="w-16 h-16 object-cover rounded mb-1 bg-black/20">
                <span class="text-xs text-center text-gray-300 truncate w-full">${char.name}</span>
            `;
            thumb.addEventListener('click', () => {
                // Select This Character
                document.querySelectorAll('#library-grid > div').forEach(el => el.classList.remove('border-blue-500', 'bg-blue-900'));
                thumb.classList.add('border-blue-500', 'bg-blue-900');

                selectedLibraryChar = char;
                nameInput.value = char.name;
                imageInput.required = false; // Not needed for library
                soundInput.required = false; // Not needed for library
            });
            libraryGrid.appendChild(thumb);
        });
    };

    const switchMode = (mode) => {
        if (mode === 'library') {
            modeLibraryBtn.classList.add('text-blue-400', 'border-blue-400');
            modeLibraryBtn.classList.remove('text-gray-500');
            modeCustomBtn.classList.remove('text-blue-400', 'border-blue-400');
            modeCustomBtn.classList.add('text-gray-500');

            libraryView.classList.remove('hidden');
            customView.classList.add('hidden');
            imageInputContainer.classList.add('hidden'); // Hide manual image upload

            // Re-render based on current phase
            renderLibrary(engine.currentPhase);
            selectedLibraryChar = null;
            nameInput.readOnly = true; // Auto-filled
            modalSubmitBtn.textContent = 'Add to Game';
        } else {
            modeLibraryBtn.classList.remove('text-blue-400', 'border-blue-400');
            modeLibraryBtn.classList.add('text-gray-500');
            modeCustomBtn.classList.add('text-blue-400', 'border-blue-400');
            modeCustomBtn.classList.remove('text-gray-500');

            libraryView.classList.add('hidden');
            customView.classList.remove('hidden');
            imageInputContainer.classList.remove('hidden'); // Show manual image upload (required)

            selectedLibraryChar = null;
            nameInput.readOnly = false;
            nameInput.value = '';
            modalSubmitBtn.textContent = 'Create Custom';
        }
    };

    modeLibraryBtn.addEventListener('click', () => switchMode('library'));
    modeCustomBtn.addEventListener('click', () => switchMode('custom'));


    // Handler for "Edit" Request from Game Engine
    const handleEditRequest = (char) => {
        // Set Mode to Edit
        editCharIdInput.value = char.id;
        modalTitle.textContent = `Edit Character: ${char.name}`;
        modalSubmitBtn.textContent = 'Save Changes';

        // Show Mode Switchers (Enable Library for Edit)
        modeLibraryBtn.parentElement.classList.remove('hidden');

        // Default to Library View for convenience, or Custom? 
        // User asked: "olhando e usando thumbnail". So Library default is good.
        switchMode('library');

        // Pre-fill Name
        nameInput.value = char.name;
        nameInput.readOnly = false; // Allow editing name

        // Reset File inputs
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

    // --- DYNAMIC ASSET INTEGRATION ---
    const manifestChars1 = assetLoader.getLibraryCharacters(1);
    const manifestChars2 = assetLoader.getLibraryCharacters(2);

    // 1. Update existing hardcoded characters with new assets
    SPRUNKI_CHARACTERS.forEach(char => {
        const list = (char.phase === 2) ? manifestChars2 : manifestChars1;
        // Match by ID or Name (case-insensitive)
        const match = list.find(m =>
            m.name.toLowerCase() === char.id.toLowerCase() ||
            m.name.toLowerCase() === char.name.replace(/_/g, ' ').toLowerCase()
        );

        if (match) {
            console.log(`Updated assets for ${char.name}`);
            char.imageVal = match.image;
            char.soundVal = match.sound;
        }
    });

    // 2. Add new characters from Manifest that are NOT in SPRUNKI_CHARACTERS
    const allExistingIds = new Set(SPRUNKI_CHARACTERS.map(c => c.id));

    const addNew = (list, phase) => {
        list.forEach(m => {
            // Check if this manifest character is already represented
            // We match by name since manifest "name" is the key
            // The manifest name is "oren", "clukr" etc.
            // We need to check if ANY existing char has this ID or Name
            const exists = SPRUNKI_CHARACTERS.some(c =>
                c.id.toLowerCase() === m.name.toLowerCase() ||
                c.name.toLowerCase() === m.name.toLowerCase()
            );

            if (!exists) {
                console.log(`Adding new character from manifest: ${m.name}`);
                SPRUNKI_CHARACTERS.push({
                    id: m.name.replace(/\s+/g, '_'),
                    name: m.name.charAt(0).toUpperCase() + m.name.slice(1), // Capitalize
                    type: 'voice', // Default type (user can edit later if we add type to manifest logic)
                    phase: phase,
                    color: m.color || '#6b7280',
                    imageVal: m.image,
                    soundVal: m.sound
                });
            }
        });
    };

    addNew(manifestChars1, 1);
    addNew(manifestChars2, 2);

    engine.start(SPRUNKI_CHARACTERS);

    // Open Modal for "New" (Reset Mode)
    uploadBtn.addEventListener('click', () => {
        editCharIdInput.value = ''; // Empty = New
        modalTitle.textContent = 'Add Character';

        customForm.reset();
        modeLibraryBtn.parentElement.classList.remove('hidden');

        // Default to Library Mode
        switchMode('library');

        modal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    customForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editingId = editCharIdInput.value;
        const name = nameInput.value;

        // Common logic to fetch library assets
        let libImgBlob = null;
        let libAudioBlob = null;

        if (selectedLibraryChar) {
            try {
                const splitRes = await fetch(selectedLibraryChar.sound);
                libAudioBlob = await splitRes.blob();

                const imgRes = await fetch(selectedLibraryChar.image);
                libImgBlob = await imgRes.blob();
            } catch (err) {
                console.error("Failed to load library assets", err);
                alert("Error loading library assets. Check console.");
                return;
            }
        }

        if (editingId) {
            // EDIT MODE
            const imgFile = imageInput.files.length ? imageInput.files[0] : libImgBlob;
            const audioFile = soundInput.files.length ? soundInput.files[0] : libAudioBlob;

            // Note: If both file input and library are empty, passing null preserves existing assets in engine logic?
            // Engine.editCharacter logic needs to be checked. 
            // If we pass null, it usually keeps old one. 
            // If we select library, we pass blobs.

            await engine.editCharacter(editingId, name, imgFile, audioFile);
        } else {
            // CREATE MODE
            if (libImgBlob && libAudioBlob) {
                // ADD FROM LIBRARY
                await engine.addCustomCharacter(name, libImgBlob, libAudioBlob);
            } else {
                // MANUAL UPLOAD
                const imgFile = imageInput.files.length ? imageInput.files[0] : null;
                const audioFile = soundInput.files.length ? soundInput.files[0] : null;
                if (imgFile && audioFile) {
                    await engine.addCustomCharacter(name, imgFile, audioFile);
                }
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

    // Phase Toggle Button
    phaseToggleBtn.addEventListener('click', () => {
        engine.togglePhase();
        if (engine.currentPhase === 2) {
            phaseToggleBtn.classList.add('bg-purple-900', 'ring-2', 'ring-purple-400', 'scale-105');
            phaseToggleBtn.innerText = "FASE 1";
        } else {
            phaseToggleBtn.classList.remove('bg-purple-900', 'ring-2', 'ring-purple-400', 'scale-105');
            phaseToggleBtn.innerText = "FASE 2";
        }
    });
});
