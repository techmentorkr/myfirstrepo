# 마크다운 블로그 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 마크다운 파일을 읽어 렌더링하는 정적 블로그 웹사이트 구현

**Architecture:** `index.html`(목록) + `post.html`(상세) 두 페이지 구조. `posts/index.json`이 파일명 목록을 관리하고, 각 `.md` 파일 상단 frontmatter에서 메타데이터를 파싱. JS 로직 전체를 `js/main.js` 단일 파일에 구현.

**Tech Stack:** HTML5, CSS3 (CSS Custom Properties), Vanilla JavaScript ES6+, 의존성 없음

## Global Constraints

- 외부 라이브러리/CDN/프레임워크 사용 금지 (npm, React, Vue 등)
- 빌드 도구 없음 — 브라우저에서 직접 실행 (`python -m http.server` 등 로컬 서버 필요)
- 최대 콘텐츠 너비: 720px
- 모바일 breakpoint: 768px
- 다크모드: localStorage 저장, `prefers-color-scheme` 폴백, 기본값 라이트
- XSS 방지: 링크 href에서 `javascript:` 프로토콜 차단, 코드 블록 HTML 이스케이프

---

## 파일 구조

```
my-blog/
├── index.html              # 글 목록 페이지
├── post.html               # 개별 글 뷰어
├── css/
│   └── style.css           # CSS 변수 테마 + 전체 스타일
├── js/
│   └── main.js             # 테마, frontmatter 파서, 마크다운 파서, 글 로딩
└── posts/
    ├── index.json          # 파일명 배열
    ├── hello-world.md      # 샘플 글 1
    └── markdown-guide.md   # 샘플 글 2 (파서 검증용)
```

---

## Task 1: 디렉토리 구조 + CSS 스타일 시스템

**Files:**
- Create: `css/style.css`
- Create: `js/main.js` (빈 파일)
- Create: `posts/` 디렉토리

**Interfaces:**
- Produces: CSS Custom Properties `--bg`, `--text`, `--text-muted`, `--accent`, `--code-bg`, `--border`, `--card-bg`, `--shadow`, `--shadow-hover` — 이후 모든 컴포넌트가 이 변수를 사용

- [ ] **Step 1: 디렉토리 생성**

```bash
mkdir css js posts
```

- [ ] **Step 2: `js/main.js` 빈 파일 생성**

```bash
# 빈 파일로 생성 (이후 Task에서 채움)
```

파일 내용: (비어 있음)

- [ ] **Step 3: `css/style.css` 전체 작성**

```css
/* Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* CSS Variables - Light Theme */
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --text-muted: #6b7280;
  --accent: #2563eb;
  --code-bg: #f4f4f5;
  --border: #e5e7eb;
  --card-bg: #f9fafb;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-hover: 0 4px 12px rgba(0,0,0,0.12);
}

/* Dark Theme */
[data-theme="dark"] {
  --bg: #0f172a;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --accent: #60a5fa;
  --code-bg: #1e293b;
  --border: #334155;
  --card-bg: #1e293b;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-hover: 0 4px 12px rgba(0,0,0,0.4);
}

/* Base */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  transition: background 0.2s, color 0.2s;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  background: rgba(255,255,255,0.85);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

[data-theme="dark"] .header {
  background: rgba(15,23,42,0.85);
}

.header-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
}

.back-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.9rem;
}
.back-link:hover { text-decoration: underline; }

.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text);
  transition: border-color 0.2s;
  line-height: 1;
}
.theme-toggle:hover { border-color: var(--accent); }

/* Container */
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Post List */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  display: block;
  padding: 1.25rem 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  color: var(--text);
  box-shadow: var(--shadow);
  transition: transform 0.15s, box-shadow 0.15s;
}
.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.post-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
  color: var(--text);
}

.post-card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.post-card-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Tags */
.tag {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  background: var(--code-bg);
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--accent);
}

/* Post Header */
.post-header h1 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 0.75rem;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

/* Post Body */
.post-body { margin-top: 1.5rem; }

.post-body h1, .post-body h2, .post-body h3 {
  margin: 1.75rem 0 0.75rem;
  line-height: 1.3;
}
.post-body h1 { font-size: 1.75rem; }
.post-body h2 {
  font-size: 1.4rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.4rem;
}
.post-body h3 { font-size: 1.15rem; }

.post-body p { margin-bottom: 1rem; }

.post-body a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.post-body img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
  display: block;
}

.post-body blockquote {
  border-left: 3px solid var(--accent);
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  color: var(--text-muted);
  background: var(--card-bg);
  border-radius: 0 6px 6px 0;
}

.post-body ul, .post-body ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
.post-body li { margin-bottom: 0.25rem; }

.post-body code {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 0.875em;
  background: var(--code-bg);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

.post-body pre {
  background: var(--code-bg);
  border-radius: 8px;
  padding: 1.25rem;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid var(--border);
}
.post-body pre code {
  background: none;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.6;
}

.post-body hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

/* States */
.loading, .empty { color: var(--text-muted); text-align: center; padding: 3rem 0; }
.error { color: #ef4444; text-align: center; padding: 3rem 0; }

/* Mobile */
@media (max-width: 768px) {
  .header { padding: 0.75rem 1rem; }
  .container { padding: 1.5rem 1rem; }
  .post-header h1 { font-size: 1.5rem; }
  .post-card { padding: 1rem 1.125rem; }
}
```

- [ ] **Step 4: 브라우저에서 CSS 변수 확인**

로컬 서버 실행:
```bash
python -m http.server 8000
```
`http://localhost:8000/css/style.css` 접속 → CSS 텍스트 출력되면 정상.

- [ ] **Step 5: 커밋**

```bash
git init
git add css/style.css js/main.js
git commit -m "feat: add CSS theme system with dark mode variables"
```

---

## Task 2: HTML 페이지 스캐폴딩

**Files:**
- Create: `index.html`
- Create: `post.html`

**Interfaces:**
- Consumes: `css/style.css` (Task 1), `js/main.js` (Task 3에서 채워짐)
- Produces: DOM 구조 — `#postList` (index.html), `#postContent` (post.html), `#themeToggle` (양쪽)

- [ ] **Step 1: `index.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>my-blog</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="header">
    <a href="index.html" class="header-title">my-blog</a>
    <button class="theme-toggle" id="themeToggle" aria-label="테마 전환">🌙</button>
  </header>
  <main class="container">
    <div id="postList" class="post-list"></div>
  </main>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: `post.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>글 보기 - my-blog</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="header">
    <a href="index.html" class="back-link">← 목록으로</a>
    <button class="theme-toggle" id="themeToggle" aria-label="테마 전환">🌙</button>
  </header>
  <main class="container">
    <article id="postContent" class="post-content"></article>
  </main>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: 브라우저에서 구조 확인**

`http://localhost:8000` 접속. 예상 결과:
- 흰 배경, "my-blog" 헤더, 🌙 버튼 표시
- `#postList` 영역은 비어 있음 (JS 미구현 상태)
- 콘솔 에러 없음 (main.js 빈 파일이므로 에러 없어야 함)

- [ ] **Step 4: 커밋**

```bash
git add index.html post.html
git commit -m "feat: add HTML page scaffolding for index and post views"
```

---

## Task 3: 테마 토글 + Frontmatter 파서

**Files:**
- Modify: `js/main.js`

**Interfaces:**
- Produces:
  - `parseFrontmatter(text: string): { meta: object, body: string }` — 이후 모든 글 로딩에서 사용
  - `initTheme(): void`, `setTheme(theme: string): void`, `toggleTheme(): void`

- [ ] **Step 1: `js/main.js`에 테마 함수 + frontmatter 파서 작성**

```javascript
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
// Init (DOMContentLoaded에서 호출)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
});
```

- [ ] **Step 2: Frontmatter 파서 console.assert 테스트 작성 후 실행**

브라우저 콘솔에서 아래를 붙여넣고 실행:

```javascript
// 테스트 1: frontmatter가 있는 경우
const sample = `---
title: 테스트 글
date: 2024-01-15
tags: [javascript, web]
description: 짧은 설명
---

본문 내용입니다.`;

const result = parseFrontmatter(sample);
console.assert(result.meta.title === '테스트 글', '❌ title 파싱 실패');
console.assert(result.meta.date === '2024-01-15', '❌ date 파싱 실패');
console.assert(Array.isArray(result.meta.tags), '❌ tags 배열 아님');
console.assert(result.meta.tags[0] === 'javascript', '❌ tags[0] 파싱 실패');
console.assert(result.body === '본문 내용입니다.', '❌ body 파싱 실패');

// 테스트 2: frontmatter 없는 경우
const plain = '그냥 본문입니다.';
const result2 = parseFrontmatter(plain);
console.assert(Object.keys(result2.meta).length === 0, '❌ 빈 meta 아님');
console.assert(result2.body === '그냥 본문입니다.', '❌ body가 원본과 다름');

// 테스트 3: value에 콜론 포함
const withColon = `---
url: https://example.com
---
내용`;
const result3 = parseFrontmatter(withColon);
console.assert(result3.meta.url === 'https://example.com', '❌ 콜론 포함 value 파싱 실패');

console.log('✅ 모든 frontmatter 테스트 통과');
```

예상 출력: `✅ 모든 frontmatter 테스트 통과`

- [ ] **Step 3: 브라우저에서 테마 토글 확인**

`http://localhost:8000` 접속 후:
- 🌙 버튼 클릭 → 다크 모드 전환, 버튼이 ☀️로 변경
- 다시 클릭 → 라이트 모드 복귀
- 페이지 새로고침 → 이전 테마 유지 (localStorage)

- [ ] **Step 4: 커밋**

```bash
git add js/main.js
git commit -m "feat: add theme toggle and frontmatter parser"
```

---

## Task 4: 마크다운 파서

**Files:**
- Modify: `js/main.js` (파서 함수 추가)

**Interfaces:**
- Consumes: 없음 (순수 함수)
- Produces:
  - `escapeHtml(text: string): string`
  - `parseMarkdown(text: string): string` — HTML 문자열 반환. Task 6에서 post 본문 렌더링에 사용

- [ ] **Step 1: `js/main.js`에 마크다운 파서 추가** (기존 코드 아래에 추가)

```javascript
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

  // 3. 제목 (h3 → h2 → h1 순서로 처리)
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 4. 수평선 (--- 단독 줄, 제목 이후에 처리)
  text = text.replace(/^---$/gm, '<hr>');

  // 5. 인용
  text = text.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 6. 굵게, 기울임
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  // 7. 이미지 (링크보다 먼저)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // 8. 링크 (javascript: 프로토콜 차단)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    if (/^javascript:/i.test(url)) return escapeHtml(label);
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // 9. 순서 없는 목록 (연속된 - 라인을 하나의 ul로)
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

  // 11. 단락 (빈 줄로 구분된 텍스트 블록을 <p>로)
  const blocks = text.split(/\n{2,}/);
  text = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    // 이미 블록 태그로 시작하거나 코드 플레이스홀더면 그대로
    if (/^<(h[1-3]|ul|ol|blockquote|pre|hr|img)/.test(block)) return block;
    if (block.startsWith('\x00CODE')) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  // 12. 코드 블록 복원
  codeBlocks.forEach((html, idx) => {
    text = text.replace(`\x00CODE${idx}\x00`, html);
  });

  return text;
}
```

- [ ] **Step 2: 마크다운 파서 console.assert 테스트**

브라우저 콘솔에서 실행:

```javascript
// 테스트: 제목
let r = parseMarkdown('# Hello');
console.assert(r.includes('<h1>Hello</h1>'), '❌ h1 실패');

r = parseMarkdown('## World');
console.assert(r.includes('<h2>World</h2>'), '❌ h2 실패');

// 테스트: 굵게/기울임
r = parseMarkdown('**굵게** *기울임*');
console.assert(r.includes('<strong>굵게</strong>'), '❌ bold 실패');
console.assert(r.includes('<em>기울임</em>'), '❌ italic 실패');

// 테스트: 인라인 코드
r = parseMarkdown('`const x = 1`');
console.assert(r.includes('<code>const x = 1</code>'), '❌ inline code 실패');

// 테스트: 코드 블록 + HTML 이스케이프
r = parseMarkdown('```js\nconst a = <div>;\n```');
console.assert(r.includes('<pre>'), '❌ pre 없음');
console.assert(r.includes('&lt;div&gt;'), '❌ HTML 이스케이프 실패');

// 테스트: 링크 XSS 차단
r = parseMarkdown('[클릭](javascript:alert(1))');
console.assert(!r.includes('javascript:'), '❌ XSS 차단 실패');

// 테스트: 일반 링크
r = parseMarkdown('[Google](https://google.com)');
console.assert(r.includes('href="https://google.com"'), '❌ 링크 실패');
console.assert(r.includes('rel="noopener noreferrer"'), '❌ rel 속성 없음');

// 테스트: 목록
r = parseMarkdown('- 항목1\n- 항목2');
console.assert(r.includes('<ul>'), '❌ ul 없음');
console.assert(r.includes('<li>항목1</li>'), '❌ li 없음');

console.log('✅ 모든 마크다운 파서 테스트 통과');
```

예상 출력: `✅ 모든 마크다운 파서 테스트 통과`

- [ ] **Step 3: 커밋**

```bash
git add js/main.js
git commit -m "feat: add pure-JS markdown parser with XSS protection"
```

---

## Task 5: 글 목록 페이지 (index.html 로직)

**Files:**
- Modify: `js/main.js` (loadPostList 추가)
- Create: `posts/index.json`

**Interfaces:**
- Consumes: `parseFrontmatter(text)` (Task 3), `posts/index.json`
- Produces: `loadPostList(): Promise<void>` — `#postList` DOM에 글 카드 렌더링

- [ ] **Step 1: `posts/index.json` 생성**

```json
[
  "hello-world.md",
  "markdown-guide.md"
]
```

- [ ] **Step 2: `js/main.js`에 `loadPostList` 추가** (기존 코드 아래에 추가)

```javascript
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

    // 날짜 내림차순 정렬
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
        ? post.tags.map(t => `<span class="tag">${t}</span>`).join('')
        : '';
      const desc = post.description
        ? `<p class="post-card-desc">${post.description}</p>`
        : '';
      const href = `post.html?post=${encodeURIComponent(post.filename)}`;

      return `
        <a href="${href}" class="post-card">
          <h2 class="post-card-title">${post.title || post.filename}</h2>
          <div class="post-card-meta">
            <span class="post-date">${post.date || ''}</span>
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
```

- [ ] **Step 3: DOMContentLoaded에서 `loadPostList` 호출하도록 수정**

기존 init 블록을:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
});
```

아래로 교체:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  loadPostList();
  loadPost(); // Task 6에서 구현 (index.html에서는 #postContent 없어 조기 반환)
});
```

> 주의: `loadPost()`는 아직 미구현이므로 Task 6 전까지 이 줄은 주석 처리해도 됨. Task 6 완료 후 주석 해제.

- [ ] **Step 4: 브라우저 확인 (`posts/*.md` 파일 없어도 에러 처리 확인)**

`http://localhost:8000` 접속. 예상 결과:
- "글 목록을 불러오지 못했습니다" 에러 메시지 (posts/*.md 아직 없으므로 정상)
- 콘솔에 fetch 에러 로그

- [ ] **Step 5: 커밋**

```bash
git add posts/index.json js/main.js
git commit -m "feat: add post list loading and rendering for index page"
```

---

## Task 6: 글 뷰어 페이지 (post.html 로직)

**Files:**
- Modify: `js/main.js` (loadPost 추가)

**Interfaces:**
- Consumes: `parseFrontmatter(text)` (Task 3), `parseMarkdown(text)` (Task 4)
- Produces: `loadPost(): Promise<void>` — `#postContent` DOM에 글 헤더 + 본문 렌더링

- [ ] **Step 1: `js/main.js`에 `loadPost` 추가** (기존 코드 아래에 추가)

```javascript
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

    // 페이지 타이틀 업데이트
    document.title = `${meta.title || filename} - my-blog`;

    const tags = Array.isArray(meta.tags)
      ? meta.tags.map(t => `<span class="tag">${t}</span>`).join('')
      : '';

    container.innerHTML = `
      <header class="post-header">
        <h1>${meta.title || filename}</h1>
        <div class="post-meta">
          <span class="post-date">${meta.date || ''}</span>
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
```

- [ ] **Step 2: DOMContentLoaded init 블록 최종 확인**

`js/main.js` 맨 아래 init 블록이 아래와 같은지 확인 (Task 5에서 이미 작성):

```javascript
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  loadPostList();
  loadPost();
});
```

- [ ] **Step 3: 커밋**

```bash
git add js/main.js
git commit -m "feat: add post viewer with frontmatter header and markdown body"
```

---

## Task 7: 샘플 콘텐츠 + 최종 검증

**Files:**
- Create: `posts/hello-world.md`
- Create: `posts/markdown-guide.md`

**Interfaces:**
- Consumes: 완성된 `index.html`, `post.html`, `js/main.js` (모든 이전 Task)

- [ ] **Step 1: `posts/hello-world.md` 작성**

```markdown
---
title: 안녕하세요, my-blog입니다
date: 2024-01-20
tags: [소개, 블로그]
description: 마크다운으로 글을 쓰고 정적 웹사이트로 변환하는 블로그를 소개합니다.
---

## 블로그를 시작하며

안녕하세요. 이 블로그는 마크다운 파일을 읽어 HTML로 렌더링하는 정적 블로그입니다.

프레임워크 없이 순수 HTML, CSS, JavaScript만으로 만들어졌습니다.

## 주요 기능

- **다크 모드** 지원 (🌙 버튼 클릭)
- **모바일 반응형** 레이아웃
- **마크다운** 파싱 (제목, 목록, 코드 블록 등)

## 글 쓰는 방법

`posts/` 폴더에 `.md` 파일을 추가하고 `posts/index.json`에 파일명을 등록하면 됩니다.

```json
["hello-world.md", "my-new-post.md"]
```

좋은 글로 찾아오겠습니다.
```

- [ ] **Step 2: `posts/markdown-guide.md` 작성**

```markdown
---
title: 마크다운 문법 가이드
date: 2024-01-15
tags: [마크다운, 가이드]
description: 이 블로그에서 지원하는 마크다운 문법을 모두 소개합니다.
---

## 제목

# H1 제목
## H2 제목
### H3 제목

## 텍스트 강조

**굵게** 또는 *기울임*으로 텍스트를 강조할 수 있습니다.

## 목록

순서 없는 목록:

- 항목 하나
- 항목 둘
- 항목 셋

순서 있는 목록:

1. 첫 번째
2. 두 번째
3. 세 번째

## 코드

인라인 코드: `const x = 42`

코드 블록:

```javascript
function greet(name) {
  return `안녕하세요, ${name}!`;
}

console.log(greet('블로그'));
```

## 인용

> 좋은 글은 독자를 위해 쓰여진다.

## 링크와 이미지

[GitHub 바로가기](https://github.com)

## 수평선

---

이상으로 지원 문법 안내를 마칩니다.
```

- [ ] **Step 3: 글 목록 페이지 최종 확인**

`http://localhost:8000` 접속. 체크리스트:
- [ ] 글 카드 2개 표시 (날짜 내림차순: 안녕하세요 → 마크다운 가이드)
- [ ] 각 카드에 제목, 날짜, 태그, 설명 표시
- [ ] 카드 hover 시 살짝 올라오는 효과
- [ ] 다크모드 토글 정상 동작
- [ ] 모바일 화면(DevTools 375px)에서 레이아웃 이상 없음

- [ ] **Step 4: 개별 글 페이지 최종 확인**

카드 클릭 → `post.html?post=hello-world.md`. 체크리스트:
- [ ] 제목, 날짜, 태그 헤더 표시
- [ ] 본문 마크다운 렌더링 (h2, 목록, 코드 블록 등)
- [ ] "← 목록으로" 클릭 시 index.html 이동
- [ ] 코드 블록 가로 스크롤 동작 (좁은 화면)
- [ ] 다크모드에서 코드 블록 배경색 구분

- [ ] **Step 5: 잘못된 URL 에러 처리 확인**

`http://localhost:8000/post.html?post=없는파일.md` 접속.
예상: "글을 찾을 수 없습니다." 메시지 표시

- [ ] **Step 6: 최종 커밋**

```bash
git add posts/hello-world.md posts/markdown-guide.md
git commit -m "feat: add sample markdown posts for blog content"
```
