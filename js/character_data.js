/**
 * character_data.js
 * Definitions for Sprunki Phase 1 characters.
 */

export const SPRUNKI_CHARACTERS = [
    {
        id: 'oren',
        name: 'Oren',
        type: 'beat',
        color: '#f97316', // Orange
        // In a real app, these would be paths to assets. 
        // We will mock them or user can replace them.
        imageVal: 'assets/images/oren_placeholder.png',
        soundVal: 'assets/audio/oren_beat.mp3'
    },
    {
        id: 'clukr',
        name: 'Clukr',
        type: 'beat',
        color: '#94a3b8', // Silver/Slate
        imageVal: 'assets/images/clukr_placeholder.png',
        soundVal: 'assets/audio/clukr_beat.mp3'
    },
    {
        id: 'gray',
        name: 'Gray',
        type: 'effect', // Bass usually, grouping as effect or melody for simplicity
        color: '#475569', // Gray
        imageVal: 'assets/images/gray_placeholder.png',
        soundVal: 'assets/audio/gray_bass.mp3'
    },
    {
        id: 'sky',
        name: 'Sky',
        type: 'melody',
        color: '#0ea5e9', // Light Blue
        imageVal: 'assets/images/sky_placeholder.png',
        soundVal: 'assets/audio/sky_melody.mp3'
    },
    {
        id: 'lime',
        name: 'Lime',
        type: 'melody',
        color: '#84cc16', // Lime Green
        imageVal: 'assets/images/lime_placeholder.png',
        soundVal: 'assets/audio/lime_melody.mp3'
    },
    {
        id: 'garnold',
        name: 'Garnold',
        type: 'effect',
        color: '#eab308', // Gold
        imageVal: 'assets/images/garnold_placeholder.png',
        soundVal: 'assets/audio/garnold_effect.mp3'
    },
    {
        id: 'owakcx',
        name: 'Owakcx',
        type: 'voice', // Texture/Voice
        color: '#8b5cf6', // Violet
        imageVal: 'assets/images/owakcx_placeholder.png',
        soundVal: 'assets/audio/owakcx_voice.mp3'
    }
];
