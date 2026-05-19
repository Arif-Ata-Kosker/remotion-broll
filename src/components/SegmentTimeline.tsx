import React from "react";
import { Sequence } from "remotion";
import { Segment } from "../lib/types";
import { msToFrames } from "../lib/utils";
import { SegmentRenderer } from "./SegmentRenderer";

interface SegmentTimelineProps {
    segments: Segment[];
    globalVideoSrc: string;
}

/**
 * Renders all video segments wrapped in Sequences.
 * Subtitles are handled globally by SentenceSubtitleTrack in ViralVideo.
 */
export const SegmentTimeline: React.FC<SegmentTimelineProps> = ({
    segments,
    globalVideoSrc,
}) => {
    return (
        <>
            {segments.map((segment) => {
                const from = msToFrames(segment.startMs);
                const durationInFrames = msToFrames(segment.endMs - segment.startMs);

                return (
                    <Sequence
                        key={segment.id}
                        from={from}
                        durationInFrames={durationInFrames}
                        name={segment.name}
                    >
                        <SegmentRenderer
                            segment={segment}
                            globalVideoSrc={globalVideoSrc}
                        />
                    </Sequence>
                );
            })}
        </>
    );
};

export default SegmentTimeline;
