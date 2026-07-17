-- ════════════════════════════════════════════════════════════════════
-- Suede — Capsule brand store URLs (powers the "Shop <brand>" button and
-- the outbound-click attribution). Clean canonical URLs only; the app adds
-- its own utm tags at click time. Idempotent (update by slug). Re-runnable.
-- ════════════════════════════════════════════════════════════════════
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
