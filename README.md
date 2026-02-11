# Flux Utility - 빠르고 간편한 온라인 유틸리티

[![Live Demo](https://img.shields.io/badge/Live-flux--utility.vercel.app-blue?style=flat-square&logo=vercel)](https://flux-utility.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**모든 파일 처리는 브라우저에서 수행됩니다.** 서버로 파일을 전송하지 않으므로 빠르고 안전합니다.

## 🌟 주요 특징

- ✨ **빠른 처리**: 모든 작업이 브라우저에서 즉시 실행
- 🔒 **개인정보 보호**: 파일이 서버에 저장되지 않음
- 🎨 **다크 모드**: 라이트/다크 모드 자동 전환
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원
- 🚀 **최신 기술**: Next.js 16, React 19, Turbopack

## 🛠️ 제공 도구 (9가지)

### PDF 도구

| 도구 | 설명 |
|-----|------|
| **PDF to Image** | PDF를 JPG/PNG 이미지로 변환하고 NotebookLM 워터마크 제거 |
| **Image to PDF** | JPG, PNG, GIF 이미지를 하나의 PDF 파일로 병합 (순서 변경 가능) |
| **PDF 강의 도구** | PDF에 펜, 형광펜, 도형, 텍스트로 주석 추가. 강의 화면 녹화(WebM 1920x1080) |

### 이미지 도구

| 도구 | 설명 |
|-----|------|
| **이미지 편집기** | 밝기, 대비, 채도 조정 + 인스타 스타일 필터 10종 + 크롭 |
| **배경 제거** | 색상 기반 배경 투명화 (원클릭 제거) |
| **이미지 리사이즈** | 크기 변경, 비율 잠금, 포맷 변환 (JPG/PNG/WebP) |

### 유틸리티 & 검색

| 도구 | 설명 |
|-----|------|
| **QR코드 생성기** | 텍스트/URL을 QR코드 이미지로 변환 |
| **Video Scene Detect** | 동영상에서 장면 전환 지점을 자동 감지 |
| **무료 이미지/동영상** | Pixabay에서 수백만 개 이미지·동영상 검색 & 다운로드 |

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 저장소 복제
git clone https://github.com/yourusername/flux-utility.git
cd flux-utility

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 을 열면 앱이 실행됩니다.

### 환경 설정

Pixabay 검색 기능을 사용하려면 API 키가 필요합니다.

1. [Pixabay API](https://pixabay.com/api/) 에서 무료 API 키 발급
2. `.env.local` 파일 생성:

```env
PIXABAY_API_KEY=your_api_key_here
```

### 빌드 & 배포

```bash
# 프로덕션 빌드
npm run build

# 로컬에서 프로덕션 버전 실행
npm run start

# 린팅
npm run lint
```

## 📁 프로젝트 구조

```
flux-utility/
├── src/
│   ├── app/
│   │   ├── api/pixabay/          # Pixabay API 프록시 (서버 사이드)
│   │   ├── tools/                # 도구 페이지
│   │   │   ├── pdf-to-image/
│   │   │   ├── image-to-pdf/
│   │   │   ├── pdf-annotate/
│   │   │   ├── image-edit/
│   │   │   ├── bg-remove/
│   │   │   ├── image-resize/
│   │   │   ├── qr-generator/
│   │   │   ├── video-scene-detect/
│   │   │   └── stock-image/
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   └── page.tsx              # 홈페이지
│   │
│   ├── components/
│   │   ├── layout/               # 네비게이션, 푸터 등
│   │   ├── ui/                   # 공유 UI 컴포넌트
│   │   └── tools/                # 도구 카드 등
│   │
│   ├── lib/
│   │   ├── image/                # 이미지 처리 함수
│   │   ├── pdf/                  # PDF 처리 함수
│   │   ├── video/                # 비디오 처리 함수
│   │   ├── qr/                   # QR 코드 생성
│   │   ├── pixabay/              # Pixabay API 클라이언트
│   │   ├── constants.ts          # 도구 레지스트리
│   │   └── utils.ts              # 유틸리티 함수
│   │
│   ├── types/                    # TypeScript 타입 정의
│   └── hooks/                    # React 커스텀 훅
│
├── public/                       # 정적 파일 (pdf.worker.min.mjs)
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts (Tailwind v4)
└── src/app/globals.css          # 글로벌 스타일 (@theme 사용)
```

## 🎨 기술 스택

### 프론트엔드
- **Next.js 16** - React 프레임워크 (App Router, Turbopack)
- **React 19** - UI 라이브러리
- **TypeScript 5** - 정적 타입 언어
- **Tailwind CSS 4** - 유틸리티 CSS 프레임워크

### 처리 라이브러리
- **pdfjs-dist** - PDF 렌더링
- **jsPDF** - PDF 생성
- **qrcode** - QR 코드 생성
- **jszip** - ZIP 아카이브
- **file-saver** - 파일 다운로드

### 기타
- **lucide-react** - 아이콘
- **clsx** / **tailwind-merge** - 클래스 병합

## 🔧 새로운 도구 추가하기

### 1단계: 도구 등록
`src/lib/constants.ts` 편집:

```typescript
{
  id: 'my-tool',
  name: '내 도구',
  description: '도구 설명 (한국어)',
  icon: 'IconName',           // lucide-react 아이콘
  href: '/tools/my-tool',
  category: 'Image',          // PDF, Image, Video, Utility, Search
  isNew: true,
}
```

### 2단계: 도구 페이지 생성
`src/app/tools/my-tool/page.tsx` 생성:

```typescript
'use client';

export default function MyToolPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">내 도구</h1>
      {/* 도구 UI */}
    </div>
  );
}
```

### 3단계: 처리 로직 추가
`src/lib/{category}/my-tool.ts` 생성:

```typescript
export async function processMyTool(input: InputType): Promise<OutputType> {
  // 처리 로직
  return result;
}
```

### 4단계: 하위 컴포넌트 (선택사항)
복잡한 도구의 경우 `src/app/tools/my-tool/_components/` 폴더 생성:
- `FileUpload.tsx` - 입력 처리
- `Settings.tsx` - 설정 UI
- `Preview.tsx` - 결과 미리보기

### 5단계: 빌드 & 배포
```bash
npm run build
# Vercel에 자동 배포됨
```

## 📊 지원 파일 형식

### 이미지
- **입력**: JPG, PNG, GIF, WebP, BMP
- **출력**: JPG, PNG, WebP

### PDF
- **입력**: 표준 PDF (암호화 PDF는 지원하지 않음)
- **출력**: PDF

### 비디오
- **입력**: MP4, WebM, MOV (브라우저 지원 코덱)
- **출력**: WebM (녹화), JSON (장면 감지)

### QR 코드
- **입력**: 텍스트, URL, 이메일, 전화번호
- **출력**: PNG

## 🌐 배포

### Vercel (권장)
1. GitHub에 푸시
2. [Vercel](https://vercel.com) 에서 New Project → Import GitHub repo
3. Environment Variables 설정: `PIXABAY_API_KEY`
4. Deploy

자동으로 배포되며 git push마다 업데이트됩니다.

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 보안 & 개인정보

- ✅ **로컬 처리**: 모든 파일 작업이 브라우저에서 수행
- ✅ **서버 저장 없음**: 파일이 서버에 저장되지 않음
- ✅ **API 키 보호**: PIXABAY_API_KEY는 서버 사이드만 사용
- ✅ **CORS 안전**: Pixabay 다운로드는 프록시를 통해 처리
- ✅ **추적 없음**: 사용자 활동 추적 없음

## 🐛 문제 해결

| 문제 | 해결 방법 |
|-----|---------|
| PDF.js worker를 찾을 수 없음 | `npm run copy-pdf-worker` 실행 |
| Pixabay 검색이 401 오류 | `.env.local`에서 `PIXABAY_API_KEY` 확인 |
| 다크 모드가 적용 안 됨 | 새로고침 (localStorage 확인) |
| 대용량 파일 처리 느림 | 브라우저 개발자 도구 → Performance 탭 확인 |
| 빌드 오류 (SSR 관련) | 캔버스/WebWorker 코드가 `typeof window` 체크 되어 있는지 확인 |

## 📚 개발 정보

- **AI Context**: [CLAUDE.md](./CLAUDE.md) 참고 (개발자용)
- **Node Version**: 18+ 권장
- **Package Manager**: npm / yarn / pnpm 모두 지원

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 🙋 기여하기

개선 사항이나 버그 리포트는 GitHub Issues를 통해 알려주세요!

### 기여 시 주의사항
1. TypeScript 타입 엄격 사용
2. 한국어 UI 텍스트
3. 라이트/다크 모드 모두 지원
4. 모바일 반응형 테스트
5. `src/lib/constants.ts`에 도구 등록 후 생성

## 🔗 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [React 문서](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Pixabay API](https://pixabay.com/api/)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/)

## 📮 문의

질문이나 건의사항이 있으신가요?
- GitHub Issues로 버그 리포트
- GitHub Discussions로 기능 요청
- 이메일: [contact@example.com](mailto:contact@example.com)

---

**Flux Utility** - 빠르고 안전한 온라인 유틸리티
