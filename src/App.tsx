import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from 'react';
import {
  calculateResult,
  loadingMessages,
  quizQuestions,
  resultOrder,
  resultProfiles,
  type ResultKey,
  type ResultProfile,
} from './data/coolbti';
import {
  createResultRecord,
  updateResultStudentInfo,
  type SavedResultRecord,
} from './lib/resultApi';

type Step = 'intro' | 'quiz' | 'loading' | 'gacha' | 'result' | 'student' | 'booth';

type QuestionScene = {
  label: string;
  title: string;
  image: string;
  accent: ResultKey;
};

type EngagementCopy = {
  position: string;
  staffLine: string;
  mission: string;
  storyLine: string;
};

type AdminResultRow = {
  id: string;
  public_slug: string;
  result_key: ResultKey;
  answers: unknown;
  scores: unknown;
  card_payload: Record<string, unknown>;
  user_nickname: string | null;
  plant_name: string | null;
  user_intro: string | null;
  is_purchased: boolean;
  purchased_at: string | null;
  created_at: string;
};

type AdminDraft = {
  result_key: ResultKey;
  user_nickname: string;
  plant_name: string;
  user_intro: string;
  is_purchased: boolean;
  answers: string;
  scores: string;
  card_payload: string;
};

const activityPhotos = {
  bouquetClose: '/쿨라워_프론트기준/landing_bouquet.jpg',
  bouquetHands: '/쿨라워_프론트기준/booth_decorate.jpg',
  plantDisplay: '/쿨라워_프론트기준/landing_potshelf.jpg',
  garden: '/쿨라워_프론트기준/landing_garden.jpg',
  questionEntrance: '/쿨라워_프론트기준/landing_garden.jpg',
  questionFriends: '/쿨라워_프론트기준/q_friends.jpg',
  questionBooth: '/쿨라워_프론트기준/q_materials.jpg',
  questionStory: '/쿨라워_프론트기준/q_story.jpg',
  questionWaiting: '/쿨라워_프론트기준/q_springnight.jpg',
  questionPick: '/쿨라워_프론트기준/q_potpick.jpg',
  questionHome: '/쿨라워_프론트기준/q_walkhome.jpg',
  boothWorkshop: '/쿨라워_프론트기준/booth_scene.jpg',
};

const resultPhotos: Record<ResultKey, string> = {
  succulent: '/쿨라워_프론트기준/result_succulent.jpg',
  cactus: '/쿨라워_프론트기준/result_cactus.jpg',
  hoya: '/쿨라워_프론트기준/result_heart_hoya.jpg',
  fishbone: '/쿨라워_프론트기준/result_fishbone.jpg',
};

const interestFormUrl = (import.meta.env.VITE_INTEREST_FORM_URL as string | undefined)?.trim();

const questionScenes: QuestionScene[] = [
  {
    label: '입장 10분',
    title: '공기 먼저 마시는 타입인지 체크',
    image: activityPhotos.questionEntrance,
    accent: 'succulent',
  },
  {
    label: '동선 회의',
    title: '친구 말에 바로 나오는 첫 반응',
    image: activityPhotos.questionFriends,
    accent: 'cactus',
  },
  {
    label: '부스 앞',
    title: '발걸음을 멈추게 하는 한마디',
    image: activityPhotos.questionBooth,
    accent: 'fishbone',
  },
  {
    label: '스토리 각',
    title: '올리고 싶은 장면을 고르는 기준',
    image: activityPhotos.questionStory,
    accent: 'hoya',
  },
  {
    label: '공연 대기',
    title: '해 질 때까지 버티는 방식',
    image: activityPhotos.questionWaiting,
    accent: 'cactus',
  },
  {
    label: '결제 직전',
    title: '지갑을 여는 마지막 기준',
    image: activityPhotos.questionPick,
    accent: 'hoya',
  },
  {
    label: '귀가길',
    title: '오늘 축제를 저장하는 방식',
    image: activityPhotos.questionHome,
    accent: 'fishbone',
  },
];

const engagementCopy: Record<ResultKey, EngagementCopy> = {
  succulent: {
    position: '조용한 완성도 담당 / 사진 고르고 오래 기억하는 사람',
    staffLine: '다육이 나오셨네요. 시끄러운 축제에서도 은근히 끝까지 즐기는 타입 맞죠?',
    mission: '결과 화면을 스태프에게 보여주고, 마음에 드는 화분 질감 하나를 골라보세요.',
    storyLine: '힘들었는데 좋긴 했다. 내 화분은 일감호 잔잔 다육이.',
  },
  cactus: {
    position: '동선 설계 담당 / 줄 길이와 귀가 루트까지 보는 사람',
    staffLine: '선인장 나오셨네요. 같이 다니면 제일 든든한 축제 생존형입니다.',
    mission: '결과 화면을 스태프에게 보여주고, 오늘 부스 동선 추천을 받아가세요.',
    storyLine: '불평은 했지만 결국 제일 오래 버팀. 내 화분은 스탠딩존 생존 선인장.',
  },
  hoya: {
    position: '스토리 각 담당 / 조명과 결과물 분위기를 살리는 사람',
    staffLine: '하트호야 나오셨네요. 사진 각도 은근히 신경 쓰는 타입 맞죠?',
    mission: '결과 화면을 스태프에게 보여주고, 사진 잘 나오는 화분 포인트를 물어보세요.',
    storyLine: '축제는 지나가도 스토리 하이라이트는 남음. 내 화분은 봄밤 감성 하트호야.',
  },
  fishbone: {
    position: '구석부스 발굴 담당 / 남들이 놓친 재미를 찾는 사람',
    staffLine: '피쉬본 나오셨네요. 메인보다 옆 부스가 더 궁금한 타입입니다.',
    mission: '결과 화면을 스태프에게 보여주고, 제일 특이한 화분 조합을 추천받아보세요.',
    storyLine: '메인보다 사이드에서 인생 콘텐츠를 건짐. 내 화분은 구석부스 취향 피쉬본.',
  },
};

const resultLabels = resultOrder.reduce(
  (acc, key) => {
    acc[key] = resultProfiles[key].name;
    return acc;
  },
  {} as Record<ResultKey, string>,
);

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="statusbar__right">
        <span className="signal" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>5G</span>
        <span className="battery">86</span>
      </span>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="home-indicator" aria-hidden="true">
      <span />
    </div>
  );
}

function TapeStrip({
  className = '',
  color = 'butter',
}: {
  className?: string;
  color?: 'butter' | 'green' | 'coral';
}) {
  return <span className={`tape-strip tape-strip--${color} ${className}`} aria-hidden="true" />;
}

function twoDigit(value: number) {
  return value.toString().padStart(2, '0');
}

function resultNumber(key: ResultKey) {
  return twoDigit(resultOrder.indexOf(key) + 1);
}

function PlantMark({ profile, compact = false }: { profile: ResultProfile; compact?: boolean }) {
  return (
    <div
      className={compact ? 'plant-mark plant-mark--compact' : 'plant-mark'}
      style={
        {
          '--accent': profile.colors.accent,
          '--pot': profile.colors.pot,
          '--leaf': profile.colors.leaf,
          '--bloom': profile.colors.bloom,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className="plant-mark__stem plant-mark__stem--left" />
      <div className="plant-mark__stem plant-mark__stem--right" />
      <div className="plant-mark__leaf plant-mark__leaf--one" />
      <div className="plant-mark__leaf plant-mark__leaf--two" />
      <div className="plant-mark__leaf plant-mark__leaf--three" />
      <div className="plant-mark__flower" />
      <div className="plant-mark__pot" />
    </div>
  );
}

function HomeButton({ onHome }: { onHome: () => void }) {
  return (
    <button className="home-button" type="button" onClick={onHome} aria-label="홈으로 돌아가기">
      <span className="home-button__icon" aria-hidden="true" />
      홈
    </button>
  );
}

function PhotoFrame({
  src,
  alt,
  label,
  className = '',
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
}) {
  return (
    <figure className={`photo-frame ${className}`}>
      <img src={src} alt={alt} />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function Intro({ onStart, onBooth }: { onStart: () => void; onBooth: () => void }) {
  return (
    <main className="screen screen--intro">
      <section className="cover-sheet">
        <header className="cover-strip">
          <div>
            <span className="cover-strip__badge">K</span>
            <strong>쿨라워 <em>× 녹색지대</em></strong>
          </div>
          <span>ISSUE 2026 · VOL.04</span>
        </header>
        <hr className="dashline" />

        <div className="cover-masthead">
          <p className="kicker">
            <span className="dot dot--coral" />
            화분 관상소 · POT-OLOGY
          </p>
          <h1>
            네 화분,
            <br />
            <span>찾아가라.</span>
          </h1>
          <p className="cover-masthead__hand">
            녹색지대에서 드러나는
            <br />
            나의 화분 자아.
          </p>
        </div>

        <div className="cover-collage" aria-label="쿨라워 축제 프론트 기준 이미지 콜라주">
          <div
            className="cover-photo cover-photo--main"
            style={{ backgroundImage: `url(${activityPhotos.plantDisplay})` }}
          />
          <TapeStrip className="cover-tape cover-tape--one" />
          <div
            className="cover-photo cover-photo--sub"
            style={{ backgroundImage: `url(${activityPhotos.bouquetClose})` }}
          >
            <span>campus, april '26</span>
          </div>
          <TapeStrip className="cover-tape cover-tape--two" color="green" />
          <div className="cover-sticker">
            <strong>30s</strong>
            <span>TEST</span>
          </div>
        </div>

        <section className="cover-index" aria-label="체험 순서">
          <div className="cover-index__head">
            <span className="kicker">— INDEX</span>
            <span>03 STEPS</span>
          </div>
          {[
            ['01', '30초 화분 자아 테스트', '7문항으로 나의 화분 타입을 진단'],
            ['02', '결과 캡처해 친구한테 자랑', '가챠처럼 뽑힌 내 화분 결과 공유'],
            ['03', '부스에서 진짜로 만들어 데려가기', '미니식물 + 토분 꾸미기 + 식재'],
          ].map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
              <i aria-hidden="true">→</i>
            </article>
          ))}
        </section>

        <section className="cover-price" aria-label="체험 가격 안내">
          <div>
            <span className="kicker">— PRICE</span>
            <em>거의 원가 *_*</em>
          </div>
          <strong>₩8,000</strong>
          <p>
            체험가 · 원가 ₩7,500
            <br />
            밖에서 비슷한 체험하면 보통 <b>30~40,000원</b>
          </p>
        </section>

        <div className="cover-actions">
          <button className="pill-button pill-button--primary" type="button" onClick={onStart}>
            화분 자아 테스트 시작하기
            <span aria-hidden="true">↳</span>
          </button>
          <button className="pill-button pill-button--ghost" type="button" onClick={onBooth}>
            부스 안내 보기
          </button>
        </div>

        <footer className="cover-footer">
          <span>2026 KU FESTIVAL · 녹색지대</span>
          <span>COOL FLOWER</span>
        </footer>
      </section>

    </main>
  );
}

function Quiz({
  currentIndex,
  answers,
  onBack,
  onSelect,
  onHome,
}: {
  currentIndex: number;
  answers: ResultKey[];
  onBack: () => void;
  onSelect: (answer: ResultKey) => void;
  onHome: () => void;
}) {
  const question = quizQuestions[currentIndex];
  const scene = questionScenes[currentIndex];
  const progress = Math.round(((currentIndex + 1) / quizQuestions.length) * 100);
  const sceneProfile = resultProfiles[scene.accent];

  return (
    <main className="screen screen--quiz">
      <nav className="quiz-topbar" aria-label="질문 이동">
        <button type="button" onClick={onBack} aria-label="이전 질문으로 돌아가기">
          ←
        </button>
        <span>화분 관상소 · 진단 중</span>
        <button type="button" onClick={onHome}>
          처음부터
        </button>
      </nav>

      <section
        className="quiz-panel"
        style={
          {
            '--accent': sceneProfile.colors.accent,
            '--pot': sceneProfile.colors.pot,
            '--leaf': sceneProfile.colors.leaf,
            '--bloom': sceneProfile.colors.bloom,
          } as CSSProperties
        }
      >
        <div className="quiz-progress">
          <div>
            <strong>
              {twoDigit(currentIndex + 1)}
              <span>/{twoDigit(quizQuestions.length)}</span>
            </strong>
            <em>{progress}% · 진행</em>
          </div>
          <div
            className="quiz-progress__segments"
            aria-label={`진행률 ${progress}%`}
            style={{ '--columns': quizQuestions.length } as CSSProperties}
          >
            {quizQuestions.map((item, index) => (
              <span key={item.id} className={index <= currentIndex ? 'is-filled' : ''} />
            ))}
          </div>
        </div>

        <div className="quiz-card">
          <div className="quiz-card__tag">QUESTION · {twoDigit(currentIndex + 1)}</div>
          <TapeStrip className="quiz-card__tape" color="coral" />
          <h2>{question.title}</h2>
          <div className="quiz-photo">
            <img src={scene.image} alt={scene.title} />
            <TapeStrip className="quiz-photo__tape quiz-photo__tape--left" />
            <TapeStrip className="quiz-photo__tape quiz-photo__tape--right" color="green" />
            <span>{scene.label} · {scene.title}</span>
          </div>
          <p>
            <span className="dot" />
            정답은 없어요. 첫 직감대로 골라보세요.
          </p>
        </div>

        <div className="option-list">
          {question.options.map((option) => (
            <button
              className="option-button"
              key={option.id}
              type="button"
              onClick={() => onSelect(option.result)}
            >
              <span className="option-button__id">{option.id}</span>
              <span>{option.text}</span>
              <i>{resultProfiles[option.result].plant}</i>
            </button>
          ))}
        </div>

        <div className="quiz-meta">
          <div>
            <span>다음 질문 →</span>
            <strong>{quizQuestions[currentIndex + 1]?.title ?? '화분 가챠 결과 확인'}</strong>
          </div>
          <div className="answer-dots" aria-label={`선택 완료 ${answers.length}개`}>
            {quizQuestions.map((questionItem, index) => (
              <span
                className={index < answers.length ? 'answer-dot answer-dot--filled' : 'answer-dot'}
                key={questionItem.id}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Loading({ onDone, onHome }: { onDone: () => void; onHome: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (messageIndex >= loadingMessages.length - 1) {
      const doneTimer = window.setTimeout(onDone, 720);
      return () => window.clearTimeout(doneTimer);
    }

    const timer = window.setTimeout(() => {
      setMessageIndex((index) => index + 1);
    }, 620);

    return () => window.clearTimeout(timer);
  }, [messageIndex, onDone]);

  return (
    <main className="screen">
      <HomeButton onHome={onHome} />
      <section className="loading-panel">
        <div className="loader-plant" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h2>화분 가챠 진행 중</h2>
        <p>{loadingMessages[messageIndex]}</p>
      </section>
    </main>
  );
}

function Gacha({
  answers,
  onReveal,
  onHome,
}: {
  answers: ResultKey[];
  onReveal: () => void;
  onHome: () => void;
}) {
  const result = useMemo(() => calculateResult(answers), [answers]);
  const [opened, setOpened] = useState(false);

  return (
    <main className="screen screen--gacha">
      <HomeButton onHome={onHome} />
      <section
        className={opened ? 'gacha-panel gacha-panel--opened' : 'gacha-panel'}
        style={
          {
            '--accent': result.profile.colors.accent,
            '--pot': result.profile.colors.pot,
            '--leaf': result.profile.colors.leaf,
            '--bloom': result.profile.colors.bloom,
          } as CSSProperties
        }
      >
        <div className="gacha-panel__copy">
          <p className="system-label">녹색지대 화분 가챠</p>
          <h2>{opened ? '화분 태그가 열렸습니다' : '마지막으로 캡슐을 흔들어주세요'}</h2>
          <p>
            {opened
              ? '녹색지대에서 당신의 화분이 발견되었습니다.'
              : '녹색지대 부스 앞에서 받은 가챠권처럼, 캡슐 속 화분 태그를 확인해보세요.'}
          </p>
        </div>

        <button
          className="gacha-machine"
          type="button"
          onClick={() => setOpened(true)}
          disabled={opened}
          aria-label="화분 캡슐 흔들기"
        >
          <span className="gacha-machine__glass">
            {resultOrder.map((key) => (
              <i
                className={opened && key === result.key ? 'gacha-capsule is-winner' : 'gacha-capsule'}
                key={key}
                style={
                  {
                    '--capsule': resultProfiles[key].colors.accent,
                  } as CSSProperties
                }
              />
            ))}
          </span>
          <span className="gacha-machine__slot">POT</span>
        </button>

        {opened ? (
          <div className="gacha-ticket">
            <span>FOUND</span>
            <strong>{result.profile.name}</strong>
            <button className="primary-button primary-button--wide" type="button" onClick={onReveal}>
              내 화분 찾기
            </button>
          </div>
        ) : (
          <button className="secondary-button secondary-button--wide" type="button" onClick={() => setOpened(true)}>
            화분 캡슐 흔들기
          </button>
        )}
      </section>
    </main>
  );
}

function Result({
  answers,
  savedResultFingerprintRef,
  onSavedResult,
  onRestart,
  onStudent,
  onBooth,
  onHome,
}: {
  answers: ResultKey[];
  savedResultFingerprintRef: MutableRefObject<string | null>;
  onSavedResult: (record: SavedResultRecord | null) => void;
  onRestart: () => void;
  onStudent: () => void;
  onBooth: () => void;
  onHome: () => void;
}) {
  const result = useMemo(() => calculateResult(answers), [answers]);
  const { profile, scores, scorePercent } = result;
  const engagement = engagementCopy[result.key];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fingerprint = answers.join('-');
    if (savedResultFingerprintRef.current === fingerprint) return;
    savedResultFingerprintRef.current = fingerprint;

    createResultRecord({
        result_key: result.key,
        answers,
        scores: result.scores,
        card_payload: {
          resultName: profile.name,
          plant: profile.plant,
          headline: profile.headline,
          summary: profile.summary,
          festivalFlaw: profile.festivalFlaw,
          prescription: profile.prescription,
          recommendation: profile.recommendation,
          studentId: profile.studentId,
          scorePercent,
        },
      })
      .then((record) => {
        onSavedResult(record);
      })
      .catch((error) => {
        console.warn('[coolbti] result save failed', error);
      });
  }, [answers, onSavedResult, profile, result.key, result.scores, savedResultFingerprintRef, scorePercent]);

  const shareText = `내 축제 쿨BTI 결과는 ${profile.name}! ${profile.headline} 쿨라워 부스에서 네 화분 찾아가라.`;

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="screen screen--result">
      <nav className="result-topbar">
        <span>
          <i className="dot dot--coral" />
          당신의 화분 자아
        </span>
        <button type="button" onClick={onRestart}>
          ↺ 다시하기
        </button>
      </nav>

      <section
        className="result-cover"
        style={
          {
            '--accent': profile.colors.accent,
            '--pot': profile.colors.pot,
            '--leaf': profile.colors.leaf,
            '--bloom': profile.colors.bloom,
          } as CSSProperties
        }
      >
        <div className="result-title">
          <div>
            <span>NO. {resultNumber(result.key)} / {twoDigit(resultOrder.length)}</span>
            <i />
            <em>{profile.plant} 자아 발견</em>
          </div>
          <h1>{profile.name}</h1>
          <p>{profile.headline}</p>
        </div>

        <figure className="result-polaroid">
          <img src={resultPhotos[result.key]} alt={`${profile.name} 결과 이미지`} />
          <figcaption>
            나만의 한 화분 — <span>FOUND</span>
          </figcaption>
          <TapeStrip className="result-polaroid__tape" />
          <div className="result-score-badge">
            <span>MATCH</span>
            <strong>{scorePercent}%</strong>
          </div>
        </figure>

        <article className="diagnosis-card">
          <span className="kicker">— DIAGNOSIS</span>
          <strong>{profile.summary}</strong>
        </article>

        <section className="result-traits" aria-label="결과 상세 정보">
          <article>
            <span>축제적 결함</span>
            <strong>{profile.festivalFlaw}</strong>
          </article>
          <article>
            <span>처방</span>
            <strong>{profile.prescription}</strong>
          </article>
          <article>
            <span>추천 화분</span>
            <strong>{profile.recommendation}</strong>
          </article>
          <article>
            <span>쿨라워 포지션</span>
            <strong>{engagement.position}</strong>
          </article>
        </section>

        <section className="result-friends">
          <div>
            <span className="kicker">— RESULT SCORES</span>
            <em>by 쿨라워</em>
          </div>
          {resultOrder.map((key) => (
            <article key={key}>
              <img src={resultPhotos[key]} alt={`${resultProfiles[key].name} 미리보기`} />
              <div>
                <span>{resultProfiles[key].plant}</span>
                <strong>{scores[key]}점</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="result-booth-card">
          <span className="kicker">— REAL POT, REAL YOU</span>
          <h2>
            이제 진짜
            <br />
            반려화분도 만들어볼까요?
          </h2>
          <p>
            미니식물 직접 고르기 → 토분 꾸미기 → 식재해서 완성.
            전용 가방 · 스티커 · 쿨라워 명함도 함께 드려요.
          </p>
          <div>
            <img src={activityPhotos.bouquetHands} alt="쿨라워 부스 체험 이미지" />
            <strong>체험가 ₩8,000 · 원가 약 ₩7,500</strong>
          </div>
        </section>

        <section className="result-share">
          <div>
            <strong>✦ 캡처해서 친구한테 자랑하기</strong>
            <span>#쿨라워 #화분자아 #건국대축제</span>
          </div>
          <button type="button" onClick={copyResult}>
            {copied ? '복사 완료' : '문구 복사'}
          </button>
        </section>

        <div className="result-actions">
          <button className="pill-button pill-button--primary" type="button" onClick={onStudent}>
            식물학생증 발급받기
          </button>
          <button className="pill-button pill-button--ghost" type="button" onClick={onBooth}>
            부스 정보 보기
          </button>
          <button className="pill-button pill-button--ghost" type="button" onClick={onHome}>
            홈으로 돌아가기
          </button>
          {interestFormUrl && (
            <a
              className="pill-button pill-button--coral"
              href={interestFormUrl}
              target="_blank"
              rel="noreferrer"
            >
              쿨라워 부스 관심 등록 / 지원하기
            </a>
          )}
        </div>
      </section>
    </main>
  );
}

function StudentCardScreen({
  answers,
  savedResult,
  onResult,
  onBooth,
  onHome,
}: {
  answers: ResultKey[];
  savedResult: SavedResultRecord | null;
  onResult: () => void;
  onBooth: () => void;
  onHome: () => void;
}) {
  const { profile } = useMemo(() => calculateResult(answers), [answers]);
  const [nickname, setNickname] = useState('');
  const [plantName, setPlantName] = useState('');
  const [intro, setIntro] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const displayNickname = nickname.trim() || '지나가던 건대생';
  const displayPlantName = plantName.trim() || '말랑다육';
  const displayIntro = intro.trim() || '물은 적게, 관심은 적당히 주세요';

  function escapeSvgText(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function splitForSvg(value: string, maxLength: number) {
    const chunks: string[] = [];
    let current = '';

    value.split(' ').forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxLength && current) {
        chunks.push(current);
        current = word;
        return;
      }
      current = next;
    });

    if (current) chunks.push(current);
    return chunks.slice(0, 3);
  }

  async function saveStudentInfoToDb() {
    if (!savedResult) {
      setSaveStatus('DB 저장 정보가 없어 이미지 저장만 진행했습니다.');
      return;
    }

    try {
      await updateResultStudentInfo(savedResult, {
        user_nickname: displayNickname,
        plant_name: displayPlantName,
        user_intro: displayIntro,
        card_payload: {
          studentCard: {
            nickname: displayNickname,
            plantName: displayPlantName,
            intro: displayIntro,
            resultName: profile.name,
            studentId: profile.studentId,
          },
        },
      });
      setSaveStatus('식물학생증 정보가 DB에 저장되었습니다.');
    } catch (error) {
      console.warn('[coolbti] student card save failed', error);
      setSaveStatus('이미지는 저장됐고, DB 저장은 실패했습니다. 환경변수를 확인하세요.');
    }
  }

  async function downloadStudentCard() {
    const featureLines = splitForSvg(profile.headline, 23);
    const cautionLines = splitForSvg(profile.festivalFlaw, 23);
    const introLines = splitForSvg(displayIntro, 24);
    const lineText = (lines: string[], x: number, y: number, size = 30, gap = 42) =>
      lines
        .map(
          (line, index) =>
            `<text x="${x}" y="${y + index * gap}" font-size="${size}" font-weight="800" fill="#223328">${escapeSvgText(
              line,
            )}</text>`,
        )
        .join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1400" viewBox="0 0 900 1400">
  <rect width="900" height="1400" rx="44" fill="#fffdf7"/>
  <rect x="34" y="34" width="832" height="1332" rx="34" fill="#fffdf7" stroke="#14261d" stroke-width="8"/>
  <rect x="34" y="34" width="832" height="250" rx="34" fill="${profile.colors.bloom}" opacity="0.82"/>
  <circle cx="730" cy="148" r="92" fill="none" stroke="#14261d" stroke-width="5" stroke-dasharray="14 14" opacity="0.28"/>
  <text x="78" y="118" font-size="30" font-weight="900" fill="#667065">GREEN ID</text>
  <text x="78" y="182" font-size="56" font-weight="900" fill="#14261d">녹색지대 식물학생증</text>
  <rect x="78" y="322" width="250" height="320" rx="24" fill="#edf8f0" stroke="#cbd9bf" stroke-width="4"/>
  <path d="M202 530 C165 470 172 396 224 366 C279 400 286 472 244 530 Z" fill="${profile.colors.leaf}"/>
  <path d="M156 548 C190 486 257 468 304 500 C288 568 220 596 156 548 Z" fill="${profile.colors.accent}" opacity="0.88"/>
  <rect x="146" y="550" width="122" height="82" rx="18" fill="${profile.colors.pot}"/>
  <rect x="128" y="532" width="158" height="34" rx="14" fill="${profile.colors.pot}" opacity="0.84"/>
  <text x="370" y="348" font-size="26" font-weight="900" fill="${profile.colors.accent}">이름</text>
  <text x="370" y="398" font-size="50" font-weight="900" fill="#14261d">${escapeSvgText(displayPlantName)}</text>
  <text x="370" y="472" font-size="26" font-weight="900" fill="${profile.colors.accent}">보호자</text>
  <text x="370" y="518" font-size="36" font-weight="800" fill="#223328">${escapeSvgText(displayNickname)}</text>
  <text x="370" y="588" font-size="26" font-weight="900" fill="${profile.colors.accent}">유형</text>
  <text x="370" y="634" font-size="36" font-weight="900" fill="#223328">${escapeSvgText(profile.name)}</text>
  <text x="78" y="728" font-size="26" font-weight="900" fill="${profile.colors.accent}">소속</text>
  <text x="78" y="778" font-size="34" font-weight="800" fill="#223328">쿨라워 화분관상학과</text>
  <text x="78" y="848" font-size="26" font-weight="900" fill="${profile.colors.accent}">학번</text>
  <text x="78" y="898" font-size="34" font-weight="800" fill="#223328">${escapeSvgText(profile.studentId)}</text>
  <text x="78" y="970" font-size="26" font-weight="900" fill="${profile.colors.accent}">특징</text>
  ${lineText(featureLines, 78, 1020)}
  <text x="78" y="1160" font-size="26" font-weight="900" fill="${profile.colors.accent}">주의사항</text>
  ${lineText(cautionLines, 78, 1210)}
  <rect x="78" y="1272" width="744" height="74" rx="18" fill="#f4fff1" stroke="#cbd9bf"/>
  ${lineText(introLines, 104, 1320, 26, 34)}
  <text x="78" y="1368" font-size="24" font-weight="900" fill="#405246">발급처: 쿨라워 화분 관상소</text>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'green-plant-id.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    await saveStudentInfoToDb();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="screen screen--student">
      <HomeButton onHome={onHome} />
      <section
        className="student-layout"
        style={
          {
            '--accent': profile.colors.accent,
            '--pot': profile.colors.pot,
            '--leaf': profile.colors.leaf,
            '--bloom': profile.colors.bloom,
          } as CSSProperties
        }
      >
        <div className="student-form">
          <p className="system-label">녹색지대 식물학생증</p>
          <h2>스토리에 올릴 이름표를 발급합니다</h2>
          <label>
            닉네임
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="예) 지나가던 건대생"
            />
          </label>
          <label>
            화분 이름
            <input
              value={plantName}
              onChange={(event) => setPlantName(event.target.value)}
              placeholder="예) 말랑다육"
            />
          </label>
          <label>
            한 줄 소개
            <input
              value={intro}
              onChange={(event) => setIntro(event.target.value)}
              placeholder="예) 물은 적게, 관심은 적당히 주세요"
            />
          </label>
          <div className="student-form__actions">
            <button className="primary-button" type="button" onClick={downloadStudentCard}>
              식물학생증 저장하기
            </button>
            <button className="secondary-button" type="button" onClick={onResult}>
              결과 다시 보기
            </button>
          </div>
          {saved && <p className="student-form__notice">스토리에 올리고 녹색지대에서 네 화분 찾아가라.</p>}
          {saveStatus && <p className="student-form__notice">{saveStatus}</p>}
        </div>

        <article className="plant-id-card" aria-label="녹색지대 식물학생증 미리보기">
          <div className="plant-id-card__top">
            <span>GREEN ID</span>
            <strong>녹색지대 식물학생증</strong>
          </div>
          <div className="plant-id-card__body">
            <div className="plant-id-card__portrait">
              <PlantMark profile={profile} compact />
            </div>
            <dl>
              <div>
                <dt>이름</dt>
                <dd>{displayPlantName}</dd>
              </div>
              <div>
                <dt>보호자</dt>
                <dd>{displayNickname}</dd>
              </div>
              <div>
                <dt>소속</dt>
                <dd>쿨라워 화분관상학과</dd>
              </div>
              <div>
                <dt>유형</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>학번</dt>
                <dd>{profile.studentId}</dd>
              </div>
              <div>
                <dt>특징</dt>
                <dd>{profile.headline}</dd>
              </div>
              <div>
                <dt>주의사항</dt>
                <dd>{profile.festivalFlaw}</dd>
              </div>
            </dl>
          </div>
          <p>{displayIntro}</p>
          <div className="plant-id-card__footer">
            <span>발급처: 쿨라워 화분 관상소</span>
            <button type="button" onClick={onBooth}>
              부스 정보 보기
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

function BoothInfoScreen({
  answers,
  onResult,
  onHome,
}: {
  answers: ResultKey[];
  onResult: () => void;
  onHome: () => void;
}) {
  const result = useMemo(() => (answers.length ? calculateResult(answers) : null), [answers]);
  const profile = result?.profile ?? resultProfiles.succulent;

  return (
    <main className="screen screen--booth">
      <HomeButton onHome={onHome} />
      <section
        className="booth-board"
        style={
          {
            '--accent': profile.colors.accent,
            '--pot': profile.colors.pot,
            '--leaf': profile.colors.leaf,
            '--bloom': profile.colors.bloom,
          } as CSSProperties
        }
      >
        <PhotoFrame
          src={activityPhotos.boothWorkshop}
          alt="쿨라워 활동에서 꽃다발을 함께 포장하는 손과 꽃"
          label="쿨라워 부스 무드"
          className="photo-frame--booth"
        />
        <div className="booth-board__copy">
          <p className="system-label">쿨라워 부스 정보</p>
          <h2>결과 화분을 실제로 만들 수 있습니다</h2>
          <p>
            쿨라워 부스에서 결과 화분을 직접 만들 수 있습니다.
            체험비와 위치는 추후 공개됩니다.
            수량 한정으로 진행될 수 있습니다.
          </p>
          <article className="price-note">
            <h3>가격이 왜 세 보이나요?</h3>
            <p>
              구불 몰드와 원재료 단가가 높아 체험비 대부분이 재료, 제작, 부스 운영비로
              들어갑니다. 외부 유사 체험 대비 부담을 낮춘 구성으로 준비 중입니다.
            </p>
          </article>
          <article className="booth-result">
            <PlantMark profile={profile} compact />
            <div>
              <span>{result ? '내 결과 화분' : '테스트 후 추천 화분'}</span>
              <strong>{result ? profile.recommendation : '결과별 추천 화분이 여기에 표시됩니다'}</strong>
            </div>
          </article>
          <div className="booth-info-grid" aria-label="추후 공개 항목">
            {['위치', '체험비', '운영 시간', '수량'].map((item) => (
              <div key={item}>
                <span>{item}</span>
                <strong>추후 공개</strong>
              </div>
            ))}
          </div>
          <div className="booth-board__actions">
            {result && (
              <button className="primary-button" type="button" onClick={onResult}>
                내 결과 화분 다시 보기
              </button>
            )}
            {interestFormUrl && (
              <a
                className="primary-button"
                href={interestFormUrl}
                target="_blank"
                rel="noreferrer"
              >
                쿨라워 더 알아보기 / 관심 남기기
              </a>
            )}
            <button className="secondary-button" type="button" onClick={onHome}>
              처음으로 돌아가기
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatAdminDate(value: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toJsonText(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function makeAdminDraft(row: AdminResultRow): AdminDraft {
  return {
    result_key: row.result_key,
    user_nickname: row.user_nickname ?? '',
    plant_name: row.plant_name ?? '',
    user_intro: row.user_intro ?? '',
    is_purchased: row.is_purchased,
    answers: toJsonText(row.answers),
    scores: toJsonText(row.scores),
    card_payload: toJsonText(row.card_payload),
  };
}

function parseAdminJson(label: string, value: string) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} JSON 형식이 올바르지 않습니다.`);
  }
}

function AdminDashboard() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('coolbtiAdminToken') ?? '');
  const [rows, setRows] = useState<AdminResultRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AdminDraft>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | ResultKey>('all');
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'true' | 'false'>('all');
  const [status, setStatus] = useState('관리자 토큰을 입력하고 조회하세요.');
  const [isLoading, setIsLoading] = useState(false);

  const stats = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        acc[row.result_key] += 1;
        if (row.is_purchased) acc.purchased += 1;
        return acc;
      },
      {
        total: 0,
        purchased: 0,
        succulent: 0,
        cactus: 0,
        hoya: 0,
        fishbone: 0,
      } as Record<ResultKey | 'total' | 'purchased', number>,
    );
  }, [rows]);

  async function adminRequest(path: string, init: RequestInit = {}) {
    if (!adminToken.trim()) throw new Error('관리자 토큰이 비어 있습니다.');

    const response = await fetch(path, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-admin-token': adminToken.trim(),
        ...(init.headers ?? {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error ?? `관리자 요청 실패 (${response.status})`);
    }
    return payload;
  }

  async function loadRows() {
    setIsLoading(true);
    setStatus('DB에서 결과를 불러오는 중입니다.');
    try {
      const params = new URLSearchParams({ limit: '80' });
      if (query.trim()) params.set('q', query.trim());
      if (resultFilter !== 'all') params.set('result_key', resultFilter);
      if (purchaseFilter !== 'all') params.set('is_purchased', purchaseFilter);

      const payload = await adminRequest(`/api/admin/results?${params.toString()}`);
      const nextRows = (payload.results ?? []) as AdminResultRow[];
      setRows(nextRows);
      setDrafts({});
      setEditingId(null);
      localStorage.setItem('coolbtiAdminToken', adminToken.trim());
      setStatus(`${nextRows.length}개 row를 불러왔습니다.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(row: AdminResultRow) {
    setDrafts((current) => ({
      ...current,
      [row.id]: current[row.id] ?? makeAdminDraft(row),
    }));
    setEditingId(row.id);
  }

  function updateDraft(id: string, patch: Partial<AdminDraft>) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
  }

  async function saveRow(row: AdminResultRow) {
    const draft = drafts[row.id];
    if (!draft) return;

    setIsLoading(true);
    setStatus('수정 내용을 저장하는 중입니다.');
    try {
      const patch = {
        result_key: draft.result_key,
        user_nickname: draft.user_nickname.trim() || null,
        plant_name: draft.plant_name.trim() || null,
        user_intro: draft.user_intro.trim() || null,
        is_purchased: draft.is_purchased,
        answers: parseAdminJson('answers', draft.answers),
        scores: parseAdminJson('scores', draft.scores),
        card_payload: parseAdminJson('card_payload', draft.card_payload),
      };
      const payload = await adminRequest('/api/admin/results', {
        method: 'PATCH',
        body: JSON.stringify({ id: row.id, patch }),
      });
      setRows((current) =>
        current.map((item) => (item.id === row.id ? (payload.result as AdminResultRow) : item)),
      );
      setEditingId(null);
      setStatus('수정 완료.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteRow(row: AdminResultRow) {
    const confirmed = window.confirm(`정말 삭제할까요?\n${row.public_slug} / ${resultLabels[row.result_key]}`);
    if (!confirmed) return;

    setIsLoading(true);
    setStatus('row를 삭제하는 중입니다.');
    try {
      await adminRequest('/api/admin/results', {
        method: 'DELETE',
        body: JSON.stringify({ id: row.id }),
      });
      setRows((current) => current.filter((item) => item.id !== row.id));
      setStatus('삭제 완료.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-hero">
        <div>
          <p className="system-label">관리자 DB 보정</p>
          <h1>축제쿨비티아이 관리자</h1>
          <p>
            Supabase `coolbti_results` row를 조회하고, 결과 유형·닉네임·화분명·구매 인증·JSON
            payload를 보정합니다. 삭제는 되돌릴 수 없습니다.
          </p>
        </div>
        <a className="secondary-button" href="/">
          사용자 화면으로
        </a>
      </section>

      <section className="admin-toolbar">
        <label>
          관리자 토큰
          <input
            type="password"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            placeholder="쿨쿨띠 / znfznfEl"
          />
        </label>
        <label>
          검색
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="slug, 닉네임, 화분명"
          />
        </label>
        <label>
          결과
          <select
            value={resultFilter}
            onChange={(event) => setResultFilter(event.target.value as 'all' | ResultKey)}
          >
            <option value="all">전체</option>
            {resultOrder.map((key) => (
              <option key={key} value={key}>
                {resultLabels[key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          구매 인증
          <select
            value={purchaseFilter}
            onChange={(event) => setPurchaseFilter(event.target.value as 'all' | 'true' | 'false')}
          >
            <option value="all">전체</option>
            <option value="true">인증됨</option>
            <option value="false">미인증</option>
          </select>
        </label>
        <button className="primary-button" type="button" onClick={loadRows} disabled={isLoading}>
          {isLoading ? '처리 중' : '조회'}
        </button>
      </section>

      <section className="admin-stats" aria-label="관리자 통계">
        <article>
          <span>조회 row</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>구매 인증</span>
          <strong>{stats.purchased}</strong>
        </article>
        {resultOrder.map((key) => (
          <article key={key}>
            <span>{resultProfiles[key].plant}</span>
            <strong>{stats[key]}</strong>
          </article>
        ))}
      </section>

      <p className="admin-status">{status}</p>

      <section className="admin-table" aria-label="coolbti_results 목록">
        {rows.map((row) => {
          const draft = drafts[row.id] ?? makeAdminDraft(row);
          const isEditing = editingId === row.id;

          return (
            <article className="admin-row" key={row.id}>
              <div className="admin-row__summary">
                <div>
                  <span>{formatAdminDate(row.created_at)}</span>
                  <strong>{resultLabels[row.result_key]}</strong>
                  <p>
                    slug: {row.public_slug} / {row.is_purchased ? '구매 인증' : '미인증'}
                  </p>
                </div>
                <div className="admin-row__actions">
                  <button className="secondary-button" type="button" onClick={() => startEdit(row)}>
                    수정
                  </button>
                  <button className="danger-button" type="button" onClick={() => deleteRow(row)}>
                    삭제
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="admin-editor">
                  <label>
                    결과 유형
                    <select
                      value={draft.result_key}
                      onChange={(event) =>
                        updateDraft(row.id, { result_key: event.target.value as ResultKey })
                      }
                    >
                      {resultOrder.map((key) => (
                        <option key={key} value={key}>
                          {resultLabels[key]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    닉네임
                    <input
                      value={draft.user_nickname}
                      onChange={(event) => updateDraft(row.id, { user_nickname: event.target.value })}
                      maxLength={30}
                    />
                  </label>
                  <label>
                    화분명
                    <input
                      value={draft.plant_name}
                      onChange={(event) => updateDraft(row.id, { plant_name: event.target.value })}
                      maxLength={30}
                    />
                  </label>
                  <label>
                    한 줄 소개
                    <input
                      value={draft.user_intro}
                      onChange={(event) => updateDraft(row.id, { user_intro: event.target.value })}
                      maxLength={80}
                    />
                  </label>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={draft.is_purchased}
                      onChange={(event) => updateDraft(row.id, { is_purchased: event.target.checked })}
                    />
                    구매 인증 row로 표시
                  </label>
                  <label>
                    answers JSON
                    <textarea
                      value={draft.answers}
                      onChange={(event) => updateDraft(row.id, { answers: event.target.value })}
                    />
                  </label>
                  <label>
                    scores JSON
                    <textarea
                      value={draft.scores}
                      onChange={(event) => updateDraft(row.id, { scores: event.target.value })}
                    />
                  </label>
                  <label>
                    card_payload JSON
                    <textarea
                      value={draft.card_payload}
                      onChange={(event) => updateDraft(row.id, { card_payload: event.target.value })}
                    />
                  </label>
                  <div className="admin-editor__actions">
                    <button className="primary-button" type="button" onClick={() => saveRow(row)}>
                      저장
                    </button>
                    <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>
                      취소
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ResultKey[]>([]);
  const [savedResult, setSavedResult] = useState<SavedResultRecord | null>(null);
  const savedResultFingerprintRef = useRef<string | null>(null);
  const isAdminPath = window.location.pathname.replace(/\/+$/, '') === '/admin';

  function goHome() {
    setAnswers([]);
    setCurrentIndex(0);
    setSavedResult(null);
    setStep('intro');
  }

  function startQuiz() {
    setAnswers([]);
    setCurrentIndex(0);
    setSavedResult(null);
    savedResultFingerprintRef.current = null;
    setStep('quiz');
  }

  function selectAnswer(answer: ResultKey) {
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);

    if (currentIndex >= quizQuestions.length - 1) {
      setStep('loading');
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function backQuestion() {
    if (currentIndex <= 0) {
      goHome();
      return;
    }

    setAnswers((current) => current.slice(0, -1));
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  const screen =
    step === 'intro' ? (
      <Intro onStart={startQuiz} onBooth={() => setStep('booth')} />
    ) : step === 'quiz' ? (
      <Quiz
        currentIndex={currentIndex}
        answers={answers}
        onBack={backQuestion}
        onSelect={selectAnswer}
        onHome={goHome}
      />
    ) : step === 'loading' ? (
      <Loading onDone={() => setStep('gacha')} onHome={goHome} />
    ) : step === 'gacha' ? (
      <Gacha answers={answers} onReveal={() => setStep('result')} onHome={goHome} />
    ) : step === 'result' ? (
      <Result
        answers={answers}
        savedResultFingerprintRef={savedResultFingerprintRef}
        onSavedResult={setSavedResult}
        onRestart={startQuiz}
        onStudent={() => setStep('student')}
        onBooth={() => setStep('booth')}
        onHome={goHome}
      />
    ) : step === 'student' ? (
      <StudentCardScreen
        answers={answers}
        savedResult={savedResult}
        onResult={() => setStep('result')}
        onBooth={() => setStep('booth')}
        onHome={goHome}
      />
    ) : (
      <BoothInfoScreen answers={answers} onResult={() => setStep('result')} onHome={goHome} />
    );

  return (
    <div className="app-shell">
      {isAdminPath && <AdminDashboard />}
      {!isAdminPath && (
        <div className="phone-shell">
          <StatusBar />
          {screen}
          <HomeIndicator />
        </div>
      )}
    </div>
  );
}
