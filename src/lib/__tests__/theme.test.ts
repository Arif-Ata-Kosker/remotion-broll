import { describe, it, expect } from "vitest";
import { colors, gradients, typography, spacing, shadows } from "../theme";

describe("Theme Integrity", () => {
    describe("colors", () => {
        it("has all accent colors defined", () => {
            expect(colors.accent.gold).toBeDefined();
            expect(colors.accent.orange).toBeDefined();
            expect(colors.accent.orangeLight).toBeDefined();
        });

        it("has all text colors defined", () => {
            expect(colors.text.primary).toBeDefined();
            expect(colors.text.stroke).toBeDefined();
        });

        it("has all background colors defined", () => {
            expect(colors.background.dark).toBeDefined();
            expect(colors.background.hookDark).toBeDefined();
            expect(colors.background.hookMid).toBeDefined();
            expect(colors.background.hookDeep).toBeDefined();
        });

        it("has all overlay colors defined", () => {
            expect(colors.overlay.black90).toBeDefined();
            expect(colors.overlay.black70).toBeDefined();
            expect(colors.overlay.white50).toBeDefined();
        });

        it("has valid hex color format for solids", () => {
            expect(colors.accent.gold).toMatch(/^#[0-9A-F]{6}$/i);
            expect(colors.accent.orange).toMatch(/^#[0-9A-F]{6}$/i);
            expect(colors.text.primary).toMatch(/^#[0-9A-F]{6}$/i);
        });

        it("has valid rgba format for overlays", () => {
            expect(colors.overlay.black90).toMatch(/^rgba\(\d+,\d+,\d+,[\d.]+\)$/);
            expect(colors.glow.gold80).toMatch(/^rgba\(\d+,\d+,\d+,[\d.]+\)$/);
        });
    });

    describe("gradients", () => {
        it("has all gradient definitions", () => {
            expect(gradients.bottomEdge).toBeDefined();
            expect(gradients.topEdge).toBeDefined();
            expect(gradients.splitBottomEdge).toBeDefined();
            expect(gradients.ctaOverlay).toBeDefined();
            expect(gradients.endCardBg).toBeDefined();
            expect(gradients.decorativeLine).toBeDefined();
        });

        it("gradients are valid CSS strings", () => {
            expect(gradients.bottomEdge).toContain("linear-gradient");
            expect(gradients.endCardCta).toContain("linear-gradient");
            expect(gradients.hookIntroBg).toContain("linear-gradient");
        });
    });

    describe("typography", () => {
        it("has all fontSize values as positive numbers", () => {
            expect(typography.fontSize.hookTitle).toBeGreaterThan(0);
            expect(typography.fontSize.endCardTitle).toBeGreaterThan(0);
            expect(typography.fontSize.subtitleMax).toBeGreaterThan(0);
        });

        it("has all fontWeight values between 100-900", () => {
            expect(typography.fontWeight.black).toBe(900);
            expect(typography.fontWeight.extraBold).toBe(800);
            expect(typography.fontWeight.semiBold).toBe(600);
            expect(typography.fontWeight.medium).toBe(500);
        });

        it("has all letterSpacing values as strings", () => {
            expect(typeof typography.letterSpacing.wide).toBe("string");
            expect(typography.letterSpacing.wide).toContain("px");
        });

        it("maintains sensible fontSize hierarchy", () => {
            expect(typography.fontSize.hookTitle).toBeGreaterThan(typography.fontSize.endCardTitle);
            expect(typography.fontSize.endCardTitle).toBeGreaterThan(typography.fontSize.hookSubtext);
        });
    });

    describe("spacing", () => {
        it("has overlay height ratio between 0 and 1", () => {
            expect(spacing.overlayHeightRatio).toBeGreaterThan(0);
            expect(spacing.overlayHeightRatio).toBeLessThan(1);
        });

        it("has all borderRadius values defined", () => {
            expect(spacing.borderRadius.large).toBeDefined();
            expect(spacing.borderRadius.medium).toBeDefined();
            expect(spacing.borderRadius.pill).toBeDefined();
        });

        it("has all gap values as positive numbers", () => {
            expect(spacing.gap.small).toBeGreaterThan(0);
            expect(spacing.gap.medium).toBeGreaterThan(0);
            expect(spacing.gap.large).toBeGreaterThan(0);
        });

        it("maintains gap hierarchy", () => {
            expect(spacing.gap.large).toBeGreaterThan(spacing.gap.medium);
            expect(spacing.gap.medium).toBeGreaterThan(spacing.gap.small);
        });
    });

    describe("shadows", () => {
        it("has all shadow definitions", () => {
            expect(shadows.hookTitleGlow).toBeDefined();
            expect(shadows.endCardCtaBox).toBeDefined();
            expect(shadows.decorativeLineGlow).toBeDefined();
            expect(shadows.textSoft).toBeDefined();
        });

        it("shadows are valid CSS strings", () => {
            expect(shadows.textSoft).toContain("rgba");
            expect(shadows.hookTitleGlow).toContain("0 0");
        });
    });
});
