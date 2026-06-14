import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const BRANDS = ["Meji Meji", "Nadi", "Starfish", "Bubon"];
const MARQUEE = "Curated collection of minority-owned and slow fashion brands that deserve your attention";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="bg-[#F8F7F2] text-[#0d0d0d] font-body">
      <header className="w-full px-6 md:px-0 py-5">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" aria-label="Suede home" className="flex items-center">
            <img src="/suede-mark.svg" alt="Suede" className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-5">
            <button className="hidden md:flex items-center gap-1 text-[13px] tracking-wide hover:opacity-70">
              Suede for Business
              <span aria-hidden className="text-[10px]">&#9662;</span>
            </button>
            <span aria-hidden className="hidden md:inline text-[18px]">&#8981;</span>
            {user ? (
              <div className="flex items-center gap-3 text-[13px]">
                <Link href="/profile" className="hover:opacity-70">Your profile</Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="rounded-full bg-[#000000] px-4 py-2 text-white text-[13px]">Sign out</button>
                </form>
              </div>
            ) : (
              <div className="flex items-center rounded-full border border-[#0d0d0d] bg-[#000000] p-0.5">
                <Link href="/auth/login" className="rounded-full px-4 py-1.5 text-[13px] text-white hover:bg-white/10">Sign in</Link>
                <Link href="/auth/signup" className="rounded-full bg-[#A2A2A2] px-4 py-1.5 text-[13px] text-white">Create Account</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="relative flex min-h-[82vh] flex-col justify-center overflow-hidden bg-[#F8F6F3] px-6 md:px-0">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-start justify-center gap-16 pt-24 opacity-[0.45]">
          {[0,1,2].map((i) => (
            <svg key={i} viewBox="0 0 200 120" fill="none" className="w-40 md:w-56">
              <path d="M100 8c-9 0-16 6-16 15 0 7 5 11 11 13L100 40" stroke="#9a958b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M100 40 12 104h176L100 40z" stroke="#9a958b" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          ))}
        </div>
        <div className="relative z-10 container mx-auto">
          <div className="flex items-center gap-4 text-[11px] tracking-[0.26em] text-[#4b4b4b]">
            <span>THE TRUST LAYER FOR FASHION</span>
            <span className="text-[#a0a0a0]">EST 2026</span>
          </div>
          <h1 className="font-display mt-4 max-w-[16ch] text-[clamp(40px,7vw,82px)] leading-[1.02] font-medium">
            Stop shopping blind. Start shopping with intent.
          </h1>
          <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-[#4b4b4b]">
            Real reviews from real bodies, ranked for your measurement match. Discover emerging brands worth your attention.
          </p>
          <Link href="/the-lookbook" className="mt-8 inline-block border-b border-[#0d0d0d] pb-1 text-[11px] tracking-[0.18em] uppercase">
            Leave a Review
          </Link>
        </div>
        <div className="relative z-10 container mx-auto mt-16">
          <nav className="grid grid-cols-2 border-t border-[#e4e0d7] text-center md:grid-cols-4">
            {[["The Capsule","/the-capsule"],["The Lookbook","/the-lookbook"],["The Collective","/the-collective"]].map(([t,h]) => (
              <Link key={t} href={h} className="border-b border-[#e4e0d7] px-2 py-5 text-[12px] tracking-[0.2em] uppercase hover:bg-[#efece4] md:border-l md:border-b-0 first:md:border-l-0">{t}</Link>
            ))}
            <span className="flex flex-col items-center gap-1 border-b border-[#e4e0d7] px-2 py-5 text-[12px] tracking-[0.2em] uppercase text-[#a0a0a0] md:border-l md:border-b-0">
              The Consign <span className="text-[9px]">Coming Soon</span>
            </span>
          </nav>
        </div>
      </section>

      <section className="flex h-16 items-center overflow-hidden bg-[#000000] text-white sm:h-20">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[0,1].map((k) => (
            <span key={k} className="flex">
              {[0,1,2].map((j) => (
                <span key={j} className="mx-8 text-[12px] tracking-[0.2em] uppercase">{MARQUEE}</span>
              ))}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-[#F8F6F3] py-16 md:py-20">
        <div className="container mx-auto px-6">
          <h2 className="mb-10 text-center text-[12px] tracking-[0.24em] uppercase">Browse Capsule Brands</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {BRANDS.map((b) => (
              <Link key={b} href="/the-capsule" className="block">
                <div className="aspect-[3/4] w-full bg-[#e9e5dc] bg-cover bg-top" style={{ backgroundImage: "url(/brand-photo.jpg)" }} />
                <div className="mt-3 text-center text-[11px] tracking-[0.2em] uppercase">{b}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6">
        <div className="grid items-center gap-10 border-t border-[#e4e0d7] py-16 md:grid-cols-2 md:gap-16">
          <div>
            <span className="text-[11px] tracking-[0.26em] uppercase text-[#4b4b4b]">How it works</span>
            <h3 className="font-display mt-3 text-[34px] font-medium">The Lookbook</h3>
            <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-[#4b4b4b]">Browse reviews to understand fit, quality, and brand experience. Respond to inquiries to share your own.</p>
            <div className="mt-6 flex gap-6 text-[11px] tracking-[0.18em] uppercase">
              <Link href="/the-lookbook" className="border-b border-[#0d0d0d] pb-1">Reviews</Link>
              <Link href="/the-lookbook" className="border-b border-[#0d0d0d] pb-1">Inquiries</Link>
            </div>
          </div>
          <div className="aspect-[4/3] w-full bg-[#ece8df]" />
        </div>

        <div className="grid items-center gap-10 bg-[#000000] px-6 py-16 text-white md:grid-cols-2 md:gap-16 md:px-12">
          <div className="aspect-[4/3] w-full bg-[#2a2925] md:order-1" />
          <div className="md:order-2">
            <span className="text-[11px] tracking-[0.26em] uppercase text-[#a0a0a0]">How it works</span>
            <h3 className="font-display mt-3 text-[34px] font-medium">The Collective</h3>
            <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-[#b8b3a8]">Connect with your Suede match based on real measurements and fashion preferences.</p>
            <div className="mt-6 flex gap-6 text-[11px] tracking-[0.18em] uppercase">
              <Link href="/the-collective" className="border-b border-white pb-1">Find members</Link>
              <Link href="/profile" className="border-b border-white pb-1">Create your profile</Link>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-[#f8f7f1] px-6 py-16 text-[#151515] md:px-12 md:py-20">
        <div className="container mx-auto">
          <div className="grid items-start gap-10 md:grid-cols-[0.85fr_1fr] lg:gap-16">
            <h2 className="font-display text-[40px] leading-tight font-medium">Don&rsquo;t know your body measurements?</h2>
            <div>
              <p className="mb-2 text-[12px] tracking-[0.18em] uppercase text-[#4b4b4b]">Select one of the following options:</p>
              {[
                ["AI Body Measurement Quiz","Answer a few quick questions, get directional measurements. (~90 sec)","Recommended"],
                ["Self-Guided Measurement Consultation","Step-by-step chat guide to measuring yourself at home. Measuring tape required. (~5 min)","~5 min"],
                ["I Know My Measurements","Complete your Suede profile.","Fastest"],
              ].map(([n,d,t]) => (
                <div key={n} className="flex items-baseline justify-between gap-5 border-t border-[#e4e0d7] py-5 last:border-b">
                  <div>
                    <div className="font-display text-[22px]">{n}</div>
                    <div className="mt-1 max-w-[44ch] text-[13px] text-[#4b4b4b]">{d}</div>
                  </div>
                  <span className="whitespace-nowrap text-[10px] tracking-[0.16em] uppercase text-[#a0a0a0]">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#F8F7F2] px-6 py-10 text-[#0d0d0d] sm:px-10 lg:px-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            <div className="col-span-2 sm:col-span-1">
              <img src="/suede-mark.svg" alt="Suede" className="h-16 w-auto object-contain" />
            </div>
            <FooterCol title="About"><a href="/about">About Us</a><a href="/privacy">Privacy</a></FooterCol>
            <FooterCol title="Suede for Business"><a href="/brand/apply">Apply</a><a href="/brand/login">Brand Portal</a></FooterCol>
            <FooterCol title="Suggest"><a href="/suggest">Suggest a Brand</a></FooterCol>
            <div className="flex flex-col lg:col-span-2">
              <span className="text-[13px] font-semibold">Navigate</span>
              <ul className="mt-2 flex flex-col gap-2 text-[13px] text-[#4b4b4b]">
                <li><a href="/the-capsule">The Capsule | Brand Directory</a></li>
                <li><a href="/the-lookbook">The Lookbook | Review Feed</a></li>
                <li><a href="/the-collective">The Collective | Member Discovery</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
            <div className="w-full max-w-md">
              <label className="text-[13px] font-medium">Sign up for our Newsletter | Per Suede</label>
              <div className="mt-4 flex items-center border-b border-[#0d0d0d] pb-2">
                <input placeholder="Email address" aria-label="Email address" className="w-full bg-transparent text-[14px] outline-none" />
              </div>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-[13px] font-semibold">Let&rsquo;s Connect!</p>
              <a href="mailto:info@suedecapsule.com" className="mt-2 block text-[13px] text-[#4b4b4b] hover:opacity-65">info@suedecapsule.com</a>
            </div>
          </div>

          <div className="mt-8 mb-2">
            <img src="/suede-wordmark.svg" alt="Suede" className="h-auto w-full max-w-[300px] object-contain" />
          </div>
          <div className="mt-2 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-[12px] font-medium text-[#4b4b4b]">Suede LLC</p>
            <a href="https://instagram.com/suedecapsule" className="text-[13px] font-semibold hover:opacity-65">@suedecapsule</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, children }) {
  return (
    <div className="flex flex-col">
      <span className="text-[13px] font-semibold">{title}</span>
      <ul className="mt-2 flex flex-col gap-2 text-[13px] text-[#4b4b4b]">
        {Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : <li>{children}</li>}
      </ul>
    </div>
  );
}
