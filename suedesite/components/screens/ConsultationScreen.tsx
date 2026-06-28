'use client';
/* Suede — Self-Guided Fit Consultation.
   Faithful recreation of the fashionruler /consultation chat flow, adapted to
   the design system (inline styles + tokens). A conversational stylist walks
   the user through 9 body measurements with tips + tutorial videos, then writes
   them back to the Suede profile. No Supabase — save routes into the kit. */
import React from 'react';
import { Icon } from '@/components/ds';
import { SignInGate } from '@/components/screens/SignInGate';

// Full US sizing sets — shared with profile setup & quiz.
const CS_TOPS_LETTER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS'];
const CS_NUM_SIZES = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'];
const CS_BOT_LETTER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const CS_WAIST_SIZES = ['24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44'];
const CS_PLUS_SIZES = ['1X', '2X', '3X', '4X', '5X'];

const MEASUREMENT_STEPS = [
  { field: 'height', label: 'Height', inputType: 'height', unit: '', intro: "Let's start with the basics! What's your height?", tip: 'Stand barefoot against a wall for the most accurate reading.', video: '', followUp: 'Got it! Height is the foundation for understanding how garments will fall on your body.' },
  { field: 'usual_tops', label: 'Usual Tops', inputType: 'sizes', multi: true, groups: [{ label: 'Letter size', options: CS_TOPS_LETTER }, { label: 'US numeric size', options: CS_NUM_SIZES }], intro: "Before measurements — let's capture your usual sizes. These write straight to your profile.\n\nFor tops & dresses, select all the sizes you typically wear.", tip: 'Pick every size you reach for — letter and/or numeric. Tap Next when done.', video: '', followUp: 'Got it.' },
  { field: 'usual_bottoms', label: 'Usual Bottoms', inputType: 'sizes', multi: true, groups: [{ label: 'Letter size', options: CS_BOT_LETTER }, { label: 'US numeric size', options: CS_NUM_SIZES }, { label: 'Waist (inches) — denim & trousers', options: CS_WAIST_SIZES }], intro: "And for bottoms? Select all that apply — letter, numeric, and waist sizing.", tip: 'Choose any that fit how you shop. Tap Next when done.', video: '', followUp: 'Great.' },
  { field: 'usual_plus', label: 'Plus', inputType: 'sizes', multi: true, optional: true, groups: [{ label: 'Plus size', options: CS_PLUS_SIZES }], intro: "Do you wear plus sizes? Select any that apply, or tap Next to skip.", tip: 'Optional — tap Next to continue.', video: '', followUp: "Perfect. Now let's get your key measurements." },
  { field: 'bust', label: 'Bust', inputType: 'number', unit: 'in', intro: "First up — bust.\n\nWrap a soft tape measure around the fullest part of your bust, keeping it parallel to the floor. Don't pull too tight — you want it snug but comfortable.", tip: 'Wear a non-padded bra for accuracy. The tape should sit across the nipple line.', video: 'https://www.youtube.com/watch?v=05AMPRSNZ_E', followUp: 'Perfect. Your bust measurement is one of the most important for tops, dresses, and anything fitted through the chest.' },
  { field: 'waist', label: 'Waist', inputType: 'number', unit: 'in', intro: "Next — your natural waist.\n\nThis is the narrowest part of your torso, usually about an inch above your belly button. Wrap the tape around and breathe normally — don't suck in!", tip: 'Try bending sideways — the crease that forms is your natural waistline.', video: 'https://www.youtube.com/watch?v=FB7uJFhkoKU', followUp: 'Great. Your waist measurement is essential for skirts, pants, and anything with a defined waistline.' },
  { field: 'hips', label: 'Hips', inputType: 'number', unit: 'in', intro: "Now your hips.\n\nMeasure around the fullest part of your hips and buttocks. Keep the tape parallel to the floor and don't compress.", tip: 'Stand with your feet together. The widest point is usually 7-9 inches below your waist.', video: 'https://www.youtube.com/watch?v=2zcLvlPoWz8', followUp: "Got it — that covers the essentials." },
  { field: 'inseam', label: 'Inseam', inputType: 'number', unit: 'in', optional: true, optionalStart: true, intro: "These next few are optional — adding them helps other members get even more accurate matches off your reviews.\n\nWould you like to add them, or skip the rest and finish your profile now?", revealIntro: "Amazing, thank you! First optional one — your inseam. Measure from the top of your inner thigh (right at the crotch) straight down to your ankle bone.", tip: 'Easiest to measure while wearing well-fitting pants, or have someone help. Stand straight with feet shoulder-width apart.', video: 'https://www.youtube.com/watch?v=aS5opN50l9c', followUp: 'Nice. Your inseam determines pant length and how midi/maxi hemlines will hit on you.' },
  { field: 'shoulder_width', label: 'Shoulder Width', inputType: 'number', unit: 'in', optional: true, intro: "Optional — your shoulders.\n\nMeasure from the bony point at the edge of one shoulder, across the back of your neck, to the same point on the other shoulder.", tip: "Feel for the bony bump at the top of each arm — that's your shoulder point. Measure across the back, not the front.", video: 'https://www.youtube.com/watch?v=fGYR39wtExQ', followUp: 'Shoulder width affects how blazers, jackets, and structured tops fit. This is a measurement most people overlook.' },
  { field: 'arm_length', label: 'Arm Length', inputType: 'number', unit: 'in', optional: true, intro: "Optional — arm length.\n\nMeasure from the edge of your shoulder (that same bony point), down along the outside of your slightly bent arm, to your wrist bone.", tip: 'Keep a slight bend in your elbow — this mimics how sleeves actually sit when you’re wearing them.', video: '', followUp: 'This helps with sleeve length on blazers, long-sleeve tops, and outerwear. No more sleeves that are too short or too long.' },
  { field: 'torso_length', label: 'Torso Length', inputType: 'number', unit: 'in', optional: true, intro: "Last optional one — torso length.\n\nMeasure from the base of your neck (where it meets your shoulder) straight down your front to your natural waistline.", tip: "This tells you if you're short-torsoed or long-torsoed — which affects where crop tops, bodysuits, and high-waisted bottoms hit.", video: '', followUp: "Beautiful — that completes your SUEDE fit profile." },
] as any;

const NEED = [
  { icon: 'ruler', t: 'A soft tape measure', s: 'The flexible fabric kind. A piece of string + ruler works too.' },
  { icon: 'shirt', t: 'Fitted clothing or undergarments', s: 'Loose clothing can add inches. Wear something snug.' },
  { icon: 'user', t: 'A mirror (optional but helpful)', s: 'Helps you check that the tape is level and positioned correctly.' },
];

const INK = 'var(--ink-900)';
const ink = (al) => `rgba(0,0,0,${al})`;
const PAPER = '#F8F6F3';
const SERIF = { fontFamily: 'var(--font-serif)' };

function getYouTubeEmbedId(url) {
  if (!url) return null;
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/, /youtube\.com\/shorts\/([^?]+)/];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

function TutorialVideo({ video, label }: any) {
  const [open, setOpen] = React.useState(false);
  const ytId = getYouTubeEmbedId(video);
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: ink(0.4) }}>
        <Icon name="play" size={11} color={ink(0.4)} />
        <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>{open ? 'Hide tutorial' : 'Need a tutorial?'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8, overflow: 'hidden', background: '#000' }}>
          <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
            {ytId ? (
              <iframe style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`} title={`How to measure your ${label.toLowerCase()}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <video style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} src={video} controls playsInline preload="metadata" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ConsultationScreen({ onRoute, authed }: any) {
  const [started, setStarted] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [heightFeet, setHeightFeet] = React.useState('');
  const [heightInches, setHeightInches] = React.useState('');
  const [measurements, setMeasurements] = React.useState<any>({});
  const [isTyping, setIsTyping] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [optChosen, setOptChosen] = React.useState(false);
  const chatEndRef = React.useRef<any>(null);
  const inputRef = React.useRef<any>(null);
  const stepRef = React.useRef(0);

  React.useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollInto250 = true; }, []);
  React.useEffect(() => {
    if (chatEndRef.current && chatEndRef.current.parentElement) {
      const sc = chatEndRef.current.closest('[data-chat-scroll]');
      if (sc) sc.scrollTop = sc.scrollHeight;
    }
  }, [messages, isTyping]);
  React.useEffect(() => { if (started && !isTyping && inputRef.current) inputRef.current.focus(); }, [started, isTyping, currentStep]);

  const addAssistantMessage = (content, extras?) => new Promise<void>((resolve) => {
    setIsTyping(true);
    const delay = Math.min(600 + content.length * 5, 1800);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content, type: 'text', ...(extras || {}) }]);
      setIsTyping(false);
      resolve();
    }, delay);
  });

  const startConsultation = async () => {
    setStarted(true);
    await addAssistantMessage('Hey! Welcome to your Suede Fit Consultation.');
    await addAssistantMessage("I'm going to walk you through taking your body measurements. It takes about 5 minutes and you'll need a soft tape measure — the flexible kind, not a metal one.");
    await addAssistantMessage("If you don't have one, a piece of string + a ruler works too. Or even a phone charger cable — get creative!");
    await addAssistantMessage("Ready? Let's start with something easy.");
    const step = MEASUREMENT_STEPS[0];
    await addAssistantMessage(step.intro, { type: 'measurement-input', field: step.field, label: step.label, unit: step.unit, inputType: step.inputType, tip: step.tip, video: step.video });
  };

  const advanceStep = async (followUp) => {
    await addAssistantMessage(followUp);
    const nextStep = stepRef.current + 1;
    if (nextStep >= MEASUREMENT_STEPS.length) {
      await addAssistantMessage("Here's a summary of your measurements:");
      setMessages((prev) => [...prev, { role: 'assistant', content: buildSummary(), type: 'measurement-confirm' }]);
      await addAssistantMessage("Everything look right? I'll save these to your Suede profile. You can always update them later in your profile settings.");
      setCompleted(true);
    } else {
      stepRef.current = nextStep;
      setCurrentStep(nextStep);
      const step = MEASUREMENT_STEPS[nextStep];
      if (step.optionalStart) {
        // gate step: ask the optional question only — don't reveal the input yet
        await addAssistantMessage(step.intro);
      } else {
        await addAssistantMessage(step.intro, { type: 'measurement-input', field: step.field, label: step.label, unit: step.unit, inputType: step.inputType, tip: step.tip, video: step.video });
      }
    }
  };

  const chooseOptional = async () => {
    setMessages((prev) => [...prev, { role: 'user', content: 'Yes, I want to help' }]);
    const step = MEASUREMENT_STEPS[stepRef.current];
    await addAssistantMessage(step.revealIntro, { type: 'measurement-input', field: step.field, label: step.label, unit: step.unit, inputType: step.inputType, tip: step.tip, video: step.video });
    setOptChosen(true);
  };

  const buildSummary = () => {
    const m = measurements; const lines = [];
    if (m.height_feet) lines.push(`Height: ${m.height_feet}'${m.height_inches || 0}"`);
    const arr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
    const tops = arr(m.usual_tops); if (tops.length) lines.push(`Usual Tops: ${tops.join(', ')}`);
    const bots = arr(m.usual_bottoms); if (bots.length) lines.push(`Usual Bottoms: ${bots.join(', ')}`);
    const plus = arr(m.usual_plus); if (plus.length) lines.push(`Plus: ${plus.join(', ')}`);
    if (m.bust) lines.push(`Bust: ${m.bust}"`);
    if (m.waist) lines.push(`Waist: ${m.waist}"`);
    if (m.hips) lines.push(`Hips: ${m.hips}"`);
    if (m.inseam) lines.push(`Inseam: ${m.inseam}"`);
    if (m.shoulder_width) lines.push(`Shoulder Width: ${m.shoulder_width}"`);
    if (m.arm_length) lines.push(`Arm Length: ${m.arm_length}"`);
    if (m.torso_length) lines.push(`Torso Length: ${m.torso_length}"`);
    return lines.join('\n');
  };

  const finishNow = async () => {
    setMessages((prev) => [...prev, { role: 'user', content: 'Skip the optional measurements' }]);
    await addAssistantMessage("No problem — we'll leave those out. Here's a summary of your measurements:");
    setMessages((prev) => [...prev, { role: 'assistant', content: buildSummary(), type: 'measurement-confirm' }]);
    await addAssistantMessage("Everything look right? I'll save these to your Suede profile. You can always add the optional ones later in your profile settings.");
    setCompleted(true);
  };

  const handleSubmitMeasurement = async () => {
    const step = MEASUREMENT_STEPS[stepRef.current];
    if (inputValue.toLowerCase() === 'skip') {
      setMessages((prev) => [...prev, { role: 'user', content: 'Skip' }]);
      setInputValue('');
      await advanceStep("No worries, we'll skip that one.");
      return;
    }
    if (step.inputType === 'height') {
      if (!heightFeet) return;
      const heightStr = `${heightFeet}'${heightInches || '0'}"`;
      setMessages((prev) => [...prev, { role: 'user', content: heightStr }]);
      setMeasurements((prev) => ({ ...prev, height_feet: parseInt(heightFeet), height_inches: parseInt(heightInches || '0') }));
      setHeightFeet(''); setHeightInches('');
      await advanceStep(step.followUp);
      return;
    }
    const value = parseFloat(inputValue);
    if (!inputValue || isNaN(value)) return;
    if (step.unit === 'in' && (value < 5 || value > 70)) { await addAssistantMessage("That measurement seems off — make sure you're measuring in inches. Give it another try?"); return; }
    const displayValue = step.unit ? `${value} ${step.unit}` : `${value}`;
    setMessages((prev) => [...prev, { role: 'user', content: displayValue }]);
    setMeasurements((prev) => ({ ...prev, [step.field]: value }));
    setInputValue('');
    await advanceStep(step.followUp);
  };

  const saveMeasurements = async () => {
    setSaving(true);
    await addAssistantMessage("Your measurements have been saved to your SUEDE profile! 🎉\n\nNow when you browse reviews, you'll be matched with reviewers who share your measurements. Happy shopping!");
    setSaving(false);
    setTimeout(() => onRoute(authed ? 'yourprofile' : 'signin'), 2600);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitMeasurement(); } };

  const handleSelectSize = async (size) => {
    const step = MEASUREMENT_STEPS[stepRef.current];
    setMessages((prev) => [...prev, { role: 'user', content: size }]);
    setMeasurements((prev) => ({ ...prev, [step.field]: size }));
    await advanceStep(step.followUp);
  };

  const toggleSizeMulti = (field, val) => {
    setMeasurements((prev) => {
      const cur = prev[field] || [];
      return { ...prev, [field]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });
  };

  const confirmSizes = async () => {
    const step = MEASUREMENT_STEPS[stepRef.current];
    const sel = measurements[step.field] || [];
    setMessages((prev) => [...prev, { role: 'user', content: sel.length ? sel.join(', ') : 'Skip' }]);
    await advanceStep(step.followUp);
  };

  const currentStepData = currentStep < MEASUREMENT_STEPS.length ? MEASUREMENT_STEPS[currentStep] : null;
  const inputBase = { background: 'var(--white)', border: 0, padding: '12px 16px', color: INK, fontSize: 18, fontFamily: 'var(--font-body)', outline: 'none', boxShadow: `inset 0 0 0 1px ${ink(0.08)}` };
  const darkBtn = (extra = {}) => ({ background: INK, color: PAPER, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 12, fontFamily: 'var(--font-body)', transition: 'background var(--dur-base)', ...extra } as any);

  // ---- Landing ----
  if (!authed && SignInGate) return <SignInGate onRoute={onRoute} title="Fit Consultation" message="Sign in to take your guided measurement consultation and save the results to your Suede profile." />;
  if (!started) {
    return (
      <main style={{ background: PAPER, minHeight: '100vh' }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '64px 32px 0px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: ink(0.4), marginBottom: 24 }}>SUEDE Fit Consultation</p>
            <h1 style={{ ...SERIF, fontSize: 48, color: INK, margin: '0 0 24px', lineHeight: 1.1, fontWeight: 400 }}>Your Personal<br />Measurement Guide</h1>
            <p style={{ color: ink(0.6), maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>Our AI stylist will walk you through taking your body measurements step by step. No guesswork, no confusion — just accurate numbers in about 5 minutes.</p>
          </div>

          <div style={{ background: 'var(--white)', padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: ink(0.4), margin: '0 0 24px' }}>What You'll Need</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {NEED.map((n) => (
                <div key={n.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ width: 36, height: 36, background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={n.icon} size={18} color={INK} /></span>
                  <div>
                    <p style={{ fontSize: 14, color: INK, fontWeight: 500, margin: 0 }}>{n.t}</p>
                    <p style={{ fontSize: 12, color: ink(0.5), margin: '2px 0 0' }}>{n.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--white)', padding: 32, marginBottom: 48 }}>
            <h3 style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: ink(0.4), margin: '0 0 24px' }}>{MEASUREMENT_STEPS.length} Steps · ~5 Minutes</h3>
            {[
              { title: 'Foundational', fields: ['height', 'usual_tops', 'usual_bottoms', 'usual_plus'] },
              { title: 'Body Measurements', fields: ['bust', 'waist', 'hips'] },
              { title: 'Optional', fields: ['inseam', 'shoulder_width', 'arm_length', 'torso_length'] },
            ].map((group, gi) => (
              <div key={group.title} style={{ marginBottom: gi < 2 ? 28 : 0 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: ink(0.4), margin: '0 0 12px', paddingBottom: 8, borderBottom: `1px solid ${ink(0.1)}` }}>{group.title}</p>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${group.fields.length}, 1fr)`, gap: 12 }}>
                  {group.fields.map((f) => {
                    const i = MEASUREMENT_STEPS.findIndex((s) => s.field === f);
                    if (i < 0) return null;
                    const s = MEASUREMENT_STEPS[i];
                    return (
                      <div key={f} style={{ textAlign: 'center', padding: '12px 0', background: PAPER }}>
                        <p style={{ fontSize: 12, color: ink(0.4), margin: '0 0 4px' }}>{i + 1}</p>
                        <p style={{ fontSize: 14, color: INK, margin: 0 }}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={startConsultation} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-700)'} onMouseLeave={(e) => e.currentTarget.style.background = INK} style={darkBtn({ padding: '20px 64px' })}>Start Consultation</button>
          </div>
        </div>
      </main>
    );
  }

  // ---- Chat ----
  const progressPct = (Math.min(currentStep + 1, MEASUREMENT_STEPS.length) / MEASUREMENT_STEPS.length) * 100;
  return (
    <main style={{ background: PAPER, height: 'calc(100vh - 73px)', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes csBounce{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-5px);opacity:.7}} .cs-dot{animation:csBounce 1.2s infinite}`}</style>

      {/* Progress */}
      <div style={{ background: PAPER, borderBottom: `1px solid ${ink(0.1)}`, flex: 'none' }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: ink(0.4), margin: 0 }}>Fit Consultation</p>
          <p style={{ fontSize: 12, color: ink(0.4), margin: 0 }}>{Math.min(currentStep + 1, MEASUREMENT_STEPS.length)} / {MEASUREMENT_STEPS.length}</p>
        </div>
        <div style={{ height: 2, background: '#E8E4DF' }}>
          <div style={{ height: '100%', background: INK, transition: 'width var(--dur-slow)', width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Messages */}
      <div data-chat-scroll style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 672, margin: '0 auto', padding: '32px 32px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'assistant' ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, maxWidth: '85%' }}>
                    <div style={{ width: 28, height: 28, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', marginTop: 4 }}>
                      <span style={{ ...SERIF, color: PAPER, fontSize: 13, fontWeight: 500 }}>S</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      {msg.type === 'measurement-confirm' ? (
                        <div style={{ background: 'var(--white)', padding: 20, border: `1px solid ${ink(0.1)}` }}>
                          <p style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: ink(0.4), margin: '0 0 12px' }}>Your Measurements</p>
                          {msg.content.split('\n').map((line, j) => (
                            <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${ink(0.05)}` }}>
                              <span style={{ fontSize: 14, color: ink(0.6) }}>{line.split(':')[0]}</span>
                              <span style={{ fontSize: 14, color: INK, fontWeight: 500 }}>{line.split(':')[1]}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {msg.content.split('\n').map((line, j) => (line ? <p key={j} style={{ fontSize: 14, color: INK, lineHeight: 1.55, margin: 0 }}>{line}</p> : <br key={j} />))}
                          {msg.tip && (
                            <div style={{ marginTop: 4, background: 'rgba(232,228,223,0.5)', padding: '12px 16px' }}>
                              <p style={{ fontSize: 12, color: ink(0.5), margin: 0 }}>💡 <span style={{ fontWeight: 500 }}>Tip:</span> {msg.tip}</p>
                            </div>
                          )}
                          {msg.video && <TutorialVideo video={msg.video} label={msg.label || ''} />}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: INK, color: PAPER, padding: '12px 20px', maxWidth: '70%' }}><p style={{ fontSize: 14, margin: 0 }}>{msg.content}</p></div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 28, height: 28, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', marginTop: 4 }}><span style={{ ...SERIF, color: PAPER, fontSize: 13, fontWeight: 500 }}>S</span></div>
                <div style={{ display: 'flex', gap: 6, padding: '12px 4px' }}>
                  {[0, 150, 300].map((d) => <span key={d} className="cs-dot" style={{ width: 6, height: 6, background: ink(0.3), borderRadius: '50%', animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ background: PAPER, borderTop: `1px solid ${ink(0.1)}`, padding: 16, flex: 'none' }}>
        <div style={{ maxWidth: 672, margin: '0 auto' }}>
          {!completed ? (
            <React.Fragment>
              {currentStepData && currentStepData.inputType === 'sizes' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {currentStepData.groups.map((g) => (
                    <div key={g.label}>
                      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink(0.4), marginBottom: 8 }}>{g.label}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {g.options.map((opt) => {
                          const selected = (measurements[currentStepData.field] || []).includes(opt);
                          return (
                            <button key={opt} onClick={() => !isTyping && toggleSizeMulti(currentStepData.field, opt)} disabled={isTyping}
                              style={{ minWidth: 48, padding: '10px 14px', background: selected ? INK : 'var(--white)', color: selected ? PAPER : INK, border: 0, boxShadow: `inset 0 0 0 1px ${selected ? INK : ink(0.12)}`, cursor: isTyping ? 'default' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, transition: 'all var(--dur-fast) var(--ease-out)' }}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button onClick={confirmSizes} disabled={isTyping} style={darkBtn({ padding: '12px 32px', opacity: isTyping ? 0.3 : 1 })}>
                      {currentStepData.optional && !(measurements[currentStepData.field] || []).length ? 'Skip' : 'Next'}
                    </button>
                  </div>
                </div>
              ) : currentStepData && currentStepData.optionalStart && !optChosen ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button onClick={chooseOptional} disabled={isTyping} style={darkBtn({ width: '100%', padding: '15px 32px', opacity: isTyping ? 0.3 : 1 })}>I want to help — add the optional measurements</button>
                  <button onClick={finishNow} disabled={isTyping} style={{ width: '100%', padding: '15px 32px', border: `1px solid ${ink(0.2)}`, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: ink(0.6), opacity: isTyping ? 0.3 : 1 }}>Skip — finish my profile now</button>
                </div>
              ) : currentStepData && currentStepData.inputType === 'height' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <input ref={inputRef} type="number" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} onKeyDown={handleKeyDown} placeholder="5" min="3" max="8" disabled={isTyping} style={{ ...inputBase, width: 80, textAlign: 'center' }} />
                    <span style={{ color: ink(0.4), fontSize: 18 }}>ft</span>
                    <input type="number" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} onKeyDown={handleKeyDown} placeholder="6" min="0" max="11" disabled={isTyping} style={{ ...inputBase, width: 80, textAlign: 'center' }} />
                    <span style={{ color: ink(0.4), fontSize: 18 }}>in</span>
                  </div>
                  <button onClick={handleSubmitMeasurement} disabled={!heightFeet || isTyping} style={darkBtn({ padding: '12px 32px', opacity: (!heightFeet || isTyping) ? 0.3 : 1 })}>Next</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                      placeholder={currentStepData && currentStepData.unit ? `Enter ${currentStepData.label.toLowerCase()} in ${currentStepData.unit}` : `Enter ${(currentStepData && currentStepData.label.toLowerCase()) || 'value'}`}
                      disabled={isTyping} style={{ ...inputBase, width: '100%', boxSizing: 'border-box', paddingRight: 48 }} />
                    {currentStepData && currentStepData.unit && <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: ink(0.3), fontSize: 14 }}>{currentStepData.unit}</span>}
                  </div>
                  <button onClick={handleSubmitMeasurement} disabled={!inputValue || isTyping} style={darkBtn({ padding: '12px 32px', opacity: (!inputValue || isTyping) ? 0.3 : 1 })}>Next</button>
                </div>
              )}
              <p style={{ fontSize: 12, color: ink(0.3), textAlign: 'center', marginTop: 8 }}>Type 'skip' to skip · Press Enter to submit</p>
            </React.Fragment>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={saveMeasurements} disabled={saving} style={darkBtn({ flex: 1, padding: '16px 0', letterSpacing: '0.2em', opacity: saving ? 0.5 : 1 })}>{saving ? 'Saving…' : 'Save to My Profile'}</button>
              <button onClick={() => onRoute(authed ? 'yourprofile' : 'signin')} style={{ padding: '16px 32px', border: `1px solid ${ink(0.2)}`, background: 'transparent', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 12, color: ink(0.6), fontFamily: 'var(--font-body)' }}>Edit Manually</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
