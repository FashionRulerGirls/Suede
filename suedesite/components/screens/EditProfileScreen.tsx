'use client';
import React from 'react';
/* Suede — Edit Profile / profile set-up flow.
   Four steps: Personal Info · Measurements · Social Links · Account.
   Loads the signed-in member's profile + measurements and saves changes
   (measurements stored as inches). */
import { Button, Field, Input, Icon, Avatar, Badge } from '@/components/ds';
import { SignInGate } from '@/components/screens/SignInGate';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import {
  loadProfileData, saveProfileFields, saveMeasurements,
  heightToInches, inchesToHeight, toInches, inchesDisplay,
  buildUsualSizes, splitUsualSizes,
} from '@/lib/profileData';

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

function PersonalStep({ f, set }: any) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-heading)', margin: 0 }}>Personal Information</h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '8px 0 0' }}>This is how other members see you on Suede.</p>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '28px 0' }} />
      <div className="sd-ep-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <EPInput label="Display Name" maxLength={50} value={f.display_name} onChange={(e: any) => set('display_name', e.target.value)} placeholder="Your name" />
        <EPInput label="Username" maxLength={30} value={f.username} onChange={(e: any) => set('username', e.target.value.replace(/\s+/g, ''))} placeholder="username" />
      </div>
      <div style={{ marginTop: 28 }}>
        <EPLabel>Bio</EPLabel>
        <textarea value={f.bio} onChange={(e) => set('bio', e.target.value.slice(0, 200))} placeholder="Tell the community a little about your style…" rows={5}
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', background: 'transparent', padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)', outline: 'none' }} />
        <div style={{ textAlign: 'right', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{(f.bio || '').length} / 200</div>
      </div>
    </div>
  );
}

function MeasurementsStep({ f, set, sizes, setSize }: any) {
  const Divider = () => <div style={{ height: 1, background: 'var(--border-subtle)', margin: '32px 0' }} />;
  const SubHead = ({ children }: any) => <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>{children}</div>;
  const mi = (label: string, key: string, opts: any = {}) => (
    <EPInput label={label} sub={opts.sub} optional={opts.optional} maxLength={opts.maxLength || 8} value={f[key]} onChange={(e: any) => set(key, e.target.value)} placeholder={opts.ph} />
  );
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
        {mi('Height', 'height', { sub: 'feet & inches', maxLength: 12, ph: `5'6"` })}
        {mi('Bust', 'bust', { sub: 'inches', ph: `36"` })}
        {mi('Waist', 'waist', { sub: 'inches', ph: `28"` })}
        {mi('Hips', 'hips', { sub: 'inches', ph: `40"` })}
        {mi('Inseam', 'inseam', { optional: true, sub: 'inches', ph: `30"` })}
        {mi('Shoulder Width', 'shoulder', { optional: true, sub: 'inches', ph: `16"` })}
        {mi('Arm Length', 'arm', { optional: true, sub: 'inches', ph: `23"` })}
        {mi('Torso Length', 'torso', { optional: true, sub: 'inches', ph: `24"` })}
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

function SocialStep({ f, set }: any) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 26, color: 'var(--text-heading)', margin: 0 }}>Social Links</h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: '8px 0 0' }}>Connect your channels so members can follow your style off-platform.</p>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '28px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 620 }}>
        <EPInput label="Instagram" icon="instagram" maxLength={60} value={f.instagram} onChange={(e: any) => set('instagram', e.target.value)} placeholder="@yourhandle" />
        <EPInput label="TikTok" icon="tiktok" maxLength={60} value={f.tiktok} onChange={(e: any) => set('tiktok', e.target.value)} placeholder="@yourhandle" />
        <EPInput label="Website" icon="globe" maxLength={300} value={f.website} onChange={(e: any) => set('website', e.target.value)} placeholder="https://" />
      </div>
    </div>
  );
}

function AccountStep({ f, set, email, onRoute }: any) {
  const prefs: [string, string, string][] = [
    ['private_measurements', 'Private measurements', 'Hide your exact numbers from other members — only your match confidence shows.'],
    ['email_notifications', 'Email notifications', 'Get notified when someone reviews an item in your size.'],
    ['show_in_collective', 'Show profile in The Collective', 'Appear in member discovery and search.'],
  ];
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
        <EPInput label="Email" value={email || ''} readOnly />
        <div>
          <EPLabel>Password</EPLabel>
          <button type="button" onClick={() => onRoute('forgot')} style={{ marginTop: 8, height: 50, width: '100%', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', textAlign: 'left', padding: '0 14px' }}>Send a password reset link</button>
        </div>
      </div>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {prefs.map(([key, t, d]) => {
          const on = !!f[key];
          return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '16px 18px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>{t}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{d}</div>
            </div>
            <button type="button" role="switch" aria-checked={on} aria-label={t} onClick={() => set(key, !on)} style={{ width: 44, height: 26, borderRadius: 999, background: on ? 'var(--ink-900)' : 'var(--ink-200)', position: 'relative', flex: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'background var(--dur-base) var(--ease-out)' }}>
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

const BLANK = {
  display_name: '', username: '', bio: '',
  instagram: '', tiktok: '', website: '',
  height: '', bust: '', waist: '', hips: '', inseam: '', shoulder: '', arm: '', torso: '',
  private_measurements: false, email_notifications: true, show_in_collective: true,
};

export function EditProfileScreen({ onRoute, authed = false }: any) {
  const { user } = useAuth();
  const [step, setStep] = React.useState(0);
  const [avatarSrc, setAvatarSrc] = React.useState('');
  const [f, setF] = React.useState<any>({ ...BLANK });
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const [sizes, setSizes] = React.useState<any>({ topsLetter: '', topsNum: '', botLetter: '', botNum: '', waist: '', plus: '' });
  const setSize = (k: any, v: any) => setSizes((s: any) => ({ ...s, [k]: v }));
  const [saving, setSaving] = React.useState(false);
  const [saveErr, setSaveErr] = React.useState<string | null>(null);
  const cur = EP_STEPS[step].id;

  const onAvatarPick = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setAvatarSrc(URL.createObjectURL(file));
  };

  // Load the signed-in member's profile + measurements
  React.useEffect(() => {
    const sb = createClient();
    if (!sb || !user) return;
    let active = true;
    loadProfileData(sb, user.id).then(({ profile, measurements }) => {
      if (!active) return;
      if (profile) {
        setF((p: any) => ({
          ...p,
          display_name: profile.display_name || '',
          username: profile.username || '',
          bio: profile.bio || '',
          instagram: profile.instagram || '',
          tiktok: profile.tiktok || '',
          website: profile.website || '',
          private_measurements: !profile.measurements_public,
          email_notifications: profile.email_notifications,
          show_in_collective: profile.show_in_collective,
        }));
        if (profile.avatar_url) setAvatarSrc(profile.avatar_url);
      }
      if (measurements) {
        setF((p: any) => ({
          ...p,
          height: inchesToHeight(measurements.height_in),
          bust: inchesDisplay(measurements.bust_in),
          waist: inchesDisplay(measurements.waist_in),
          hips: inchesDisplay(measurements.hips_in),
          inseam: inchesDisplay(measurements.inseam_in),
          shoulder: inchesDisplay(measurements.shoulder_in),
          arm: inchesDisplay(measurements.arm_in),
          torso: inchesDisplay(measurements.torso_in),
        }));
        if (measurements.usual_sizes) setSizes((s: any) => ({ ...s, ...splitUsualSizes(measurements.usual_sizes) }));
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [user?.id]);

  const save = async () => {
    const sb = createClient();
    if (!sb || !user) return true; // demo mode (no backend) — just advance
    if (!f.username.trim()) { setSaveErr('Username is required.'); return false; }
    setSaving(true); setSaveErr(null);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      saveProfileFields(sb, user.id, {
        display_name: f.display_name.trim() || f.username.trim(),
        username: f.username.trim(),
        bio: f.bio.trim() || null,
        instagram: f.instagram.trim() || null,
        tiktok: f.tiktok.trim() || null,
        website: f.website.trim() || null,
        measurements_public: !f.private_measurements,
        email_notifications: f.email_notifications,
        show_in_collective: f.show_in_collective,
      } as any),
      saveMeasurements(sb, user.id, {
        height_in: heightToInches(f.height),
        bust_in: toInches(f.bust),
        waist_in: toInches(f.waist),
        hips_in: toInches(f.hips),
        inseam_in: toInches(f.inseam),
        shoulder_in: toInches(f.shoulder),
        arm_in: toInches(f.arm),
        torso_in: toInches(f.torso),
        usual_sizes: buildUsualSizes({
          tops: [sizes.topsLetter, sizes.topsNum],
          bottoms: [sizes.botLetter, sizes.botNum],
          waist: [sizes.waist],
          plus: [sizes.plus],
        }),
        source: 'manual',
        source_confidence: 0.9,
      }),
    ]);
    setSaving(false);
    if (e1 || e2) { setSaveErr((e1 || e2)!.message); return false; }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('suede-profile-updated'));
    return true;
  };

  const onPrimary = async () => {
    const ok = await save();
    if (!ok) return;
    if (step < EP_STEPS.length - 1) setStep(step + 1);
    else onRoute('yourprofile');
  };

  if (!authed) return <SignInGate onRoute={onRoute} title="Edit Profile" message="Sign in to set up your Suede profile and measurement match." />;

  return (
    <div style={{ position: 'relative', minHeight: '90vh' }}>
      <div className="sd-ep-wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 1320, margin: '0 auto', padding: '24px 48px 0' }}>
        <button onClick={() => onRoute('yourprofile')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
          <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to Profile
        </button>

        <div className="sd-ep-grid" style={{ display: 'grid', gridTemplateColumns: '232px 1fr', gap: 0, alignItems: 'start' }}>
          <aside className="sd-ep-aside" style={{ paddingTop: 36 }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 28, cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={onAvatarPick} style={{ display: 'none' }} />
              <div style={{ position: 'relative' }}>
                <Avatar src={avatarSrc} name={f.display_name || ''} size={92} ring />
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

          <div className="sd-ep-sheet" style={{ background: 'var(--white)', border: '1px solid var(--border-subtle)', padding: '48px 56px', minHeight: 560 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 34, color: 'var(--text-heading)', margin: '0 0 32px' }}>Edit Profile</h1>
            {cur === 'personal' && <PersonalStep f={f} set={set} />}
            {cur === 'measurements' && <MeasurementsStep f={f} set={set} sizes={sizes} setSize={setSize} />}
            {cur === 'social' && <SocialStep f={f} set={set} />}
            {cur === 'account' && <AccountStep f={f} set={set} email={user?.email} onRoute={onRoute} />}
          </div>
        </div>

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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 20, padding: '20px 0 64px', flexWrap: 'wrap' }}>
          {saveErr && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--rating-critical)', marginRight: 'auto' }}>{saveErr}</span>}
          <button onClick={() => onRoute('yourprofile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Discard Changes</button>
          <Button variant="primary" size="lg" disabled={saving} onClick={onPrimary}>{saving ? 'Saving…' : (step < EP_STEPS.length - 1 ? 'Save & Continue' : 'Save Changes')}</Button>
        </div>
      </div>
    </div>
  );
}
