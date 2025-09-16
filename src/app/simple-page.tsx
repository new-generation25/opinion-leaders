'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Opinion {
  id: number;
  topic: string;
  content: string;
  author: string;
  timestamp: string;
  isAutoClassified?: boolean;
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

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // localStorage에서 데이터 로드
  useEffect(() => {
    if (!mounted) return;
    
    const savedOpinions = localStorage.getItem('opinions');
    if (savedOpinions) {
      setOpinions(JSON.parse(savedOpinions));
    } else {
      // 더미 데이터 생성
      const dummyOpinions: Opinion[] = [
        { id: 1, topic: '지역문화 활동가 역량강화', content: '지역문화 활동가들의 전문성 향상을 위한 교육 프로그램 확대가 필요합니다.', author: '김활동가', timestamp: '2024-01-15 09:30', isAutoClassified: false },
        { id: 2, topic: '네트워킹 및 아카이빙 플랫폼', content: '활동가들 간의 네트워킹과 활동 기록 보존을 위한 디지털 플랫폼 구축이 시급합니다.', author: '박네트워킹', timestamp: '2024-01-15 10:15', isAutoClassified: true },
        { id: 3, topic: '활동가 활동환경 및 제도', content: '지역문화 활동가들의 안정적인 활동을 위한 제도적 지원체계 마련이 필요합니다.', author: '이제도', timestamp: '2024-01-15 11:20', isAutoClassified: false },
        { id: 4, topic: '로컬콘텐츠 개발 및 사업화', content: '지역 특색을 살린 콘텐츠 개발과 수익모델 창출 지원이 필요합니다.', author: '최콘텐츠', timestamp: '2024-01-15 12:45', isAutoClassified: true },
        { id: 5, topic: '문화공간 및 인프라', content: '지역문화 활동을 위한 공간 확보와 인프라 구축이 시급합니다.', author: '정공간', timestamp: '2024-01-15 13:10', isAutoClassified: false },
        { id: 6, topic: '지역사회 문화 파트너십', content: '지역사회와 문화 활동가들 간의 협력체계 강화가 필요합니다.', author: '강파트너십', timestamp: '2024-01-15 14:25', isAutoClassified: true },
        { id: 7, topic: '정책 결정 과정 및 민관 협력', content: '문화정책 결정 과정에 활동가들의 참여 확대가 필요합니다.', author: '윤정책', timestamp: '2024-01-15 15:40', isAutoClassified: false },
        { id: 8, topic: '지역문화 활동가 역량강화', content: '활동가들의 리더십과 기획 능력 향상을 위한 멘토링 제도가 필요합니다.', author: '조역량', timestamp: '2024-01-15 16:20', isAutoClassified: true },
        { id: 9, topic: '네트워킹 및 아카이빙 플랫폼', content: '지역별 문화 활동 성과를 체계적으로 기록하고 공유할 플랫폼이 필요합니다.', author: '임아카이빙', timestamp: '2024-01-15 17:05', isAutoClassified: false },
        { id: 10, topic: '활동가 활동환경 및 제도', content: '활동가들의 처우 개선과 지속가능한 활동을 위한 제도적 보장이 필요합니다.', author: '한환경', timestamp: '2024-01-15 18:30', isAutoClassified: true },
        { id: 11, topic: '로컬콘텐츠 개발 및 사업화', content: '지역 고유의 문화자원을 활용한 창의적 콘텐츠 개발 지원이 필요합니다.', author: '백개발', timestamp: '2024-01-16 09:15', isAutoClassified: false },
        { id: 12, topic: '문화공간 및 인프라', content: '폐교나 유휴시설을 활용한 문화공간 조성 사업 확대가 필요합니다.', author: '노인프라', timestamp: '2024-01-16 10:45', isAutoClassified: true },
        { id: 13, topic: '지역사회 문화 파트너십', content: '지역 기업과 문화 활동가들 간의 상생 협력 모델 개발이 필요합니다.', author: '유협력', timestamp: '2024-01-16 11:55', isAutoClassified: false },
        { id: 14, topic: '정책 결정 과정 및 민관 협력', content: '문화정책 수립 시 현장 활동가들의 의견 수렴 체계 구축이 필요합니다.', author: '송민관', timestamp: '2024-01-16 13:20', isAutoClassified: true },
        { id: 15, topic: '지역문화 활동가 역량강화', content: '디지털 기술 활용 능력 향상을 위한 교육 프로그램이 필요합니다.', author: '전디지털', timestamp: '2024-01-16 14:10', isAutoClassified: false },
        { id: 16, topic: '네트워킹 및 아카이빙 플랫폼', content: '전국 문화 활동가들의 경험과 노하우를 공유할 온라인 플랫폼이 필요합니다.', author: '홍공유', timestamp: '2024-01-16 15:35', isAutoClassified: true },
        { id: 17, topic: '활동가 활동환경 및 제도', content: '문화 활동가들의 사회보장 제도 확대가 시급합니다.', author: '문보장', timestamp: '2024-01-16 16:50', isAutoClassified: false },
        { id: 18, topic: '로컬콘텐츠 개발 및 사업화', content: '지역문화 콘텐츠의 상업화를 위한 마케팅 지원이 필요합니다.', author: '장마케팅', timestamp: '2024-01-16 17:25', isAutoClassified: true },
        { id: 19, topic: '문화공간 및 인프라', content: '문화 활동을 위한 장비 대여 시스템 구축이 필요합니다.', author: '표장비', timestamp: '2024-01-16 18:40', isAutoClassified: false },
        { id: 20, topic: '지역사회 문화 파트너십', content: '지역축제와 문화행사의 지속가능한 운영 모델 개발이 필요합니다.', author: '남지속가능', timestamp: '2024-01-16 19:15', isAutoClassified: true }
      ];
      
      setOpinions(dummyOpinions);
      localStorage.setItem('opinions', JSON.stringify(dummyOpinions));
    }
  }, [mounted]);

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
            alert('AI 주제 분류 중 오류가 발생했습니다. Gemini API 키가 설정되었는지 확인해주세요. 수동 분류를 사용하거나 잠시 후 다시 시도해주세요.');
            setIsSubmitting(false);
            return;
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const newOpinion: Opinion = {
      id: Date.now(),
      topic: finalTopic,
      content: opinionContent,
      author: author || '익명',
      timestamp: new Date().toISOString(),
      isAutoClassified: topicMode === 'auto'
    };
    
    const updatedOpinions = [...opinions, newOpinion];
    setOpinions(updatedOpinions);
    localStorage.setItem('opinions', JSON.stringify(updatedOpinions));
    
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
        const summaryData = JSON.parse(data.result.replace(/```json\n?/, '').replace(/```$/, ''));
        setAiSummaryContent(summaryData);

    } catch (error) {
        console.error('AI 요약 생성 오류:', error);
        const errorMessage = error instanceof Error ? error.message : 'AI 요약 생성 중 오류가 발생했습니다.';
        alert(`AI 요약 생성 실패: ${errorMessage}\n\nGemini API 키가 설정되었는지 확인해주세요.`);
        setShowAISummary(false);
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

  // 컴포넌트가 마운트되지 않았으면 로딩 상태 표시
  if (!mounted) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">로딩 중...</div>
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
                        <option value="">주제를 선택하세요</option>
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
                    {isSubmitting ? 'AI 분석 중...' : '의견 제출'}
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
                <h3>AI 종합 요약</h3>
                <div id="summaryContent">
                  {isSummaryLoading ? (
                    <div className="loading-spinner-small">AI가 핵심 주제를 분석 중입니다...</div>
                  ) : aiSummaryContent && aiSummaryContent.themes ? (
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