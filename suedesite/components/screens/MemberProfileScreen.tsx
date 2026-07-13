'use client';
import React from 'react';
/* Suede — The Collective member profile page. */
import { Avatar, StarRating, Button, Tabs, Icon, ReviewCard, MeasurementSpec } from '@/components/ds';
import { SUEDE_REVIEWS, SUEDE_INQUIRIES } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';
import { FullMeasureRow } from '@/components/screens/FullMeasureRow';
import { InquiryCard } from '@/components/screens/LookbookScreen';
import { useAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { isFollowingMember, setMemberFollow, loadMemberProfile, loadMemberReviews, loadMemberInquiries } from '@/lib/contentData';

function MProfStat({ value, label }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 130 }}>
      <span style={{ fontFamily: 'var(--font-meta)', fontWeight: 500, fontSize: 30, lineHeight: 1, color: 'var(--text-heading)' }}>{value}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

export function MemberProfileScreen({ onRoute }: any) {
  const m = appState.member || {
    name: 'Amara K.', handle: '@amara', avatar: '/assets/avatars/avatar-rose.jpg',
    social: '@amara_k', bio: "I love to explore the brands and Fashion. It's my hobbyy.",
    measurements: { height: "5'7\"", bust: '34"', waist: '26"', hips: '36"' },
    followers: '30', reviews: '24', inquiries: '12', brands: '8',
  };
  const { user } = useAuth();
  const memberId = m.id; // present only for a real member (from the DB)
  const [tab, setTab] = React.useState('reviews');
  const [mQuery, setMQuery] = React.useState('');
  const [mSort, setMSort] = React.useState('date');
  const [following, setFollowing] = React.useState(false);
  const [realProf, setRealProf] = React.useState<any>(null);
  const [realReviews, setRealReviews] = React.useState<any[] | null>(null);
  const [realInquiries, setRealInquiries] = React.useState<any[] | null>(null);
  React.useEffect(() => {
    const sb = createClient();
    if (!sb || !user || !memberId) return;
    let active = true;
    isFollowingMember(sb, user.id, memberId).then((f) => { if (active) setFollowing(f); }).catch(() => {});
    loadMemberProfile(sb, memberId, user.id).then((p) => { if (active) setRealProf(p); }).catch(() => {});
    loadMemberReviews(sb, memberId, user.id).then((r) => { if (active) setRealReviews(r); }).catch(() => { if (active) setRealReviews([]); });
    loadMemberInquiries(sb, memberId, user.id).then((r) => { if (active) setRealInquiries(r); }).catch(() => { if (active) setRealInquiries([]); });
    return () => { active = false; };
  }, [user?.id, memberId]);
  // For a real member, present live profile data (measurements, counts, feed).
  const rp = realProf;
  const disp = rp ? {
    ...m,
    name: rp.name, handle: rp.handle, avatar: rp.avatar, bio: rp.bio, social: rp.social,
    measurements: { height: rp.measurements.height, bust: rp.measurements.bust, waist: rp.measurements.waist, hips: rp.measurements.hips },
    fullMeasurements: { 'Inseam': rp.measurements.inseam, 'Shoulder Width': rp.measurements.shoulder, 'Arm Length': rp.measurements.arm, 'Torso Length': rp.measurements.torso },
    usualSizes: rp.measurements.usual_sizes || {},
    followers: rp.followers, reviews: rp.reviews, inquiries: rp.inquiries, brands: rp.followingCount,
  } : m;
  const toggleFollow = async () => {
    const on = !following;
    setFollowing(on);
    const sb = createClient();
    if (!sb || !user || !memberId) return; // demo/mock member — local toggle only
    if (user.id === memberId) { setFollowing(false); return; } // can't follow yourself
    try { await setMemberFollow(sb, user.id, memberId, on); }
    catch { setFollowing(!on); }
  };
  const reviews = SUEDE_REVIEWS || [];
  const feed = memberId ? (realReviews || []) : [...reviews, ...reviews].slice(0, 2);
  const inqFeed = memberId ? (realInquiries || []) : [...(SUEDE_INQUIRIES || [])].slice(0, 2);
  const feedLoading = !!memberId && (tab === 'reviews' ? realReviews === null : realInquiries === null);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '28px 40px 0' }}>
        <button onClick={() => onRoute('collective')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to The Collective
        </button>

        {/* Header card */}
        <div className="sd-mprof-card" style={{ position: 'relative', backgroundImage: 'linear-gradient(rgba(250,249,246,0.55), rgba(250,249,246,0.55)), url(/assets/imagery/suede-card-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-sm)', padding: '36px 40px' }}>
          <div className="sd-mprof-top" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <Avatar src={disp.avatar} name={disp.name} size={116} ring />
            <div className="sd-mprof-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="sd-mprof-namerow" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 22 }}>
                <div className="sd-mprof-nameblock" style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 38, lineHeight: 1.05, color: 'var(--text-heading)', margin: 0 }}>{disp.name}</h1>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>{disp.handle}</div>
                  <div className="sd-mprof-socials" style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                    {(!rp || rp.instagram) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}><Icon name="instagram" size={16} color="var(--text-secondary)" />{rp ? (rp.instagram || disp.social) : disp.social}</span>}
                    {(!rp || rp.tiktok) && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}><Icon name="tiktok" size={16} color="var(--text-secondary)" />{rp ? (rp.tiktok || disp.social) : disp.social}</span>}
                  </div>
                </div>
                {(!rp || (user && user.id !== memberId)) && <span className="sd-mprof-action"><Button variant="ghost" trailingIcon={following ? 'check' : 'user-plus'} onClick={toggleFollow}>{following ? 'Following' : 'Follow'}</Button></span>}
              </div>
              <p className="sd-mprof-bio" style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '20px 0 0', maxWidth: 560 }}>{disp.bio}</p>
              <div className="sd-mprof-measure" style={{ marginTop: 16 }}>
                <FullMeasureRow base={disp.measurements} extra={rp ? disp.fullMeasurements : (disp.fullMeasurements || { 'Inseam': '30"', 'Shoulder Width': '16"', 'Arm Length': '23"', 'Torso Length': '24"' })} sizes={rp ? disp.usualSizes : (disp.usualSizes || { 'Tops': ['M', '8'], 'Bottoms': ['M', '8'] })} />
              </div>
            </div>
          </div>

          {/* Stats — centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <div className="sd-mprof-stats" style={{ display: 'flex', justifyContent: 'center', gap: 64, paddingTop: 28, borderTop: '1px solid var(--border-subtle)', textAlign: 'center', width: '100%' }}>
              <MProfStat value={disp.reviews} label="Reviews" />
              <MProfStat value={disp.inquiries} label="Inquiries" />
              <MProfStat value={disp.brands} label="Brands Followed" />
              <MProfStat value={disp.followers} label="Followers" />
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
              <SearchBar value={mQuery} onChange={setMQuery} placeholder="Search by brand" />
              <Dropdown label="Sort" value={mSort} onChange={setMSort} options={[{ value: 'date', label: 'Latest' }, { value: 'high', label: 'Rating: High → Low' }, { value: 'low', label: 'Rating: Low → High' }, { value: 'az', label: 'Brand A → Z' }]} />
            </CollapsibleToolbar>
          );
        })()}

        {/* Feed */}
        {feedLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>Loading…</div>
        ) : (() => {
          const q = mQuery.trim().toLowerCase();
          const list = (tab === 'reviews' ? feed : inqFeed).filter((r: any) => (r.brand || '').toLowerCase().includes(q));
          if (list.length === 0) {
            return <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-heading)' }}>{tab === 'reviews' ? 'No reviews yet.' : 'No inquiries yet.'}</div>;
          }
          return (
            <div className="sd-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 28, paddingBottom: 20 }}>
              {tab === 'reviews'
                ? list.map((r: any, i: number) => <ReviewCard key={r.id || i} {...r} hideMeasurements onSeeFull={() => { appState.review = r; onRoute('review'); }} />)
                : list.map((r: any, i: number) => <InquiryCard key={r.id || i} {...r} hideMeasurements onOpen={() => { appState.inquiry = r; onRoute('inquiry'); }} />)}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
