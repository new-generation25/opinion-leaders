let opinions = JSON.parse(localStorage.getItem('opinions')) || [];

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const opinionForm = document.getElementById('opinionForm');
    const generateSummaryBtn = document.getElementById('generateSummary');
    const topicFilter = document.getElementById('topicFilter');
    const manualModeRadio = document.getElementById('manualMode');
    const autoModeRadio = document.getElementById('autoMode');
    const manualTopicSelect = document.getElementById('manualTopicSelect');
    const autoTopicInfo = document.getElementById('autoTopicInfo');
    const opinionTextarea = document.getElementById('opinion');
    const predictedTopicDiv = document.getElementById('predictedTopic');
    const topicPredictionSpan = document.getElementById('topicPrediction');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('click', function() {
        document.querySelector('#opinion').scrollIntoView({
            behavior: 'smooth'
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = '#fff';
            navbar.style.backdropFilter = 'none';
        }
    });

    opinionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const topicMode = formData.get('topicMode');
        let finalTopic;
        
        if (topicMode === 'manual') {
            finalTopic = formData.get('topic');
            if (!finalTopic) {
                alert('주제를 선택해주세요.');
                return;
            }
        } else {
            finalTopic = classifyOpinionTopic(formData.get('opinion'));
        }
        
        const opinion = {
            id: Date.now(),
            topic: finalTopic,
            content: formData.get('opinion'),
            author: formData.get('name') || '익명',
            timestamp: new Date().toISOString(),
            isAutoClassified: topicMode === 'auto'
        };
        
        opinions.push(opinion);
        localStorage.setItem('opinions', JSON.stringify(opinions));
        
        this.reset();
        
        alert('의견이 성공적으로 제출되었습니다!');
        
        updateDashboard();
        
        document.querySelector('#dashboard').scrollIntoView({
            behavior: 'smooth'
        });
    });

    generateSummaryBtn.addEventListener('click', function() {
        generateAISummary();
    });

    topicFilter.addEventListener('change', function() {
        updateDashboard(this.value);
    });

    manualModeRadio.addEventListener('change', function() {
        if (this.checked) {
            manualTopicSelect.style.display = 'block';
            autoTopicInfo.style.display = 'none';
            document.getElementById('topic').required = true;
        }
    });

    autoModeRadio.addEventListener('change', function() {
        if (this.checked) {
            manualTopicSelect.style.display = 'none';
            autoTopicInfo.style.display = 'block';
            document.getElementById('topic').required = false;
            predictOpinionTopic();
        }
    });

    opinionTextarea.addEventListener('input', function() {
        if (autoModeRadio.checked && this.value.length > 10) {
            predictOpinionTopic();
        }
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.feature, .service-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    updateDashboard();
    initializeTopicMode();
});

function initializeTopicMode() {
    if (manualModeRadio.checked) {
        manualTopicSelect.style.display = 'block';
        autoTopicInfo.style.display = 'none';
        document.getElementById('topic').required = true;
    } else if (autoModeRadio.checked) {
        manualTopicSelect.style.display = 'none';
        autoTopicInfo.style.display = 'block';
        document.getElementById('topic').required = false;
    }
}

function updateDashboard(filterTopic = '') {
    const filteredOpinions = filterTopic ? 
        opinions.filter(op => op.topic === filterTopic) : 
        opinions;
    
    updateTopicGroups(filteredOpinions);
    updatePostitBoard(filteredOpinions);
}

function updateTopicGroups(filteredOpinions) {
    const topicGroups = document.getElementById('topicGroups');
    const grouped = groupOpinionsByTopic(filteredOpinions);
    
    topicGroups.innerHTML = '';
    
    Object.keys(grouped).forEach(topic => {
        const group = document.createElement('div');
        group.className = 'topic-group';
        group.innerHTML = `
            <h3>${topic} <span class="topic-count">${grouped[topic].length}</span></h3>
            <div class="topic-summary">
                ${grouped[topic].slice(0, 3).map(op => 
                    `<p><strong>${op.author}:</strong> ${op.content.substring(0, 100)}...</p>`
                ).join('')}
                ${grouped[topic].length > 3 ? `<p><em>외 ${grouped[topic].length - 3}개 의견</em></p>` : ''}
            </div>
        `;
        topicGroups.appendChild(group);
    });
}

function updatePostitBoard(filteredOpinions) {
    const postitBoard = document.getElementById('postitBoard');
    
    if (filteredOpinions.length === 0) {
        postitBoard.innerHTML = '<div class="empty-state">아직 제출된 의견이 없습니다.<br>첫 번째 의견을 작성해보세요!</div>';
        return;
    }
    
    postitBoard.innerHTML = '';
    
    filteredOpinions.forEach(opinion => {
        const postit = document.createElement('div');
        postit.className = 'postit';
        postit.innerHTML = `
            <div class="postit-topic">${opinion.topic}</div>
            <div class="postit-content">${opinion.content}</div>
            <div class="postit-author">- ${opinion.author}</div>
        `;
        postitBoard.appendChild(postit);
    });
}

function groupOpinionsByTopic(opinionsArray) {
    return opinionsArray.reduce((groups, opinion) => {
        const topic = opinion.topic;
        if (!groups[topic]) {
            groups[topic] = [];
        }
        groups[topic].push(opinion);
        return groups;
    }, {});
}

function generateAISummary() {
    const aiSummary = document.getElementById('aiSummary');
    const summaryContent = document.getElementById('summaryContent');
    
    if (opinions.length === 0) {
        alert('요약할 의견이 없습니다. 먼저 의견을 제출해주세요.');
        return;
    }
    
    const grouped = groupOpinionsByTopic(opinions);
    const topicSummaries = Object.keys(grouped).map(topic => {
        const topicOpinions = grouped[topic];
        const keyPoints = extractKeyPoints(topicOpinions);
        return `
            <div class="topic-summary-section">
                <h4>${topic} (${topicOpinions.length}개 의견)</h4>
                <ul>
                    ${keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
                <p><strong>주요 키워드:</strong> ${extractKeywords(topicOpinions).join(', ')}</p>
            </div>
        `;
    });
    
    const overallSentiment = analyzeSentiment(opinions);
    
    summaryContent.innerHTML = `
        <div class="summary-overview">
            <h4>전체 요약</h4>
            <p><strong>총 의견 수:</strong> ${opinions.length}개</p>
            <p><strong>다뤄진 주제:</strong> ${Object.keys(grouped).length}개</p>
            <p><strong>전체적인 분위기:</strong> ${overallSentiment}</p>
        </div>
        ${topicSummaries.join('')}
        <div class="action-items">
            <h4>제안사항</h4>
            <ul>
                <li>가장 많은 의견이 수집된 "${getMostDiscussedTopic(grouped)}" 주제에 대한 심화 논의 필요</li>
                <li>다양한 관점의 의견들을 종합하여 정책 제안서 작성 권장</li>
                <li>소수 의견도 중요하므로 모든 목소리를 반영한 균형잡힌 결론 도출 필요</li>
            </ul>
        </div>
    `;
    
    aiSummary.style.display = 'block';
    aiSummary.scrollIntoView({ behavior: 'smooth' });
}

function extractKeyPoints(opinions) {
    const allText = opinions.map(op => op.content).join(' ');
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
}

function extractKeywords(opinions) {
    const text = opinions.map(op => op.content).join(' ').toLowerCase();
    const words = text.match(/[가-힣]{2,}/g) || [];
    const frequency = {};
    
    words.forEach(word => {
        if (word.length > 1) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    });
    
    return Object.keys(frequency)
        .sort((a, b) => frequency[b] - frequency[a])
        .slice(0, 5);
}

function analyzeSentiment(opinions) {
    const positiveWords = ['좋', '훌륭', '성공', '발전', '개선', '긍정', '만족'];
    const negativeWords = ['나쁘', '문제', '걱정', '부족', '실패', '부정', '우려'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    opinions.forEach(opinion => {
        const content = opinion.content.toLowerCase();
        positiveWords.forEach(word => {
            if (content.includes(word)) positiveCount++;
        });
        negativeWords.forEach(word => {
            if (content.includes(word)) negativeCount++;
        });
    });
    
    if (positiveCount > negativeCount) return '긍정적';
    if (negativeCount > positiveCount) return '우려가 많음';
    return '중립적';
}

function getMostDiscussedTopic(grouped) {
    return Object.keys(grouped).reduce((a, b) => 
        grouped[a].length > grouped[b].length ? a : b
    );
}

function classifyOpinionTopic(text) {
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
}

function predictOpinionTopic() {
    const text = opinionTextarea.value;
    if (text.length < 10) {
        predictedTopicDiv.style.display = 'none';
        return;
    }
    
    const predictedTopic = classifyOpinionTopic(text);
    topicPredictionSpan.textContent = predictedTopic;
    predictedTopicDiv.style.display = 'block';
}