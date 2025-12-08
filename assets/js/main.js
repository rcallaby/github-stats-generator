// assets/js/main.js
async function fetchContributionsSVG(username) {
    const url = `https://github.com/users/${encodeURIComponent(username)}/contributions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Profile not found');
    const text = await res.text();
    return text;
}

function parseSVGAndCompute(svgText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const rects = Array.from(doc.querySelectorAll('rect[data-count]'));
    const days = rects.map(r => ({
        date: r.getAttribute('data-date'),
        count: parseInt(r.getAttribute('data-count') || 0, 10),
        color: r.getAttribute('fill') || null
    }));
    const total = days.reduce((s, d) => s + d.count, 0);
    
    days.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let current = 0, longest = 0;
    let running = 0;
    for (const d of days) {
        if (d.count > 0) {
            running++;
        } else {
            if (running > longest) longest = running;
            running = 0;
        }
    }
    if (running > longest) longest = running;
    
    current = 0;
    for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].count > 0) current++;
        else break;
    }
    
    return { days, total, current, longest, svg: svgText };
}

function insertSVGInto(el, svgText) {
    el.innerHTML = svgText;
}

document.getElementById('fetch-btn').addEventListener('click', async () => {
    const user = document.getElementById('username').value.trim();
    if (!user) return alert('Enter username');
    const theme = document.getElementById('theme-select').value;
    document.body.className = 'theme-' + theme;
    try {
        const svg = await fetchContributionsSVG(user);
        const stats = parseSVGAndCompute(svg);
        document.getElementById('total').textContent = stats.total;
        document.getElementById('current-streak').textContent = stats.current + ' days';
        document.getElementById('longest-streak').textContent = stats.longest + ' days';
        insertSVGInto(document.getElementById('graph'), stats.svg);
    } catch (e) {
        alert('Error fetching: ' + e.message);
    }
});

document.getElementById('generate-embed').addEventListener('click', () => {
    const user = document.getElementById('username').value.trim();
    const theme = document.getElementById('theme-select').value;
    if (!user) return alert('Enter username');
    const hostPrompt = prompt('Enter the public URL where widget.html will be hosted (example: https://your.github.io/repo/)');
    if (!hostPrompt) return;
    const host = hostPrompt.endsWith('/') ? hostPrompt : hostPrompt + '/';
    const widgetUrl = host + 'widget.html?user=' + encodeURIComponent(user) + '&theme=' + encodeURIComponent(theme);
    const md = `[![GitHub Stats](${widgetUrl})](${widgetUrl})`;
    const html = `<iframe src="${widgetUrl}" title="GitHub Stats for ${user}" style="border:0;width:430px;height:170px"></iframe>`;
});