/**
 * character_data.js
 * Definitions for Sprunki Phase 1 characters.
 */

export const SPRUNKI_CHARACTERS = [
    // --- PHASE 1 CHARACTERS ---
    {
        id: 'oren',
        name: 'Oren',
        type: 'beat',
        phase: 1,
        color: '#f97316', // Orange
        imageVal: 'assets/images/oren_placeholder.png',
        soundVal: 'assets/audio/oren_beat.mp3'
    },
    {
        id: 'clukr',
        name: 'Clukr',
        type: 'beat',
        phase: 1,
        color: '#94a3b8', // Silver/Slate
        imageVal: 'assets/images/clukr_placeholder.png',
        soundVal: 'assets/audio/clukr_beat.mp3'
    },
    {
        id: 'gray',
        name: 'Gray',
        type: 'effect',
        phase: 1,
        color: '#475569', // Gray
        imageVal: 'assets/images/gray_placeholder.png',
        soundVal: 'assets/audio/gray_bass.mp3'
    },
    {
        id: 'sky',
        name: 'Sky',
        type: 'melody',
        phase: 1,
        color: '#0ea5e9', // Light Blue
        imageVal: 'assets/images/sky_placeholder.png',
        soundVal: 'assets/audio/sky_melody.mp3'
    },
    {
        id: 'lime',
        name: 'Lime',
        type: 'melody',
        phase: 1,
        color: '#84cc16', // Lime Green
        imageVal: 'assets/images/lime_placeholder.png',
        soundVal: 'assets/audio/lime_melody.mp3'
    },
    {
        id: 'garnold',
        name: 'Garnold',
        type: 'effect',
        phase: 1,
        color: '#eab308', // Gold
        imageVal: 'assets/images/garnold_placeholder.png',
        soundVal: 'assets/audio/garnold_effect.mp3'
    },
    {
        id: 'owakcx',
        name: 'Owakcx',
        type: 'voice',
        phase: 1,
        color: '#8b5cf6', // Violet
        imageVal: 'assets/images/owakcx_placeholder.png',
        soundVal: 'assets/audio/owakcx_voice.mp3'
    },

    // --- PHASE 2 CHARACTERS (Skeletons/Spooky) ---
    // Re-using assets but with different IDs and colors for visual distinction (handled by CSS filters mostly)
    {
        id: 'skel_oren',
        name: 'Skel-OREN',
        type: 'beat',
        phase: 2,
        color: '#cbd5e1', // Bone White
        imageVal: 'assets/images/oren_placeholder.png',
        soundVal: 'assets/audio/oren_beat.mp3' // Re-using sound for now, maybe pitch shift in future?
    },
    {
        id: 'skel_clukr',
        name: 'Ghoul-Clukr',
        type: 'beat',
        phase: 2,
        color: '#334155', // Dark Slate
        imageVal: 'assets/images/clukr_placeholder.png',
        soundVal: 'assets/audio/clukr_beat.mp3'
    },
    {
        id: 'skel_gray',
        name: 'Grim Gray',
        type: 'effect',
        phase: 2,
        color: '#7e22ce', // Purple
        imageVal: 'assets/images/gray_placeholder.png',
        soundVal: 'assets/audio/gray_bass.mp3'
    },
    {
        id: 'skel_sky',
        name: 'Spirit Sky',
        type: 'melody',
        phase: 2,
        color: '#ef4444', // Red (Blood)
        imageVal: 'assets/images/sky_placeholder.png',
        soundVal: 'assets/audio/sky_melody.mp3'
    },
    {
        id: 'skel_owakcx',
        name: 'Phantom Owakcx',
        type: 'voice',
        phase: 2,
        color: '#18181b', // Black
        imageVal: 'assets/images/owakcx_placeholder.png',
        soundVal: 'assets/audio/owakcx_voice.mp3'
    }
];
