import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { C, F } from '../theme';
import { Eyebrow } from '../components/Marks';
import { MeasurementSpec } from '../components/Card';
import { ease, reveal, fadeUp, sceneFade } from '../components/anim';

export const MatchScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const target = 94;
  const prog = interpolate(frame, [12, 66], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const value = Math.round(prog * target);

  const size = 520;
  const stroke = 8;
  const r = size / 2 - stroke;
  const circ = 2 * Math.PI * r;
  const fillFrac = (prog * target) / 100;

  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, dur), alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46 }}>
        <div style={{ ...fadeUp(reveal(frame, 4, 16)) }}>
          <Eyebrow>Suede Match</Eyebrow>
        </div>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.hair} strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={C.green}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - fillFrac)}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: F.serif,
              fontWeight: 400,
              fontSize: 210,
              color: C.ink,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
            <span style={{ fontSize: 96, marginLeft: 6, alignSelf: 'flex-start', marginTop: 40, color: C.muted }}>%</span>
          </div>
        </div>
        <div style={{ ...fadeUp(reveal(frame, 40, 20)) }}>
          <MeasurementSpec height={`5'7"`} bust={`34"`} waist={`27"`} hips={`38"`} size={30} />
        </div>
        <div
          style={{
            ...fadeUp(reveal(frame, 52, 20)),
            fontFamily: F.serif,
            fontWeight: 400,
            fontSize: 52,
            lineHeight: 1.25,
            textAlign: 'center',
            color: C.ink600,
            maxWidth: 760,
          }}
        >
          We pair you with reviewers who
          <br />
          share your measurements.
        </div>
      </div>
    </AbsoluteFill>
  );
};
