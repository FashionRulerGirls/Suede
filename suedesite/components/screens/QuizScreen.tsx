'use client';
/* Suede — Quick Fit (AI Body Measurement Quiz).
   Faithful recreation of the standalone suede-quick-fit Next.js app, adapted
   to the design system (inline styles + tokens) and window.claude.complete
   for inference. Multi-step questionnaire → directional bust/waist/hips/inseam
   with a confidence read, written back to the user's Suede profile. */
import React from 'react';
import { Icon, Logo } from '@/components/ds';
import { claudeComplete } from '@/lib/claude';
import { SignInGate } from '@/components/screens/SignInGate';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { saveQuizResult, buildUsualSizes } from '@/lib/profileData';

const WORDMARK = '/assets/brand/suede-wordmark.svg';
const MARK = '/assets/brand/suede-monogram.svg';
const MAX_SIZES = 2;
const MATCH_CONFIDENCE = { high: 0.7, medium: 0.55, low: 0.4 };

const FEMALE_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
const FEMALE_NUM = ['00', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24'];
const MALE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const MALE_PANT = ['28', '30', '31', '32', '33', '34', '36', '38', '40', '42', '44', '46'];

// Full US sizing sets — shared with profile setup & consultation.
const TOPS_LETTER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS'];
const NUM_SIZES = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'];
const BOT_LETTER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const WAIST_SIZES = ['24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44'];
const PLUS_SIZES = ['1X', '2X', '3X', '4X', '5X'];

const FEMALE_BODY = [
  { v: 'defined waist, full bust and hips', l: 'Defined waist, full bust & hips', s: 'Clear waist with soft fullness above and below' },
  { v: 'defined waist, lean build', l: 'Defined waist, lean build', s: 'Clear waist, slim or petite overall' },
  { v: 'fuller hips than bust, soft lower body', l: 'Fuller through hips & thighs', s: 'Hips fuller than bust, soft thighs and seat' },
  { v: 'fuller hips than bust, athletic lower body', l: 'Fuller hips, athletic legs', s: 'Hips wider than bust, strong legs and seat' },
  { v: 'fuller midsection, slimmer hips and legs', l: 'Fuller through the midsection', s: 'Carries fullness at the middle, slimmer hips and legs' },
  { v: 'balanced bust waist and hips, slim', l: 'Balanced & slim', s: 'Bust, waist, and hips fairly even — little taper' },
  { v: 'balanced bust waist and hips, athletic', l: 'Balanced & athletic', s: 'Even proportions, toned and muscular' },
  { v: 'shoulders broader than hips', l: 'Broader shoulders, narrower hips', s: 'Shoulders wider than hips, often athletic' },
  { v: 'full and soft throughout', l: 'Full & soft throughout', s: 'Soft fullness across bust, waist, and hips' },
];
const MALE_BODY = [
  { v: 'broad shoulders, narrow waist, muscular', l: 'Broad shoulders, narrow waist', s: 'Tapered, athletic build' },
  { v: 'lean, shoulders and hips similar', l: 'Lean & balanced', s: 'Slim, shoulders and hips fairly even' },
  { v: 'balanced shoulders waist and hips', l: 'Average & balanced', s: 'Even proportions through shoulders, waist, and hips' },
  { v: 'fuller midsection, slimmer limbs', l: 'Fuller through the midsection', s: 'Carries fullness at the middle, slimmer arms and legs' },
  { v: 'athletic, shoulders slightly wider than hips', l: 'Athletic, shoulders slightly wider', s: 'Balanced build, shoulders a touch wider than hips' },
  { v: 'fuller throughout, big and tall', l: 'Full throughout', s: 'Fuller build, big-and-tall proportions' },
];
const TORSO = [
  { v: 'short', l: 'Short torso', s: 'Long legs proportionally — high-rise pants sit naturally' },
  { v: 'average', l: 'Average', s: 'Balanced torso-to-leg ratio' },
  { v: 'long', l: 'Long torso', s: 'Shorter legs proportionally — tops often run short' },
];
const WAIST = [
  { v: 'defined', l: 'Very defined', s: 'Clear nip in at the waist' },
  { v: 'somewhat', l: 'Somewhat defined', s: 'Visible curve, not extreme' },
  { v: 'straight', l: 'Straight through', s: 'Minimal taper from waist to hip' },
];
const INSEAM = [
  { v: 'petite', l: 'Always too long', s: 'I usually need petite or hemming' },
  { v: 'regular', l: 'Usually fit fine', s: 'Standard length works' },
  { v: 'tall', l: 'Often too short', s: 'I look for tall sizes' },
];
const DESC_PROMPTS = [
  'Tell us about your build — broad, narrow, athletic, soft?',
  'Anything unusual about your proportions?',
  'How does your posture or frame feel?',
  'What never fits you off the rack?',
];
const CONF_RANGE = { high: '±0.5"', medium: '±1.2"', low: '±2.5"' };

const INK = 'var(--ink-900)';
const ink = (a) => `rgba(0,0,0,${a})`;
const SERIF = { fontFamily: 'var(--font-serif)' };

function Pill({ active, onClick, children, disabled }: any) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: '12px 20px', borderRadius: 0, fontSize: 14, letterSpacing: '0.02em',
        fontFamily: 'var(--font-body)', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--dur-base) var(--ease-out)', background: active ? ink(0.06) : 'var(--white)',
        border: `1px solid ${active ? INK : disabled ? ink(0.08) : hover ? ink(0.4) : ink(0.15)}`,
        color: active ? INK : disabled ? ink(0.25) : hover ? INK : ink(0.65),
      }}>
      {children}
    </button>
  );
}

function OptionCard({ active, onClick, label, sublabel }: any) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', textAlign: 'left', padding: '20px 24px', borderRadius: 0, cursor: 'pointer',
        transition: 'all var(--dur-base) var(--ease-out)',
        background: active ? ink(0.04) : hover ? ink(0.03) : 'var(--white)',
        border: `1px solid ${active ? INK : hover ? ink(0.4) : ink(0.12)}`,
      }}>
      <div style={{ ...SERIF, fontSize: 17, fontWeight: 500, color: INK }}>{label}</div>
      {sublabel && <div style={{ fontSize: 12, color: ink(0.5), marginTop: 4, letterSpacing: '0.02em' }}>{sublabel}</div>}
    </button>
  );
}

const Eyebrow = ({ children }: any) => (
  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: ink(0.5), textTransform: 'uppercase', marginBottom: 12 }}>{children}</div>
);
const H2 = ({ children, mb = 8 }: any) => (
  <h2 style={{ ...SERIF, fontSize: 30, fontWeight: 400, color: 'var(--text-heading)', margin: `0 0 ${mb}px` }}>{children}</h2>
);
const Sub = ({ children }: any) => (
  <p style={{ fontSize: 14, color: ink(0.5), margin: 0, lineHeight: 1.55 }}>{children}</p>
);
const FieldLabel = ({ children }: any) => (
  <label style={{ fontSize: 14, color: ink(0.6), marginBottom: 12, display: 'block', letterSpacing: '0.02em' }}>{children}</label>
);
const numInput = { background: 'transparent', borderBottom: `1px solid ${ink(0.2)}`, outline: 'none', padding: '12px 0', fontSize: 24, ...SERIF, color: INK, border: 'none', borderRadius: 0 };

export function QuizScreen({ onRoute, authed }: any) {
  const { user } = useAuth();
  const [step, setStep] = React.useState(0);
  const [a, setA] = React.useState({
    sex: null, heightUnit: 'ft', heightFt: '', heightIn: '', heightCm: '',
    weight: '', weightUnit: 'lb', age: '', bodyType: null, cupSize: null, bandSize: '',
    torsoLength: null, topSize: [], bottomSize: [], waistDef: null, inseam: null, photos: [], description: '',
    topsLetter: [], topsNum: [], botLetter: [], botNum: [], waistSize: [], plusSize: [],
  } as any);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<any>(null);
  const [results, setResults] = React.useState<any>(null);
  const [saveStatus, setSaveStatus] = React.useState('idle');
  const fileRef = React.useRef<any>(null);

  const update = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const toggleMulti = (k, val) => setA((p) => {
    const cur = p[k] || [];
    return { ...p, [k]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
  });
  const toggleSize = (k, size) => setA((p) => {
    const cur = p[k] || [];
    if (cur.includes(size)) return { ...p, [k]: cur.filter((x) => x !== size) };
    if (cur.length >= MAX_SIZES) return p;
    return { ...p, [k]: [...cur, size] };
  });

  const steps = ['intro', 'basics', 'body-stats', 'body-type',
    ...(a.sex === 'female' ? ['cup-size'] : []),
    'torso', 'waist', 'inseam', 'photos', 'description', 'results'];
  const totalSteps = steps.length - 2;
  const progress = step === 0 ? 0 : step === steps.length - 1 ? totalSteps : step;
  const stepName = steps[step];
  const stepNum = (name) => { const i = steps.indexOf(name); return i === -1 ? '' : String(i).padStart(2, '0'); };

  const hasHeight = () => a.heightUnit === 'ft' ? !!a.heightFt : !!a.heightCm;
  const canAdvance = () => {
    switch (stepName) {
      case 'intro': return true;
      case 'basics': return a.sex && a.age;
      case 'body-stats': return hasHeight() && a.weight;
      case 'body-type': return a.bodyType;
      case 'cup-size': return true;
      case 'torso': return a.torsoLength;
      case 'waist': return a.waistDef;
      case 'inseam': return a.inseam;
      default: return true;
    }
  };

  const formatHeight = () => {
    let total;
    if (a.heightUnit === 'ft') {
      const ft = parseFloat(a.heightFt); const inch = parseFloat(a.heightIn) || 0;
      if (!ft || isNaN(ft)) return ''; total = ft * 12 + inch;
    } else { const cm = parseFloat(a.heightCm); if (!cm || isNaN(cm)) return ''; total = cm / 2.54; }
    let ft = Math.floor(total / 12); let inch = Math.round(total - ft * 12);
    if (inch === 12) { ft += 1; inch = 0; }
    return `${ft}'${inch}"`;
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = await Promise.all(files.map((file: any) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res({ dataUrl: r.result, mediaType: file.type || 'image/jpeg', name: file.name });
      r.readAsDataURL(file);
    })));
    update('photos', [...a.photos, ...next]);
    if (fileRef.current) fileRef.current.value = '';
  };
  const removePhoto = (i) => update('photos', a.photos.filter((_, x) => x !== i));

  const runInference = async () => {
    setLoading(true); setError(null);
    const heightStr = a.heightUnit === 'ft' ? `${a.heightFt} ft ${a.heightIn || 0} in` : `${a.heightCm} cm`;
    const weightStr = `${a.weight} ${a.weightUnit}`;
    const cupInfo = a.sex === 'female' && a.cupSize && a.bandSize ? `Bra size: ${a.bandSize}${a.cupSize}` : 'Bra size: not provided';
    const photoNote = a.photos.length ? `\n${a.photos.length} photo(s) provided as visual reference for frame and silhouette.` : '\nNo photos provided.';
    const descNote = a.description ? `\n\nUSER'S OWN DESCRIPTION OF THEIR BODY:\n"${a.description}"` : '';
    const prompt = `You are an expert anthropometrist providing directional body measurement estimates for an apparel sizing platform. Use ASTM D5585 (women) and ASTM D6240 (men) body measurement standards as your baseline reference, then adjust based on the proportional cues and self-description provided.

USER PROFILE:
- Sizing reference: ${a.sex}
- Age: ${a.age}
- Height: ${heightStr}
- Weight: ${weightStr}
- Body type: ${a.bodyType}
- ${cupInfo}
- Usual top size(s): ${[...a.topsLetter, ...a.topsNum].join(', ') || 'not provided'}
- Usual bottom size(s): ${[...a.botLetter, ...a.botNum].join(', ') || 'not provided'}
- Usual waist size(s): ${a.waistSize.join(', ') || 'not provided'}
- Plus size(s): ${a.plusSize.join(', ') || 'none'}
- Torso length: ${a.torsoLength}
- Waist definition: ${a.waistDef}
- Pant length tendency: ${a.inseam}${photoNote}${descNote}

Estimate ONLY the following four measurements in inches: bust, waist, hips, and inseam (inside-leg length). Be realistic — these should match what a tailor would measure, not vanity sizing. The bra size anchors the bust estimate; the waist-definition answer and usual bottom size anchor the waist and hips; the pant-length tendency and torso length anchor the inseam. Set confidence to "high" only with strong, consistent signal, otherwise "medium".

Respond ONLY with a valid JSON object in this exact format, no markdown, no preamble:
{"bust": <number>, "waist": <number>, "hips": <number>, "inseam": <number>, "confidence": "<high|medium|low>", "reasoning": "<one short sentence explaining key factors that shaped the estimate>"}`;

    try {
      const raw = await claudeComplete({ messages: [{ role: 'user', content: prompt }] });
      const cleaned = String(raw).replace(/```json|```/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : cleaned);
      setSaveStatus('ready'); setResults(parsed); setStep(steps.length - 1);
    } catch (err) {
      setError('Something went wrong reading your measurements. Please try again.');
    } finally { setLoading(false); }
  };

  // Save the derived measurements + usual sizes to the signed-in profile, and
  // log the full run to quiz_results. No-op in demo/unconfigured mode.
  const persistToProfile = async () => {
    const sb = createClient();
    if (!sb || !user || !results) return;
    setSaveStatus('saving');
    try {
      await saveQuizResult(sb, user.id, {
        answers: a,
        derived: {
          bust: results.bust, waist: results.waist, hips: results.hips,
          inseam: results.inseam, confidence: results.confidence, reasoning: results.reasoning,
        },
        height: formatHeight(),
        usualSizes: buildUsualSizes({
          tops: [...a.topsLetter, ...a.topsNum],
          bottoms: [...a.botLetter, ...a.botNum],
          waist: a.waistSize,
          plus: a.plusSize,
        }),
      });
      setSaveStatus('saved');
    } catch { setSaveStatus('ready'); }
  };

  const finishQuiz = async () => {
    await persistToProfile();
    onRoute(authed ? 'yourprofile' : 'signin');
  };

  const next = async () => {
    if (!canAdvance()) return;
    if (step === steps.length - 2) await runInference();
    else setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const restart = () => {
    setStep(0); setResults(null); setError(null); setSaveStatus('idle');
    setA({ sex: null, heightUnit: 'ft', heightFt: '', heightIn: '', heightCm: '', weight: '', weightUnit: 'lb', age: '', bodyType: null, cupSize: null, bandSize: '', torsoLength: null, topSize: [], bottomSize: [], waistDef: null, inseam: null, photos: [], description: '', topsLetter: [], topsNum: [], botLetter: [], botNum: [], waistSize: [], plusSize: [] } as any);
  };

  const primaryBtn = (extra = {}) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
    padding: '16px 36px', borderRadius: 0, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase',
    fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', border: 'none',
    background: INK, color: 'var(--white)', transition: 'all var(--dur-base) var(--ease-out)', ...extra,
  } as any);

  if (!authed && SignInGate) return <SignInGate onRoute={onRoute} title="Measurement Quiz" message="Sign in to take the Quick Fit quiz and save your measurements to your Suede profile." />;

  const usualSizesBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink(0.45), marginBottom: 16 }}>Tops &amp; Dresses</div>
        <FieldLabel>Letter size</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TOPS_LETTER.map((s) => <Pill key={s} active={a.topsLetter.includes(s)} onClick={() => toggleMulti('topsLetter', s)}>{s}</Pill>)}
        </div>
        <div style={{ marginTop: 18 }}><FieldLabel>US numeric size</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {NUM_SIZES.map((s) => <Pill key={s} active={a.topsNum.includes(s)} onClick={() => toggleMulti('topsNum', s)}>{s}</Pill>)}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: ink(0.08) }} />
      <div>
        <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink(0.45), marginBottom: 16 }}>Bottoms</div>
        <FieldLabel>Letter size</FieldLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BOT_LETTER.map((s) => <Pill key={s} active={a.botLetter.includes(s)} onClick={() => toggleMulti('botLetter', s)}>{s}</Pill>)}
        </div>
        <div style={{ marginTop: 18 }}><FieldLabel>US numeric size</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {NUM_SIZES.map((s) => <Pill key={s} active={a.botNum.includes(s)} onClick={() => toggleMulti('botNum', s)}>{s}</Pill>)}
          </div>
        </div>
        <div style={{ marginTop: 18 }}><FieldLabel>Waist size (inches) — for denim &amp; trousers</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {WAIST_SIZES.map((s) => <Pill key={s} active={a.waistSize.includes(s)} onClick={() => toggleMulti('waistSize', s)}>{s}</Pill>)}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: ink(0.08) }} />
      <div>
        <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink(0.45), marginBottom: 16 }}>Plus</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PLUS_SIZES.map((s) => <Pill key={s} active={a.plusSize.includes(s)} onClick={() => toggleMulti('plusSize', s)}>{s}</Pill>)}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#F8F6F3', color: INK, fontFamily: 'var(--font-body)' }}>
      <style>{`@keyframes qfFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .qf-fade{animation:qfFade .5s var(--ease-out)} @keyframes qfSpin{to{transform:rotate(360deg)}} .qf-spin{animation:qfSpin 1s linear infinite}`}</style>
      {step > 0 && step < steps.length - 1 && (
        <div style={{ background: '#F8F6F3', borderBottom: `1px solid ${ink(0.1)}` }}>
          <div style={{ maxWidth: 672, margin: '0 auto', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: ink(0.4), margin: 0 }}>Quick Fit</p>
            <p style={{ fontSize: 12, color: ink(0.4), margin: 0 }}>{progress} / {totalSteps}</p>
          </div>
          <div style={{ height: 2, background: '#E8E4DF' }}>
            <div style={{ height: '100%', background: INK, transition: 'width var(--dur-slow)', width: `${(progress / totalSteps) * 100}%` }} />
          </div>
        </div>
      )}

      <div style={{ maxWidth: 672, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ minHeight: 400 }}>
          {loading && (
            <div className="qf-fade" style={{ textAlign: 'center', padding: '128px 0' }}>
              <Icon name="refresh" size={40} color={INK} className="qf-spin" style={{ margin: '0 auto 24px' }} />
              <h2 style={{ ...SERIF, fontSize: 30, margin: '0 0 12px', fontWeight: 400 }}>Analyzing your <em>proportions</em></h2>
              <p style={{ fontSize: 14, color: ink(0.5) }}>Calibrating measurements against anthropometric standards…</p>
            </div>
          )}

          {error && !loading && (
            <div className="qf-fade" style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ color: ink(0.7), fontSize: 14, marginBottom: 24 }}>{error}</div>
              <button onClick={runInference} style={{ padding: '12px 24px', borderRadius: 999, border: `1px solid ${INK}`, color: INK, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Try again</button>
            </div>
          )}

          {!loading && !error && stepName === 'intro' && (
            <div className="qf-fade" style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 24px' }}><Logo variant="monogram" height={48} color={INK} /></div>
              <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: ink(0.4), marginBottom: 16 }}>Suede Quick Fit</div>
              <h1 style={{ ...SERIF, fontSize: 56, margin: '0 0 24px', lineHeight: 1.1, fontWeight: 400 }}>Find your fit in <em>2 minutes</em></h1>
              <p style={{ color: ink(0.6), maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.6 }}>Answer a few quick questions about your body and usual sizes. Add a photo or describe yourself for the most accurate read.</p>
              <button onClick={next} style={primaryBtn()}>Begin <Icon name="arrow-right" size={16} color="var(--white)" /></button>
            </div>
          )}

          {!loading && !error && stepName === 'basics' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              <div><Eyebrow>{stepNum('basics')} — A few basics</Eyebrow><H2>Tell us about you</H2></div>
              <div>
                <FieldLabel>Body type for sizing reference</FieldLabel>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Pill active={a.sex === 'female'} onClick={() => update('sex', 'female')}>Women's sizing</Pill>
                  <Pill active={a.sex === 'male'} onClick={() => update('sex', 'male')}>Men's sizing</Pill>
                </div>
              </div>
              <div>
                <FieldLabel>Age</FieldLabel>
                <input type="number" value={a.age} onChange={(e) => update('age', e.target.value)} placeholder="28" style={{ ...numInput, width: 128 }} />
              </div>
            </div>
          )}

          {!loading && !error && stepName === 'body-stats' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              <div><Eyebrow>{stepNum('body-stats')} — Height & weight</Eyebrow><H2>The fundamentals</H2></div>
              <div>
                <FieldLabel>Height</FieldLabel>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                  {a.heightUnit === 'ft' ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                        <input type="number" value={a.heightFt} onChange={(e) => update('heightFt', e.target.value)} placeholder="5" style={{ ...numInput, width: 64 }} />
                        <span style={{ paddingBottom: 12, fontSize: 16, color: ink(0.45) }}>ft</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                        <input type="number" value={a.heightIn} onChange={(e) => update('heightIn', e.target.value)} placeholder="6" style={{ ...numInput, width: 64 }} />
                        <span style={{ paddingBottom: 12, fontSize: 16, color: ink(0.45) }}>in</span>
                      </div>
                    </div>
                  ) : (
                    <input type="number" value={a.heightCm} onChange={(e) => update('heightCm', e.target.value)} placeholder="168" style={{ ...numInput, width: 128 }} />
                  )}
                  <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
                    <Pill active={a.heightUnit === 'ft'} onClick={() => update('heightUnit', 'ft')}>ft / in</Pill>
                    <Pill active={a.heightUnit === 'cm'} onClick={() => update('heightUnit', 'cm')}>cm</Pill>
                  </div>
                </div>
              </div>
              <div>
                <FieldLabel>Weight</FieldLabel>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                  <input type="number" value={a.weight} onChange={(e) => update('weight', e.target.value)} placeholder={a.weightUnit === 'lb' ? '145' : '66'} style={{ ...numInput, width: 128 }} />
                  <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
                    <Pill active={a.weightUnit === 'lb'} onClick={() => update('weightUnit', 'lb')}>lb</Pill>
                    <Pill active={a.weightUnit === 'kg'} onClick={() => update('weightUnit', 'kg')}>kg</Pill>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && stepName === 'body-type' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div><Eyebrow>{stepNum('body-type')} — Your body</Eyebrow><H2 mb={12}>Your body type</H2><Sub>Pick the one that best captures both your shape and overall feel.</Sub></div>
              <div style={{ display: 'grid', gap: 12 }}>
                {(a.sex === 'female' ? FEMALE_BODY : MALE_BODY).map((o) => (
                  <OptionCard key={o.v} active={a.bodyType === o.v} onClick={() => update('bodyType', o.v)} label={o.l} sublabel={o.s} />
                ))}
              </div>
            </div>
          )}

          {!loading && !error && stepName === 'cup-size' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <Eyebrow>{stepNum('cup-size')} — Bust</Eyebrow>
                <H2 mb={12}>Bra size <span style={{ color: ink(0.3), fontSize: 16, fontStyle: 'italic' }}>optional</span></H2>
                <Sub>Sharing this anchors your bust measurement more precisely. Skip if you'd rather not.</Sub>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <FieldLabel>Band size (inches)</FieldLabel>
                  <input type="number" value={a.bandSize} onChange={(e) => update('bandSize', e.target.value)} placeholder="34" style={{ ...numInput, width: 128 }} />
                </div>
                <div>
                  <FieldLabel>Cup size</FieldLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD', 'G', 'H'].map((c) => (
                      <Pill key={c} active={a.cupSize === c} onClick={() => update('cupSize', c)}>{c}</Pill>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && stepName === 'torso' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div><Eyebrow>{stepNum('torso')} — Proportions</Eyebrow><H2 mb={12}>Torso length</H2><Sub>Compared to your overall height, how would you describe your torso?</Sub></div>
              <div style={{ display: 'grid', gap: 12 }}>
                {TORSO.map((o) => <OptionCard key={o.v} active={a.torsoLength === o.v} onClick={() => update('torsoLength', o.v)} label={o.l} sublabel={o.s} />)}
              </div>
            </div>
          )}

          {!loading && !error && stepName === 'waist' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div><Eyebrow>{stepNum('waist')} — Silhouette</Eyebrow><H2 mb={12}>Define your waist</H2><Sub>Looking in a mirror, how would you describe your waistline?</Sub></div>
              <div style={{ display: 'grid', gap: 12 }}>
                {WAIST.map((o) => <OptionCard key={o.v} active={a.waistDef === o.v} onClick={() => update('waistDef', o.v)} label={o.l} sublabel={o.s} />)}
              </div>
            </div>
          )}

          {!loading && !error && stepName === 'inseam' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div><Eyebrow>{stepNum('inseam')} — Pant length</Eyebrow><H2 mb={12}>Pant length</H2><Sub>When you buy regular-length pants, what happens?</Sub></div>
              <div style={{ display: 'grid', gap: 12 }}>
                {INSEAM.map((o) => <OptionCard key={o.v} active={a.inseam === o.v} onClick={() => update('inseam', o.v)} label={o.l} sublabel={o.s} />)}
              </div>
            </div>
          )}

          {!loading && !error && stepName === 'photos' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <Eyebrow>{stepNum('photos')} — Photos</Eyebrow>
                <H2 mb={12}>Add photos <span style={{ color: ink(0.3), fontSize: 16, fontStyle: 'italic' }}>optional</span></H2>
                <Sub>Upload one or more full-body photos in fitted clothing for the most accurate read. Front, side, or both — your choice. Photos are processed securely and never shared.</Sub>
              </div>
              {a.photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {a.photos.map((p, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '3 / 4', borderRadius: 0, overflow: 'hidden', border: `1px solid ${ink(0.1)}`, background: 'var(--white)' }}>
                      <img src={p.dataUrl} alt={`Upload ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="close" size={16} color="#fff" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
                <button onClick={() => fileRef.current && fileRef.current.click()}
                  style={{ width: '100%', padding: '32px 24px', borderRadius: 0, border: `2px dashed ${ink(0.15)}`, background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all var(--dur-base) var(--ease-out)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = ink(0.5); e.currentTarget.style.background = ink(0.03); }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ink(0.15); e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 0, background: ink(0.06), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={a.photos.length > 0 ? 'camera' : 'upload'} size={20} color={INK} />
                  </div>
                  <div style={{ fontSize: 14, color: ink(0.7), letterSpacing: '0.02em' }}>{a.photos.length > 0 ? 'Add another photo' : 'Tap to upload from your device'}</div>
                  <div style={{ fontSize: 12, color: ink(0.4) }}>Best results: full body, fitted clothing, plain background</div>
                </button>
              </div>
              {a.photos.length === 0 && (
                <button onClick={next} style={{ width: '100%', textAlign: 'center', fontSize: 14, color: ink(0.4), letterSpacing: '0.02em', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer' }}>Skip — continue without photos</button>
              )}
            </div>
          )}

          {!loading && !error && stepName === 'description' && (
            <div className="qf-fade" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <Eyebrow>{stepNum('description')} — In your words</Eyebrow>
                <H2 mb={12}>Anything else? <span style={{ color: ink(0.3), fontSize: 16, fontStyle: 'italic' }}>optional</span></H2>
                <Sub>Sometimes the best signal comes from how you describe yourself. Share anything the questions didn't capture.</Sub>
              </div>
              <textarea value={a.description} maxLength={600} onChange={(e) => update('description', e.target.value)} rows={6}
                placeholder="e.g., I have broad shoulders for my frame, a long torso, and shorter legs. Tops always run short and pants are always loose at the waist…"
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--white)', border: `1px solid ${ink(0.15)}`, borderRadius: 0, padding: 20, outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'var(--font-body)', fontSize: 16, color: INK }} />
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-body)', fontSize: 12, color: ink(0.4), marginTop: -20 }}>{(a.description || '').length} / 600 characters</div>
              <div>
                <div style={{ fontSize: 12, color: ink(0.4), letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Need inspiration? You could mention</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {DESC_PROMPTS.map((p, i) => (
                    <li key={i} style={{ fontSize: 14, color: ink(0.55), fontStyle: 'italic', lineHeight: 1.6, paddingLeft: 16, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: ink(0.3) }}>—</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              {!a.description && (
                <button onClick={next} style={{ width: '100%', textAlign: 'center', fontSize: 14, color: ink(0.4), letterSpacing: '0.02em', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer' }}>Skip — get my measurements</button>
              )}
            </div>
          )}

          {!loading && !error && stepName === 'results' && results && (
            <div className="qf-fade">
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Eyebrow>Your Quick Fit</Eyebrow>
                <h2 style={{ ...SERIF, fontSize: 38, margin: '0 0 12px', fontWeight: 400 }}>Estimated <em>measurements</em></h2>
                {results.confidence && (
                  <p style={{ fontSize: 14, color: ink(0.5), maxWidth: 420, margin: '0 auto' }}>
                    Confidence: <span style={{ color: ink(0.8), textTransform: 'capitalize' }}>{results.confidence}</span> ({CONF_RANGE[results.confidence] || '±1.5"'} typical)
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Height', formatHeight()], ['Bust', `${Math.round(results.bust)}"`], ['Waist', `${Math.round(results.waist)}"`], ['Hips', `${Math.round(results.hips)}"`], ['Inseam', `${Math.round(results.inseam)}"`]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '20px 24px', borderRadius: 0, border: `1px solid ${ink(0.1)}`, background: 'var(--white)' }}>
                    <div style={{ color: ink(0.7), letterSpacing: '0.02em' }}>{l}</div>
                    <div style={{ ...SERIF, fontSize: 30, color: INK }}>{v}</div>
                  </div>
                ))}
              </div>
              {results.reasoning && (
                <div style={{ marginTop: 24, padding: '16px 24px', borderRadius: 0, border: `1px solid ${ink(0.1)}`, background: 'var(--white)' }}>
                  <div style={{ fontSize: 11, color: ink(0.45), letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>AI reasoning</div>
                  <p style={{ fontSize: 14, color: ink(0.7), lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>{results.reasoning}</p>
                </div>
              )}
              <div style={{ marginTop: 32, padding: 24, borderRadius: 0, border: `1px solid ${ink(0.12)}`, background: 'var(--white)' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: ink(0.45), marginBottom: 8 }}>Added to your profile</div>
                <p style={{ fontSize: 14, color: ink(0.65), lineHeight: 1.6, margin: 0 }}>These measurements go to your Suede profile and feed Suede Match. Because Quick Fit is an estimate rather than a precise measurement, they carry a lower match confidence than a scanned or self-measured profile. You can refine them anytime in your profile.</p>
              </div>
              <div style={{ marginTop: 32, padding: 24, borderRadius: 0, border: `1px solid ${ink(0.12)}`, background: 'var(--white)' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: ink(0.45), marginBottom: 8 }}>Complete your full profile</div>
                <p style={{ fontSize: 14, color: ink(0.65), lineHeight: 1.6, margin: '0 0 24px' }}>Add your usual sizes so brands and Suede Match can recommend the right fit across labels. Optional — you can always add these later in your profile.</p>
                {usualSizesBlock}
              </div>
              <button onClick={finishQuiz} disabled={saveStatus === 'saving'} style={primaryBtn({ width: '100%', marginTop: 32, opacity: saveStatus === 'saving' ? 0.6 : 1 })}>
                {saveStatus === 'saving' ? 'Saving…' : (authed ? 'Save & return to your profile' : 'Save to my profile')} <Icon name="arrow-right" size={16} color="var(--white)" />
              </button>
              <button onClick={restart} style={{ marginTop: 16, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', fontSize: 14, color: ink(0.5), letterSpacing: '0.02em', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon name="refresh" size={16} color={ink(0.5)} /> Start over
              </button>
            </div>
          )}
        </div>

        {!loading && !error && step > 0 && step < steps.length - 1 && (
          <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={back} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: ink(0.5), letterSpacing: '0.02em', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Icon name="arrow-left" size={16} color={ink(0.5)} /> Back
            </button>
            <button onClick={next} disabled={!canAdvance()}
              style={primaryBtn(canAdvance() ? {} : { background: ink(0.1), color: ink(0.4), cursor: 'not-allowed' })}>
              {step === steps.length - 2 ? 'Get my measurements' : 'Continue'} <Icon name="arrow-right" size={16} color={canAdvance() ? 'var(--white)' : ink(0.4)} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
