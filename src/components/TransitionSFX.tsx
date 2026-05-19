import React from "react";
import { Audio, staticFile } from "remotion";

interface TransitionSFXProps {
    volume?: number;
}

/**
 * TransitionSFX - Whoosh sound effect for transitions
 *
 * Plays a whoosh sound during segment transitions
 * Synchronized with burn transition effect
 */
export const TransitionSFX: React.FC<TransitionSFXProps> = ({ volume = 0.4 }) => {
    return (
        <Audio
            src={staticFile("sfx/whoosh.mp3")}
            volume={() => volume}
        />
    );
};

export default TransitionSFX;
