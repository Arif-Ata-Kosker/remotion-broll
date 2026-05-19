import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

/**
 * BurnTransition - Fire transition effect
 *
 * Uses burn.mp4 with screen blend mode to create a fire wipe transition
 * Applied between segments to add dynamic visual breaks
 */
export const BurnTransition: React.FC = () => {
    return (
        <AbsoluteFill style={{ zIndex: 10 }}>
            <OffthreadVideo
                src={staticFile("transitions/burn.mp4")}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    mixBlendMode: "screen",
                }}
                muted
            />
        </AbsoluteFill>
    );
};

export default BurnTransition;
