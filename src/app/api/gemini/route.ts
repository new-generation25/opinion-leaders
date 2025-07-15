import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 키를 환경 변수에서 가져옵니다.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function run(prompt: string) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
    
    let prompt;
    // 여기에 나중에 task별로 다른 프롬프트를 구성하는 로직이 들어갑니다.
    switch (task) {
        case 'classify':
            prompt = `다음 의견을 다음 카테고리 중 하나로 분류해주세요: '교육', '환경', '경제', '기술', '정치', '사회', '문화', '기타'. 다른 설명 없이 카테고리만 반환해주세요.\n\n의견: "${content}"`;
            break;
        case 'extractThemes':
            if (!Array.isArray(content) || content.length === 0) {
                return NextResponse.json({ error: '핵심 주제 추출을 위해서는 의견 배열이 필요합니다.' }, { status: 400 });
            }
            prompt = `다음은 여러 사용자들이 제출한 의견 목록입니다. 이 의견들을 분석하여 1~2개의 핵심 주제를 추출하고, 각 주제에 대한 간결한 설명을 덧붙여주세요. 결과는 JSON 형식으로 반환해주세요. (예: {"themes": [{"theme": "주제1", "description": "설명1"}, {"theme": "주제2", "description": "설명2"}]})\n\n의견 목록:\n${content.map((c: any) => `- ${c.content}`).join('\n')}`;
            break;
        case 'summarize':
            prompt = `다음 의견을 한 문장으로 간결하게 요약해주세요:\n\n"${content}"`;
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