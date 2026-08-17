"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ExpandIcon, MuteIcon, PauseIcon, PlayIcon, VolumeIcon } from "./icons";
import { PLACEHOLDER_VIDEO_URL } from "../lib/videos";

const VIDEO_SRC = PLACEHOLDER_VIDEO_URL;

const focusRingOnDark =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function RitualSpotlight() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  function togglePlay() {
    const video = videoRef.current;
    if (!video || !VIDEO_SRC) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }

  function goFullscreen() {
    videoRef.current?.requestFullscreen?.();
  }

  return (
    <section className="bg-surface-muted">
      <div className="mx-auto grid max-w-7xl items-center gap-[var(--space-6)] px-[var(--space-4)] py-[var(--space-7)] md:grid-cols-2 md:gap-[var(--space-7)]">
        <div>
          <h2 className="font-display text-lg text-primary sm:text-xl">Bhringraj Hair Ritual</h2>
          <p className="mt-[var(--space-4)] max-w-md text-sm text-tertiary">
            A time-tested Ayurvedic remedy known to reduce hair fall and support density.
            Discover the ritual behind stronger, healthier hair.
          </p>
          <Link
            href="/hair"
            className={`mt-[var(--space-6)] inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-xs)] bg-action-onlight-bg px-[var(--space-5)] py-[var(--space-3)] text-sm font-semibold text-action-onlight-text transition-colors duration-[var(--motion-instant)] hover:bg-action-onlight-bg-hover active:bg-action-onlight-bg-active ${focusRingOnDark}`}
          >
            Explore Now
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-[var(--radius-xs)] bg-[radial-gradient(circle_at_30%_20%,_#1a1a1a,_#000000_60%)]">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={VIDEO_SRC || undefined}
            muted={isMuted}
            playsInline
            loop
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <button
            type="button"
            onClick={togglePlay}
            className={`group absolute inset-0 flex items-center justify-center ${focusRingOnDark}`}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {/* Fades out during playback so the badge stops covering the
                footage, and returns on hover or keyboard focus. */}
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-[var(--radius-xs)] bg-surface-muted text-surface-base transition-opacity duration-[var(--motion-instant)] group-hover:opacity-100 group-focus-visible:opacity-100 ${
                isPlaying ? "opacity-0" : "opacity-100"
              }`}
            >
              {isPlaying ? (
                <PauseIcon className="h-6 w-6" />
              ) : (
                <PlayIcon className="ml-0.5 h-6 w-6" />
              )}
            </span>
          </button>

          <div className="absolute right-[var(--space-3)] bottom-[var(--space-3)] flex gap-[var(--space-2)]">
            <button
              type="button"
              onClick={toggleMute}
              className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-xs)] bg-surface-base/60 text-ondark hover:bg-surface-base/80 ${focusRingOnDark}`}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <MuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={goFullscreen}
              className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-xs)] bg-surface-base/60 text-ondark hover:bg-surface-base/80 ${focusRingOnDark}`}
              aria-label="View fullscreen"
            >
              <ExpandIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
