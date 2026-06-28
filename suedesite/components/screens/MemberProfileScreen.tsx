'use client';
import React from 'react';
/* Suede — The Collective member profile page. */
import { Avatar, StarRating, Button, Tabs, Icon, ReviewCard, MeasurementSpec } from '@/components/ds';
import { SUEDE_REVIEWS, SUEDE_INQUIRIES } from '@/lib/data';
import { appState } from '@/lib/appState';
import { SuedeControls } from '@/lib/listControls';
import { FullMeasureRow } from '@/components/screens/FullMeasureRow';
import { InquiryCard } from '@/components/screens/LookbookScreen';

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
  const [tab, setTab] = React.useState('reviews');
  const [mQuery, setMQuery] = React.useState('');
  const [mSort, setMSort] = React.useState('date');
  const [following, setFollowing] = React.useState(false);
  const reviews = SUEDE_REVIEWS || [];
  const feed = [...reviews, ...reviews].slice(0, 2);
  const inqFeed = [...(SUEDE_INQUIRIES || [])].slice(0, 2);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 520, backgroundImage: 'url(/assets/imagery/hero-hangers.png)', backgroundRepeat: 'no-repeat', backgroundPosition: 'center -40px', backgroundSize: 'auto 88%', opacity: 0.06, pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '28px 40px 0' }}>
        <button onClick={() => onRoute('collective')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          <Icon name="arrow-left" size={16} color="var(--text-secondary)" /> Back to The Collective
        </button>

        {/* Header card */}
        <div style={{ backgroundImage: 'linear-gradient(rgba(250,249,246,0.55), rgba(250,249,246,0.55)), url(/assets/imagery/suede-card-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-sm)', padding: '36px 40px' }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
            <Avatar src={m.avatar} name={m.name} size={116} ring />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 22 }}>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 38, lineHeight: 1.05, color: 'var(--text-heading)', margin: 0 }}>{m.name}</h1>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>{m.handle}</div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}><Icon name="instagram" size={16} color="var(--text-secondary)" />{m.social}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}><Icon name="tiktok" size={16} color="var(--text-secondary)" />{m.social}</span>
                  </div>
                </div>
                <Button variant="ghost" trailingIcon={following ? 'check' : 'user-plus'} onClick={() => setFollowing(f => !f)}>{following ? 'Following' : 'Follow'}</Button>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-secondary)', margin: '20px 0 0', maxWidth: 560 }}>{m.bio}</p>
              <div style={{ marginTop: 16 }}>
                <FullMeasureRow base={m.measurements} extra={m.fullMeasurements || { 'Inseam': '30"', 'Shoulder Width': '16"', 'Arm Length': '23"', 'Torso Length': '24"' }} sizes={m.usualSizes || { 'Tops': ['M', '8'], 'Bottoms': ['M', '8'] }} />
              </div>
            </div>
          </div>

          {/* Stats — centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 64, paddingTop: 28, borderTop: '1px solid var(--border-subtle)', textAlign: 'center', width: '100%' }}>
              <MProfStat value={m.reviews} label="Reviews" />
              <MProfStat value={m.inquiries} label="Inquiries" />
              <MProfStat value={m.brands} label="Brands Followed" />
              <MProfStat value={m.followers} label="Followers" />
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 28, paddingBottom: 20 }}>
          {tab === 'reviews'
            ? feed.filter(r => r.brand.toLowerCase().includes(mQuery.trim().toLowerCase())).map((r, i) => <ReviewCard key={i} {...r} hideMeasurements onSeeFull={() => { appState.review = r; onRoute('review'); }} />)
            : inqFeed.filter(r => r.brand.toLowerCase().includes(mQuery.trim().toLowerCase())).map((r, i) => { return <InquiryCard key={i} {...r} hideMeasurements onOpen={() => { appState.inquiry = r; onRoute('inquiry'); }} />; })}
        </div>
      </div>
    </div>
  );
}
