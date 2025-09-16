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
            prompt = `다음은 여러 사용자들이 제출한 의견 목록입니다. 이 의견들을 분석하여 1~2개의 핵심 주제를 추출하고, 각 주제에 대한 간결한 설명을 덧붙여주세요. 결과는 JSON 형식으로 반환해주세요. (예: {"themes": [{"theme": "주제1", "description": "설명1"}, {"theme": "주제2", "description": "설명2"}]})\n\n의견 목록:\n${content.map((c: any) => `- ${c.content}`).join('\n')}`;
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