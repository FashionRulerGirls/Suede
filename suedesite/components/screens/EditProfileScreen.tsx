'use client';
import React from 'react';
/* Suede — Edit Profile / profile set-up flow.
   Four steps: Personal Info · Measurements · Social Links · Account.
   Left rail nav + white sheet over the hanger watermark, footer stepper,
   and Discard / Save actions. Reached from the Your Profile edit pen. */
import { Button, Field, Input, Icon, Avatar, Badge } from '@/components/ds';
import { SignInGate } from '@/components/screens/SignInGate';

const EP_STEPS = [
  { id: 'personal', label: 'Personal Info', icon: 'user' },
  { id: 'measurements', label: 'Measurements', icon: 'ruler' },
  { id: 'social', label: 'Social Links', icon: 'globe' },
  { id: 'account', label: 'Account', icon: 'lock' },
];

function EPLabel({ children, hint }: any) {
  return (
    <div style={{ marginBottom: 8 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>{children}</span>
      {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>{hint}</span>}
    </div>
  );
}

function ChipRow({ options, value, onChange, cols }: any) {
  const chip = (active: any) => ({
    padding: '12px 0', textAlign: 'center' as const, cursor: 'pointer',
    border: `1px solid ${active ? 'var(--ink-900)' : 'var(--border-default)'}`,
    background: active ? 'var(--ink-900)' : 'transparent', color: active ? 'var(--white)' : 'var(--text-primary)',
    fontFamily: 'var(--font-body)', fontSize: 14, transition: 'all var(--dur-fast) var(--ease-out)',
  });
  return (
    <div className="sd-chipgrid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {options.map((o: any) => <button key={o} type="button" onClick={() => onChange(value === o ? '' : o)} style={chip(value === o)}>{o}</button>)}
    </div>
  );
}

function EPInput({ label, sub, optional, ai, ...rest }: any) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>{label}</span>
        {optional && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>(Optional)</span>}
        {ai && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-meta)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--denim)', background: 'rgba(113,142,191,0.12)', padding: '2px 7px', borderRadius: 999 }}><Icon name="sparkle" size={11} color="var(--denim)" />From Quiz</span>}
      </div>
      {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      <div style={{ marginTop: 8, position: 'relative' }}>
        <Input variant="outline" readOnly={ai} {...rest} />
        {ai && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>Calculated</span>}
      </div>
    </div>
  );
}

function PersonalStep({ bio, setBio }: any) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-heading)', margin: 0 }}>Personal Information</h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '8px 0 0' }}>This is how other members see you on Suede.</p>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '28px 0' }} />
      <div className="sd-ep-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <EPInput label="Display Name" maxLength={50} defaultValue="Amara K." />
        <EPInput label="Username" maxLength={30} defaultValue="@ amara_k" />
      </div>
      <div style={{ marginTop: 28 }}>
        <EPLabel>Bio</EPLabel>
        <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} placeholder="Tell the community a little about your style…" rows={5}
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)', outline: 'none' }} />
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{bio.length} / 200</div>
      </div>
    </div>
  );
}

function MeasurementsStep({ sizes, setSize }: any) {
  const Divider = () => <div style={{ height: 1, background: 'var(--border-subtle)', margin: '32px 0' }} />;
  const SubHead = ({ children }: any) => <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>{children}</div>;
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-heading)', margin: 0 }}>Measurement Profile</h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '8px 0 0', maxWidth: 620, lineHeight: 1.6 }}>Your measurements are used to calculate Suede Match scores with members of the Collective. If you would like for your measurements to remain private, please update your preference in Account Settings.</p>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '28px 0' }} />

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--surface-inset)', border: '1px solid var(--border-subtle)', padding: '16px 18px', marginBottom: 32 }}>
        <Icon name="info" size={18} color="var(--text-secondary)" style={{ flex: 'none', marginTop: 1 }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Accurate measurements improve your match score results by up to 40%. We recommend measuring yourself in form-fitting clothing.</span>
      </div>

      <div className="sd-ep-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, rowGap: 24 }}>
        <EPInput label="Height" sub="feet & inches" maxLength={12} defaultValue={`5'6"`} />
        <EPInput label="Bust" sub="inches" maxLength={8} defaultValue={`36"`} />
        <EPInput label="Waist" sub="inches" maxLength={8} defaultValue={`28"`} />
        <EPInput label="Hips" sub="inches" maxLength={8} defaultValue={`40"`} />
        <EPInput label="Inseam" optional sub="inches" maxLength={8} defaultValue={`30"`} />
        <EPInput label="Shoulder Width" optional sub="inches" maxLength={8} defaultValue={`16"`} />
        <EPInput label="Arm Length" optional sub="inches" maxLength={8} defaultValue={`23"`} />
        <EPInput label="Torso Length" optional sub="inches" maxLength={8} defaultValue={`24"`} />
      </div>

      <Divider />
      <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 24, color: 'var(--text-heading)', margin: 0 }}>Usual Sizes</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: '6px 0 24px' }}>Select all that apply for each category (US Sizing)</p>

      <SubHead>Tops &amp; Dresses</SubHead>
      <EPLabel>Letter size</EPLabel>
      <ChipRow cols={9} options={['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS']} value={sizes.topsLetter} onChange={(v: any) => setSize('topsLetter', v)} />
      <div style={{ marginTop: 18 }}><EPLabel>US numeric size</EPLabel>
        <ChipRow cols={11} options={['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20']} value={sizes.topsNum} onChange={(v: any) => setSize('topsNum', v)} /></div>

      <Divider />
      <SubHead>Bottoms</SubHead>
      <EPLabel>Letter size</EPLabel>
      <ChipRow cols={8} options={['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']} value={sizes.botLetter} onChange={(v: any) => setSize('botLetter', v)} />
      <div style={{ marginTop: 18 }}><EPLabel>US numeric size</EPLabel>
        <ChipRow cols={11} options={['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20']} value={sizes.botNum} onChange={(v: any) => setSize('botNum', v)} /></div>
      <div style={{ marginTop: 18 }}><EPLabel>Waist size (inches) — for denim &amp; trousers</EPLabel>
        <ChipRow cols={11} options={['24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44']} value={sizes.waist} onChange={(v: any) => setSize('waist', v)} /></div>

      <Divider />
      <SubHead>Plus</SubHead>
      <div style={{ maxWidth: 360 }}><ChipRow cols={5} options={['1X', '2X', '3X', '4X', '5X']} value={sizes.plus} onChange={(v: any) => setSize('plus', v)} /></div>
    </div>
  );
}

function SocialStep() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-heading)', margin: 0 }}>Social Links</h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '8px 0 0' }}>Connect your channels so members can follow your style off-platform.</p>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '28px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 620 }}>
        <EPInput label="Instagram" icon="instagram" maxLength={60} placeholder="@yourhandle" />
        <EPInput label="TikTok" icon="tiktok" maxLength={60} placeholder="@yourhandle" />
        <EPInput label="Website" icon="globe" maxLength={300} placeholder="https://" />
      </div>
    </div>
  );
}

function AccountStep({ onRoute }: any) {
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>({
    'Private measurements': true,
    'Email notifications': true,
    'Show profile in The Collective': true,
  });
  const togglePref = (k: string) => setPrefs(p => ({ ...p, [k]: !p[k] }));
  const deleteAccount = () => {
    if (typeof window !== 'undefined' && window.confirm('Permanently delete your Suede account? This cannot be undone.')) {
      onRoute('__signout');
    }
  };
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-heading)', margin: 0 }}>Account</h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '8px 0 0' }}>Manage your login and privacy preferences.</p>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '28px 0' }} />
      <div className="sd-ep-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <EPInput label="Email" maxLength={120} defaultValue="amara@email.com" />
        <EPInput label="Password" type="password" maxLength={72} defaultValue="password" />
      </div>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[['Private measurements', 'Only share aggregate match percentages — never raw numbers.'],
          ['Email notifications', 'Get notified when someone reviews an item in your size.'],
          ['Show profile in The Collective', 'Appear in member discovery and search.']].map(([t, d]: any) => {
          const on = prefs[t];
          return (
          <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '16px 18px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>{t}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{d}</div>
            </div>
            <button type="button" role="switch" aria-checked={on} aria-label={t} onClick={() => togglePref(t)} style={{ width: 44, height: 26, borderRadius: 999, background: on ? 'var(--ink-900)' : 'var(--ink-200)', position: 'relative', flex: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'background var(--dur-base) var(--ease-out)' }}>
              <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: 'var(--white)', transition: 'left var(--dur-base) var(--ease-out)' }} />
            </button>
          </div>
          );
        })}
        <button type="button" onClick={deleteAccount} style={{ alignSelf: 'flex-start', marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--rating-critical)', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}>Delete account</button>
      </div>
    </div>
  );
}

export function EditProfileScreen({ onRoute, authed = false }: any) {
  const [step, setStep] = React.useState(0);
  const [avatarSrc, setAvatarSrc] = React.useState('/assets/avatars/avatar-rose.jpg');
  const onAvatarPick = (e: any) => {
    const f = e.target.files?.[0];
    if (f) setAvatarSrc(URL.createObjectURL(f));
  };
  const [bio, setBio] = React.useState('Brooklyn-based, drawn to clean tailoring and considered eveningwear. Always hunting the perfect drape.');
  const [sizes, setSizes] = React.useState({ topsLetter: 'M', topsNum: '8', botLetter: 'M', botNum: '8', waist: '28', plus: '', build: 'Curvy' });
  const setSize = (k: any, v: any) => setSizes(s => ({ ...s, [k]: v }));
  const cur = EP_STEPS[step].id;

  if (!authed) return <SignInGate onRoute={onRoute} title="Edit Profile" message="Sign in to set up your Suede profile and measurement match." />;

  return (
    <div style={{ position: 'relative', minHeight: '90vh' }}>
      {/* hanger watermark */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360, backgroundImage: 'url(/assets/imagery/hero-hangers.png)', backgroundRepeat: 'no-repeat', backgroundPosition: 'center -60px', backgroundSize: 'auto 80%', opacity: 0.10, pointerEvents: 'none', zIndex: 0 }} />

      <div className="sd-ep-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 1320, margin: '0 auto', padding: '24px 48px 0' }}>
        <button onClick={() => onRoute('yourprofile')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
          <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to Profile
        </button>

        <div className="sd-ep-grid" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', gap: 0, alignItems: 'start' }}>
          {/* Left rail */}
          <aside className="sd-ep-aside" style={{ paddingTop: 36 }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 28, cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={onAvatarPick} style={{ display: 'none' }} />
              <div style={{ position: 'relative' }}>
                <Avatar src={avatarSrc} name="Amara K." size={92} ring />
                <span style={{ position: 'absolute', right: 2, bottom: 2, width: 30, height: 30, borderRadius: '50%', background: 'var(--ink-900)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--paper)' }}>
                  <Icon name="image" size={14} color="var(--white)" />
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', marginTop: 12 }}>Change photo</span>
            </label>
            <nav className="sd-ep-nav" style={{ display: 'flex', flexDirection: 'column' }}>
              {EP_STEPS.map((s, i) => {
                const active = i === step;
                return (
                  <button key={s.id} onClick={() => setStep(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', cursor: 'pointer', border: 'none', textAlign: 'left', background: active ? 'var(--surface-inset)' : 'transparent', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 15, transition: 'background var(--dur-fast) var(--ease-out)' }}>
                    <Icon name={s.icon} size={16} color={active ? 'var(--text-primary)' : 'var(--text-muted)'} />{s.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Sheet */}
          <div className="sd-ep-sheet" style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: '48px 56px', minHeight: 560 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 34, color: 'var(--text-heading)', margin: '0 0 32px' }}>Edit Profile</h1>
            {cur === 'personal' && <PersonalStep bio={bio} setBio={setBio} />}
            {cur === 'measurements' && <MeasurementsStep sizes={sizes} setSize={setSize} />}
            {cur === 'social' && <SocialStep />}
            {cur === 'account' && <AccountStep onRoute={onRoute} />}
          </div>
        </div>

        {/* Stepper */}
        <div className="sd-ep-stepper" style={{ padding: '44px 0 0', marginLeft: 232 }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', maxWidth: 1000 }}>
            <div style={{ position: 'absolute', top: 38, left: 8, right: 8, height: 2, background: 'var(--ink-900)', zIndex: 0 }} />
            {EP_STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setStep(i)} style={{ position: 'relative', zIndex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 0 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: i === step ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: i <= step ? 'var(--ink-900)' : 'var(--white)', border: `2px solid ${i <= step ? 'var(--ink-900)' : 'var(--ink-300)'}`, boxShadow: i === step ? '0 0 0 4px rgba(20,18,15,0.12)' : 'none' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 28, padding: '36px 0 64px' }}>
          <button onClick={() => onRoute('yourprofile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Discard Changes</button>
          <Button variant="primary" size="lg" onClick={() => step < EP_STEPS.length - 1 ? setStep(step + 1) : onRoute('yourprofile')}>{step < EP_STEPS.length - 1 ? 'Save & Continue' : 'Save Changes'}</Button>
        </div>
      </div>
    </div>
  );
}
