# Opinion Leader

실시간 의견 수렴 및 분석 플랫폼

## 🚀 기능

- **소셜 로그인**: Google, 네이버 OAuth 지원
- **실시간 의견 수집**: 키워드 기반 AI 자동 분류
- **포스트잇 보드**: 직관적인 의견 시각화
- **모바일 반응형**: 모든 디바이스 지원
- **실시간 주제 예측**: 입력 중 자동 주제 분류

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd opinion-leader
```

### 2. 패키지 설치
```bash
pnpm install
```

### 3. 환경변수 설정
`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Naver OAuth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
```

### 4. OAuth 설정

⚠️ **중요**: 소셜 로그인은 실제 OAuth 설정이 완료되어야 작동합니다. 로컬 환경에서 테스트하려면 아래 단계를 따라 설정해주세요.

#### Google OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. "APIs & Services" > "Credentials"에서 OAuth 2.0 Client ID 생성
3. 승인된 리디렉션 URI에 `http://localhost:3000/api/auth/callback/google` 추가
4. 클라이언트 ID와 시크릿을 `.env.local`의 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`에 입력

#### 네이버 OAuth 설정
1. [네이버 개발자센터](https://developers.naver.com/)에서 애플리케이션 등록
2. Callback URL에 `http://localhost:3000/api/auth/callback/naver` 추가
3. 클라이언트 ID와 시크릿을 `.env.local`의 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`에 입력

#### 로컬 환경에서 테스트 없이 사용하기
OAuth 설정 없이 기본 기능만 테스트하려면:
- 환경변수를 설정하지 않고 실행
- "로그인" 버튼 클릭 시 에러가 발생하지만 기본 기능은 작동
- 의견 제출, 포스트잇 보드 등 다른 기능은 정상 작동

### 5. 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📱 주요 기능

### 소셜 로그인
- Google, 네이버 계정으로 간편 로그인
- NextAuth.js 기반 안전한 인증

### AI 기반 의견 분류
- 7개 주제별 키워드 자동 분류 (교육, 환경, 경제, 기술, 정치, 사회, 문화)
- 실시간 주제 예측 (10글자 이상 입력 시)

### 포스트잇 보드
- 5가지 색상의 포스트잇 디자인
- 자연스러운 회전 효과 및 호버 애니메이션
- 주제별 그룹핑 및 필터링

### 모바일 최적화
- 반응형 디자인으로 모든 디바이스 지원
- 터치 친화적인 UI/UX

## 🧰 기술 스택

- **Frontend**: Next.js 14, TypeScript, React Hooks
- **Authentication**: NextAuth.js
- **Styling**: CSS Modules, 반응형 디자인
- **Package Manager**: pnpm
- **Storage**: LocalStorage (추후 데이터베이스 연동 예정)

## 📂 프로젝트 구조

```
src/
├── app/
│   ├── api/auth/[...nextauth]/     # NextAuth.js API 라우트
│   ├── auth/signin/                # 로그인 페이지
│   ├── globals.css                 # 전역 스타일
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── page.tsx                    # 홈페이지
│   └── simple-page.tsx             # 메인 애플리케이션
└── components/
    └── SessionProvider.tsx         # NextAuth 세션 프로바이더
```

## 🔧 개발 참고사항

- **hydration 에러 방지**: 클라이언트 사이드 전용 코드는 `useEffect`와 `mounted` 상태 활용
- **로컬스토리지**: 브라우저 로컬스토리지에 의견 데이터 저장
- **더미 데이터**: 초기 실행 시 20개의 샘플 의견 자동 생성

## 🚀 배포

추후 Vercel, Netlify 등의 플랫폼을 통한 배포 예정

## 📝 라이선스

MIT License 