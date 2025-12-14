/**
 * asset_loader.js
 * Utility to load characters from the static manifest.
 */

import { ASSET_MANIFEST } from './assets_manifest.js';

export class AssetLoader {
    constructor() {
        this.manifest = ASSET_MANIFEST;
    }

    /**
     * Returns all characters available in the library for a given phase.
     * @param {number|string} phase - The phase ID (1 or 2)
     * @returns {Array} List of character objects
     */
    getLibraryCharacters(phase) {
        const p = phase.toString();
        return this.manifest[p] || [];
    }

    /**
     * Returns a specific character by Name and Phase
     */
    getCharacter(phase, name) {
        const list = this.getLibraryCharacters(phase);
        return list.find(c => c.name === name);
    }
}
