(function () {
  'use strict';

  // small helpers
  function qs(name, def) {
    const p = new URLSearchParams(location.search);
    return p.get(name) || def;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function fmt(n) {
    return n.toLocaleString();
  }

  const user = qs('user', 'octocat');
  const theme = qs('theme', 'light');
  document.body.className = 'theme-' + theme;

  el('user-handle').textContent = '@' + user;
  el('user-meta').textContent = 'GitHub contributions';

  // optional: fetch and show avatar (public)
  (async function showAvatar() {
    try {
      const r = await fetch(`https://github.com/${encodeURIComponent(user)}.png`, { cache: 'force-cache' });
      if (r.ok) {
        const wrap = el('avatar-wrap');
        const img = document.createElement('img');
        img.src = `https://github.com/${encodeURIComponent(user)}.png`;
        img.alt = user + ' avatar';
        img.width = 48;
        img.height = 48;
        img.style.borderRadius = '8px';
        wrap.appendChild(img);
      }
    } catch (e) {
      // ignore avatar errors
    }
  })();

  // primary function: fetch contributions page and parse the svg
  async function loadContribs() {
    const contribUrl = `https://github.com/users/${encodeURIComponent(user)}/contributions`;
    const graphContainer = el('w-graph');
    const sparkSvg = el('w-sparkline');
    const note = el('w-note');

    try {
      const res = await fetch(contribUrl, { mode: 'cors', cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Profile not found');
      }

      const text = await res.text();

      // try to parse the response for an <svg> tag
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      let svg = doc.querySelector('svg');

      // sometimes GitHub returns an <svg> nested in text/plain - fallback to regex extraction
      if (!svg) {
        const rx = /(<svg[\s\S]*<\/svg>)/i;
        const m = text.match(rx);
        if (m) {
          const doc2 = parser.parseFromString(m[1], 'image/svg+xml');
          svg = doc2.querySelector('svg');
        }
      }

      if (!svg) {
        throw new Error('No SVG found (maybe GitHub HTML changed or blocked)');
      }

      // clone SVG so we can safely insert into our document and tweak attributes
      const svgClone = svg.cloneNode(true);
      // make the svg responsive/fit nicely
      svgClone.setAttribute('width', '100%');
      svgClone.style.maxWidth = '100%';
      svgClone.style.height = 'auto';
      svgClone.removeAttribute('style'); // remove inline size styles if any

      // insert SVG into widget
      graphContainer.innerHTML = '';
      graphContainer.appendChild(svgClone);

      // extract rects with data-date/data-count
      const rects = Array.from(svgClone.querySelectorAll('rect[data-date]'));
      if (!rects.length) {
        throw new Error('No contribution rects found');
      }

      const days = rects.map(r => {
        const date = r.getAttribute('data-date');
        const count = parseInt(r.getAttribute('data-count') || '0', 10) || 0;
        return { date, count };
      });

      // ensure chronological order (some svg order by week rows)
      days.sort((a, b) => new Date(a.date) - new Date(b.date));

      // compute stats
      const total = days.reduce((s, d) => s + d.count, 0);

      // longest streak
      let longest = 0;
      let running = 0;
      for (const d of days) {
        if (d.count > 0) {
          running++;
        } else {
          if (running > longest) {
            longest = running;
          }
          running = 0;
        }
      }
      if (running > longest) {
        longest = running;
      }

      // current streak (ending at last day)
      let current = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].count > 0) {
          current++;
        } else {
          break;
        }
      }

      // weekly average over last 52 weeks (approx)
      const avg = Math.round(total / 52);

      // render numbers
      el('w-total').textContent = fmt(total);
      el('w-current').textContent = current + 'd';
      el('w-longest').textContent = longest + 'd';
      note.textContent = `≈ ${avg}/week · last ${days.length} days`;

      // make a small sparkline from recent 28 days (or fallback to all days)
      const sparkDays = days.slice(-28);
      drawSparkline(sparkSvg, sparkDays.map(d => d.count));
    } catch (err) {
      // graceful fallback
      graphContainer.innerHTML = '';
      const link = document.createElement('a');
      link.href = `https://github.com/${encodeURIComponent(user)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = `View ${user}'s GitHub profile`;
      link.style.display = 'inline-block';
      link.style.marginBottom = '8px';

      const img = document.createElement('img');
      img.src = `https://github.com/users/${encodeURIComponent(user)}/contributions`;
      img.alt = `Contributions for ${user}`;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.display = 'block';

      const msg = document.createElement('div');
      msg.innerHTML = `<strong>Unable to parse contributions</strong><div style="font-size:12px;color:var(--muted);margin-top:6px">Reason: ${escapeHtml(err.message)}. This often happens when the browser blocks cross-origin scraping. You can resolve this by hosting this widget on pages with a server-side proxy, or by using GitHub Pages for the widget files. No token needed.</div>`;

      graphContainer.appendChild(msg);
      graphContainer.appendChild(link);
      graphContainer.appendChild(img);

      el('w-total').textContent = '—';
      el('w-current').textContent = '—';
      el('w-longest').textContent = '—';
      el('w-note').textContent = 'Detailed stats unavailable.';
    }
  }

  // small sparkline drawer: small polyline inside given svg element
  function drawSparkline(svgEl, values) {
    if (!svgEl || !Array.isArray(values) || values.length === 0) {
      return;
    }
    const w = 200;
    const h = 34;
    svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgEl.innerHTML = '';
    const max = Math.max(...values, 1);
    const step = w / Math.max(values.length - 1, 1);
    const points = values.map((v, i) => {
      const x = (i * step);
      const y = h - (v / max) * (h - 6) - 3; // padding
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
    // filled area
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute('points', points);
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke-width', '1.8');
    poly.setAttribute('stroke-linejoin', 'round');
    poly.setAttribute('stroke-linecap', 'round');
    poly.setAttribute('stroke', 'currentColor');
    svgEl.appendChild(poly);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  // run
  loadContribs();
})();
