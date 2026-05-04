export type ResultKey = 'succulent' | 'cactus' | 'hoya' | 'fishbone';

export type QuizOption = {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  result: ResultKey;
};

export type QuizQuestion = {
  id: number;
  title: string;
  options: QuizOption[];
};

export type ResultProfile = {
  key: ResultKey;
  name: string;
  plant: string;
  headline: string;
  summary: string;
  festivalFlaw: string;
  prescription: string;
  recommendation: string;
  studentId: string;
  vibeTags: string[];
  colors: {
    accent: string;
    pot: string;
    leaf: string;
    bloom: string;
  };
};

export const resultOrder: ResultKey[] = ['succulent', 'cactus', 'hoya', 'fishbone'];

export const resultProfiles: Record<ResultKey, ResultProfile> = {
  succulent: {
    key: 'succulent',
    name: '일감호 잔잔 다육이',
    plant: '다육이',
    headline: '조용히 왔다가, 조용히 즐기고, 이상하게 오래 기억함.',
    summary:
      '당신은 녹색지대의 소란 속에서도 자기 리듬을 지키는 사람입니다. 시끄러운 곳에 오래 있으면 기가 빨리지만, 막상 끝까지 남아 있는 경우가 많습니다. 크게 티 내지는 않아도 분위기 좋은 순간을 오래 저장해둡니다.',
    festivalFlaw: '재밌는데 재밌다고 크게 표현하지 않음.',
    prescription: '중간중간 사람 적은 곳에서 조용히 충전하세요.',
    recommendation: '작고 단단한 다육이팟',
    studentId: 'GREEN-2026-042',
    vibeTags: ['잔잔함', '일감호', '오래 기억함'],
    colors: {
      accent: '#2f8f62',
      pot: '#f28f5b',
      leaf: '#51b878',
      bloom: '#ffe06b',
    },
  },
  cactus: {
    key: 'cactus',
    name: '스탠딩존 생존 선인장',
    plant: '선인장',
    headline: '불평은 하지만 결국 제일 오래 버팀.',
    summary:
      '당신은 축제를 감성보다 생존 전략으로 접근하는 사람입니다. 공연 시간, 줄 길이, 물 사는 타이밍, 귀가 루트까지 계산해야 마음이 놓입니다. 예민해 보일 수 있지만, 같이 다니면 제일 든든한 타입입니다.',
    festivalFlaw: '계획이 틀어지면 바로 가시가 올라옴.',
    prescription: '동선은 짜되, 축제의 변수도 콘텐츠라고 생각하세요.',
    recommendation: '선명한 색감의 선인장팟',
    studentId: 'GREEN-2026-042',
    vibeTags: ['생존력', '스탠딩존', '계획형'],
    colors: {
      accent: '#1f7a68',
      pot: '#5c7cfa',
      leaf: '#1f9d78',
      bloom: '#ff6b8b',
    },
  },
  hoya: {
    key: 'hoya',
    name: '봄밤 감성 하트호야',
    plant: '하트호야',
    headline: '축제는 지나가도 스토리 하이라이트는 남음.',
    summary:
      '당신은 녹색지대의 봄밤, 조명, 음악에 약한 사람입니다. 그냥 축제라고 말하면서도, 해 지고 노래 나오면 혼자 감성 버튼이 눌립니다. 예쁜 결과물과 같이 찍은 사진을 오래 기억합니다.',
    festivalFlaw: '괜찮다고 해놓고 사진 각도는 은근히 봄.',
    prescription: '예쁜 조명 아래에서 한 장은 꼭 남기세요.',
    recommendation: '하트 포인트가 있는 하트호야팟',
    studentId: 'GREEN-2026-042',
    vibeTags: ['봄밤', '조명', '스토리'],
    colors: {
      accent: '#7c3aed',
      pot: '#f6c85f',
      leaf: '#3fbf7f',
      bloom: '#ff7bbd',
    },
  },
  fishbone: {
    key: 'fishbone',
    name: '구석부스 취향 피쉬본',
    plant: '피쉬본',
    headline: '메인보다 사이드에서 인생 콘텐츠를 건짐.',
    summary:
      '당신은 메인보다 구석에서 재미를 찾는 사람입니다. 남들이 다 가는 곳보다, “저건 뭐 하는 데지?” 싶은 곳에 더 끌립니다. 평범한 기념품보다 이상하게 기억나는 결과물을 좋아합니다.',
    festivalFlaw: '대중적인 건 싫다면서 은근히 반응은 신경 씀.',
    prescription: '구석부스 하나쯤은 믿고 들어가도 됩니다.',
    recommendation: '질감과 패턴이 살아 있는 피쉬본팟',
    studentId: 'GREEN-2026-042',
    vibeTags: ['구석부스', '취향', '사이드 콘텐츠'],
    colors: {
      accent: '#d94f30',
      pot: '#36a3a8',
      leaf: '#7cc04b',
      bloom: '#ffe45c',
    },
  },
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    title: '녹색지대 입장 10분 만에 나는?',
    options: [
      {
        id: 'A',
        text: '“일단 한 바퀴만 돌자” 해놓고 일감호 쪽 공기부터 마시는 중',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '공연 시간표, 줄 길이, 화장실 위치까지 이미 머릿속에 넣는 중',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '“잠깐만 여기 빛 예쁘다” 하면서 친구를 자연스럽게 세워둠',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '메인 부스보다 옆에 있는 정체불명 부스가 더 신경 쓰임',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 2,
    title: '친구가 “뭐부터 할까?”라고 물으면?',
    options: [
      {
        id: 'A',
        text: '“사람 좀 덜한 데부터 가자. 나 아직 몸이 축제에 적응 안 됨”',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '“지금 저기부터 가야 안 꼬임. 20분 뒤엔 줄 길어질 듯”',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '“잠깐만, 저거 사진 먼저 찍고 가면 안 됨?”',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '“저기 아무도 안 가는데 그래서 좀 궁금함”',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 3,
    title: '부스 앞에서 나를 멈추게 하는 말은?',
    options: [
      {
        id: 'A',
        text: '“직접 만든 거 가져갈 수 있어요”',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '“대기 5분이면 돼요”',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '“완성하면 사진 진짜 예쁘게 나와요”',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '“이거 해본 사람 아직 별로 없어요”',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 4,
    title: '녹색지대에서 스토리 올릴 때 나는?',
    options: [
      {
        id: 'A',
        text: '사람 많은 사진보다 분위기 있는 한 장 조용히 올림',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '사진 고르고 문구 정리하고 위치 태그까지 맞춰야 올림',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '노래, 조명, 문구 삼박자 맞아야 마음이 편함',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '남들은 왜 찍었는지 모를 장면을 혼자 만족하면서 올림',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 5,
    title: '공연 기다리는 동안 내 상태는?',
    options: [
      {
        id: 'A',
        text: '말수는 줄었는데 사실 속으로는 꽤 즐기는 중',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '자리, 물, 귀가 루트, 친구 이탈 가능성까지 계산 중',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '해 지는 순간 갑자기 “아 이게 청춘인가” 상태 됨',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '공연보다 주변 사람들 리액션 구경이 더 재밌음',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 6,
    title: '축제에서 돈 쓸 때 내 기준은?',
    options: [
      {
        id: 'A',
        text: '책상 위에 두고 오래 볼 수 있으면 마음이 흔들림',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '가격, 퀄리티, 들고 다니기 편한지까지 따짐',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '예쁘면 이미 마음은 결제했고 손만 늦게 움직임',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '이상한데 묘하게 내 취향이면 안 살 수가 없음',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 7,
    title: '축제 끝나고 집 가는 길에 드는 생각은?',
    options: [
      {
        id: 'A',
        text: '“힘들었는데… 좋긴 했다.”',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '“오늘 동선 나쁘지 않았다. 다음엔 더 잘 짤 수 있음.”',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '“사진 보니까 갑자기 좀 아련하네.”',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '“근데 아까 그 부스 진짜 뭐였지? 아직도 웃김.”',
        result: 'fishbone',
      },
    ],
  },
];

export const loadingMessages = [
  '일감호 수면에 비친 화분 자아 확인 중...',
  '녹색지대 파도에 떠밀려온 성향 분석 중...',
  '부스 앞에서 멈칫한 횟수 계산 중...',
  '봄밤 감성 과다 여부 측정 중...',
  '스탠딩존 생존 가능성 점검 중...',
  '당신의 화분을 녹색지대에서 수색 중...',
  '녹색지대에서 당신의 화분이 발견되었습니다.',
];

export function calculateResult(answers: ResultKey[]) {
  const scores = resultOrder.reduce(
    (acc, key) => {
      acc[key] = 0;
      return acc;
    },
    {} as Record<ResultKey, number>,
  );

  answers.forEach((answer) => {
    scores[answer] += 1;
  });

  const winner = resultOrder.reduce((best, key) => {
    return scores[key] > scores[best] ? key : best;
  }, resultOrder[0]);

  return {
    key: winner,
    profile: resultProfiles[winner],
    scores,
    scorePercent: Math.round((scores[winner] / quizQuestions.length) * 100),
  };
}
