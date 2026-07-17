-- ════════════════════════════════════════════════════════════════════
-- Suede — brand seed (mirrors lib/data.ts). Ratings/follower counts are NOT
-- seeded: those now come from real reviews via the brand_stats view, so every
-- brand starts at 0 until real activity arrives. Re-runnable.
-- ════════════════════════════════════════════════════════════════════

insert into brands (slug, name, tagline, founder, founded_year, category, location, social, hero_image_url, is_capsule, status)
values
  ('kai-collective', 'Kai Collective', 'London-based contemporary brand intentionally crafted to make women feel their most confident.', 'Founded by Fisayo Longe, sharp tailoring with gold-hardware drama.', '2016', 'Womenswear', 'London, UK', '@kaicollective', '/assets/models/kai-collective.png', true, 'active'),
  ('nadi', 'Nadi', 'Designed for women who value quality, presence, and self-expression, NADI is not about fast fashion or fleeting trends.', 'Founded by Aya Okonkwo, blending West African textiles with modern silhouettes.', '2019', 'Womenswear', 'Brooklyn, NY', '@nadibydani', '/assets/models/nadi.png', true, 'active'),
  ('meji-meji', 'Meji Meji', 'Creating a world where every narrative is not only acknowledged but celebrated, interwoven into the very fabric of our collective journey.', 'Founded by Meji Alabi, fluid jersey draping and asymmetry.', '2018', 'Womenswear', 'Lagos, NG', '@mejimeji', '/assets/models/meji-meji.png', true, 'active'),
  ('kairos', 'Kairos', 'Drawing inspiration from kairos—the perfect, opportune moment—our creations are designed for those who seize life’s most meaningful occasions with confidence and style.', 'Founded by Tunde Bakare, suede separates in earthen tones.', '2020', 'Womenswear', 'Accra, GH', '@kairos', '/assets/models/kairos.png', true, 'active'),
  ('bupbes', 'Bupbes', 'From the Vietnamese “búp bê” (dolls) — created to make each girl’s world her own doll house, where she is the main character.', 'Founded by Bupe Mwamba, sculptural corsetry and peplum tailoring.', '2017', 'Womenswear', 'Lusaka, ZM', '@bupbes', '/assets/models/bupbes.png', true, 'active'),
  ('nysama', 'Nysama', 'Elevated resort wear for wherever the day takes you, sunrise to sunset, cocktails to midnight.', 'Founded by Nysa Mensah, elevated resort wear sunrise to sunset.', '2021', 'Womenswear', 'Paris, FR', '@nysama', '/assets/models/nysama.png', true, 'active'),
  ('bubon', 'Bubon', 'Offering a range of unique, original and innovative pieces, Bubon’s designs are inspired by nurturing the art of dressing.', 'Founded by Bubon Atelier, deconstructed knit and denim.', '2019', 'Unisex', 'Berlin, DE', '@bubon', '/assets/models/bubon.png', true, 'active'),
  ('tofe', 'Tofe', 'Bridging timeless elegance and fearless edge, with each piece crafted to inspire confidence, strength, and a sense of daring.', 'Founded by Tofe Adeyemi, bias-cut column dresses in saturated colour.', '2018', 'Womenswear', 'New York, NY', '@tofe', '/assets/models/tofe.png', true, 'active'),
  ('starfish-mrkt', 'Starfish Mrkt', 'This is placeholder text for Starfish Mrkt — outreach pending. We would love Starfish featured in our first drop.', null, null, 'Womenswear', null, '@starfishmrkt', '/assets/models/starfish.png', true, 'outreach_pending'),
  ('lanje', 'Lanje', 'Brand profile coming soon — we’d love Lanje featured in an upcoming drop.', null, null, 'Womenswear', null, '@lanje', '/assets/models/lanje.png', true, 'outreach_pending'),
  ('muse-brnd', 'Muse Brnd', 'MUSE BRND creates a harmonious composition on fabric that intertwines streetwear and lux.', null, null, 'Womenswear', null, '@musebrnd', '/assets/models/musebrnd.png', true, 'outreach_pending'),
  ('coucoo', 'Coucoo', 'The Coucoo experience aims to help every woman feel like the most empowered, confident version of themselves.', null, null, 'Womenswear', null, '@coucoo', '/assets/models/coucoo.png', true, 'outreach_pending'),
  ('local-european', 'Local European', 'We’re building a world of elegance and practicality created for those who value ease, repeat wear, and intentional dressing.', null, null, 'Womenswear', null, '@localeuropean', '/assets/models/localeuropean.png', true, 'outreach_pending'),
  ('akino', 'Akino', 'Akino is an evolving capsule of statement day-to-night pieces for our city girl.', null, null, 'Womenswear', null, '@akino', '/assets/models/akino.png', true, 'outreach_pending'),
  ('the-ekhator-label', 'The Ekhator Label', 'We wanted to touch on this piece to pay homage to our African roots, inspired by the working class back home who used baskets for their day-to-day work.', null, null, 'Womenswear', null, '@theekhatorlabel', '/assets/models/ekhator.png', true, 'outreach_pending'),
  ('constructed-for-women', 'Constructed for Women', 'Bringing fresh perspectives and bold expressions in the world of fashion is our foundation.', null, null, 'Womenswear', null, '@constructedforwomen', '/assets/models/constructedforwomen.png', true, 'outreach_pending')
on conflict (slug) do nothing;

-- Capsule brand store URLs (see migration 0015). Set after the insert so a
-- fresh seed has them; safe to re-run.
update brands set shop_url = 'https://kaicollective.com/'      where slug = 'kai-collective';
update brands set shop_url = 'https://nadibydani.com/'         where slug = 'nadi';
update brands set shop_url = 'https://mejimeji.co/'            where slug = 'meji-meji';
update brands set shop_url = 'https://kairoswear.co/'          where slug = 'kairos';
update brands set shop_url = 'https://bupbes.com/'             where slug = 'bupbes';
update brands set shop_url = 'https://nysama.com/'             where slug = 'nysama';
update brands set shop_url = 'https://bubon.co/'               where slug = 'bubon';
update brands set shop_url = 'https://www.tofecol.com/'        where slug = 'tofe';
update brands set shop_url = 'https://starfishmrkt.com/'       where slug = 'starfish-mrkt';
update brands set shop_url = 'https://bylanje.co/'             where slug = 'lanje';
update brands set shop_url = 'https://musebrnd.com/'           where slug = 'muse-brnd';
update brands set shop_url = 'https://coucoo.io/'              where slug = 'coucoo';
update brands set shop_url = 'https://localeuropean.com/'      where slug = 'local-european';
update brands set shop_url = 'https://akino.ai/'               where slug = 'akino';
update brands set shop_url = 'https://www.thekhatorlabel.com/' where slug = 'the-ekhator-label';
update brands set shop_url = 'https://constructedforwomen.com/' where slug = 'constructed-for-women';
