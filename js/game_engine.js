/**
 * game_engine.js
 * Handles UI generation, drag-and-drop logic, and ties UI to Audio.
 */

import { AudioManager } from './audio_manager.js';
import { StorageManager } from './storage_manager.js';

export class GameEngine {
    constructor() {
        this.audioManager = new AudioManager();
        this.storageManager = new StorageManager();
        this.characters = []; // Single source of truth (from DB)
        this.activeSlots = new Array(7).fill(null); // 7 Slots, null or charID
        this.currentPhase = 1; // 1 = Normal, 2 = Spooky/Phase 2

        this.stageEl = document.getElementById('stage');
        this.pickerEl = document.getElementById('picker');

        // We defer initStage to after DB load
    }

    // Called by app.js with the default list
    async start(defaultCharacters) {
        await this.storageManager.init();

        // 1. Load existing from DB
        let persisted = await this.storageManager.loadAllCharacters();

        // 2. Synchronization / Seeding
        // Check if there are any default characters (Phase 1 OR Phase 2) that are missing from DB
        // This handles both "First Run" and "Update with new characters" scenarios.
        const missingDefaults = defaultCharacters.filter(def => !persisted.some(p => p.id === def.id));

        if (missingDefaults.length > 0) {
            console.log(`Found ${missingDefaults.length} missing default characters. Seeding...`);
            const seeds = missingDefaults.map(c => ({
                ...c,
                isDefault: true,
                // Ensure we save paths
                imageVal: c.imageVal,
                soundVal: c.soundVal
            }));

            for (const char of seeds) {
                await this.storageManager.saveCharacter(char);
            }
            // Reload after seeding
            persisted = await this.storageManager.loadAllCharacters();
        }

        // 3. Process and Load into Memory
        this.characters = [];
        for (const p of persisted) {
            // Reconstruct runtime object
            let imgUrl = p.imageVal;

            // If it has a Blob stored (Custom upload), create URL
            if (p.imageBlob) {
                imgUrl = URL.createObjectURL(p.imageBlob);
            }

            // Load Audio
            if (p.audioBlob) {
                await this.audioManager.loadUserSound(p.id, p.audioBlob);
            } else if (p.soundVal) {
                await this.audioManager.loadSound(p.id, p.soundVal);
            }

            this.characters.push({
                ...p,
                imageVal: imgUrl,
                phase: p.phase || 1 // Default to Phase 1 if undefined (legacy records)
            });
        }

        // 4. Initial Render
        this.initStage();
        this.renderPicker();
    }

    initStage() {
        this.stageEl.innerHTML = '';
        for (let i = 0; i < 7; i++) {
            const slot = document.createElement('div');
            slot.classList.add('char-slot');
            slot.dataset.index = i;

            const visual = document.createElement('div');
            visual.classList.add('char-idle');
            slot.appendChild(visual);

            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e));
            slot.addEventListener('click', () => this.removeCharacterFromSlot(i));

            this.stageEl.appendChild(slot);
        }
    }

    renderPicker() {
        this.pickerEl.innerHTML = '';

        // Sort: Defaults first, then custom? Or just ID order?
        // Let's keep array order (which is insertion order from DB usually)
        // Filter by Current Phase
        // Phase 1 shows Phase 1 chars + Custom chars (assuming cust chars are Phase 1 or universal for now)
        // Let's assume Custom Characters (created by user) are available in BOTH phases or just Phase 1?
        // Requirement didn't specify. Let's show Custom Chars in Phase 1 for now, or match phase property.
        // If we created a custom char in Phase 2, it might not have phase prop saved correctly in my previous edit?
        // Wait, app.js logic for custom creation needs checking.
        // For now: Show characters where char.phase matches currentPhase.
        // Custom chars might depend on how we saved them.

        const phaseChars = this.characters.filter(c => {
            // If character has no phase (custom legacy), assume phase 1
            const p = c.phase || 1;
            return p === this.currentPhase;
        });

        phaseChars.forEach(char => {
            const icon = document.createElement('div');
            icon.classList.add('sound-icon', `type-${char.type}`, 'group', 'relative');
            icon.draggable = true;
            icon.dataset.id = char.id;

            icon.style.backgroundColor = char.color;
            icon.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs font-bold text-white opacity-80">${char.name}</div>`;

            if (char.imageVal && !char.imageVal.includes('placeholder')) {
                icon.style.backgroundImage = `url(${char.imageVal})`;
                icon.style.backgroundSize = 'cover';
                icon.innerHTML = '';
            }

            // Edit Button
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✎';
            editBtn.className = 'absolute top-1 right-1 text-white bg-black/50 hover:bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10';
            editBtn.title = "Edit Character";

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onEditRequest) this.onEditRequest(char);
            });
            icon.appendChild(editBtn);

            icon.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', char.id);
                e.dataTransfer.effectAllowed = 'copy';
            });
            this.pickerEl.appendChild(icon);
        });
    }

    handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
    handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const charId = e.dataTransfer.getData('text/plain');
        const index = parseInt(e.currentTarget.dataset.index);
        if (charId) this.assignCharacterToSlot(index, charId);
    }

    assignCharacterToSlot(index, charId) {
        const char = this.characters.find(c => c.id === charId);
        if (!char) return;

        if (this.activeSlots[index]) this.removeCharacterFromSlot(index);

        this.activeSlots[index] = charId;
        const slotEl = this.stageEl.children[index];
        const visual = slotEl.querySelector('.char-idle') || document.createElement('div');
        visual.className = 'char-active';
        visual.style.backgroundColor = char.color;

        if (char.imageVal && !char.imageVal.includes('placeholder')) {
            visual.innerHTML = `<img src="${char.imageVal}" class="w-full h-full object-contain drop-shadow-lg">`;
            visual.style.backgroundColor = 'transparent';
        } else {
            visual.innerHTML = '';
        }

        if (!slotEl.contains(visual)) slotEl.appendChild(visual);
        const icon = this.pickerEl.querySelector(`.sound-icon[data-id="${charId}"]`);
        if (icon) icon.classList.add('in-use');
        this.audioManager.startLoop(charId);
    }

    removeCharacterFromSlot(index) {
        const charId = this.activeSlots[index];
        if (!charId) return;
        this.audioManager.stopLoop(charId);
        this.activeSlots[index] = null;
        const slotEl = this.stageEl.children[index];
        const visual = slotEl.querySelector('.char-active');
        if (visual) {
            visual.className = 'char-idle';
            visual.innerHTML = '';
            visual.style.backgroundColor = '';
        }
        const icon = this.pickerEl.querySelector(`.sound-icon[data-id="${charId}"]`);
        if (icon) icon.classList.remove('in-use');
    }

    stopAll() {
        this.audioManager.stopAll();
        this.activeSlots.forEach((charId, idx) => {
            if (charId) this.removeCharacterFromSlot(idx);
        });
    }

    togglePhase() {
        this.currentPhase = (this.currentPhase === 1) ? 2 : 1;

        // 1. Update Visuals (Body Class)
        document.body.classList.toggle('phase-2', this.currentPhase === 2);

        // 2. Refresh Picker to show relevant characters
        this.renderPicker();

        // 3. Optional: Trigger specific sound or effect here if desired
        console.log(`Switched to Phase ${this.currentPhase}`);
    }

    async addCustomCharacter(name, imgFile, audioFile) {
        const id = 'custom_' + Date.now();
        // Save to Persistence
        const persistedChar = {
            id: id,
            name: name,
            type: 'voice',
            color: '#3b82f6',
            imageBlob: imgFile,
            audioBlob: audioFile,
            imageVal: null,
            soundVal: null,
            phase: this.currentPhase // Save to current phase
        };
        await this.storageManager.saveCharacter(persistedChar);

        // Reload all (simplest way to ensure sync)
        // Or optimize by pushing to list. Let's reload to reuse logic.
        // Actually, reloading is expensive for assets. Let's push to list.

        const imgUrl = URL.createObjectURL(imgFile);
        await this.audioManager.loadUserSound(id, audioFile);

        this.characters.push({
            ...persistedChar,
            imageVal: imgUrl
        });

        this.renderPicker();
    }

    async editCharacter(id, name, imgFile, audioFile) {
        const charIndex = this.characters.findIndex(c => c.id === id);
        if (charIndex === -1) return;
        let char = this.characters[charIndex];

        // 1. Update Runtime Info
        char.name = name;
        if (imgFile) char.imageVal = URL.createObjectURL(imgFile);
        if (audioFile) {
            this.audioManager.stopLoop(id);
            await this.audioManager.loadUserSound(id, audioFile);
        }

        // 2. Update DB
        // Fetch raw record
        const allPersisted = await this.storageManager.loadAllCharacters();
        let dbRec = allPersisted.find(p => p.id === id);
        if (dbRec) {
            dbRec.name = name;
            if (imgFile) dbRec.imageBlob = imgFile;
            if (audioFile) dbRec.audioBlob = audioFile;
            await this.storageManager.saveCharacter(dbRec);
        }

        // 3. UI Update
        this.renderPicker();
        const activeIdx = this.activeSlots.indexOf(id);
        if (activeIdx !== -1) {
            this.assignCharacterToSlot(activeIdx, id); // refresh visuals
        }
    }
}
