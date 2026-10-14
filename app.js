/* Swim Feels — splashes on the hero water, a swimmer that follows the scroll, plan builder from the real price list */
(() => {
  'use strict';
  const M = window.Motion || { $: (s, r = document) => r.querySelector(s), $$: (s, r = document) => Array.from(r.querySelectorAll(s)), motion: false, fine: false, reduce: true, ready: (f) => f(), onScroll: [], toast() {} };
  const { $, $$ } = M;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* Splashes */
  const cv = $('#splash');
  if (cv && cv.getContext && M.motion) {
    const ctx = cv.getContext('2d');
    const drops = [];
    let W = 0, H = 0, raf = 0, last = 0, visible = true;
    const hero = $('.hero');
    const size = () => { const dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const splash = (x, y, n = 18) => { for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6; const v = 160 + Math.random() * 320; drops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 2 + Math.random() * 4, life: 0 }); } if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    const tick = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000 || 0.016); last = now;
      ctx.clearRect(0, 0, W, H);
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life += dt;
        if (d.y > H + 20 || d.life > 2) { drops.splice(i, 1); continue; }
        ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * (1 - d.life / 2)).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.3); ctx.fill();
      }
      raf = drops.length ? requestAnimationFrame(tick) : 0;
      if (!drops.length) ctx.clearRect(0, 0, W, H);
    };
    size();
    addEventListener('resize', size);
    let lx = -99;
    cv.addEventListener('pointerdown', (e) => { const b = cv.getBoundingClientRect(); splash(e.clientX - b.left, e.clientY - b.top, 22); });
    cv.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const b = cv.getBoundingClientRect(); const x = e.clientX - b.left; if (Math.abs(x - lx) > 60) { lx = x; splash(x, e.clientY - b.top, 5); } });
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(hero);
    M.ready(() => setTimeout(() => splash(W * 0.3, H * 0.4, 14), 700));
  }

  /* Path scene */
  const scene = $('#path'), steps = $$('#pa-steps li'), shots = $$('#pa-shots .sh'), sw = $('#swimmer-el'), lanes = $('#lanes'), mEl = $('#pa-m');
  if (scene && steps.length && M.motion && sw && lanes) {
    let idx = -1;
    const upd = () => {
      const r = scene.getBoundingClientRect(), span = scene.offsetHeight - innerHeight;
      const p = clamp(span > 0 ? -r.top / span : 0);
      const lw = lanes.clientWidth - sw.clientWidth - 8;
      const wave = Math.sin(p * 40) * 6;
      sw.style.transform = 'translate(' + (4 + p * lw).toFixed(1) + 'px,' + wave.toFixed(1) + 'px)';
      const i = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      if (i === idx) return;
      idx = i;
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      shots.forEach((s, k) => s.classList.toggle('is-on', k === i % shots.length));
      if (mEl) mEl.textContent = i + 1;
    };
    M.onScroll.push(upd); upd();
  }

  /* Plan builder (prices: price lists in the 2GIS card) */
  const form = $('#plan-form');
  if (form) {
    const G = {
      mama: { n: 'Мама и малыш (до 1 года)', d: '30 минут', std: { 5: 35000, 8: 54000 }, pre: { 8: 68000 }, trial: 8000 },
      mini: { n: 'Мини-группы (4–5 лет)', d: '30 минут', std: { 8: 54000 }, pre: { 8: 68000 }, trial: 8000 },
      kids: { n: 'Дети (6–13 лет)', d: '45 минут', std: { 8: 37000, 12: 48000 }, pre: { 8: 46000, 12: 60500 }, trial: 6000 },
      well: { n: 'Оздоровительное плавание (от 6 лет)', d: '90 минут', std: { 8: 54000 }, pre: { 8: 68000 }, trial: 8000 },
      teen: { n: 'Подростки (14–17 лет)', d: '45 минут', std: { 8: 39000, 12: 52000 }, pre: { 8: 48500, 12: 65000 }, trial: 6500 },
      adult: { n: 'Взрослые (18+)', d: '45 минут', std: { 8: 40000, 12: 54000 }, pre: { 8: 48000, 12: 66000 }, trial: 8000 },
      team: { n: 'Сборная команда', d: '', std: { 16: 52000 }, pre: {}, trial: 0 },
    };
    const S = {
      baby: { n: 'Грудничковое плавание (0+)', d: '30 минут', opts: { 'Один': [80000, 10000] } },
      kid: { n: 'Дети (6–17 лет)', d: '45 минут', opts: { 'Один': [90000, 12000], 'Дуэт': [130000, 16500], 'Трио': [176000, 22000] } },
      adult: { n: 'Взрослые (18+)', d: '45 минут', opts: { 'Один': [90000, 12000], 'Дуэт': [145000, 20000], 'Трио': [185000, 25000] } },
    };
    const F = { one: ['Разовое посещение', 4000, 1], eight: ['8 занятий', 29000, 8], twelve: ['12 занятий', 39000, 12] };
    const $who = $('#who'), $count = $('#count'), $tier = $('#tier'), gCount = $('#g-count'), gTier = $('#g-tier');
    const sumEl = $('#sum'), title = $('#q-title'), sub = $('#q-sub'), trial = $('#q-trial'), wa = $('#q-wa'), plan = $('#book-plan');
    const st = { fmt: 'group', who: 'adult', count: '8', tier: 'std' };
    let shown = 0, raf = 0;
    const anim = (to) => {
      cancelAnimationFrame(raf);
      if (!M.motion) { shown = to; sumEl.textContent = fmt(to); return; }
      const from = shown, t0 = performance.now();
      const step = (now) => { const k = Math.min(1, (now - t0) / 520), e = 1 - Math.pow(1 - k, 3); shown = from + (to - from) * e; sumEl.textContent = fmt(shown); if (k < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    const chip = (host, name, val, label, on) => {
      const l = document.createElement('label'); l.className = 'chip';
      const i = document.createElement('input'); i.type = 'radio'; i.name = name; i.value = val; i.checked = on;
      const s = document.createElement('span'); s.textContent = label;
      l.append(i, s); host.appendChild(l);
    };
    const rebuild = () => {
      $who.innerHTML = ''; $count.innerHTML = ''; $tier.innerHTML = '';
      gCount.hidden = false; gTier.hidden = false;
      if (st.fmt === 'group') {
        if (!G[st.who]) st.who = 'adult';
        Object.keys(G).forEach((k) => chip($who, 'who', k, G[k].n.replace(/ \(.*/, ''), k === st.who));
        const g = G[st.who]; const counts = Object.keys(g.std);
        if (!counts.includes(st.count)) st.count = counts[0];
        counts.forEach((c) => chip($count, 'count', c, c + ' занятий', c === st.count));
        const hasPre = g.pre && g.pre[st.count];
        if (st.tier === 'pre' && !hasPre) st.tier = 'std';
        chip($tier, 'tier', 'std', 'Стандарт', st.tier === 'std');
        if (hasPre) chip($tier, 'tier', 'pre', 'Премиум', st.tier === 'pre');
        gTier.hidden = !hasPre && Object.keys(g.pre).length === 0 && false;
      } else if (st.fmt === 'solo') {
        if (!S[st.who]) st.who = 'adult';
        Object.keys(S).forEach((k) => chip($who, 'who', k, S[k].n.replace(/ \(.*/, '') + (k === 'baby' ? ' 0+' : k === 'kid' ? ' 6–17' : ' 18+'), k === st.who));
        const o = Object.keys(S[st.who].opts);
        if (!o.includes(st.count)) st.count = o[0];
        o.forEach((c) => chip($count, 'count', c, c === 'Один' ? 'Один человек' : c, c === st.count));
        gCount.querySelector('legend').textContent = 'Состав';
        gTier.hidden = true;
      } else {
        if (!F[st.who]) st.who = 'eight';
        Object.keys(F).forEach((k) => chip($who, 'who', k, F[k][0], k === st.who));
        gCount.hidden = true; gTier.hidden = true;
      }
      if (st.fmt !== 'solo') gCount.querySelector('legend').textContent = 'Сколько занятий';
      $('legend', $who.parentElement).textContent = st.fmt === 'free' ? 'Что берём' : 'Кто плавает';
    };
    const render = () => {
      let price = 0, t = '', s = '', tr = '', msg = '';
      if (st.fmt === 'group') {
        const g = G[st.who]; const p = st.tier === 'pre' && g.pre[st.count] ? g.pre[st.count] : g.std[st.count];
        price = p; t = g.n + (g.d ? ', ' + g.d : ''); s = st.count + ' занятий, ' + (st.tier === 'pre' && g.pre[st.count] ? 'премиум (до 40 дней)' : 'стандарт');
        tr = g.trial ? 'Пробное занятие: ' + fmt(g.trial) + ' ₸' : 'Пробное занятие в прайсе не указано';
        msg = 'Группа: ' + g.n + ', ' + st.count + ' занятий, ' + (st.tier === 'pre' && g.pre[st.count] ? 'премиум' : 'стандарт') + ', по прайсу ' + fmt(price) + ' ₸';
      } else if (st.fmt === 'solo') {
        const g = S[st.who]; const [p, pt] = g.opts[st.count];
        price = p; t = 'Персональные: ' + g.n + ', ' + g.d; s = '10 занятий, ' + (st.count === 'Один' ? 'один человек' : st.count.toLowerCase()) + ' (действует до 40 дней)';
        tr = 'Пробное занятие: ' + fmt(pt) + ' ₸';
        msg = 'Персональные: ' + g.n + ', 10 занятий, ' + st.count.toLowerCase() + ', по прайсу ' + fmt(price) + ' ₸';
      } else {
        const f = F[st.who]; price = f[1]; t = 'Свободное плавание'; s = f[0]; tr = f[2] === 1 ? 'Разовое посещение без абонемента' : 'Абонемент на ' + f[2] + ' занятий';
        msg = 'Свободное плавание: ' + f[0] + ', по прайсу ' + fmt(price) + ' ₸';
      }
      title.textContent = t; sub.textContent = s; trial.innerHTML = tr.replace(/(\d[\d  ]*) ₸/, (m) => m.replace(/ /g, ' '));
      anim(price);
      wa.href = 'https://wa.me/77478037031?text=' + encodeURIComponent('Здравствуйте! Хотим записаться на пробное занятие в Swim Feels.\n' + msg);
      wa.target = '_blank'; wa.rel = 'noopener';
      if (plan) plan.value = msg;
    };
    form.addEventListener('change', (e) => {
      const n = e.target.name, v = e.target.value;
      if (n === 'fmt') { st.fmt = v; st.who = v === 'group' ? 'adult' : v === 'solo' ? 'adult' : 'eight'; st.count = v === 'solo' ? 'Один' : '8'; st.tier = 'std'; }
      else if (n === 'who') { st.who = v; if (st.fmt === 'group') st.count = Object.keys(G[v].std)[0]; }
      else if (n === 'count') st.count = v;
      else if (n === 'tier') st.tier = v;
      rebuild(); render();
    });
    rebuild(); render();
  }
})();
