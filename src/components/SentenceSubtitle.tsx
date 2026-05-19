import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { msToFrames } from "../lib/utils";
import type { Sentence } from "../lib/types";

const { fontFamily } = loadFont();

const HIGHLIGHT_PATTERNS = [
    /otomasyon/i,
    /ücretsiz/i,
    /n8n/i,
    /yorumlara/i,
    /youtube/i,
    /yapay zeka/i,
    /yüzlerce/i,
    /tamamen/i,
];

const HIGHLIGHT_COLOR = "#FFD93D";

const stripPunct = (w: string) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

const isHighlight = (word: string) => {
    const stripped = stripPunct(word);
    if (!stripped) return false;
    return HIGHLIGHT_PATTERNS.some((re) => re.test(stripped));
};

interface SentenceSubtitleTrackProps {
    sentences: Sentence[];
}

/**
 * Reference-style caption track: one sentence at a time, sentence case,
 * small font, dark rounded pill background, anchored near the bottom.
 * Reads sentence-segments.json timings (absolute ms from video start).
 */
export const SentenceSubtitleTrack: React.FC<SentenceSubtitleTrackProps> = ({
    sentences,
}) => {
    return (
        <>
            {sentences.map((s, i) => {
                const from = msToFrames(s.startMs);
                const duration = Math.max(1, msToFrames(s.endMs - s.startMs));
                return (
                    <Sequence
                        key={`sentence-${i}`}
                        from={from}
                        durationInFrames={duration}
                        name={`sentence-${i}`}
                    >
                        <SentenceCaption text={s.text} />
                    </Sequence>
                );
            })}
        </>
    );
};

const SentenceCaption: React.FC<{ text: string }> = ({ text }) => {
    return (
        <AbsoluteFill
            style={{
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 220,
                paddingLeft: 60,
                paddingRight: 60,
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    fontFamily,
                    fontWeight: 600,
                    fontSize: 42,
                    lineHeight: 1.25,
                    color: "#FFFFFF",
                    textAlign: "center",
                    background: "rgba(0,0,0,0.72)",
                    padding: "14px 26px",
                    borderRadius: 16,
                    maxWidth: "92%",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
                    textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                    letterSpacing: 0.2,
                    wordBreak: "normal",
                    whiteSpace: "normal",
                }}
            >
                {text.split(/(\s+)/).map((token, i) => {
                    if (/^\s+$/.test(token)) return <React.Fragment key={i}>{token}</React.Fragment>;
                    if (isHighlight(token)) {
                        return (
                            <span
                                key={i}
                                style={{
                                    color: HIGHLIGHT_COLOR,
                                    fontWeight: 800,
                                    textShadow: "0 0 18px rgba(255,217,61,0.5), 0 2px 6px rgba(0,0,0,0.6)",
                                }}
                            >
                                {token}
                            </span>
                        );
                    }
                    return <React.Fragment key={i}>{token}</React.Fragment>;
                })}
            </div>
        </AbsoluteFill>
    );
};

export default SentenceSubtitleTrack;
