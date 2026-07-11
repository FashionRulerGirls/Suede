'use client';
// Suede Discovery Site — client app shell. Ports the route state machine,
// auth state, scroll management, and visual tweaks from ui_kits/suede/index.html.

import React from 'react';

import { Nav } from '@/components/screens/Nav';
import { Footer } from '@/components/screens/Footer';
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
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakSlider,
  TweakText,
} from '@/components/TweaksPanel';
import { appState } from '@/lib/appState';
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

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRouteRaw] = React.useState('landing');
  const [authed, setAuthed] = React.useState(false);
  const returnToRef = React.useRef<string | null>(null);
  const AUTH_ROUTES = ['signin', 'createaccount', 'forgot', 'verify', 'reset', 'brandsignin'];

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
      setAuthed(true);
      const back = returnToRef.current;
      returnToRef.current = null;
      setRouteRaw(back || 'landing');
      scrollTop();
      return;
    }
    if (r === '__signout') {
      setAuthed(false);
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
      setAuthed,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  };
  const Screen = screens[route] || LandingScreen;

  return (
    <div id="root">
      <Nav route={route} onRoute={setRoute} authed={authed} />
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
