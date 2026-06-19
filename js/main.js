// ============================================================
// Theme
// ============================================================

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ============================================================
// Frontmatter Parser
// ============================================================

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: text.trim() };

  const meta = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (!key) return;
    // Parse array: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
    }
    meta[key] = value;
  });

  return { meta, body: match[2].trim() };
}

// ============================================================
// Markdown Parser
// ============================================================

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMarkdown(text) {
  // 1. 코드 블록을 먼저 추출 (내부에 다른 규칙이 적용되지 않도록)
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const langAttr = lang ? ` class="language-${lang}"` : '';
    codeBlocks.push(`<pre><code${langAttr}>${escapeHtml(code.trim())}</code></pre>`);
    return `\x00CODE${idx}\x00`;
  });

  // 2. 인라인 코드
  text = text.replace(/`([^`\n]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

  // 3. 제목 (h3 → h2 → h1 순서)
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 4. 수평선
  text = text.replace(/^---$/gm, '<hr>');

  // 5. 인용
  text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 6. 굵게, 기울임
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  // 7. 이미지 (링크보다 먼저)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`;
  });

  // 8. 링크 (javascript: 프로토콜 차단)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    if (/^javascript:/i.test(url)) return escapeHtml(label);
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  });

  // 9. 순서 없는 목록
  text = text.replace(/((?:^- .+\n?)+)/gm, match => {
    const items = match.trim().split('\n')
      .map(line => `<li>${line.replace(/^- /, '')}</li>`)
      .join('');
    return `<ul>${items}</ul>\n`;
  });

  // 10. 순서 있는 목록
  text = text.replace(/((?:^\d+\. .+\n?)+)/gm, match => {
    const items = match.trim().split('\n')
      .map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`)
      .join('');
    return `<ol>${items}</ol>\n`;
  });

  // 11. 단락
  const blocks = text.split(/\n{2,}/);
  text = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h[1-3]|ul|ol|blockquote|pre|hr|img)/.test(block)) return block;
    if (block.startsWith('\x00CODE')) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  // 12. 코드 블록 복원
  codeBlocks.forEach((html, idx) => {
    text = text.replace(`\x00CODE${idx}\x00`, () => html);
  });

  return text;
}

// ============================================================
// Post List (index.html)
// ============================================================

async function loadPostList() {
  const container = document.getElementById('postList');
  if (!container) return;

  container.innerHTML = '<p class="loading">로딩 중...</p>';

  try {
    const res = await fetch('posts/index.json');
    if (!res.ok) throw new Error('index.json 로드 실패');
    const files = await res.json();

    const posts = await Promise.all(
      files.map(async filename => {
        const r = await fetch(`posts/${filename}`);
        if (!r.ok) return null;
        const text = await r.text();
        const { meta } = parseFrontmatter(text);
        return { filename, ...meta };
      })
    );

    const validPosts = posts.filter(Boolean);

    validPosts.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

    if (validPosts.length === 0) {
      container.innerHTML = '<p class="empty">아직 글이 없습니다.</p>';
      return;
    }

    container.innerHTML = validPosts.map(post => {
      const tags = Array.isArray(post.tags)
        ? post.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')
        : '';
      const desc = post.description
        ? `<p class="post-card-desc">${escapeHtml(post.description)}</p>`
        : '';
      const href = `post.html?post=${encodeURIComponent(post.filename)}`;

      return `
        <a href="${href}" class="post-card">
          <h2 class="post-card-title">${escapeHtml(post.title || post.filename)}</h2>
          <div class="post-card-meta">
            <span class="post-date">${escapeHtml(post.date || '')}</span>
            ${tags}
          </div>
          ${desc}
        </a>`;
    }).join('');

  } catch (e) {
    container.innerHTML = '<p class="error">글 목록을 불러오지 못했습니다. 로컬 서버에서 실행하세요.</p>';
    console.error(e);
  }
}

// ============================================================
// Post Viewer (post.html)
// ============================================================

async function loadPost() {
  const container = document.getElementById('postContent');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const filename = params.get('post');

  if (!filename) {
    container.innerHTML = '<p class="error">글을 찾을 수 없습니다.</p>';
    return;
  }

  container.innerHTML = '<p class="loading">로딩 중...</p>';

  try {
    const res = await fetch(`posts/${filename}`);
    if (!res.ok) throw new Error('not found');
    const text = await res.text();
    const { meta, body } = parseFrontmatter(text);

    document.title = `${meta.title || filename} - my-blog`;

    const tags = Array.isArray(meta.tags)
      ? meta.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')
      : '';

    container.innerHTML = `
      <header class="post-header">
        <h1>${escapeHtml(meta.title || filename)}</h1>
        <div class="post-meta">
          <span class="post-date">${escapeHtml(meta.date || '')}</span>
          ${tags}
        </div>
        <hr>
      </header>
      <div class="post-body">${parseMarkdown(body)}</div>
    `;
  } catch (e) {
    container.innerHTML = '<p class="error">글을 찾을 수 없습니다.</p>';
    console.error(e);
  }
}

// ============================================================
// Init
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  loadPostList();
  loadPost();
});
