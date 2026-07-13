'use client';
import React from 'react';
/* Suede — Your Profile (logged-in member's own profile). */
import { Avatar, Button, Tabs, Icon, ReviewCard, MeasurementSpec, StarRating } from '@/components/ds';
import { SUEDE_REVIEWS, SUEDE_INQUIRIES, SUEDE_BRANDS, SUEDE_MEMBERS } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';
import { FullMeasureRow } from '@/components/screens/FullMeasureRow';
import { InquiryCard } from '@/components/screens/LookbookScreen';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { loadProfileData, inchesToHeight, inchesDisplay } from '@/lib/profileData';
import { loadUserReviews, loadUserInquiries, countFollowedBrands, memberFollowerCount } from '@/lib/contentData';

function YProfStat({ value, label, links, onValue }: any) {
  const valueStyle = { fontFamily: 'var(--font-meta)', fontWeight: 500, fontSize: 30, lineHeight: 1, color: 'var(--text-heading)' } as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 130 }}>
      {onValue
        ? <button onClick={onValue} style={{ ...valueStyle, background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'opacity var(--dur-fast) var(--ease-out)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>{value}</button>
        : <span style={valueStyle}>{value}</span>}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      {links && links.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: 2 }}>
          {links.map((l: any) => (
            <button key={l.label} onClick={l.onClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--text-muted)', textDecoration: 'underline', textUnderlineOffset: 3, transition: 'color var(--dur-fast) var(--ease-out)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>{l.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function YourProfileScreen({ onRoute }: any) {
  const { user } = useAuth();
  const [db, setDb] = React.useState<any>(null);
  const [dbReviews, setDbReviews] = React.useState<any[]>([]);
  const [dbInquiries, setDbInquiries] = React.useState<any[]>([]);
  const [followedBrands, setFollowedBrands] = React.useState(0);
  const [followerCount, setFollowerCount] = React.useState(0);
  React.useEffect(() => {
    const sb = createClient();
    if (!sb || !user) { setDb(null); setDbReviews([]); setDbInquiries([]); setFollowedBrands(0); setFollowerCount(0); return; }
    let active = true;
    loadProfileData(sb, user.id).then((d) => { if (active) setDb(d); }).catch(() => {});
    loadUserReviews(sb, user.id).then((r) => { if (active) setDbReviews(r); }).catch(() => {});
    loadUserInquiries(sb, user.id).then((q) => { if (active) setDbInquiries(q); }).catch(() => {});
    countFollowedBrands(sb, user.id).then((n) => { if (active) setFollowedBrands(n); }).catch(() => {});
    memberFollowerCount(sb, user.id).then((n) => { if (active) setFollowerCount(n); }).catch(() => {});
    return () => { active = false; };
  }, [user?.id]);

  const MOCK = {
    name: 'Kikiola Kanbi', handle: '@kikiolakanbi', avatar: '/assets/avatars/avatar-rose.jpg',
    social: '@kikiola_kanbi', bio: "I love to explore the brands and Fashion. It's my hobbyy.",
    measurements: { height: "5'7\"", bust: '34"', waist: '26"', hips: '36"' },
    fullMeasurements: { 'Inseam': '30"', 'Shoulder Width': '16"', 'Arm Length': '23"', 'Torso Length': '24"' },
    usualSizes: { 'Tops': ['M', '8'], 'Bottoms': ['M', '8'], 'Waist': ['28"'] },
    followers: '30', reviews: '24', inquiries: '12', brands: '8',
  };
  const p = db?.profile;
  const ms = db?.measurements;
  const real = !!p;   // a real signed-in account; otherwise fall back to the demo
  const m = real ? {
    name: p.display_name || p.username,
    handle: '@' + p.username,
    avatar: p.avatar_url || '',
    social: p.instagram || p.tiktok || ('@' + p.username),
    bio: p.bio || '',
    measurements: {
      height: inchesToHeight(ms?.height_in) || undefined,
      bust: inchesDisplay(ms?.bust_in) || undefined,
      waist: inchesDisplay(ms?.waist_in) || undefined,
      hips: inchesDisplay(ms?.hips_in) || undefined,
    },
    fullMeasurements: {
      'Inseam': inchesDisplay(ms?.inseam_in) || undefined,
      'Shoulder Width': inchesDisplay(ms?.shoulder_in) || undefined,
      'Arm Length': inchesDisplay(ms?.arm_in) || undefined,
      'Torso Length': inchesDisplay(ms?.torso_in) || undefined,
    },
    usualSizes: ms?.usual_sizes || {},
    followers: String(followerCount), reviews: String(dbReviews.length), inquiries: String(dbInquiries.length), brands: String(followedBrands),
  } : MOCK;
  const [tab, setTab] = React.useState('reviews');
  const [view, setView] = React.useState(appState.profileView || 'profile'); // profile | brands | followers
  React.useEffect(() => {
    appState.profileView = null;
    const onView = (e: any) => setView(e.detail || 'profile');
    window.addEventListener('suede-profile-view', onView);
    return () => window.removeEventListener('suede-profile-view', onView);
  }, []);
  const [feedTab, setFeedTab] = React.useState('reviews');
  const [feedQuery, setFeedQuery] = React.useState('');
  const [feedSort, setFeedSort] = React.useState('date');
  const reviews = real ? [] : (SUEDE_REVIEWS || []);
  const meReviewer = { name: m.name, handle: m.handle, avatar: m.avatar };
  const feed = real
    ? dbReviews.map(r => ({ ...r, reviewer: meReviewer }))
    : [...reviews, ...reviews].slice(0, 2).map(r => ({ ...r, reviewer: meReviewer }));
  const inquiries = real
    ? dbInquiries.map(it => ({ ...it, asker: meReviewer }))
    : (SUEDE_INQUIRIES || []).slice(0, 2).map(it => ({ ...it, asker: meReviewer }));
  const openReview = (r: any) => { appState.review = r; onRoute('review'); };

  if (view !== 'profile') {
    const isFeed = view === 'capsulefeed' || view === 'collectivefeed';
    const isBrandSide = view === 'capsulefeed' || view === 'brands';
    const ql = feedQuery.trim().toLowerCase();
    const avatarPool = ['/assets/avatars/avatar-rose.jpg', '/assets/avatars/avatar-blue.jpg', '/assets/avatars/avatar-asaya.jpg'];
    // The brands this member follows / the members who follow them.
    const followedBrands = (SUEDE_BRANDS || []).slice(0, Number(m.brands) || 8).filter(b => b.name.toLowerCase().includes(ql));
    const followers = (SUEDE_MEMBERS || []).filter(p => (p.name + ' ' + p.handle).toLowerCase().includes(ql));
    const openBrand = (b: any) => { appState.brand = b; onRoute('brand'); };
    const openMember = (p: any, avatar: string) => {
      appState.member = { name: p.name, handle: p.handle, avatar, social: p.handle, bio: "I love to explore the brands and Fashion. It's my hobby.", measurements: p.m, followers: '30', reviews: String(p.reviews), inquiries: String(p.inquiries), brands: String(p.brands) };
      onRoute('member');
    };
    return (
      <div style={{ maxWidth: 1460, margin: '0 auto', padding: '28px 52px 0' }}>
        <button onClick={() => setView('profile')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to your profile
        </button>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{isBrandSide ? 'Brands You Follow' : 'Your Followers'}</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 48, color: 'var(--text-heading)', margin: 0 }}>
            {isFeed ? (isBrandSide ? 'Capsule Feed' : 'Collective Feed') : (isBrandSide ? `${m.brands} Brands` : `${m.followers} Followers`)}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: 0, maxWidth: 560 }}>
            {isFeed
              ? (isBrandSide ? 'The latest reviews and inquiries from the brands you follow.' : 'The latest reviews and inquiries from the members who follow you.')
              : (isBrandSide ? 'Every Capsule brand you follow. Tap any brand to view its page.' : 'Everyone following your fit and reviews. Tap a member to view their profile.')}
          </p>
        </header>

        {(() => {
          const Controls: any = SuedeControls || {};
          const SearchBar = Controls.SearchBar, Dropdown = Controls.Dropdown, CollapsibleToolbar = Controls.CollapsibleToolbar;
          if (!CollapsibleToolbar) return null;
          return (
            <CollapsibleToolbar align={isFeed ? 'space-between' : 'flex-end'}>
              <SearchBar value={feedQuery} onChange={setFeedQuery} placeholder={isFeed ? 'Search by brand' : (isBrandSide ? 'Search brands' : 'Search followers')} />
              {isFeed && <Dropdown label="Sort" value={feedSort} onChange={setFeedSort} options={[{ value: 'date', label: 'Latest' }, { value: 'high', label: 'Rating: High → Low' }, { value: 'low', label: 'Rating: Low → High' }, { value: 'az', label: 'Brand A → Z' }]} />}
            </CollapsibleToolbar>
          );
        })()}

        {isFeed ? (
          <React.Fragment>
            <div style={{ maxWidth: 460, margin: '24px auto 32px' }}>
              <Tabs items={[{ label: 'Reviews', value: 'reviews' }, { label: 'Inquiries', value: 'inquiries' }]} value={feedTab} onChange={setFeedTab} align="stretch" />
            </div>
            {feedTab === 'reviews' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, paddingBottom: 24 }}>
                {[...reviews].slice(0, 4).filter(r => r.brand.toLowerCase().includes(ql)).map((r, i) => <ReviewCard key={i} {...r} onSeeFull={() => openReview(r)} />)}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, paddingBottom: 24 }}>
                {(SUEDE_INQUIRIES || []).filter(it => it.brand.toLowerCase().includes(ql)).map((it, i) => <InquiryCard key={i} {...it} onOpen={() => { appState.inquiry = it; onRoute('inquiry'); }} />)}
              </div>
            )}
          </React.Fragment>
        ) : isBrandSide ? (
          followedBrands.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '54px 0', fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-heading)' }}>No brands found.</div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 28, paddingBottom: 28 }}>
            {followedBrands.map((b: any) => (
              <button key={b.name} onClick={() => openBrand(b)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '24px 20px', cursor: 'pointer', textAlign: 'center', transition: 'border-color var(--dur-fast) var(--ease-out)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--ink-900)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                <span style={{ width: 96, height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <img src={b.image} alt={b.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '0.02em', color: 'var(--text-heading)' }}>{b.name}</span>
                <StarRating value={b.rating} size={14} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-muted)' }}>{b.reviews} Reviews · {b.followers} Followers</span>
              </button>
            ))}
          </div>
          )
        ) : (
          followers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '54px 0', fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-heading)' }}>No followers found.</div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 28, paddingBottom: 28 }}>
            {followers.map((p: any, i: number) => {
              const avatar = avatarPool[i % avatarPool.length];
              return (
                <button key={p.handle} onClick={() => openMember(p, avatar)} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', cursor: 'pointer', textAlign: 'left', transition: 'border-color var(--dur-fast) var(--ease-out)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--ink-900)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                  <Avatar src={avatar} name={p.name} size="md" />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flex: 1 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>{p.handle} · {p.reviews} reviews</span>
                  </span>
                  <Icon name="chevron-right" size={16} color="var(--text-muted)" />
                </button>
              );
            })}
          </div>
          )
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* faint hanger watermark */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '28px 40px 0' }}>
        <button onClick={() => onRoute('collective')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to The Collective
        </button>

        {/* Header */}
        <div className="sd-yprof-card" style={{ position: 'relative', backgroundImage: 'linear-gradient(rgba(250,249,246,0.55), rgba(250,249,246,0.55)), url(/assets/imagery/suede-card-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-sm)', padding: '36px 40px' }}>
          <div className="sd-yprof-top" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <Avatar src={m.avatar} name={m.name} size={116} ring />
            <div className="sd-yprof-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="sd-yprof-namerow" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 22 }}>
                <div className="sd-yprof-nameblock" style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 38, lineHeight: 1.05, color: 'var(--text-heading)', margin: 0 }}>{m.name}</h1>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>{m.handle}</div>
                  <div className="sd-yprof-socials" style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}><Icon name="instagram" size={16} color="var(--text-secondary)" />{m.social}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}><Icon name="tiktok" size={16} color="var(--text-secondary)" />{m.social}</span>
                  </div>
                </div>
                <button aria-label="Edit profile" onClick={() => onRoute('editprofile')} className="sd-yprof-edit" style={{ width: 44, height: 44, flex: 'none', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-default)', background: 'var(--surface-card)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', transition: 'all var(--dur-fast) var(--ease-out)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ink-900)'; e.currentTarget.style.color = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--ink-900)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-card)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}>
                  <Icon name="pen" size={17} />
                </button>
              </div>
              <p className="sd-yprof-bio" style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '20px 0 0', maxWidth: 560 }}>{m.bio}</p>
              <div className="sd-yprof-measure" style={{ marginTop: 16 }}>
                <FullMeasureRow base={m.measurements} extra={m.fullMeasurements} sizes={m.usualSizes} />
              </div>
            </div>
          </div>

          {/* Stats — centered; Brands Followed & Followers drill into feeds */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <div className="sd-yprof-statrow" style={{ display: 'flex', justifyContent: 'center', gap: 64, paddingTop: 28, borderTop: '1px solid var(--border-subtle)', textAlign: 'center', width: '100%' }}>
              <YProfStat value={m.reviews} label="Reviews" />
              <YProfStat value={m.inquiries} label="Inquiries" />
              <YProfStat value={m.brands} label="Brands Followed" onValue={() => setView('brands')} links={[{ label: 'Capsule Feed', onClick: () => setView('capsulefeed') }]} />
              <YProfStat value={m.followers} label="Followers" onValue={() => setView('followers')} links={[{ label: 'Collective Feed', onClick: () => setView('collectivefeed') }]} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 32, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          <Tabs items={[{ label: 'Reviews', value: 'reviews' }, { label: 'Inquiries', value: 'inquiries' }]} value={tab} onChange={setTab} align="stretch" />
        </div>

        {/* Search & sort */}
        {(() => {
          const Controls: any = SuedeControls || {};
          const SearchBar = Controls.SearchBar, Dropdown = Controls.Dropdown, CollapsibleToolbar = Controls.CollapsibleToolbar;
          if (!CollapsibleToolbar) return null;
          return (
            <CollapsibleToolbar align="space-between">
              <SearchBar value={feedQuery} onChange={setFeedQuery} placeholder="Search by brand" />
              <Dropdown label="Sort" value={feedSort} onChange={setFeedSort} options={[{ value: 'date', label: 'Latest' }, { value: 'high', label: 'Rating: High → Low' }, { value: 'low', label: 'Rating: Low → High' }, { value: 'az', label: 'Brand A → Z' }]} />
            </CollapsibleToolbar>
          );
        })()}

        {/* Feed */}
        {(() => {
          const list = tab === 'reviews' ? feed : inquiries;
          if (list.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '56px 0 40px' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text-heading)', margin: '0 0 6px' }}>
                  {tab === 'reviews' ? "You haven't written any reviews yet." : "You haven't posted any inquiries yet."}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                  {tab === 'reviews' ? 'Share how something fit — help the community shop with confidence.' : 'Ask the community about fit before you buy.'}
                </p>
                <Button variant="primary" shape="pill" onClick={() => onRoute(tab === 'reviews' ? 'createreview' : 'createinquiry')}>
                  {tab === 'reviews' ? 'Write a Review' : 'Leave an Inquiry'}
                </Button>
              </div>
            );
          }
          return tab === 'reviews' ? (
            <div className="sd-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 28, paddingBottom: 20 }}>
              {feed.filter(r => r.brand.toLowerCase().includes(feedQuery.trim().toLowerCase())).map((r, i) => <ReviewCard key={i} {...r} hideMeasurements onSeeFull={() => openReview(r)} />)}
            </div>
          ) : (
            <div className="sd-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 28, paddingBottom: 20 }}>
              {inquiries.filter(it => it.brand.toLowerCase().includes(feedQuery.trim().toLowerCase())).map((it, i) => {
                return <InquiryCard key={i} {...it} hideMeasurements onOpen={() => { appState.inquiry = it; onRoute('inquiry'); }} />;
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
