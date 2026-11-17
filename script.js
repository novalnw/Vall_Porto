document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const bubbles = [];
  const sparks = [];

  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => {
      document.getElementById('heroVideoWrap').classList.add('hidden');
    });
    heroVideo.play().catch(() => {});
  }

  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hidden'), 400);
    });
    setTimeout(() => preloader.classList.add('hidden'), 3000);
  }

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
  });
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    })
  );

  const canvas = document.getElementById('stars');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let stars = [];
  let W = 0, H = 0;
  function resizeStars() {
    if (!canvas) return;
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(160, Math.floor((W * H) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      sp: Math.random() * 0.35 + 0.05,
      tw: Math.random() * Math.PI * 2,
      ts: Math.random() * 0.02 + 0.005
    }));
  }
  if (canvas) { resizeStars(); window.addEventListener('resize', resizeStars); }
  function drawStars() {
    if (ctx) {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.y -= s.sp;
        if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
        s.tw += s.ts;
        const a = 0.35 + Math.sin(s.tw) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.x += b.vx;
        b.y += b.vy;
        b.r += 0.06;
        b.life -= b.decay;
        if (b.life <= 0 || b.y < -24) { bubbles.splice(i, 1); continue; }
        const a = Math.max(b.life, 0);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,${a * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a * 0.5})`;
        ctx.fill();
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= p.decay;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        const a = Math.max(p.life, 0);
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    const sy = window.scrollY;
    document.querySelectorAll('.orb').forEach((o, i) => {
      const sp = (i + 1) * 0.1;
      o.style.transform = `translate3d(0, ${sy * sp}px, 0)`;
    });
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? (sy / maxScroll) * 100 : 0;
    const spEl = document.getElementById('scrollProgress');
    if (spEl) spEl.style.width = pct + '%';
    requestAnimationFrame(drawStars);
  }
  drawStars();

  function spawnBubble(x, y) {
    return {
      x: x + (Math.random() - 0.5) * 70,
      y: y + (Math.random() - 0.5) * 50,
      r: Math.random() * 16 + 6,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -(Math.random() * 1.6 + 0.6),
      life: 1,
      decay: Math.random() * 0.006 + 0.003
    };
  }
  const glowColors = ['#38bdf8', '#a78bfa', '#34d399', '#f0f9ff'];
  function spawnSparks(x, y) {
    const n = 16;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 3.4 + 0.8;
      sparks.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: Math.random() * 1.8 + 0.8,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        color: glowColors[(Math.random() * glowColors.length) | 0]
      });
    }
  }
  function isInteractive(el) {
    return el && el.closest && el.closest('a, button, .btn, input, textarea, select, .nav-toggle');
  }
  document.addEventListener('pointerdown', (e) => {
    if (isInteractive(e.target)) return;
    const n = 12;
    for (let i = 0; i < n; i++) bubbles.push(spawnBubble(e.clientX, e.clientY));
    spawnSparks(e.clientX, e.clientY);
  });

  const glow = document.getElementById('cursorGlow');
  if (glow) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add('active');
    });
    (function followGlow() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(followGlow);
    })();
  }

  const roles = ['Full Stack Web Developer', 'UI/UX Enthusiast', 'Data & GIS Analyst', 'Problem Solver'];
  const twEl = document.getElementById('typewriter');
  if (twEl) {
    let ri = 0, ci = 0, deleting = false;
    function type() {
      const word = roles[ri];
      if (!deleting) {
        ci++;
        twEl.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; setTimeout(type, 1600); return; }
        setTimeout(type, 75 + Math.random() * 60);
      } else {
        ci--;
        twEl.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; setTimeout(type, 350); return; }
        setTimeout(type, 40);
      }
    }
    type();
  }

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  const counters = document.querySelectorAll('.stat-num[data-target]');
  const counterIO = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur = 1400;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      counterIO.unobserve(el);
    }),
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterIO.observe(c));

  const tiltCards = document.querySelectorAll('.project-card, .testi-card, .about-card, .skill-group');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tiltCards.forEach((card) => {
      card.classList.add('tilt');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
        card.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
        card.style.setProperty('--my', `${(py + 0.5) * 100}%`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)';
      });
    });
  }

  const magBtns = document.querySelectorAll('.btn');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    magBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transition = 'transform 0.15s ease-out';
        btn.style.transform = `translate(${dx * 0.4}px, ${dy * 0.5}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
        btn.style.transform = '';
      });
    });
  }

  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('#projectGrid .project-card');
  filterBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      projectCards.forEach((card) => {
        const show = f === 'all' || card.dataset.category === f;
        card.style.display = show ? '' : 'none';
      });
    })
  );

  const termBody = document.getElementById('terminalBody');
  if (termBody) {
    const lines = Array.from(termBody.querySelectorAll('.term-line'));
    const fullText = [
      'whoami',
      'M. Noval Nur Wakhid · Full Stack Web Developer',
      'cat skills.txt',
      'React · PHP · Tailwind · Node.js · GIS · Data Analysis',
      'status',
      'Tersedia untuk kerja sama & kolaborasi'
    ];
    let typing = false;
    const termIO = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || typing) return;
        typing = true;
        lines.forEach((line) => {
          line.querySelector('.term-text').textContent = '';
          line.querySelectorAll('.term-cursor').forEach((c) => c.remove());
        });
        let li = 0;
        (function typeLine() {
          if (li >= lines.length) { typing = false; return; }
          const line = lines[li];
          const textEl = line.querySelector('.term-text');
          const full = fullText[li];
          const isOut = line.classList.contains('term-out');
          let i = 0;
          const cursor = document.createElement('span');
          cursor.className = 'term-cursor';
          (function typeChar() {
            if (i <= full.length) {
              textEl.textContent = full.slice(0, i);
              i++;
              setTimeout(typeChar, isOut ? 10 : 42);
            } else {
              textEl.appendChild(cursor.cloneNode());
              li++;
              setTimeout(typeLine, isOut ? 320 : 160);
            }
          })();
        })();
      },
      { threshold: 0.3 }
    );
    termIO.observe(termBody);
  }

  const scrambleEls = document.querySelectorAll('[data-scramble]');
  const scrambleChars = '!<>-_\\/[]{}—=+*^?#________';
  scrambleEls.forEach((el) => {
    const original = el.textContent;
    let frame = 0;
    const scrIO = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        scrIO.unobserve(el);
        (function anim() {
          const progress = frame / 30;
          let out = '';
          for (let i = 0; i < original.length; i++) {
            if (original[i] === ' ') { out += ' '; continue; }
            out += Math.random() < progress ? original[i] : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }
          el.textContent = out;
          frame++;
          if (frame < 38) requestAnimationFrame(anim);
          else el.textContent = original;
        })();
      },
      { threshold: 0.5 }
    );
    scrIO.observe(el);
  });

  const navbar = document.getElementById('navbar');
  const spySections = ['about', 'skills', 'education', 'projects', 'testimonials', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const spyIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.querySelectorAll('a').forEach((a) =>
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)
      );
    }),
    { rootMargin: '-40% 0px -55% 0px' }
  );
  spySections.forEach((s) => spyIO.observe(s));

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('show', window.scrollY > 500);
    });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---- AI chat widget ---- */
  const chatFab = document.getElementById('chatFab');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  if (chatFab && chatPanel) {
    const CHAT_WORKER = 'https://vall-chat-worker.novalnurwakhid151.workers.dev';
    const CHAT_SYSTEM =
      'Kamu adalah Vesper, AI pendamping untuk portofolio M. Noval Nur Wakhid (Vall), ' +
      'Full Stack Web Developer dari Sidoarjo, Jawa Timur, Indonesia. ' +
      'Jawab dengan ramah, ringkas, dan dalam Bahasa Indonesia. ' +
      'Fakta tentang Noval: lulusan Sistem Informasi Universitas Nahdlatul Ulama ' +
      'Sidoarjo (2022-2026); skill: React, PHP, Tailwind, Node.js, Supabase, ' +
      'JavaScript, REST API, Power BI, QGIS, GeoDa, Pentaho, Python, Streamlit, ' +
      'EasyOCR, Linux, keamanan sistem, UI design, Git/GitHub. ' +
      'Project: E-Dokter, Project ERP, Vall Food, Vall Store, Vall Coffee, ' +
      'Vall Project Analyst, Deteksi Plat Nomor. ' +
      'Kontak: novalnurwakhid151@gmail.com dan WhatsApp 6287825677105. ' +
      'Kalau ditanya hal di luar itu, arahkan untuk menghubungi melalui email/WhatsApp.';

    function addMsg(role, text) {
      const el = document.createElement('div');
      el.className = 'chat-msg ' + role;
      el.textContent = text;
      chatBody.appendChild(el);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function typingEl() {
      const wrap = document.createElement('div');
      wrap.className = 'chat-msg bot';
      wrap.innerHTML = '<span class="chat-typing"><span></span><span></span><span></span></span>';
      chatBody.appendChild(wrap);
      chatBody.scrollTop = chatBody.scrollHeight;
      return wrap;
    }

    async function ask(messages) {
      const res = await fetch(CHAT_WORKER + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: CHAT_SYSTEM, messages })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        throw new Error(data.error || 'Gagal terhubung ke AI.');
      }
      return data.reply;
    }

    async function send() {
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      addMsg('user', text);
      const typing = typingEl();
      try {
        const reply = await ask(chatHistory.concat([{ role: 'user', content: text }]));
        chatHistory.push({ role: 'user', content: text }, { role: 'assistant', content: reply });
        typing.remove();
        addMsg('bot', reply);
      } catch (err) {
        typing.remove();
        addMsg('bot', err.message);
      }
      chatInput.focus();
    }

    const chatHistory = [
      { role: 'assistant', content: 'Halo! Aku Vesper, AI pendamping Vall. Mau tanya soal skill, project, atau kontak?' }
    ];
    addMsg('bot', chatHistory[0].content);

    chatFab.addEventListener('click', () => {
      chatPanel.classList.add('open');
      chatInput.focus();
      chatBody.scrollTop = chatBody.scrollHeight;
    });
    chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));
    chatSend.addEventListener('click', send);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') send();
    });
  }
});
