'use client';
// Suede Discovery Site — client app shell. Ports the route state machine,
// auth state, scroll management, and visual tweaks from ui_kits/suede/index.html.

import React from 'react';

import { Nav } from '@/components/screens/Nav';
import { Footer } from '@/components/screens/Footer';
import { ProfileProgress } from '@/components/screens/ProfileProgress';
import { LandingScreen } from '@/components/screens/LandingScreen';
import { CapsuleScreen } from '@/components/screens/CapsuleScreen';
import { BrandScreen } from '@/components/screens/BrandScreen';
import { ReviewDetailScreen } from '@/components/screens/ReviewDetailScreen';
import { MemberProfileScreen } from '@/components/screens/MemberProfileScreen';
import { YourProfileScreen } from '@/components/screens/YourProfileScreen';
import { InquiryDetailScreen } from '@/components/screens/InquiryDetailScreen';
import { CreateReviewScreen } from '@/components/screens/CreateReviewScreen';
import { CreateInquiryScreen } from '@/components/screens/CreateInquiryScreen';
import { AboutScreen } from '@/components/screens/AboutScreen';
import { NotificationsScreen } from '@/components/screens/NotificationsScreen';
import { PrivacyScreen } from '@/components/screens/PrivacyScreen';
import { TermsScreen } from '@/components/screens/TermsScreen';
import { SuggestBrandScreen } from '@/components/screens/SuggestBrandScreen';
import { EditProfileScreen } from '@/components/screens/EditProfileScreen';
import { QuizScreen } from '@/components/screens/QuizScreen';
import { ConsultationScreen } from '@/components/screens/ConsultationScreen';
import { LookbookScreen } from '@/components/screens/LookbookScreen';
import { CollectiveScreen } from '@/components/screens/CollectiveScreen';
import { AuthScreen } from '@/components/screens/AuthScreen';
import {
  CreateAccountScreen,
  ForgotPasswordScreen,
  VerificationCodeScreen,
  ResetPasswordScreen,
} from '@/components/screens/AuthFlowScreens';
import { ApplyScreen } from '@/components/screens/ApplyScreen';
import { BrandSignInScreen } from '@/components/screens/BrandSignInScreen';
import { ClaimBrandScreen } from '@/components/screens/ClaimBrandScreen';
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakSlider,
  TweakText,
} from '@/components/TweaksPanel';
import { appState } from '@/lib/appState';
import { AuthProvider, useAuth } from '@/lib/auth';
import {
  SUEDE_BRANDS,
  SUEDE_REVIEWS,
  SUEDE_MEMBERS,
  SUEDE_INQUIRIES,
} from '@/lib/data';

const TWEAK_DEFAULTS = {
  accent: '#718ebf',
  paper: '#f8f6f3',
  cardCorners: 4,
  heroHeadline: 'Stop shopping blind. Start shopping with intent.',
  bannerText:
    'DISCOVER, REVIEW, & SHOP MINORITY-OWNED AND EMERGING BRANDS WITH CONFIDENCE',
};

function AppInner() {
  const { user, signOut, recovery } = useAuth();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRouteRaw] = React.useState('landing');
  // Real auth drives `authed`; the test override lets the QA harness (and any
  // environment where Supabase is unreachable) exercise signed-in screens.
  const [testAuthed, setTestAuthed] = React.useState(false);
  const authed = !!user || testAuthed;
  const returnToRef = React.useRef<string | null>(null);
  const AUTH_ROUTES = ['signin', 'createaccount', 'forgot', 'verify', 'reset', 'brandsignin'];
  // In-memory navigation stack. History entries only carry a small integer
  // index ({ i }) — mobile browsers silently drop oversized/non-serialisable
  // pushState payloads, which is why stuffing the full selection snapshot into
  // history made Back fall through to Home on phones. Route + selection live
  // here instead, keyed by that index.
  const navRef = React.useRef<{ stack: { route: string; sel: any }[]; idx: number }>({ stack: [{ route: 'landing', sel: {} }], idx: 0 });

  // Suede is a single-URL SPA, so in-app navigation must push its own browser
  // history entries — otherwise Back escapes to the last non-Suede page instead
  // of the previous Suede view. Each pushed entry carries the route plus the
  // appState selection needed to rebuild a detail view (brand/review/…).
  const SEL_KEYS = ['brand', 'member', 'review', 'inquiry', 'profileView', 'lookbookTab', 'capsuleDrop'];
  const snapshotSel = () => {
    const s: Record<string, any> = {};
    for (const k of SEL_KEYS) s[k] = appState[k];
    return s;
  };

  const scrollTop = () => {
    const top = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };
    top();
    requestAnimationFrame(top);
    setTimeout(top, 60);
  };

  const setRoute = (r: string) => {
    if (r === '__signin' || r === '__signedin') {
      // A real session (via Supabase) already flips `authed`; just navigate back.
      const back = returnToRef.current;
      returnToRef.current = null;
      setRouteRaw(back || 'landing');
      scrollTop();
      return;
    }
    if (r === '__signout') {
      setTestAuthed(false);
      void signOut();
      returnToRef.current = null;
      setRouteRaw('landing');
      scrollTop();
      return;
    }
    // entering the sign-in / create-account flow: remember where we came from
    if ((r === 'signin' || r === 'createaccount') && !AUTH_ROUTES.includes(route)) {
      returnToRef.current = route;
    }
    setRouteRaw(r);
    scrollTop();
    // Push a new entry onto our stack (dropping any forward history), and store
    // only its index in browser history so mobile can't lose the payload.
    const nav = navRef.current;
    nav.stack = nav.stack.slice(0, nav.idx + 1);
    nav.stack.push({ route: r, sel: snapshotSel() });
    nav.idx = nav.stack.length - 1;
    try { window.history.pushState({ i: nav.idx }, ''); } catch { /* history unavailable */ }
  };

  React.useEffect(() => {
    const top = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };
    top();
    requestAnimationFrame(top);
  }, [route]);

  // Seed the current history entry with the initial route (and strip any OAuth
  // return params from the URL), then restore route + selection on Back/Forward.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasAuthParam = /[?&#](code|access_token|signedin)=/.test(window.location.search + window.location.hash);
    // Seed the stack + the current history entry with index 0.
    navRef.current = { stack: [{ route: 'landing', sel: snapshotSel() }], idx: 0 };
    try {
      window.history.replaceState({ i: 0 }, '', hasAuthParam ? window.location.pathname : undefined);
    } catch { /* history unavailable */ }
    const onPop = (e: PopStateEvent) => {
      const st: any = e.state;
      const nav = navRef.current;
      // Resolve the target from our in-memory stack by index. If we can't (e.g.
      // a foreign entry, or the stack was reset by a reload), keep the current
      // view rather than yanking the user to Home.
      const i = st && typeof st.i === 'number' ? st.i : null;
      if (i == null || !nav.stack[i]) return;
      nav.idx = i;
      const entry = nav.stack[i];
      if (entry.sel) Object.assign(appState, entry.sel);
      setRouteRaw(entry.route);
      scrollTop();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply visual tweaks globally via CSS custom properties
  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--denim', t.accent);
    r.setProperty('--denim-ink', t.accent);
    r.setProperty('--accent', t.accent);
    r.setProperty('--accent-text', t.accent);
    r.setProperty('--paper', t.paper);
    r.setProperty('--surface-page', t.paper);
    r.setProperty('--radius-sm', t.cardCorners + 'px');
    r.setProperty('--radius-xs', Math.max(0, t.cardCorners - 2) + 'px');
  }, [t.accent, t.paper, t.cardCorners]);

  // Dev-only test hook: lets an automated harness visit any route directly
  // (seeding the shared selection state for entity screens). Stripped in prod.
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (window as any).__suedeTest = {
      go(route: string, seed?: Record<string, any>) {
        if (seed) Object.assign(appState, seed);
        setRoute(route);
      },
      seedAll() {
        appState.brand = SUEDE_BRANDS[0];
        appState.review = SUEDE_REVIEWS[0];
        appState.member = SUEDE_MEMBERS[0];
        appState.inquiry = SUEDE_INQUIRIES[0];
      },
      setAuthed: setTestAuthed,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A password-recovery link signs the user into a recovery session; send them
  // to the reset-password screen so they can set a new password.
  React.useEffect(() => {
    if (recovery) setRouteRaw('reset');
  }, [recovery]);

  // First time a member is seen signed in on this device, send them straight
  // to their profile to finish setup. (Recovery sessions are excluded.)
  React.useEffect(() => {
    if (!user || recovery) return;
    try {
      const key = 'suede_onboarded_' + user.id;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        setRouteRaw('yourprofile');
        scrollTop();
      }
    } catch { /* storage unavailable */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, recovery]);

  const screens: Record<string, any> = {
    landing: LandingScreen,
    capsule: CapsuleScreen,
    brand: BrandScreen,
    review: ReviewDetailScreen,
    member: MemberProfileScreen,
    yourprofile: YourProfileScreen,
    inquiry: InquiryDetailScreen,
    createreview: CreateReviewScreen,
    createinquiry: CreateInquiryScreen,
    about: AboutScreen,
    notifications: NotificationsScreen,
    privacy: PrivacyScreen,
    terms: TermsScreen,
    suggest: SuggestBrandScreen,
    editprofile: EditProfileScreen,
    quiz: QuizScreen,
    consult: ConsultationScreen,
    lookbook: LookbookScreen,
    collective: CollectiveScreen,
    signin: AuthScreen,
    createaccount: CreateAccountScreen,
    forgot: ForgotPasswordScreen,
    verify: VerificationCodeScreen,
    reset: ResetPasswordScreen,
    apply: ApplyScreen,
    brandsignin: BrandSignInScreen,
    claimbrand: ClaimBrandScreen,
  };
  const Screen = screens[route] || LandingScreen;

  return (
    <div id="root">
      <Nav route={route} onRoute={setRoute} authed={authed} />
      <ProfileProgress route={route} onRoute={setRoute} />
      <Screen onRoute={setRoute} tweaks={t} authed={authed} />
      <Footer onRoute={setRoute} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#718ebf', '#c9a96e', '#3f7d52', '#b1603f', '#1a1a1a']}
          onChange={(v: string) => setTweak('accent', v)}
        />
        <TweakColor
          label="Paper tone"
          value={t.paper}
          options={['#f8f6f3', '#fffdf9', '#f4f5f6', '#f1efe9', '#efece6']}
          onChange={(v: string) => setTweak('paper', v)}
        />
        <TweakSection label="Shape" />
        <TweakSlider
          label="Card corners"
          value={t.cardCorners}
          min={0}
          max={16}
          step={1}
          unit="px"
          onChange={(v: number) => setTweak('cardCorners', v)}
        />
        <TweakSection label="Voice" />
        <TweakText
          label="Hero headline"
          value={t.heroHeadline}
          onChange={(v: string) => setTweak('heroHeadline', v)}
        />
        <TweakText
          label="Banner line"
          value={t.bannerText}
          onChange={(v: string) => setTweak('bannerText', v)}
        />
      </TweaksPanel>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
