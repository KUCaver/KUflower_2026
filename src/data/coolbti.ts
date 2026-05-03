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
    name: '말라죽을 듯 안 죽는 다육이형',
    plant: '다육이',
    headline: '생존력, 무심함, 거리감으로 버티는 타입',
    summary:
      '겉으로 보기엔 방치돼도 괜찮아 보이는 타입이다. 실제로도 꽤 버틴다. 다만 너무 오래 방치하면 조용히 상처받는다.',
    festivalFlaw: '관심을 많이 주면 부담스러워하고, 방치하면 오히려 잘 크는 척한다.',
    prescription: '너무 방치하지도, 너무 챙기지도 말고 적당한 거리에서 물 한 번 주기.',
    recommendation: '작고 단단한 화분에 심은 다육이',
    studentId: 'GZ-26-SUC',
    vibeTags: ['조용한 생존', '은근한 몰입', '오래 남는 장면'],
    colors: {
      accent: '#2f8f62',
      pot: '#f28f5b',
      leaf: '#51b878',
      bloom: '#ffe06b',
    },
  },
  cactus: {
    key: 'cactus',
    name: '물 주면 썩는 과잉보호 선인장형',
    plant: '선인장',
    headline: '과몰입, 애정 과다, 방어력으로 굴러가는 타입',
    summary:
      '애정은 많은데 가끔 양 조절이 안 된다. 좋아하면 물부터 붓는 타입이라 상대가 선인장이라면 이미 위험하다.',
    festivalFlaw: '마음은 예쁜데 상대 화분은 가끔 숨 막힌다.',
    prescription: '좋아하는 마음을 한 번에 붓지 말고, 오늘은 반 컵만 주기.',
    recommendation: '가시가 있지만 은근히 믿음직한 선인장',
    studentId: 'GZ-26-CAC',
    vibeTags: ['루트 설계', '체력 관리', '끝까지 생존'],
    colors: {
      accent: '#1f7a68',
      pot: '#5c7cfa',
      leaf: '#1f9d78',
      bloom: '#ff6b8b',
    },
  },
  hoya: {
    key: 'hoya',
    name: '햇빛 없으면 삐지는 하트호야형',
    plant: '호야',
    headline: '감성, 인정욕구, 섬세함에 반응하는 타입',
    summary:
      '괜찮다고 말하지만 사실 분위기와 온도를 다 탄다. 예쁘다는 말에 약하고, 은근히 오래 기억한다.',
    festivalFlaw: '관리 난이도는 낮은 척하지만 생각보다 까다롭다.',
    prescription: '햇빛, 칭찬, 예쁜 조명을 적당히 공급하기.',
    recommendation: '조명 아래에서 진가가 나는 하트호야',
    studentId: 'GZ-26-HOY',
    vibeTags: ['감성 과다', '스토리 장인', '조명 반응'],
    colors: {
      accent: '#7c3aed',
      pot: '#f6c85f',
      leaf: '#3fbf7f',
      bloom: '#ff7bbd',
    },
  },
  fishbone: {
    key: 'fishbone',
    name: '생긴 건 힙한데 은근 예민한 피쉬본형',
    plant: '피쉬본',
    headline: '개성, 취향, 예민함이 선명한 타입',
    summary:
      '평범한 건 싫고, 너무 튀는 건 또 부담스럽다. 취향 있다는 말은 좋아하지만 설명하라고 하면 귀찮다.',
    festivalFlaw: '겉으로는 예술적이지만 안쪽은 그냥 흙일 때가 있다.',
    prescription: '취향을 설명하려고 애쓰지 말고, 그냥 네 선반에 올려두기.',
    recommendation: '평범한 선반을 이상하게 살리는 피쉬본',
    studentId: 'GZ-26-FIS',
    vibeTags: ['사이드 퀘스트', '취향 확실', '뜻밖의 수확'],
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
    title: '단톡에서 내 포지션은?',
    options: [
      {
        id: 'A',
        text: '말은 별로 안 하는데 다 보고 있음.',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '좋은 생각 나면 냅다 던지고 갑자기 과몰입함.',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '일단 “좋은데?” 하고 분위기를 살핌.',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '남들이 다 넘어간 이상한 포인트에 꽂힘.',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 2,
    title: '축제 부스에 끌리는 이유는?',
    options: [
      {
        id: 'A',
        text: '귀여운 거 하나 만들어서 오래 두고 싶음.',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '친구가 하자고 하면 일단 같이 가서 챙겨줌.',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '결과물 들고 사진 찍으면 예쁠 것 같음.',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '뭔가 이상하게 웃겨서 해보고 싶음.',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 3,
    title: '내가 식물이라면 제일 싫은 상황은?',
    options: [
      {
        id: 'A',
        text: '갑자기 물을 너무 많이 줌.',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '내가 챙기던 판이 갑자기 엉망이 됨.',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '햇빛도 없고 예쁘다는 말도 없음.',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '이름을 너무 평범하게 지어줌.',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 4,
    title: '내 인간관계 스타일은?',
    options: [
      {
        id: 'A',
        text: '적당한 거리감이 제일 편함.',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '친해지면 마음이 많아져서 챙길 게 늘어남.',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '낯가리는데 관심은 또 받고 싶음.',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '혼자 잘 살지만 불러주면 감.',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 5,
    title: '화분을 꾸민다면?',
    options: [
      {
        id: 'A',
        text: '심플하게. 오래 봐도 안 질리게.',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '탄탄하게. 쉽게 망가지지 않게.',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '귀엽고 예쁘게. 사진이 잘 나오게.',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '힙한 척하게. 설명하기 애매한데 내 취향으로.',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 6,
    title: '결과 화분이 나왔을 때 제일 먼저 할 말은?',
    options: [
      {
        id: 'A',
        text: '생각보다 귀엽네. 책상에 두면 오래 보겠다.',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '이거 관리법도 같이 알려줘야 하는 거 아님?',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '잠깐만, 여기서 사진 찍고 가자.',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '왜 나랑 닮았지? 살짝 킹받는데 마음에 듦.',
        result: 'fishbone',
      },
    ],
  },
  {
    id: 7,
    title: '부스에서 내 화분을 데려간다면?',
    options: [
      {
        id: 'A',
        text: '조용히 이름 붙이고 오래 살려볼 생각부터 함.',
        result: 'succulent',
      },
      {
        id: 'B',
        text: '물 주는 날, 둘 위치, 이동 동선까지 정리함.',
        result: 'cactus',
      },
      {
        id: 'C',
        text: '등록증이랑 같이 예쁘게 찍어서 올림.',
        result: 'hoya',
      },
      {
        id: 'D',
        text: '남들이 안 고를 것 같은 이름을 붙임.',
        result: 'fishbone',
      },
    ],
  },
];

export const loadingMessages = [
  '답변에 숨어 있는 화분 자아 확인 중...',
  '쿨라워 화분 관상소에서 성향 분석 중...',
  '부스 앞에서 멈춘 횟수 계산 중...',
  '과습, 방치, 햇빛 부족 가능성 측정 중...',
  '화분 가챠 후보군 정리 중...',
  '당신의 화분을 쿨라워 부스에서 수색 중...',
  '당신의 화분이 발견되었습니다.',
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
    if (scores[key] > scores[best]) {
      return key;
    }

    if (scores[key] === scores[best]) {
      const lastAnswer = [...answers].reverse().find((answer) => answer === key || answer === best);
      return lastAnswer === key ? key : best;
    }

    return best;
  }, resultOrder[0]);

  return {
    key: winner,
    profile: resultProfiles[winner],
    scores,
    scorePercent: Math.round((scores[winner] / quizQuestions.length) * 100),
  };
}
