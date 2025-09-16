import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 키를 환경 변수에서 가져옵니다.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY가 설정되지 않았습니다.');
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function run(prompt: string) {
  if (!genAI) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }
  
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const { task, content } = await req.json();

    if (!task || !content) {
      return NextResponse.json(
        { error: 'task와 content는 필수입니다.' },
        { status: 400 }
      );
    }
    
    if (!genAI) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다. .env.local 파일에 GEMINI_API_KEY를 설정해주세요.' },
        { status: 500 }
      );
    }
    
    let prompt;
    // 여기에 나중에 task별로 다른 프롬프트를 구성하는 로직이 들어갑니다.
    switch (task) {
        case 'classify':
            prompt = `다음 의견을 다음 카테고리 중 하나로 분류해주세요: '지역문화 활동가 역량강화', '네트워킹 및 아카이빙 플랫폼', '활동가 활동환경 및 제도', '로컬콘텐츠 개발 및 사업화', '문화공간 및 인프라', '지역사회 문화 파트너십', '정책 결정 과정 및 민관 협력', '기타'. 다른 설명 없이 카테고리만 반환해주세요.\n\n의견: "${content}"`;
            break;
        case 'extractThemes':
            if (!Array.isArray(content) || content.length === 0) {
                return NextResponse.json({ error: '핵심 주제 추출을 위해서는 의견 배열이 필요합니다.' }, { status: 400 });
            }
            
            // 카테고리별 의견 수 계산
            const categoryCount: Record<string, number> = {};
            content.forEach((opinion: any) => {
                categoryCount[opinion.topic] = (categoryCount[opinion.topic] || 0) + 1;
            });
            
            // 제안자 수 계산 (고유한 작성자 수)
            const uniqueAuthors = new Set(content.map((opinion: any) => opinion.author)).size;
            const totalOpinions = content.length;
            
            // 최근 의견 날짜
            const latestDate = new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            prompt = `다음은 지역문화 활동가들이 제출한 정책제안 의견 목록입니다. 아래 형식에 맞춰 간결하게 요약해주세요.

#출력형식 지침:
- 제목 없이 개요부터 시작
- 개요: 제안자 수, 의견 수, 최근 날짜만 간단히
- 카테고리별로 의견이 많은 순서대로 정렬
- 각 카테고리는 핵심 내용만 2-3개 불릿으로 요약
- 카테고리 간에만 구분선(---) 사용
- 개별 의견 목록은 포함하지 않음
- 결과는 반드시 JSON 형식으로 래핑: {"summary": "전체 요약 내용"}

#원하는 출력 예시:
## 제안개요
- 제안자: ${uniqueAuthors}명, 제안의견: ${totalOpinions}건
- 최근의견: ${latestDate}

## 카테고리별 제안사항

### [카테고리명] (X건)
- 주요 제안내용 요약
- 핵심 아이디어 정리

---

### [다른 카테고리명] (X건)
- 주요 제안내용 요약
- 핵심 아이디어 정리

의견 목록:
${content.map((c: any) => `[${c.topic}] ${c.author}: ${c.content}`).join('\n')}`;
            break;
        default:
            return NextResponse.json({ error: '유효하지 않은 task입니다.' }, { status: 400 });

    }


    const result = await run(prompt);

    return NextResponse.json({ result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gemini API 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 