# my-blog

마크다운 파일을 읽어 정적 블로그 웹사이트로 변환하는 프로젝트.

## 프로젝트 개요

- 마크다운(`.md`) 파일을 파싱하여 HTML 블로그 페이지로 렌더링
- 프레임워크 없이 순수 HTML, CSS, JavaScript로만 구현
- 빌드 도구 없음 — 브라우저에서 직접 실행

## 핵심 요구사항

- **다크 모드**: `prefers-color-scheme` 미디어 쿼리 + 토글 버튼으로 수동 전환 지원
- **모바일 반응형**: 모든 화면 크기에서 읽기 좋은 레이아웃
- **깔끔한 타이포그래피**: 가독성 중심 디자인, 적절한 행간·여백
- **의존성 없음**: 외부 라이브러리·CDN·프레임워크 사용 금지

## 기술 스택

- HTML5
- CSS3 (CSS Variables로 테마 관리)
- Vanilla JavaScript (ES6+)
- 마크다운 파싱: 직접 구현 또는 단일 파일 라이브러리(`marked.js` 등) 허용 시 명시

## 파일 구조 (예상)

```
my-blog/
├── CLAUDE.md
├── index.html          # 글 목록 페이지
├── post.html           # 개별 글 뷰어
├── css/
│   └── style.css       # 전체 스타일 + CSS 변수 테마
├── js/
│   └── main.js         # 마크다운 로드·파싱·렌더링 로직
└── posts/
    └── *.md            # 블로그 글 (마크다운)
```

## 디자인 원칙

- CSS Custom Properties(`--color-*`, `--font-*`)로 라이트/다크 테마 전환
- 최대 콘텐츠 너비: `720px` 내외 (읽기 최적화)
- 기본 폰트: 시스템 폰트 스택 (`-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`)
- 코드 블록: 모노스페이스, 배경색 구분, 스크롤 가능
- 모바일 breakpoint: `768px`

## 구현 시 주의사항

- `fetch()`로 로컬 마크다운 파일을 읽을 때 CORS 제약이 있으므로 로컬 서버(`python -m http.server` 등)에서 실행
- 다크 모드 초기값은 `localStorage`에 저장하여 새로고침 후에도 유지
- 마크다운 파싱은 XSS를 고려하여 안전하게 처리
