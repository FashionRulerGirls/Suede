import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F } from '../theme';
import { Eyebrow } from '../components/Marks';
import { MeasurementSpec, MatchPill, AvatarInitials } from '../components/Card';
import { reveal, fadeUp, sceneFade } from '../components/anim';

const MEMBERS = [
  { initials: 'AJ', name: 'Amara J.', handle: '@amaraj', h: `5'7"`, b: '34"', w: '27"', hip: '38"', score: 94 },
  { initials: 'PP', name: 'Priya P.', handle: '@priyap', h: `5'2"`, b: '32"', w: '26"', hip: '35"', score: 88, conf: 'medium' as const },
  { initials: 'SC', name: 'Sasha C.', handle: '@sashac', h: `5'9"`, b: '36"', w: '29"', hip: '40"', score: 91 },
];

const MemberCard: React.FC<{ m: (typeof MEMBERS)[number]; p: number }> = ({ m, p }) => (
  <div
    style={{
      ...fadeUp(p, 40),
      width: 860,
      background: C.white,
      border: `1px solid ${C.hair}`,
      boxShadow: '0 26px 60px rgba(20,18,15,0.10)',
      padding: '30px 36px',
      display: 'flex',
      alignItems: 'center',
      gap: 26,
    }}
  >
    <AvatarInitials initials={m.initials} size={96} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 50, color: C.ink800, lineHeight: 1.05 }}>
        {m.name}
      </div>
      <div style={{ fontFamily: F.meta, fontWeight: 600, fontSize: 24, letterSpacing: '0.06em', color: C.muted }}>
        {m.handle}
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
      <MeasurementSpec height={m.h} bust={m.b} waist={m.w} hips={m.hip} />
      <MatchPill score={m.score} confidence={m.conf ?? 'high'} />
    </div>
  </div>
);

export const CollectiveScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, dur), alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>
        <div style={{ ...fadeUp(reveal(frame, 4, 16)), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <Eyebrow>The Collective</Eyebrow>
          <div
            style={{
              fontFamily: F.serif,
              fontWeight: 400,
              fontSize: 76,
              lineHeight: 1.06,
              textAlign: 'center',
              color: C.ink,
              maxWidth: 860,
            }}
          >
            Reviews from people
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 500 }}>shaped like you.</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {MEMBERS.map((m, i) => (
            <MemberCard key={m.handle} m={m} p={reveal(frame, 34 + i * 22, 20)} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
