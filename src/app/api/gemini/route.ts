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
            
            prompt = `다음은 지역문화 활동가들이 제출한 정책제안 의견 목록입니다. 

CRITICAL: 응답은 반드시 아래 JSON 형식이어야 합니다. 마크다운 문법을 정확히 사용하세요.

필수 요구사항:
1. ## 제목 (큰 제목용)
2. ### 소제목 (카테고리용) 
3. - 불릿 포인트
4. --- 구분선 (카테고리 간)
5. \\n 줄바꿈 사용

JSON 출력 형식 (정확히 이 형식으로):
{
  "summary": "## 제안개요\\n- 제안자: ${uniqueAuthors}명, 제안의견: ${totalOpinions}건\\n- 최근의견: ${latestDate}\\n\\n## 카테고리별 제안사항\\n\\n### 로컬콘텐츠 개발 및 사업화 (2건)\\n- 지역 고유 문화자원 활용한 관광콘텐츠 개발\\n- 로컬크리에이터 창업 인큐베이팅 지원\\n\\n---\\n\\n### 네트워킹 및 아카이빙 플랫폼 (2건)\\n- 활동가 간 네트워킹 플랫폼 구축\\n- 우수사례 공유 시스템 개발"
}

마크다운 문법 규칙:
- ## = 큰 제목
- ### = 소제목 
- - = 불릿 포인트
- --- = 구분선
- \\n = 줄바꿈
- 반드시 JSON 형태로 응답

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