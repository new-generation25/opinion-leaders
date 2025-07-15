'use client';

import { useState, useEffect } from 'react';

interface Opinion {
  id: number;
  topic: string;
  content: string;
  author: string;
  timestamp: string;
  isAutoClassified?: boolean;
}

export default function SimplePage() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [topicMode, setTopicMode] = useState<'manual' | 'auto'>('manual');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [opinionContent, setOpinionContent] = useState('');
  const [author, setAuthor] = useState('');
  const [predictedTopic, setPredictedTopic] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [showAISummary, setShowAISummary] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 원본 HTML의 키워드 기반 AI 분류 로직
  const classifyOpinionTopic = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    const topicKeywords = {
      '교육': ['교육', '학교', '대학', '학생', '선생님', '교사', '학습', '공부', '교과서', '시험', '입시', '수업', '강의', '학원', '교직'],
      '환경': ['환경', '기후', '온난화', '공해', '오염', '재활용', '에너지', '태양광', '친환경', '탄소', '미세먼지', '자연', '생태', '숲', '바다'],
      '경제': ['경제', '돈', '세금', '금리', '주식', '투자', '부동산', '물가', '인플레이션', '일자리', '취업', '임금', '연금', '예산', '재정'],
      '기술': ['기술', '인공지능', 'AI', '컴퓨터', '소프트웨어', '앱', '프로그램', '디지털', '인터넷', '스마트폰', '로봇', '자동화', '빅데이터'],
      '정치': ['정치', '정부', '대통령', '국회', '의원', '선거', '투표', '정당', '정책', '법', '제도', '행정', '공무원', '민주주의'],
      '사회': ['사회', '복지', '의료', '건강', '병원', '안전', '범죄', '교통', '주거', '결혼', '출산', '육아', '노인', '청년', '여성'],
      '문화': ['문화', '예술', '음악', '영화', '드라마', '책', '문학', '전시', '공연', '축제', '여행', '스포츠', '게임', '엔터테인먼트']
    };
    
    let maxScore = 0;
    let predictedTopic = '기타';
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      let score = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        predictedTopic = topic;
      }
    }
    
    return predictedTopic;
  };

  // 실시간 주제 예측
  useEffect(() => {
    if (topicMode === 'auto' && opinionContent.length > 10) {
      const predicted = classifyOpinionTopic(opinionContent);
      setPredictedTopic(predicted);
    } else {
      setPredictedTopic('');
    }
  }, [opinionContent, topicMode]);

  // localStorage에서 데이터 로드
  useEffect(() => {
    const savedOpinions = localStorage.getItem('opinions');
    if (savedOpinions) {
      setOpinions(JSON.parse(savedOpinions));
    } else {
      // 더미 데이터 생성
      const dummyOpinions: Opinion[] = [
        { id: 1, topic: '교육', content: '온라인 수업의 품질을 높이려면 교사들의 디지털 역량 강화가 필요합니다.', author: '김교육', timestamp: '2024-01-15 09:30', isAutoClassified: false },
        { id: 2, topic: '환경', content: '플라스틱 사용을 줄이기 위해 친환경 포장재 사용을 의무화해야 합니다.', author: '박환경', timestamp: '2024-01-15 10:15', isAutoClassified: true },
        { id: 3, topic: '경제', content: '중소기업 지원을 위한 세제 혜택을 확대해야 경제가 살아날 것입니다.', author: '이경제', timestamp: '2024-01-15 11:20', isAutoClassified: false },
        { id: 4, topic: '기술', content: '인공지능 기술이 발달하면서 일자리 변화에 대한 대비책이 필요합니다.', author: '최기술', timestamp: '2024-01-15 12:45', isAutoClassified: true },
        { id: 5, topic: '정치', content: '지방자치단체의 권한을 강화해서 지역 특성에 맞는 정책을 펼쳐야 합니다.', author: '정정치', timestamp: '2024-01-15 13:10', isAutoClassified: false },
        { id: 6, topic: '사회', content: '고령화 사회에 대비한 의료 시설 확충과 복지 제도 개선이 시급합니다.', author: '강사회', timestamp: '2024-01-15 14:25', isAutoClassified: true },
        { id: 7, topic: '문화', content: '지역 문화 예술 지원을 늘려서 문화 다양성을 보장해야 합니다.', author: '윤문화', timestamp: '2024-01-15 15:40', isAutoClassified: false },
        { id: 8, topic: '교육', content: '학생들의 창의성을 기르는 교육과정 개편이 필요하다고 생각합니다.', author: '조학생', timestamp: '2024-01-15 16:20', isAutoClassified: true },
        { id: 9, topic: '환경', content: '재생에너지 확대를 통해 탄소 중립을 달성해야 합니다.', author: '임재생', timestamp: '2024-01-15 17:05', isAutoClassified: false },
        { id: 10, topic: '경제', content: '부동산 가격 안정화를 위한 근본적인 대책이 마련되어야 합니다.', author: '한부동산', timestamp: '2024-01-15 18:30', isAutoClassified: true },
        { id: 11, topic: '기술', content: '개인정보 보호를 위한 더 강력한 보안 기술 개발이 필요합니다.', author: '백보안', timestamp: '2024-01-16 09:15', isAutoClassified: false },
        { id: 12, topic: '정치', content: '국회의원들의 의정활동을 더 투명하게 공개해야 합니다.', author: '노투명', timestamp: '2024-01-16 10:45', isAutoClassified: true },
        { id: 13, topic: '사회', content: '청년들의 주거 문제 해결을 위한 공공임대주택 확대가 필요합니다.', author: '유청년', timestamp: '2024-01-16 11:55', isAutoClassified: false },
        { id: 14, topic: '문화', content: '전통문화 보존과 현대적 활용 방안을 모색해야 합니다.', author: '송전통', timestamp: '2024-01-16 13:20', isAutoClassified: true },
        { id: 15, topic: '교육', content: '교육 격차 해소를 위한 맞춤형 학습 지원이 확대되어야 합니다.', author: '전격차', timestamp: '2024-01-16 14:10', isAutoClassified: false },
        { id: 16, topic: '환경', content: '도시 녹지 공간 확대로 시민들의 삶의 질을 향상시켜야 합니다.', author: '홍녹지', timestamp: '2024-01-16 15:35', isAutoClassified: true },
        { id: 17, topic: '경제', content: '스타트업 생태계 활성화를 위한 투자 환경 개선이 필요합니다.', author: '문스타트업', timestamp: '2024-01-16 16:50', isAutoClassified: false },
        { id: 18, topic: '기술', content: '5G 인프라 구축을 통한 스마트시티 건설을 가속화해야 합니다.', author: '장스마트', timestamp: '2024-01-16 17:25', isAutoClassified: true },
        { id: 19, topic: '사회', content: '다문화 가정 지원 프로그램을 확대해서 사회 통합을 이루어야 합니다.', author: '표다문화', timestamp: '2024-01-16 18:40', isAutoClassified: false },
        { id: 20, topic: '문화', content: '지역축제를 통한 관광산업 활성화 방안을 마련해야 합니다.', author: '남축제', timestamp: '2024-01-16 19:15', isAutoClassified: true }
      ];
      
      setOpinions(dummyOpinions);
      localStorage.setItem('opinions', JSON.stringify(dummyOpinions));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTopic;
    if (topicMode === 'manual') {
      if (!selectedTopic) {
        alert('주제를 선택해주세요.');
        return;
      }
      finalTopic = selectedTopic;
    } else {
      finalTopic = classifyOpinionTopic(opinionContent);
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
  const generateAISummary = () => {
    if (opinions.length === 0) {
      alert('요약할 의견이 없습니다. 먼저 의견을 제출해주세요.');
      return;
    }
    setShowAISummary(true);
    document.getElementById('aiSummary')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* 네비게이션 */}
      <header>
        <nav className="navbar">
          <div className="nav-container">
            <div className="logo">
              <h1>Opinion Leader</h1>
            </div>
            <ul className="nav-menu">
              <li><a href="#home">홈</a></li>
              <li><a href="#opinion">의견 제출</a></li>
              <li><a href="#dashboard">의견 대시보드</a></li>
              <li><a href="#about">소개</a></li>
              <li><a href="#contact">연락처</a></li>
            </ul>
          </div>
        </nav>
      </header>

      <main>
        {/* 히어로 섹션 */}
        <section id="home" className="hero">
          <div className="hero-content">
            <h2>당신의 목소리가 세상을 바꿉니다</h2>
            <p>Opinion Leader와 함께 영향력 있는 의견을 나누고, 변화를 이끌어나가세요.</p>
            <button 
              className="cta-button"
              onClick={() => document.getElementById('opinion')?.scrollIntoView({ behavior: 'smooth' })}
            >
              시작하기
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
                        <option value="교육">교육</option>
                        <option value="환경">환경</option>
                        <option value="경제">경제</option>
                        <option value="기술">기술</option>
                        <option value="정치">정치</option>
                        <option value="사회">사회</option>
                        <option value="문화">문화</option>
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

                <button type="submit" className="submit-btn">
                  의견 제출
                </button>
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
                <option value="교육">교육</option>
                <option value="환경">환경</option>
                <option value="경제">경제</option>
                <option value="기술">기술</option>
                <option value="정치">정치</option>
                <option value="사회">사회</option>
                <option value="문화">문화</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* AI 요약 섹션 */}
            {showAISummary && (
              <div id="aiSummary" className="ai-summary">
                <h3>AI 종합 요약</h3>
                <div id="summaryContent">
                  <div>
                    <h4>전체 요약</h4>
                    <p><strong>총 의견 수:</strong> {opinions.length}개</p>
                    <p><strong>다뤄진 주제:</strong> {Object.keys(groupedOpinions).length}개</p>
                    <p><strong>전체적인 분위기:</strong> 다양한 관점</p>
                  </div>
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
                filteredOpinions.map((opinion) => (
                  <div key={opinion.id} className="postit">
                    <div className="postit-topic">{opinion.topic}</div>
                    <div className="postit-content">{opinion.content}</div>
                    <div className="postit-author">- {opinion.author}</div>
                  </div>
                ))
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

        {/* Services 섹션 */}
        <section id="services" className="services">
          <div className="container">
            <h2>서비스</h2>
            <div className="service-grid">
              <div className="service-card">
                <h3>콘텐츠 제작</h3>
                <p>전문적인 콘텐츠 제작 및 배포 서비스를 제공합니다.</p>
              </div>
              <div className="service-card">
                <h3>컨설팅</h3>
                <p>개인 브랜딩 및 온라인 영향력 확대를 위한 전문 컨설팅입니다.</p>
              </div>
              <div className="service-card">
                <h3>커뮤니티</h3>
                <p>오피니언 리더들을 위한 전용 커뮤니티를 운영합니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact 섹션 */}
        <section id="contact" className="contact">
          <div className="container">
            <h2>연락처</h2>
            <div className="contact-info">
              <p>Email: contact@opinion-leader.com</p>
              <p>Phone: +82-2-1234-5678</p>
              <p>Address: 서울특별시 강남구 테헤란로 123</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; 2025 Opinion Leader. All rights reserved.</p>
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