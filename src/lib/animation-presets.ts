/**
 * Merkezi animasyon preset'leri - Spring konfigürasyonları ve animasyon parametreleri.
 * Komponentlerdeki tekrarlanan spring config'leri yerine bu dosyadaki referanslar kullanılır.
 */

/** Spring konfigürasyonları (Remotion spring() config parametresi ile uyumlu) */
export const springConfigs = {
	/** HookIntro giriş animasyonu */
	hookEntry: {
		damping: 15,
		stiffness: 120,
		mass: 0.8,
	},

	/** HookIntro alt yazı animasyonu */
	hookSubtext: {
		damping: 18,
		stiffness: 150,
	},

	/** EndCard giriş animasyonu */
	endCardEntry: {
		damping: 14,
		stiffness: 100,
		mass: 0.6,
	},

	/** DynamicSubtitle pop-in animasyonu */
	subtitlePopIn: {
		damping: 12,
		stiffness: 200,
		mass: 0.5,
	},

	/** CTAOverlayLayout slide-in animasyonu */
	ctaSlideIn: {
		damping: 15,
		stiffness: 100,
	},
} as const;

/** Animasyon süreleri (frame cinsinden) */
export const animationDurations = {
	hookEntry: 15,
	hookSubtext: 12,
	hookSubtextDelay: 8,
	hookExitFrames: 10,
	endCardEntry: 20,
	subtitlePopIn: 8,
	slideInBroll: 10,
	slideInZoom: 15,
	slideInSplit: 8,
	fadeInQuick: 10,
	fadeInMedium: 15,
} as const;

/** Scale ve offset aralıkları */
export const animationRanges = {
	hookEntry: {
		scale: [0.5, 1] as [number, number],
		yOffset: [100, 0] as [number, number],
	},
	hookSubtext: {
		scale: [0.7, 1] as [number, number],
	},
	endCardEntry: {
		scale: [0.6, 1] as [number, number],
		yOffset: [120, 0] as [number, number],
	},
	subtitlePopIn: {
		scale: [0.3, 1] as [number, number],
		yOffset: [80, 0] as [number, number],
	},
	slideIn: {
		yOffset: [-50, 0] as [number, number],
		opacity: [0, 1] as [number, number],
	},
} as const;

/** Ken Burns efekt parametreleri */
export const kenBurns = {
	/** CloseupLayout: zoom + 0.05 artış, 150 frame */
	closeup: {
		zoomIncrement: 0.05,
		durationFrames: 150,
	},
	/** BRollOnlyLayout: 1.0 → 1.15, 300 frame */
	brollOnly: {
		scaleStart: 1.0,
		scaleEnd: 1.15,
		durationFrames: 300,
	},
	/** BRollPlayer: 1.05 → 1.15, tüm süre boyunca */
	brollPlayer: {
		scaleStart: 1.05,
		scaleEnd: 1.15,
	},
} as const;

/** Pulse animasyon parametreleri */
export const pulseConfigs = {
	endCard: {
		speed: 0.15,
		scaleRange: [1, 1.05] as [number, number],
	},
	cta: {
		cycleFrames: 30,
		scaleRange: [1, 1.05, 1] as [number, number, number],
	},
	endCardArrow: {
		speed: 0.3,
		amplitude: 15,
	},
} as const;
