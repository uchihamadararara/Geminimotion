import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Play, Sparkles, Check } from 'lucide-react';
import { AD_CONFIG, AdSlotConfig } from './adConfig';

// 1. TOP SOCIAL BAR ADS (Displays 2 social bar ads during AI video generation only)
export function SocialBarAds({
  isVisible,
  onDismiss,
}: {
  isVisible: boolean;
  onDismiss?: () => void;
}) {
  const [closedIds, setClosedIds] = useState<Record<string, boolean>>({});

  if (!isVisible) return null;

  const bar1 = AD_CONFIG.socialBarTop1;
  const bar2 = AD_CONFIG.socialBarTop2;

  return (
    <div className="fixed top-14 left-0 right-0 z-40 px-3 py-2 flex flex-col sm:flex-row gap-2 pointer-events-none animate-fadeIn">
      {/* Social Bar Ad 1 */}
      {!closedIds[bar1.id] && (
        <div className="pointer-events-auto flex-1 min-h-[46px] rounded-xl bg-[#1C1D22]/95 backdrop-blur-md border border-[#38BDF8]/30 shadow-lg px-3 py-2 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#38BDF8]/20 text-[#38BDF8] font-bold">
                  {bar1.badge || 'AD'}
                </span>
                <span className="text-xs font-semibold text-white truncate">{bar1.title}</span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate hidden sm:block">
                {bar1.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={bar1.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#38BDF8] hover:bg-[#60A5FA] text-black font-semibold text-[11px] flex items-center gap-1 transition-all"
            >
              <span>{bar1.ctaText || 'Claim'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <button
              onClick={() => setClosedIds((p) => ({ ...p, [bar1.id]: true }))}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/[0.08]"
              title="Close ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Social Bar Ad 2 */}
      {!closedIds[bar2.id] && (
        <div className="pointer-events-auto flex-1 min-h-[46px] rounded-xl bg-[#1C1D22]/95 backdrop-blur-md border border-[#A855F7]/30 shadow-lg px-3 py-2 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-ping shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#A855F7]/20 text-[#C084FC] font-bold">
                  {bar2.badge || 'AD'}
                </span>
                <span className="text-xs font-semibold text-white truncate">{bar2.title}</span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate hidden sm:block">
                {bar2.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={bar2.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#A855F7] hover:bg-[#C084FC] text-white font-semibold text-[11px] flex items-center gap-1 transition-all"
            >
              <span>{bar2.ctaText || 'Get Free'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <button
              onClick={() => setClosedIds((p) => ({ ...p, [bar2.id]: true }))}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/[0.08]"
              title="Close ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. IN-STEP PROCESSING BANNER AD (Rendered between commands/thinking during generation)
export function InStepBannerAd({ slot }: { slot: AdSlotConfig }) {
  return (
    <div className="my-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#1E2025] to-[#17181C] border border-white/[0.08] flex items-center justify-between gap-3 shadow-sm hover:border-white/[0.15] transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-black text-xs shrink-0 shadow"
          style={{ backgroundColor: slot.accent || '#38BDF8' }}
        >
          ✦
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.08] text-neutral-400">
              {slot.badge || 'Sponsor'}
            </span>
            <span className="text-xs font-semibold text-white truncate">{slot.title}</span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate mt-0.5">{slot.subtitle}</p>
        </div>
      </div>

      <a
        href={slot.linkUrl}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-white flex items-center gap-1 shrink-0 transition-colors"
      >
        <span>{slot.ctaText || 'View'}</span>
        <ExternalLink className="w-3 h-3 text-[#38BDF8]" />
      </a>
    </div>
  );
}

// 3. SINGLE VIDEO POP-UNDER / INTERSTITIAL (Triggers strictly 1 time when user clicks video)
export function VideoPopunderModal({
  isOpen,
  onClose,
  onSkip,
  targetSceneName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void;
  targetSceneName?: string;
}) {
  const [countdown, setCountdown] = useState(3);
  const ad = AD_CONFIG.popunderVideo;

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={countdown === 0 ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-[#1A1B1F] border border-white/[0.15] p-5 space-y-4 shadow-2xl text-left overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
              {ad.badge || 'Sponsored'}
            </span>
            <span className="text-xs text-neutral-400">Loading master 1080×1920 video</span>
          </div>
          <button
            onClick={onClose}
            className="min-h-[32px] min-w-[32px] rounded-full flex items-center justify-center text-neutral-400 hover:text-white bg-white/[0.06]"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Video Sponsor Showcase Preview */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/[0.08] flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10 text-center p-4 space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-[#38BDF8] text-black flex items-center justify-center mx-auto shadow-lg">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div className="text-xs font-bold text-white tracking-wide">
              {ad.title}
            </div>
            <p className="text-[11px] text-neutral-300 leading-snug">
              {ad.subtitle}
            </p>
          </div>
        </div>

        {/* Action Button & Auto Skip Countdown */}
        <div className="space-y-2 pt-1">
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="w-full min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#60A5FA] hover:brightness-110 active:scale-[0.99] text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Learn More & Support Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[40px] px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.99] text-neutral-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            {countdown > 0 ? (
              <span>Continue to Video in {countdown}s...</span>
            ) : (
              <span className="flex items-center gap-1 text-white font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Continue to {targetSceneName || 'Showreel Video'}</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
