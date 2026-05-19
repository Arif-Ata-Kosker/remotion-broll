import React from "react";
import { Sequence } from "remotion";
import { Segment } from "../lib/types";
import { msToFrames } from "../lib/utils";
import { BURN_DURATION_FRAMES, SFX_OFFSET_FRAMES, SFX_DURATION_FRAMES } from "../lib/constants";
import { BurnTransition } from "./BurnTransition";
import { TransitionSFX } from "./TransitionSFX";

interface TransitionLayerProps {
    segments: Segment[];
}

/**
 * TransitionLayer - Combined burn effect + whoosh SFX for all transitions
 *
 * Renders burn transitions and whoosh sounds between segments
 * Skips the first segment (no transition before the start)
 */
export const TransitionLayer: React.FC<TransitionLayerProps> = ({ segments }) => {
    return (
        <>
            {/* Burn geçiş efektleri - ilk segment hariç her segment başında */}
            {segments.slice(1).map((segment) => {
                const transitionStart = msToFrames(segment.startMs) - Math.floor(BURN_DURATION_FRAMES / 2);
                return (
                    <Sequence
                        key={`burn-${segment.id}`}
                        from={Math.max(0, transitionStart)}
                        durationInFrames={BURN_DURATION_FRAMES}
                        name={`burn-${segment.name}`}
                    >
                        <BurnTransition />
                    </Sequence>
                );
            })}

            {/* Whoosh SFX - her segment geçişinde */}
            {segments.slice(1).map((segment) => {
                const sfxStart = msToFrames(segment.startMs) - SFX_OFFSET_FRAMES;
                return (
                    <Sequence
                        key={`sfx-${segment.id}`}
                        from={Math.max(0, sfxStart)}
                        durationInFrames={SFX_DURATION_FRAMES}
                        name={`sfx-${segment.name}`}
                    >
                        <TransitionSFX volume={0.4} />
                    </Sequence>
                );
            })}
        </>
    );
};

export default TransitionLayer;
