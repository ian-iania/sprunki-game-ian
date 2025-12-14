/**
 * audio_manager.js
 * Handles Web Audio API context, loading buffers, and synchronized playback.
 */

export class AudioManager {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = new Map(); // id -> AudioBuffer
        this.activeSources = new Map(); // id -> AudioBufferSourceNode

        // Synchronization logic
        this.bpm = 120;
        this.nextStartTime = 0;
        this.isPlaying = false;

        // Handle User interaction enabling AudioContext
        document.addEventListener('click', () => {
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        }, { once: true });
    }

    /**
     * Loads a sound file from a URL/Path
     */
    async loadSound(id, url) {
        if (this.buffers.has(id)) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.buffers.set(id, audioBuffer);
            console.log(`Loaded sound: ${id}`);
        } catch (error) {
            console.error(`Error loading sound ${id} from ${url}:`, error);
            // Verify if we should use a fallback tone for placeholder
            this.generatePlaceholderTone(id);
        }
    }

    /**
     * Loads a sound from a File object (User Upload)
     */
    async loadUserSound(id, file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.buffers.set(id, audioBuffer);
            console.log(`Loaded user sound: ${id}`);
        } catch (error) {
            console.error('Error decoding user audio:', error);
        }
    }

    /**
     * Fallback for when assets are missing (since we are in an AI dev environment)
     */
    generatePlaceholderTone(id) {
        // Create a simple 2-second synthesized loop
        const sampleRate = this.audioCtx.sampleRate;
        const duration = 2.0; // seconds
        const frameCount = sampleRate * duration;
        const buffer = this.audioCtx.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);

        // Simple beep pattern based on ID hash or random
        const freq = 200 + (id.length * 50);

        for (let i = 0; i < frameCount; i++) {
            // Sine wave
            data[i] = Math.sin(i * 2 * Math.PI * freq / sampleRate);
            // Envelope to make it rhythmic (on/off)
            if (i % (sampleRate / 2) > (sampleRate / 4)) {
                data[i] = 0;
            }
        }
        this.buffers.set(id, buffer);
        console.log(`Generated placeholder tone for: ${id}`);
    }

    /**
     * Starts a synchronized loop for a character
     */
    startLoop(id) {
        if (!this.buffers.has(id)) return;

        // Stop if already playing to avoid doubling
        this.stopLoop(id);

        const source = this.audioCtx.createBufferSource();
        source.buffer = this.buffers.get(id);
        source.loop = true;
        source.connect(this.audioCtx.destination);

        const currentTime = this.audioCtx.currentTime;
        const loopDuration = 2.0; // Fixed strict duration (e.g. 1 bar at 120BPM)
        // NOTE: In a real app, we might get this from the first loaded buffer.

        let startTime = 0;

        if (!this.isPlaying) {
            // --- First Sound Starting ---
            // Start effectively "now" (plus a tiny safety margin), 
            // and this establishes the Global Grid Anchor.
            this.anchorTime = currentTime + 0.1;
            startTime = this.anchorTime;
            this.isPlaying = true;
        } else {
            // --- Joining an existing Mix ---
            // Calculate when the next "Bar" starts relative to the anchor.
            // Grid: Anchor, Anchor + 2s, Anchor + 4s...

            const elapsedTime = currentTime - this.anchorTime;
            const currentBarIndex = Math.floor(elapsedTime / loopDuration);
            // Target the NEXT bar
            const nextBarIndex = currentBarIndex + 1;

            startTime = this.anchorTime + (nextBarIndex * loopDuration);
        }

        source.start(startTime);
        this.activeSources.set(id, source);
        console.log(`Scheduled ${id} to start at ${startTime.toFixed(3)} (Current: ${currentTime.toFixed(3)})`);
    }

    /**
     * Stops a loop
     */
    stopLoop(id) {
        if (this.activeSources.has(id)) {
            try {
                this.activeSources.get(id).stop();
            } catch (e) { /* ignore if already stopped */ }
            this.activeSources.delete(id);
        }

        if (this.activeSources.size === 0) {
            this.isPlaying = false;
        }
    }

    stopAll() {
        this.activeSources.forEach((source) => {
            try { source.stop(); } catch (e) { }
        });
        this.activeSources.clear();
        this.isPlaying = false;
    }
}
