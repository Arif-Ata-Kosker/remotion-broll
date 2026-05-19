import { z } from "zod";

// ==================== Layout Types ====================

export const LayoutTypeSchema = z.enum([
  "zoom-overlay", // Legacy but can map to split-40-60
  "split-40-60", // Hook
  "fullscreen-asset", // Seg 1 & 4
  "closeup", // Seg 2 (~140% zoom)
  "split-60-40", // Seg 3
  "closeup-cta", // CTA
]);

export type LayoutType = z.infer<typeof LayoutTypeSchema>;

// ==================== Segment Schema ====================

export const BRollConfigSchema = z.object({
  src: z.string(),
  type: z.enum(["video", "image"]).default("video"),
}).nullable();

// ==================== Crop Schemas ====================

export const CropRegionSchema = z.object({
  x: z.number(),          // Top-left X in source pixels
  y: z.number(),          // Top-left Y in source pixels
  width: z.number(),      // Crop region width (source pixels)
  height: z.number(),     // Crop region height (source pixels)
  zoomLevel: z.number(),  // Effective zoom level
});

export const ZoomCropSchema = z.object({
  start: CropRegionSchema,  // Wide shot (zoom-overlay start)
  end: CropRegionSchema,    // Closeup shot (zoom-overlay end)
});

export type CropRegion = z.infer<typeof CropRegionSchema>;
export type ZoomCrop = z.infer<typeof ZoomCropSchema>;

// ==================== Segment Schema ====================

export const SegmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  videoSrc: z.string().optional(), // Override global video source
  layout: LayoutTypeSchema,

  // Layout-specific options
  zoom: z.number().optional(),           // closeup layout için
  zoomDurationMs: z.number().optional(), // zoom-overlay layout için
  ctaText: z.string().optional(),        // cta-overlay layout için
  ctaSubtext: z.string().optional(),     // cta-overlay layout için

  broll: BRollConfigSchema.optional(),
  text: z.string().optional(),

  // Virtual camera crop data
  crop: CropRegionSchema.optional(),
  zoomCrop: ZoomCropSchema.optional(), // zoom-overlay layout only
});

export type Segment = z.infer<typeof SegmentSchema>;

// ==================== Timeline Schema ====================

export const EndCardSchema = z.object({
  startMs: z.number(),
  durationMs: z.number(),
  title: z.string(),
  subtitle: z.string().optional(),
});

export const FaceDetectionMetaSchema = z.object({
  faceCenter: z.object({ x: z.number(), y: z.number() }),
  sourceWidth: z.number(),
  sourceHeight: z.number(),
  confidence: z.number(),
});

export type FaceDetectionMeta = z.infer<typeof FaceDetectionMetaSchema>;

export const ViralTimelineSchema = z.object({
  videoSrc: z.string(),
  shortTitle: z.string(),
  totalDurationMs: z.number(),
  segments: z.array(SegmentSchema),
  endCard: EndCardSchema.optional(),
  faceDetection: FaceDetectionMetaSchema.optional(),
});

export const SentenceSchema = z.object({
  startMs: z.number(),
  endMs: z.number(),
  text: z.string(),
});

export const SentenceSegmentsFileSchema = z.object({
  totalDurationMs: z.number(),
  segments: z.array(
    z.object({
      id: z.number(),
      startMs: z.number(),
      endMs: z.number(),
      sentences: z.array(SentenceSchema),
    }).passthrough(),
  ),
}).passthrough();

export type Sentence = z.infer<typeof SentenceSchema>;
export type SentenceSegmentsFile = z.infer<typeof SentenceSegmentsFileSchema>;

export type EndCard = z.infer<typeof EndCardSchema>;
export type ViralTimeline = z.infer<typeof ViralTimelineSchema>;
export type BRollConfig = z.infer<typeof BRollConfigSchema>;

// ==================== SFX Types ====================

export interface SFXItem {
  file: string;
  triggerMs: number;
  volume?: number;
}

// ==================== Legacy Exports ====================
// Legacy types moved to _legacy/types-legacy.ts
// Re-exported here for backward compatibility

export type {
    ElementAnimation,
    BackgroundElement,
    TextElement,
    Timeline,
    AudioTimestamps,
    ContentItemWithDetails,
    StoryMetadataWithDetails,
} from "./_legacy/types-legacy";

export { StoryScript, StoryWithImages } from "./_legacy/types-legacy";

// Keep for backward compatibility
export { ViralTimelineSchema as TimelineSchema };

