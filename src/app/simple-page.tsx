'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Opinion {
  id: number;
  topic: string;
  content: string;
  author: string;
  timestamp: string;
  is_auto_classified?: boolean;
  created_at?: string;
}

export default function SimplePage() {
  const router = useRouter();
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [topicMode, setTopicMode] = useState<'manual' | 'auto'>('manual');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [opinionContent, setOpinionContent] = useState('');
  const [author, setAuthor] = useState('');
  const [predictedTopic, setPredictedTopic] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [showAISummary, setShowAISummary] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [aiSummaryContent, setAiSummaryContent] = useState<any>(null);
  const [expandedPostIts, setExpandedPostIts] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // 마크다운을 HTML로 변환하는 함수
  const parseMarkdownToHTML = (markdown: string) => {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }
    
    try {
      return markdown
        // 모든 제목 삭제 (# ## ### 모두) - 더 안전한 정규식
        .replace(/^#{1,6}\s+.+$/gm, '')
        // 중간 제목만 처리 (##)
        .replace(/^##\s+(.+)$/gm, '<h3 class="summary-h3">$1</h3>')
        // 소제목 처리 (###)
        .replace(/^###\s+(.+)$/gm, '<h4 class="summary-h4">$1</h4>')
        // 구분선은 카테고리 사이에만
        .replace(/^-{3,}$/gm, '<hr class="summary-divider" />')
        // 리스트 항목 처리
        .replace(/^-\s+(.+)$/gm, '<div class="summary-item">$1</div>')
        // 불필요한 "의견 목록:" 섹션 제거 - 더 안전한 방식
        .replace(/의견\s*목록\s*:[\s\S]*$/i, '')
        // 연속된 줄바꿈 최소화
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\n/g, '<br>');
    } catch (error) {
      console.error('마크다운 파싱 오류:', error);
      return markdown; // 원본 반환
    }
  };

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // Supabase에서 데이터 로드
  useEffect(() => {
    if (!mounted) return;
    
    loadOpinions();
  }, [mounted]);

  const loadOpinions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/opinions');
      
      if (response.ok) {
        const data = await response.json();
        setOpinions(data);
      } else {
        // API 실패시 기본 샘플 데이터 사용
        const sampleData = [
          { 
            id: 1, 
            topic: '지역문화 활동가 역량강화', 
            content: '지역문화 활동가들의 지속가능한 성장을 위해 연간 40시간 이상의 체계적인 교육 프로그램을 제공하고, 문화예술교육사 자격증 취득 지원 및 멘토링 제도를 도입해야 합니다.', 
            author: '김문화기획', 
            timestamp: '2024-01-15 09:30', 
            is_auto_classified: false 
          },
          { 
            id: 2, 
            topic: '네트워킹 및 아카이빙 플랫폼', 
            content: '전국 지역문화 활동가들이 상호 소통하고 우수사례를 공유할 수 있는 통합 온라인 플랫폼을 구축하여, 지역별 문화 프로젝트 아카이빙, 활동가 데이터베이스 구축, 협업 프로젝트 매칭 시스템을 운영해야 합니다.', 
            author: '박네트워크', 
            timestamp: '2024-01-15 10:15', 
            is_auto_classified: true 
          },
          { 
            id: 3, 
            topic: '활동가 활동환경 및 제도', 
            content: '지역문화 활동가들의 안정적인 활동 보장을 위해 최저임금 수준의 기본 활동비 지원, 4대보험 가입 지원, 문화활동 공간 임대료 지원 등 제도적 안전망을 마련해야 합니다.', 
            author: '이제도개선', 
            timestamp: '2024-01-15 11:20', 
            is_auto_classified: false 
          },
          { 
            id: 4, 
            topic: '로컬콘텐츠 개발 및 사업화', 
            content: '지역 고유의 문화자원을 활용한 관광콘텐츠, 문화상품, 체험프로그램 개발을 지원하고, 로컬크리에이터 창업 인큐베이팅을 통해 지역문화의 경제적 가치 창출과 지속가능한 수익모델 구축을 지원해야 합니다.', 
            author: '최사업화', 
            timestamp: '2024-01-15 12:45', 
            is_auto_classified: true 
          },
          { 
            id: 5, 
            topic: '문화공간 및 인프라', 
            content: '폐교, 유휴 공공시설, 빈 상가 등을 활용한 지역문화거점 조성사업을 확대하고, 문화활동에 필요한 음향·영상장비, 공연무대, 전시공간 등 인프라를 구축해야 합니다.', 
            author: '정공간조성', 
            timestamp: '2024-01-15 13:10', 
            is_auto_classified: false 
          },
          { 
            id: 6, 
            topic: '지역사회 문화 파트너십', 
            content: '지역 기업, 학교, 시민단체, 행정기관과 문화 활동가 간의 상시적 협력체계를 구축하여 기업의 사회공헌활동과 연계한 문화프로젝트, 학교 연계 문화교육 프로그램을 통해 지역사회 전체가 문화 생태계의 주체가 될 수 있는 환경을 조성해야 합니다.', 
            author: '강파트너십', 
            timestamp: '2024-01-15 14:25', 
            is_auto_classified: true 
          },
          { 
            id: 7, 
            topic: '정책 결정 과정 및 민관 협력', 
            content: '지역문화정책 수립 시 현장 활동가들의 의견이 실질적으로 반영될 수 있도록 정기적인 정책간담회, 문화정책위원회 내 활동가 참여 확대, 정책 모니터링단 운영 등을 통해 민관 협력 문화정책 거버넌스를 구축해야 합니다.', 
            author: '윤정책참여', 
            timestamp: '2024-01-15 15:40', 
            is_auto_classified: false 
          }
        ];
        setOpinions(sampleData);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      // 에러 발생시 빈 배열로 초기화
      setOpinions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTopic;
    if (topicMode === 'manual') {
      if (!selectedTopic) {
        alert('주제를 선택해주세요.');
        return;
      }
      finalTopic = selectedTopic;
    } else {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: 'classify', content: opinionContent }),
            });

            if (!response.ok) throw new Error('API 요청 실패');

            const data = await response.json();
            finalTopic = data.result.trim();
        } catch (error) {
            console.error('주제 분류 중 오류 발생:', error);
            alert('AI 주제 분류 중 오류가 발생했습니다. 수동 분류를 사용하거나 잠시 후 다시 시도해주세요.');
            setIsSubmitting(false);
            return;
        }
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/opinions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          content: opinionContent,
          author: author || '익명',
          is_auto_classified: topicMode === 'auto'
        }),
      });

      if (response.ok) {
        // 성공시 데이터 다시 로드
        await loadOpinions();
        
        // 폼 리셋
        setOpinionContent('');
        setAuthor('');
        setSelectedTopic('');
        
        // 성공 모달 표시
        setShowSuccessModal(true);
        
        // 3초 후 자동으로 모달 숨기기
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
        
        // 대시보드로 스크롤
        document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        const errorData = await response.json();
        alert(`의견 제출 실패: ${errorData.error}`);
      }
    } catch (error) {
      console.error('의견 제출 오류:', error);
      alert('의견 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 주제별 그룹핑
  const groupOpinionsByTopic = (opinionsArray: Opinion[]) => {
    return opinionsArray.reduce((groups, opinion) => {
      const topic = opinion.topic;
      if (!groups[topic]) {
        groups[topic] = [];
      }
      groups[topic].push(opinion);
      return groups;
    }, {} as Record<string, Opinion[]>);
  };

  const filteredOpinions = topicFilter ? 
    opinions.filter(op => op.topic === topicFilter) : 
    opinions;

  const groupedOpinions = groupOpinionsByTopic(filteredOpinions);

  // AI 요약 생성
  const generateAISummary = async () => {
    if (opinions.length === 0) {
      alert('요약할 의견이 없습니다. 먼저 의견을 제출해주세요.');
      return;
    }

    setIsSummaryLoading(true);
    setAiSummaryContent(null);
    setShowAISummary(true);
    
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: 'extractThemes', content: opinions }),
        });

        if (!response.ok) throw new Error('AI 요약 생성에 실패했습니다.');

        const data = await response.json();
        // Gemini가 반환한 JSON 문자열을 실제 JSON 객체로 파싱
        try {
          console.log('원본 Gemini 응답:', data.result);
          
          if (!data.result || typeof data.result !== 'string') {
            throw new Error('유효하지 않은 AI 응답 형식');
          }
          
          // 다양한 마크다운 형식 제거
          let cleanResult = data.result
            .replace(/```json\s*/g, '')  // ```json 시작
            .replace(/```\s*/g, '')      // ``` 끝
            .replace(/^json\s*/gm, '')   // 라인 시작의 json
            .trim();
          
          console.log('정리된 응답:', cleanResult);
          
          // JSON 파싱 시도
          let summaryData;
          try {
            summaryData = JSON.parse(cleanResult);
            
            // summary 필드 검증
            if (!summaryData.summary || typeof summaryData.summary !== 'string') {
              throw new Error('summary 필드가 없거나 올바르지 않습니다');
            }
          } catch (firstParseError) {
            // JSON이 아닌 일반 텍스트인 경우 직접 사용
            console.warn('JSON 파싱 실패, 일반 텍스트로 처리:', firstParseError);
            console.log('일반 텍스트 내용:', cleanResult);
            
            // 일반 텍스트를 summary로 직접 사용
            summaryData = {
              summary: cleanResult
            };
          }
          
          setAiSummaryContent(summaryData);
        } catch (parseError) {
          console.error('전체 파싱 오류:', parseError);
          console.error('원본 응답:', data.result);
          
          // 최종 폴백: 기본 응답 표시
          setAiSummaryContent({
            summary: `## 처리 상태
- AI 응답을 처리하는 중 문제가 발생했습니다.
- 다시 시도해주세요.

## 원본 응답 (디버깅용)
${data && data.result && typeof data.result === 'string' ? data.result.substring(0, 200) + '...' : '응답 없음'}`
          });
        }

    } catch (error) {
        console.error('AI 요약 생성 오류:', error);
        
        // 에러 발생 시에도 기본 내용 표시
        setAiSummaryContent({
          summary: `## 연결 상태
- 현재 AI 서비스에 연결할 수 없습니다.
- 잠시 후 다시 시도해주세요.

## 문제 해결 방법
- 네트워크 연결을 확인해주세요.
- 페이지를 새로고침 후 다시 시도해주세요.`
        });
        
        // 에러 메시지는 콘솔에만 표시하고 사용자에게는 부드러운 경험 제공
        console.warn('AI 요약 생성 실패, 기본 메시지 표시');
    } finally {
        setIsSummaryLoading(false);
        // 요약 섹션으로 스크롤
        setTimeout(() => document.getElementById('aiSummary')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const toggleExpandPostIt = (id: number) => {
    setExpandedPostIts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 컴포넌트가 마운트되지 않았거나 로딩 중이면 로딩 상태 표시
  if (!mounted || isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 네비게이션 */}
      <header>
        <nav className="navbar">
          <div className="nav-container">
            <div className="logo">
              <h1>지역문화 활동가 정책제안</h1>
            </div>
            <ul className="nav-menu">
              <li><a href="#home">홈</a></li>
              <li><a href="#opinion">의견 제출</a></li>
              <li><a href="#dashboard">의견 대시보드</a></li>
              <li><a href="#about">소개</a></li>
              <li><a href="#contact">연락처</a></li>
              <li className="auth-nav">
                {/* Removed session and status checks */}
                <button onClick={() => router.push('/auth/signin')} className="login-btn">
                  로그인
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <main>
        {/* 히어로 섹션 */}
        <section id="home" className="hero">
          <div className="hero-content">
            <h2>당신의 목소리가 세상을 바꿉니다</h2>
            <p>지역문화 활동가들의 정책 제안을 통해 지역문화 발전을 이끌어나가세요.</p>
            <button 
              className="cta-button"
              onClick={() => {
                // Removed session check
                document.getElementById('opinion')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {/* Removed session check */}
              의견 제출하기
            </button>
          </div>
        </section>

        {/* 의견 제출 폼 */}
        <section id="opinion" className="opinion-form">
          <div className="container">
            <h2>의견을 들려주세요</h2>
            
            <div className="form-container">
              <form onSubmit={handleSubmit}>
                {/* 주제 설정 */}
                <div className="form-group">
                  <div className="topic-selection-header">
                    <label>주제 설정</label>
                    <div className="topic-mode-toggle">
                      <input
                        type="radio"
                        id="manualMode"
                        name="topicMode"
                        value="manual"
                        checked={topicMode === 'manual'}
                        onChange={(e) => setTopicMode(e.target.value as 'manual' | 'auto')}
                      />
                      <label htmlFor="manualMode">직접 선택</label>
                      <input
                        type="radio"
                        id="autoMode"
                        name="topicMode"
                        value="auto"
                        checked={topicMode === 'auto'}
                        onChange={(e) => setTopicMode(e.target.value as 'manual' | 'auto')}
                      />
                      <label htmlFor="autoMode">AI 자동 분류</label>
                    </div>
                  </div>

                  {/* 직접 선택 모드 */}
                  {topicMode === 'manual' && (
                    <div className="topic-input-section">
                      <select
                        id="topic"
                        name="topic"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        required
                      >
                        <option value="" disabled hidden>주제를 선택하세요</option>
                        <option value="지역문화 활동가 역량강화">지역문화 활동가 역량강화</option>
                        <option value="네트워킹 및 아카이빙 플랫폼">네트워킹 및 아카이빙 플랫폼</option>
                        <option value="활동가 활동환경 및 제도">활동가 활동환경 및 제도</option>
                        <option value="로컬콘텐츠 개발 및 사업화">로컬콘텐츠 개발 및 사업화</option>
                        <option value="문화공간 및 인프라">문화공간 및 인프라</option>
                        <option value="지역사회 문화 파트너십">지역사회 문화 파트너십</option>
                        <option value="정책 결정 과정 및 민관 협력">정책 결정 과정 및 민관 협력</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                  )}

                  {/* AI 자동 분류 모드 */}
                  {topicMode === 'auto' && (
                    <div className="topic-input-section">
                      <div className="auto-topic-info">
                        <p>✨ AI가 의견 내용을 분석하여 자동으로 적절한 주제를 분류해드립니다.</p>
                        {predictedTopic && (
                          <div className="predicted-topic">
                            <span>예상 주제: <strong>{predictedTopic}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 의견 텍스트영역 */}
                <div className="form-group">
                  <label htmlFor="opinion">의견</label>
                  <textarea
                    id="opinion"
                    name="opinion"
                    value={opinionContent}
                    onChange={(e) => setOpinionContent(e.target.value)}
                    placeholder="당신의 의견을 자유롭게 작성해주세요..."
                    required
                  />
                </div>

                {/* 닉네임 */}
                <div className="form-group">
                  <label htmlFor="name">닉네임 (선택)</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="익명"
                  />
                </div>

                <div className="form-group submit-group">
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (topicMode === 'auto' ? 'AI 분석 중...' : '제출 중...') : '의견 제출'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* 대시보드 */}
        <section id="dashboard" className="dashboard">
          <div className="container">
            <h2>의견 대시보드</h2>

            {/* 대시보드 컨트롤 */}
            <div className="dashboard-controls">
              <button onClick={generateAISummary} className="summary-btn">
                AI 종합 요약 생성
              </button>
              <select
                id="topicFilter"
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
              >
                <option value="">모든 주제</option>
                <option value="지역문화 활동가 역량강화">지역문화 활동가 역량강화</option>
                <option value="네트워킹 및 아카이빙 플랫폼">네트워킹 및 아카이빙 플랫폼</option>
                <option value="활동가 활동환경 및 제도">활동가 활동환경 및 제도</option>
                <option value="로컬콘텐츠 개발 및 사업화">로컬콘텐츠 개발 및 사업화</option>
                <option value="문화공간 및 인프라">문화공간 및 인프라</option>
                <option value="지역사회 문화 파트너십">지역사회 문화 파트너십</option>
                <option value="정책 결정 과정 및 민관 협력">정책 결정 과정 및 민관 협력</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* AI 요약 섹션 */}
            {showAISummary && (
              <div id="aiSummary" className="ai-summary">
                <h3>정책제안 AI 요약</h3>
                <div id="summaryContent">
            {isSummaryLoading ? (
              <div className="loading-spinner-small">AI가 정책제안을 분석 중입니다. 잠시만 기다려주세요.</div>
            ) : aiSummaryContent ? (
              <div className="ai-summary-content">
                {aiSummaryContent.summary ? (
                  <div 
                    className="structured-summary"
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdownToHTML(aiSummaryContent.summary)
                    }}
                  />
                ) : aiSummaryContent.themes ? (
                  <div>
                    <h4>핵심 주제</h4>
                    <ul>
                      {aiSummaryContent.themes.map((theme: any, index: number) => (
                        <li key={index}>
                          <strong>{theme.theme}:</strong> {theme.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h4>분석 결과</h4>
                    <p>{JSON.stringify(aiSummaryContent, null, 2)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>요약 내용을 불러오는 데 실패했습니다.</p>
            )}
                </div>
              </div>
            )}

            {/* 주제별 그룹 */}
            <div className="topic-groups">
              {Object.entries(groupedOpinions).map(([topic, topicOpinions]) => (
                <div key={topic} className="topic-group">
                  <h3>
                    {topic}
                    <span className="topic-count">{topicOpinions.length}</span>
                  </h3>
                  <div className="topic-summary">
                    {topicOpinions.slice(0, 3).map((opinion) => (
                      <p key={opinion.id}>
                        <strong>{opinion.author}:</strong> {opinion.content.substring(0, 100)}...
                      </p>
                    ))}
                    {topicOpinions.length > 3 && (
                      <p><em>외 {topicOpinions.length - 3}개 의견</em></p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 포스트잇 보드 */}
            <div className="postit-board">
              {filteredOpinions.length === 0 ? (
                <div className="empty-state">
                  아직 제출된 의견이 없습니다.<br />
                  첫 번째 의견을 작성해보세요!
                </div>
              ) : (
                filteredOpinions.map((opinion) => {
                  const isExpanded = expandedPostIts.has(opinion.id);
                  const isLongContent = opinion.content.length > 120;

                  return (
                    <div key={opinion.id} className={`post-it topic-${opinion.topic.toLowerCase()}`}>
                      <div className="post-it-header">
                        <span className="post-it-topic">{opinion.topic}</span>
                      </div>
                      <div
                        className={`post-it-content ${isLongContent ? 'expandable' : ''}`}
                        onClick={() => isLongContent && toggleExpandPostIt(opinion.id)}
                      >
                        <p>
                          {isLongContent && !isExpanded
                            ? `${opinion.content.substring(0, 120)}...`
                            : opinion.content}
                        </p>
                        {isLongContent && (
                          <span className="expand-indicator">{isExpanded ? '접기' : '더보기'}</span>
                        )}
                      </div>
                      <div className="post-it-footer">
                        <span>{opinion.author}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* About 섹션 */}
        <section id="about" className="about">
          <div className="container">
            <h2>우리가 하는 일</h2>
            <div className="features">
              <div className="feature">
                <h3>의견 공유</h3>
                <p>다양한 주제에 대한 전문적인 의견을 공유하고 토론할 수 있습니다.</p>
              </div>
              <div className="feature">
                <h3>네트워킹</h3>
                <p>같은 관심사를 가진 전문가들과 연결되어 네트워크를 확장하세요.</p>
              </div>
              <div className="feature">
                <h3>영향력 확대</h3>
                <p>당신의 전문성을 바탕으로 사회에 긍정적인 영향을 미치세요.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact 섹션 */}
        <section id="contact" className="contact">
          <div className="container">
            <h2>연락처</h2>
            <div className="contact-info">
              <p>Email: contact@local-culture.com</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; 2025 지역문화 활동가 정책제안. All rights reserved.</p>
        </div>
      </footer>

      {/* 성공 메시지 모달 */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✅</div>
            <h3>의견 제출 완료!</h3>
            <p>의견이 성공적으로 제출되었습니다.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="confirm-btn"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}