import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { z } from "zod";
import { ViralTimelineSchema, SentenceSchema } from "../lib/types";
import { msToFrames } from "../lib/utils";
import { SegmentTimeline } from "./SegmentTimeline";
import { TransitionLayer } from "./TransitionLayer";
import { EndCard } from "./EndCard";
import { SentenceSubtitleTrack } from "./SentenceSubtitle";

export const viralVideoSchema = z.object({
    timeline: ViralTimelineSchema.nullable(),
    sentences: z.array(SentenceSchema).default([]),
});

const ViralVideo: React.FC<{
    timeline: z.infer<typeof ViralTimelineSchema> | null;
    sentences?: z.infer<typeof SentenceSchema>[];
}> = ({ timeline, sentences = [] }) => {
    if (!timeline) {
        return (
            <AbsoluteFill style={{ backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "white", fontSize: 48 }}>Loading...</div>
            </AbsoluteFill>
        );
    }

    return (
        <AbsoluteFill style={{ backgroundColor: "black" }}>
            <SegmentTimeline
                segments={timeline.segments}
                globalVideoSrc={timeline.videoSrc}
            />

            <TransitionLayer segments={timeline.segments} />

            {/* Sentence-level captions overlayed across the whole video */}
            <SentenceSubtitleTrack sentences={sentences} />

            {timeline.endCard && (
                <Sequence
                    from={msToFrames(timeline.endCard.startMs)}
                    durationInFrames={msToFrames(timeline.endCard.durationMs)}
                    name="end-card"
                >
                    <EndCard
                        title={timeline.endCard.title}
                        subtitle={timeline.endCard.subtitle}
                    />
                </Sequence>
            )}
        </AbsoluteFill>
    );
};

export default ViralVideo;
