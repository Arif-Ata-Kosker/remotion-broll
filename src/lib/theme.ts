/**
 * Merkezi tema dosyası - Tüm renk, gradient, typography ve spacing değerleri.
 * Komponentlerdeki hardcoded değerler yerine bu dosyadaki referanslar kullanılır.
 */

export const colors = {
	accent: {
		gold: "#FFD93D",
		orange: "#FF6B35",
		orangeLight: "#FF8E53",
	},
	text: {
		primary: "#FFFFFF",
		stroke: "#000000",
	},
	background: {
		dark: "#0a0a0a",
		hookDark: "#1a1a2e",
		hookMid: "#16213e",
		hookDeep: "#0f3460",
	},
	overlay: {
		black90: "rgba(0,0,0,0.9)",
		black85: "rgba(0,0,0,0.85)",
		black70: "rgba(0,0,0,0.7)",
		black60: "rgba(0,0,0,0.6)",
		black50: "rgba(0,0,0,0.5)",
		black40: "rgba(0,0,0,0.4)",
		black30: "rgba(0,0,0,0.3)",
		white10: "rgba(255,255,255,0.1)",
		white20: "rgba(255,255,255,0.2)",
		white50: "rgba(255,255,255,0.5)",
		white80: "rgba(255,255,255,0.8)",
		white90: "rgba(255,255,255,0.9)",
	},
	glow: {
		gold80: "rgba(255,217,61,0.8)",
		gold70: "rgba(255,217,61,0.7)",
		gold60: "rgba(255,217,61,0.6)",
		gold50: "rgba(255,217,61,0.5)",
		gold40: "rgba(255,217,61,0.4)",
		orange50: "rgba(255,107,53,0.5)",
		orange30: "rgba(255,107,53,0.3)",
	},
} as const;

export const gradients = {
	/** Alt kenar gradient - altyazı okunabilirliği için (BRollOverlay, ZoomOverlay, Closeup, BRollOnly) */
	bottomEdge: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
	/** Üst kenar gradient (BRollOnly) */
	topEdge: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
	/** SplitScreen B-Roll alt gradient */
	splitBottomEdge: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
	/** SplitScreen ana video üst gradient */
	splitTopEdge: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)",
	/** CTA overlay gradient */
	ctaOverlay: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)",
	/** EndCard arka plan gradient */
	endCardBg: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)",
	/** EndCard CTA kutusu */
	endCardCta: `linear-gradient(135deg, ${colors.accent.orange} 0%, ${colors.accent.orangeLight} 50%, ${colors.accent.gold} 100%)`,
	/** HookIntro arka plan */
	hookIntroBg: `linear-gradient(135deg, ${colors.background.hookDark} 0%, ${colors.background.hookMid} 50%, ${colors.background.hookDeep} 100%)`,
	/** Dekoratif altın çizgi (BRollOverlay, ZoomOverlay) */
	decorativeLine: `linear-gradient(90deg, transparent 0%, ${colors.glow.gold70} 50%, transparent 100%)`,
	/** SplitScreen dekoratif çizgi */
	decorativeLineStrong: `linear-gradient(90deg, transparent 0%, ${colors.glow.gold80} 50%, transparent 100%)`,
} as const;

export const typography = {
	fontSize: {
		hookTitle: 72,
		endCardTitle: 48,
		hookSubtext: 36,
		endCardSubtitle: 28,
		endCardAction: 24,
		endCardArrow: 80,
		subtitleMax: 90,
		ctaMax: 96,
		ctaMin: 40,
		loading: 48,
	},
	fontWeight: {
		black: 900,
		extraBold: 800,
		semiBold: 600,
		medium: 500,
	},
	letterSpacing: {
		wide: "4px",
		medium: "3px",
		normal: "2px",
		extraWide: "8px",
	},
} as const;

export const spacing = {
	overlayHeightRatio: 0.38,
	subtitlePaddingBottom: 280,
	borderRadius: {
		large: 24,
		medium: 20,
		pill: 50,
	},
	gap: {
		small: 8,
		medium: 30,
		large: 40,
	},
} as const;

export const shadows = {
	/** HookIntro başlık glow */
	hookTitleGlow: `0 0 40px ${colors.glow.gold80}, 0 0 80px ${colors.glow.gold40}`,
	/** EndCard CTA kutusu gölge */
	endCardCtaBox: `0 20px 60px ${colors.glow.orange50}, 0 0 100px rgba(255,217,61,0.3)`,
	/** Dekoratif çizgi glow (BRollOverlay, ZoomOverlay) */
	decorativeLineGlow: `0 0 15px ${colors.glow.gold40}`,
	/** SplitScreen dekoratif çizgi glow */
	decorativeLineGlowStrong: `0 0 20px ${colors.glow.gold50}`,
	/** Genel metin gölge */
	textSoft: "0 4px 12px rgba(0,0,0,0.3)",
	textMedium: "0 4px 12px rgba(0,0,0,0.5)",
	textStrong: "0 8px 16px rgba(0,0,0,0.5)",
	textSubtle: "0 4px 8px rgba(0,0,0,0.3)",
} as const;
