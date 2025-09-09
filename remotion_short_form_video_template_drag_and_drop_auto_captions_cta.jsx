// Remotion Short-Form Template (60s, 1080x1920)
// Features
// - Drop in footage & b‑roll
// - Beat-synced cuts
// - Auto word-by-word captions
// - Hook → Value → CTA structure
// - Brand logo lockup & progress bar
// - Simple color-grade overlay
//
// Usage (Remotion >= v4):
// 1) npm create video@latest  (select React + Remotion)
// 2) Add this file as src/RemotionTemplate.tsx
// 3) Register <RemotionRoot /> in src/Root.tsx
// 4) Replace the demo props with your media & text.
// 5) npm run dev (preview) or npm run render
//
// --- BEGIN CODE ---
import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from 'remotion';

// ---------- Types ----------
export type CaptionChunk = {
  start: number; // in frames
  end: number;   // in frames
  words?: {t: string; at: number}[]; // optional word timings (frames relative to start)
  text?: string; // fallback shown if no word timings are provided
};

export type Step = {
  label: string;
  icon?: string; // URL to PNG/SVG
};

export type TemplateProps = {
  // Media
  footageUrl: string; // main A‑roll
  brollUrls?: string[]; // optional overlays
  musicUrl?: string; // background track
  logoUrl?: string; // brand logo

  // Timing (frames @ 30fps default)
  fps?: number;
  totalFrames?: number; // default 1800 (60s)
  hookDuration?: number; // e.g., 120 (4s)
  stepDuration?: number; // each value step length, default 180 (6s)
  ctaDuration?: number; // default 150 (5s)

  // Content
  title: string; // Hook headline
  subtitle?: string; // quick subhead
  steps?: Step[]; // 3 bullets/steps
  ctaText?: string; // e.g., "Comment 'SOCIAL' for the free guide"
  handle?: string; // @yourhandle

  // Captions
  captions?: CaptionChunk[]; // if omitted, no captions are rendered

  // Style
  brandColor?: string; // accent for highlights & progress
  textColor?: string; // primary text color
  bgColor?: string; // background fallback
  vignette?: number; // 0–1 strength for vignette overlay
  gradeTint?: string; // e.g., 'rgba(0,10,30,0.2)'

  // Editing helpers
  beatCuts?: number[]; // frames where we quickly show b‑roll for 12–18 frames
};

// ---------- Helpers ----------
const px = (n: number) => `${n}px`;

const ShadowCard: React.FC<{children: React.ReactNode; pad?: number; radius?: number; bg?: string}> = ({children, pad = 24, radius = 24, bg = 'rgba(0,0,0,0.55)'}) => (
  <div
    style={{
      padding: px(pad),
      borderRadius: px(radius),
      background: bg,
      backdropFilter: 'blur(4px)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.35)'
    }}
  >{children}</div>
);

const WordByWord: React.FC<{
  chunk: CaptionChunk;
  color: string;
  outline?: string;
  fontSize?: number;
  align?: 'left'|'center'|'right';
}> = ({chunk, color, outline = 'rgba(0,0,0,0.8)', fontSize = 68, align = 'center'}) => {
  const frame = useCurrentFrame();
  const {fps = 30} = useVideoConfig();
  const start = chunk.start;
  const end = chunk.end;
  const active = frame >= start && frame <= end;

  if (!active) return null;

  const content = chunk.words?.length
    ? chunk.words.map((w, i) => {
        const appear = start + w.at;
        const prog = interpolate(frame, [appear, appear + fps/6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - prog) * 12}px)`,
              opacity: prog,
              marginRight: 10,
              textShadow: `0 2px 0 ${outline}, 0 6px 18px rgba(0,0,0,0.6)`
            }}
          >
            <span style={{background: 'transparent', color}}>{w.t}</span>
          </span>
        );
      })
    : [<span key="t" style={{color}}>{chunk.text || ''}</span>];

  return (
    <div style={{
      width: '100%',
      textAlign: align,
      fontWeight: 800,
      fontSize,
      lineHeight: 1.05,
      letterSpacing: -0.5,
    }}>
      {content}
    </div>
  );
};

// ---------- Scene Components ----------
const ProgressBar: React.FC<{color: string}> = ({color}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / durationInFrames;
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 6, background: 'rgba(255,255,255,0.08)'}}>
      <div style={{width: `${p * 100}%`, height: '100%', background: color, transition: 'width 0.05s linear'}}/>
    </div>
  );
};

const Vignette: React.FC<{strength: number}> = ({strength}) => (
  <div style={{
    position: 'absolute', inset: 0,
    boxShadow: `inset 0 0 240px rgba(0,0,0,${Math.min(0.85, strength)})`
  }}/>
);

const ColorGrade: React.FC<{tint?: string}> = ({tint}) => (
  <div style={{position: 'absolute', inset: 0, background: tint || 'transparent'}}/>
);

const LowerThird: React.FC<{logoUrl?: string; handle?: string; color: string;}> = ({logoUrl, handle, color}) => (
  <div style={{position: 'absolute', left: 36, bottom: 36, display: 'flex', alignItems: 'center', gap: 12}}>
    {logoUrl && (
      <Img src={logoUrl} style={{width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.5))'}}/>
    )}
    {handle && (
      <ShadowCard pad={14} radius={16} bg={'rgba(0,0,0,0.6)'}>
        <div style={{fontWeight: 700, fontSize: 28, color}}>{handle}</div>
      </ShadowCard>
    )}
  </div>
);

const HookCard: React.FC<{title: string; subtitle?: string; color: string}> = ({title, subtitle, color}) => {
  const frame = useCurrentFrame();
  const prog = interpolate(frame, [0, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
      <ShadowCard>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          maxWidth: 880, textAlign: 'center'
        }}>
          <div style={{
            fontSize: 82, fontWeight: 900, lineHeight: 0.98,
            letterSpacing: -1,
            transform: `translateY(${(1-prog)*12}px)`,
            opacity: prog,
            color
          }}>{title}</div>
          {subtitle && (
            <div style={{fontSize: 36, color: 'white', opacity: 0.88}}>{subtitle}</div>
          )}
        </div>
      </ShadowCard>
    </div>
  );
};

const StepsStack: React.FC<{steps: Step[]; brandColor: string; textColor: string; startFrame: number; stepDuration: number;}> = ({steps, brandColor, textColor, startFrame, stepDuration}) => {
  return (
    <>
      {steps.map((s, i) => (
        <Sequence key={i} from={startFrame + i * stepDuration} durationInFrames={stepDuration}>
          <div style={{position: 'absolute', right: 36, top: 120, width: 700}}>
            <ShadowCard>
              <div style={{display: 'flex', gap: 16, alignItems: 'flex-start'}}>
                {s.icon && <Img src={s.icon} style={{width: 56, height: 56}}/>}
                <div style={{
                  fontSize: 48, fontWeight: 800, color: textColor,
                  lineHeight: 1.1
                }}>
                  <span style={{color: brandColor}}>{`Step ${i+1}: `}</span>{s.label}
                </div>
              </div>
            </ShadowCard>
          </div>
        </Sequence>
      ))}
    </>
  );
};

const CTA: React.FC<{text?: string; color: string}> = ({text, color}) => (
  <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
    <ShadowCard>
      <div style={{fontSize: 64, fontWeight: 900, color, textAlign: 'center', maxWidth: 900}}>
        {text || 'Follow for more + Comment "SOCIAL" to get the free guide'}
      </div>
    </ShadowCard>
  </div>
);

const CaptionLayer: React.FC<{chunks: CaptionChunk[]; color: string}> = ({chunks, color}) => (
  <div style={{position: 'absolute', left: 60, right: 60, bottom: 170, display: 'grid', placeItems: 'center'}}>
    {chunks.map((c, i) => (
      <WordByWord key={i} chunk={c} color={color} outline='rgba(0,0,0,0.9)' fontSize={66} align='center'/>
    ))}
  </div>
);

const BeatBroll: React.FC<{brollUrls?: string[]; beatCuts?: number[]}> = ({brollUrls, beatCuts}) => {
  const b = brollUrls || [];
  const cuts = beatCuts || [];
  return (
    <>
      {cuts.map((from, i) => (
        <Sequence key={i} from={from} durationInFrames={14 + (i % 4)}>
          {b.length > 0 && (
            <Video src={b[i % b.length]} startFrom={0} endAt={60} style={{position: 'absolute', inset: 0, objectFit: 'cover'}}/>
          )}
        </Sequence>
      ))}
    </>
  );
};

// ---------- Main Composition ----------
export const ShortFormTemplate: React.FC<TemplateProps> = (props) => {
  const fps = props.fps ?? 30;
  const total = props.totalFrames ?? 1800; // 60s
  const hookLen = props.hookDuration ?? 120;
  const stepLen = props.stepDuration ?? 180;
  const ctaLen = props.ctaDuration ?? 150;

  const steps = props.steps ?? [
    {label: 'Lock your identity → one promise, one person.'},
    {label: 'Post in buckets: Growth / Trust / Sell.'},
    {label: 'Use 1 CTA. Keep it simple.'}
  ];

  const brand = props.brandColor ?? '#5EEAD4'; // teal accent
  const textColor = props.textColor ?? '#FFFFFF';
  const bg = props.bgColor ?? '#0B0D12';

  // Scene offsets
  const hookFrom = 0;
  const stepsFrom = hookFrom + hookLen;
  const ctaFrom = Math.min(stepsFrom + steps.length * stepLen, total - ctaLen);

  // Derived caption chunks – ensure within duration
  const captionChunks = useMemo(() => (props.captions || []).filter(c => c.end <= total), [props.captions, total]);

  return (
    <AbsoluteFill style={{backgroundColor: bg, fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial'}}>
      {/* BASE FOOTAGE */}
      <Video src={props.footageUrl} startFrom={0} endAt={total} style={{position: 'absolute', inset: 0, objectFit: 'cover'}}/>

      {/* BEAT B-ROLL PUNCH-INS */}
      <BeatBroll brollUrls={props.brollUrls} beatCuts={props.beatCuts}/>

      {/* GRADING & VIGNETTE */}
      <ColorGrade tint={props.gradeTint || 'rgba(0,10,20,0.25)'} />
      <Vignette strength={props.vignette ?? 0.55} />

      {/* HOOK */}
      <Sequence from={hookFrom} durationInFrames={hookLen}>
        <HookCard title={props.title} subtitle={props.subtitle} color={textColor}/>
      </Sequence>

      {/* STEPS */}
      <StepsStack steps={steps} brandColor={brand} textColor={textColor} startFrame={stepsFrom} stepDuration={stepLen}/>

      {/* CTA */}
      <Sequence from={ctaFrom} durationInFrames={ctaLen}>
        <CTA text={props.ctaText} color={textColor}/>
      </Sequence>

      {/* CAPTIONS */}
      {captionChunks.length > 0 && (
        <CaptionLayer chunks={captionChunks} color={textColor}/>
      )}

      {/* BRAND & HUD */}
      <LowerThird logoUrl={props.logoUrl} handle={props.handle} color={textColor}/>
      <ProgressBar color={brand} />

      {/* AUDIO */}
      {props.musicUrl && (
        <Audio src={props.musicUrl} startFrom={0} endAt={total} volume={(f)=>interpolate(f,[0,24],[0,1],{extrapolateLeft:'clamp'})}/>
      )}
    </AbsoluteFill>
  );
};

// ---------- Root Registration ----------
// Place this in your src/Root.tsx (example):
// import {registerRoot, Composition} from 'remotion';
// import {ShortFormTemplate} from './RemotionTemplate';
// registerRoot(() => (
//   <>
//     <Composition
//       id="ShortForm"
//       component={ShortFormTemplate}
//       durationInFrames={1800}
//       fps={30}
//       width={1080}
//       height={1920}
//       defaultProps={{
//         footageUrl: 'https://your-cdn.com/aroll.mp4',
//         brollUrls: ['https://your-cdn.com/b1.mp4','https://your-cdn.com/b2.mp4'],
//         musicUrl: 'https://your-cdn.com/track.mp3',
//         logoUrl: 'https://your-cdn.com/logo.png',
//         title: 'Boost Your Social Skills: Fast',
//         subtitle: '3 moves that work in real life',
//         steps: [
//           {label:'Open with a benefit. "Hey, if you freeze in groups, do this…"'},
//           {label:'Use the Name→Context→Question loop to keep convo flowing.'},
//           {label:'Close with 1 ask: follow / comment / share. Not 3.'},
//         ],
//         ctaText: 'Comment “SOCIAL” and I’ll DM you the free networking script',
//         handle: '@_dorianwallace_',
//         captions: [
//           {start: 90, end: 150, text: 'If you feel awkward meeting people…'},
//           {start: 170, end: 260, words: [
//             {t:'try', at:0},{t:'this', at:6},{t:'3‑step', at:10},{t:'flow.', at:18}
//           ]},
//         ],
//         brandColor: '#5EEAD4',
//         textColor: '#FFFFFF',
//         bgColor: '#0B0D12',
//         vignette: 0.6,
//         gradeTint: 'rgba(0,20,40,0.25)',
//         beatCuts: [60, 120, 240, 360, 540, 720, 900, 1080, 1260, 1440, 1620],
//       }}
//     />
//   </>
// ));

// --- END CODE ---
