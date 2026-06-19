# 마크다운 블로그 설계 문서

**날짜:** 2026-06-19  
**프로젝트:** my-blog  
**스택:** 순수 HTML / CSS / Vanilla JS (의존성 없음)

---

## 개요

마크다운 파일을 읽어 정적 블로그 웹사이트로 렌더링하는 프로젝트.  
빌드 도구 없이 브라우저에서 직접 실행. 로컬 서버(`python -m http.server` 등) 필요.

---

## 파일 구조

```
my-blog/
├── index.html              # 글 목록 페이지
├── post.html               # 개별 글 뷰어
├── css/
│   └── style.css           # CSS 변수 기반 테마 + 전체 스타일
├── js/
│   └── main.js             # 마크다운 파서 + 테마 + 글 로딩 전체
└── posts/
    ├── index.json          # 파일명 배열: ["hello-world.md", ...]
    └── *.md                # 개별 블로그 글 (frontmatter + 본문)
```

---

## 데이터 흐름

### index.html (글 목록)
```
fetch(posts/index.json)
  └─ 파일명 목록 순회
       └─ fetch(posts/파일명.md)
            └─ frontmatter 파싱 (title, date, tags, description)
                 └─ 글 카드 DOM 생성 → 날짜 내림차순 정렬
```

### post.html (개별 글)
```
URL 파라미터 ?post=파일명 읽기
  └─ fetch(posts/파일명.md)
       └─ frontmatter 파싱 → 헤더(제목, 날짜, 태그) 렌더링
            └─ 본문 마크다운 → HTML 변환 → 삽입
```

---

## Frontmatter 형식

```markdown
---
title: 첫 번째 글
date: 2024-01-15
tags: [javascript, web]
description: 짧은 소개글 (목록 카드에 표시)
---

본문 내용...
```

파서: `---` 구분자 사이 텍스트를 줄 단위로 읽어 `key: value` 파싱.  
`tags`는 `[a, b]` 형식을 배열로 변환.

---

## 마크다운 파서

순수 JS 정규식 기반 직접 구현. 지원 문법:

| 문법 | 입력 예시 | 출력 |
|------|-----------|------|
| 제목 | `# H1` ~ `### H3` | `<h1>` ~ `<h3>` |
| 굵게 | `**text**` | `<strong>` |
| 기울임 | `*text*` | `<em>` |
| 인라인 코드 | `` `code` `` | `<code>` |
| 코드 블록 | ` ```lang ... ``` ` | `<pre><code>` |
| 링크 | `[text](url)` | `<a>` |
| 이미지 | `![alt](url)` | `<img>` |
| 인용 | `> text` | `<blockquote>` |
| 순서 없는 목록 | `- item` | `<ul><li>` |
| 순서 있는 목록 | `1. item` | `<ol><li>` |
| 수평선 | `---` | `<hr>` |
| 단락 | 빈 줄로 구분 | `<p>` |

미지원: 테이블, 각주, 수식, 중첩 목록 (추후 추가 가능)

XSS 방지: 사용자 입력이 아닌 로컬 파일 기반이므로 기본 수준 처리.  
링크 `href`에 `javascript:` 프로토콜 차단.

---

## 테마 시스템

### CSS 변수

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --text-muted: #6b7280;
  --accent: #2563eb;
  --code-bg: #f4f4f5;
  --border: #e5e7eb;
  --card-bg: #f9fafb;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --accent: #60a5fa;
  --code-bg: #1e293b;
  --border: #334155;
  --card-bg: #1e293b;
}
```

### 테마 초기화 순서
1. `localStorage.getItem('theme')` 확인
2. 없으면 `window.matchMedia('prefers-color-scheme: dark')` 확인
3. 둘 다 없으면 라이트 모드 기본값

### 토글 버튼
- 헤더 우측 고정
- ☀️ / 🌙 아이콘 (텍스트 폴백 포함)
- 클릭 시 `document.documentElement`에 `data-theme` 속성 토글 + localStorage 저장

---

## UI 레이아웃

### 공통
- 최대 너비: `720px`, 가운데 정렬
- 좌우 패딩: `1.5rem` (모바일 `<768px`: `1rem`)
- 헤더: `position: sticky; top: 0`, 배경 블러(`backdrop-filter: blur(8px)`)
- 폰트: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### index.html — 글 목록
- 헤더: 블로그 제목 (좌) + 다크모드 토글 (우)
- 글 카드: 날짜 내림차순 정렬
  - 제목 (클릭 시 `post.html?post=파일명`)
  - 날짜 · 태그 (작은 텍스트)
  - 설명 (1줄 ellipsis)
  - hover: `translateY(-2px)` + 그림자 강화
- 로딩 상태: 스켈레톤 또는 "로딩 중..." 텍스트
- 글 없음: "아직 글이 없습니다" 빈 상태 메시지

### post.html — 개별 글
- 헤더: `← 목록으로` (좌) + 다크모드 토글 (우)
- 글 헤더: 제목 → 날짜 · 태그 → 구분선
- 본문: 마크다운 렌더링 결과
  - 코드 블록: 배경색 구분, `overflow-x: auto`
  - 이미지: `max-width: 100%`
  - 링크: accent 색상, `target="_blank" rel="noopener"`
- 에러: 잘못된 파일명 시 "글을 찾을 수 없습니다" 메시지

---

## 샘플 콘텐츠

구현 완료 후 확인용 샘플 글 2개 포함:
- `posts/hello-world.md` — 소개글, 기본 마크다운 문법 시연
- `posts/markdown-guide.md` — 코드 블록, 목록, 인용 등 파서 검증용
