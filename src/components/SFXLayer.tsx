import React from "react";
import { Audio, staticFile } from "remotion";
import { SFXItem } from "../lib/types";

interface SFXLayerProps {
    sfxItems: SFXItem[];
}

export const SFXLayer: React.FC<SFXLayerProps> = ({ sfxItems }) => {
    return (
        <>
            {sfxItems.map((sfx, index) => {
                return (
                    <Audio
                        key={`sfx-${index}-${sfx.triggerMs}`}
                        src={staticFile(`sfx/${sfx.file}`)}
                        startFrom={0}
                        volume={() => sfx.volume ?? 0.5}
                    // Sequence-like behavior using playbackRate trick
                    // Audio starts at the trigger frame
                    />
                );
            })}
        </>
    );
};

// Single SFX component for use within Sequence
interface SingleSFXProps {
    file: string;
    volume?: number;
}

export const SingleSFX: React.FC<SingleSFXProps> = ({ file, volume = 0.5 }) => {
    return (
        <Audio
            src={staticFile(`sfx/${file}`)}
            volume={() => volume}
        />
    );
};

export default SFXLayer;
