'use client';
import React from 'react';
import { Icon } from '@/components/ds';
import { appState } from '@/lib/appState';

/* "Engage" sheet for a brand — Leave a Review / Leave an Inquiry. Opened from
   the pen icon on the Capsule directory cards and the brand detail card.
   Signed-out users get a locked button that routes to sign-in. */
export function ExploreModal({ brand, onClose, onRoute, authed }: any) {
  if (!brand) return null;
  const row = (icon: any, title: any, sub: any) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <Icon name={icon} size={22} color="var(--text-primary)" />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
  // Signed in: an active button that carries the brand into the form.
  // Signed out: a locked button that routes to sign-in.
  const engageBtn = (label: any, onClick: any) => (
    authed ? (
      <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--ink-900)', border: '1px solid var(--ink-900)', padding: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--white)' }}>
        {label}
      </button>
    ) : (
      <button onClick={() => onRoute('signin')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--surface-card)', border: '1px solid var(--border-default)', padding: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>
        <Icon name="lock" size={15} color="var(--text-muted)" />Sign in to {label.split(' ').pop()}
      </button>
    )
  );
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(20,18,15,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 420, maxWidth: '100%', background: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)', padding: '28px 32px 34px', position: 'relative' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 22, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
          <Icon name="close" size={22} />
        </button>
        <div style={{ height: 4 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {row('star', 'Leave a Review', 'Give a review to the Brand')}
          {engageBtn('Leave a Review', () => { onClose(); appState.reviewBrand = brand; onRoute('createreview'); })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
          {row('mail', 'Leave an Inquiry', 'Inquire about something')}
          {engageBtn('Leave an Inquiry', () => { onClose(); appState.inquiryBrand = brand; onRoute('createinquiry'); })}
        </div>
      </div>
    </div>
  );
}
