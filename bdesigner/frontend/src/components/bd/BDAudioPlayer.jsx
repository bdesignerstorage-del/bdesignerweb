import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

/**
 * BDAudioPlayer — floating "About BDesigner" voice intro.
 * Never autoplays; the user must press Play. Play/Pause + volume slider
 * + progress. Source (/audio/about-bdesigner.mp3) is replaceable later.
 * Desktop: bottom-right. Mobile: sits above the sticky consultation CTA.
 */
const SRC = "/audio/about-bdesigner.mp3";

export default function BDAudioPlayer() {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [vol, setVol] = useState(() => {
    try {
      const s = Number(sessionStorage.getItem("bd_audio_vol"));
      return Number.isFinite(s) && s > 0 ? s : 0.8;
    } catch (e) {
      return 0.8;
    }
  });

  useEffect(() => {
    if (ref.current) ref.current.volume = vol;
  }, [vol]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      const p = a.play();
      if (p && p.catch) p.catch(() => setPlaying(false));
    }
  };

  const onTime = () => {
    const a = ref.current;
    if (a && a.duration) setProgress((a.currentTime / a.duration) * 100);
  };

  return (
    <div className="bd-audio" data-testid="bd-audio-player">
      <audio
        ref={ref}
        src={SRC}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={onTime}
      />
      <button
        type="button"
        className="bd-audio__btn"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        data-testid="bd-audio-toggle"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <span className="bd-audio__label">About BDesigner</span>

      <div
        className="bd-audio__track hidden sm:block"
        aria-hidden="true"
      >
        <div className="bd-audio__fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="bd-audio__vol-wrap flex items-center gap-2">
        {vol > 0 ? (
          <Volume2 className="w-4 h-4 opacity-80" />
        ) : (
          <VolumeX className="w-4 h-4 opacity-80" />
        )}
        <input
          className="bd-audio__range"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={vol}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVol(v);
            try { sessionStorage.setItem("bd_audio_vol", String(v)); } catch (err) { /* noop */ }
          }}
          style={{ width: 66 }}
          aria-label="Volume"
          data-testid="bd-audio-volume"
        />
      </div>
    </div>
  );
}
