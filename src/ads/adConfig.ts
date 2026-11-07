export interface AdSlotConfig {
  id: string;
  name: string;
  type: 'social-bar' | 'in-step-banner' | 'popunder-video';
  title?: string;
  subtitle?: string;
  ctaText?: string;
  badge?: string;
  linkUrl?: string;
  customScriptUrl?: string; // For dropping external ad network tags (Adsterra, Monetag, Google etc.)
  customHtml?: string;
  accent?: string;
}

export interface AdSystemRules {
  enableAds: boolean;
  maxSocialBarsDuringProcessing: number;
  maxStepBannersDuringProcessing: number;
  popunderTriggerLimitPerGeneration: number; // Strict rule: only 1 popunder per generation cycle
  suppressAllAdsDuringVideoPlayback: boolean; // True: zero ads when user watches video
}

export const AD_RULES: AdSystemRules = {
  enableAds: true,
  maxSocialBarsDuringProcessing: 2,
  maxStepBannersDuringProcessing: 2,
  popunderTriggerLimitPerGeneration: 1, // Strictly 1 popunder per video generation
  suppressAllAdsDuringVideoPlayback: true,
};

// Default high-converting native ad slots — user can replace titles, links, or script tags anytime
export const AD_CONFIG: {
  socialBarTop1: AdSlotConfig;
  socialBarTop2: AdSlotConfig;
  stepBanner1: AdSlotConfig;
  stepBanner2: AdSlotConfig;
  popunderVideo: AdSlotConfig;
} = {
  socialBarTop1: {
    id: 'sb-1',
    name: 'Social Bar Ad 1',
    type: 'social-bar',
    title: '⚡ 4K Motion GPU Cloud',
    subtitle: 'Render 1080×1920 reels 10x faster with dedicated RTX clusters',
    ctaText: 'Claim Free 50 Credits',
    badge: 'Sponsored Partner',
    linkUrl: 'https://aistudio.google.com',
    accent: '#38BDF8',
  },
  socialBarTop2: {
    id: 'sb-2',
    name: 'Social Bar Ad 2',
    type: 'social-bar',
    title: '🎧 Analog Foley SFX Pack (48kHz)',
    subtitle: 'Cinematic sub-bass, whooshes & kinetic typography hits',
    ctaText: 'Download Free Pack',
    badge: 'Audio Partner',
    linkUrl: 'https://remotion.dev',
    accent: '#A855F7',
  },
  stepBanner1: {
    id: 'banner-step-1',
    name: 'In-Step Processing Banner 1',
    type: 'in-step-banner',
    title: '✦ Kinetic Preset Studio — 120+ 3D Camera Rigs',
    subtitle: 'Drop-in After Effects & Remotion easing curves with zero coding',
    ctaText: 'Explore Presets',
    badge: 'Featured Sponsor',
    linkUrl: 'https://remotion.dev',
    accent: '#38BDF8',
  },
  stepBanner2: {
    id: 'banner-step-2',
    name: 'In-Step Processing Banner 2',
    type: 'in-step-banner',
    title: '🚀 Ultra HD 60FPS Video Cloud Export',
    subtitle: 'Render vertical videos without browser memory limits',
    ctaText: 'Start Instant Render',
    badge: 'Ad Partner',
    linkUrl: 'https://aistudio.google.com',
    accent: '#10B981',
  },
  popunderVideo: {
    id: 'popunder-1',
    name: 'Single Video Pop-Under Interstitial',
    type: 'popunder-video',
    title: 'Sponsored Presentation · Kinetic Video Pro',
    subtitle: 'Unlocked high-bitrate 1080×1920 preview with lossless 48kHz audio',
    ctaText: 'Continue to My Video',
    badge: 'Special Sponsor',
    linkUrl: 'https://aistudio.google.com',
    accent: '#F59E0B',
  },
};
