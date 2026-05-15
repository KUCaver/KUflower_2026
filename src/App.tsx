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
  bouquetClose: '/쿨라워_선별사진/랜딩_꽃다발클로즈업.jpg',
  bouquetHands: '/쿨라워_선별사진/부스_꾸미기실습.jpg',
  plantDisplay: '/쿨라워_선별사진/랜딩_화분진열.jpg',
  questionEntrance: '/쿨라워_선별사진/질문1_녹색지대입장.jpg',
  questionFriends: '/쿨라워_선별사진/질문2_친구동선회의.jpg',
  questionBooth: '/쿨라워_선별사진/질문3_부스체험재료.jpg',
  questionStory: '/쿨라워_선별사진/질문4_스토리감성.jpg',
  questionWaiting: '/쿨라워_선별사진/질문5_공연대기봄밤.jpg',
  questionPick: '/쿨라워_선별사진/질문6_화분고르기.jpg',
  questionHome: '/쿨라워_선별사진/질문7_축제끝귀가길.jpg',
  boothWorkshop: '/쿨라워_선별사진/부스_체험현장.jpg',
};

const resultPhotos: Record<ResultKey, string> = {
  succulent: '/쿨라워_선별사진/결과_잔잔다육이.jpg',
  cactus: '/쿨라워_선별사진/결과_생존선인장.jpg',
  hoya: '/쿨라워_선별사진/결과_감성하트호야.jpg',
  fishbone: '/쿨라워_선별사진/결과_취향피쉬본.jpg',
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
      <section className="hero">
        <div className="hero__copy">
          <p className="system-label">2026 건국대학교 축제 · 쿨라워 부스</p>
          <h1>우리가 비싼 게 아니라, 마진이 비싸다!</h1>
          <p className="hero__subtitle">퍼스널 미니 반려화분 만들기</p>
          <div className="hero__price-card">
            <PlantMark profile={resultProfiles.succulent} compact />
            <div>
              <strong>
                원가 약 <b>7,500원</b> / 판매가 <em>8,000원</em>
              </strong>
              <p>
                준비비와 손이 많이 들어 마진은 정말 적어요.
                <br />
                밖에서 체험하면 보통 3~4만원대,
                <br />
                꽤 알차게 준비했어요.
              </p>
            </div>
          </div>
          <div className="hero__feature-strip" aria-label="부스 체험 요약">
            <article>
              <span>01</span>
              <strong>30초 꽃 성향 테스트</strong>
              <p>질문 몇 개로 나의 꽃 타입 확인</p>
            </article>
            <article>
              <span>02</span>
              <strong>반려화분 체험</strong>
              <p>미니식물 + 토분 꾸미기 + 식재</p>
            </article>
            <article>
              <span>03</span>
              <strong>현장 인증 이벤트</strong>
              <p>결과 인증 시 스티커/작은 선물 제공 가능</p>
            </article>
          </div>
          <button className="primary-button primary-button--wide" type="button" onClick={onStart}>
            꽃 성향 테스트 시작하기
            <span aria-hidden="true">›</span>
          </button>
          <button className="secondary-button secondary-button--wide" type="button" onClick={onBooth}>
            부스 안내 보기
            <span aria-hidden="true">›</span>
          </button>
          <p className="hero__note">작은 초록을 키워보세요.</p>
        </div>

        <div className="hero__poster" aria-label="쿨라워 활동 사진과 화분 유형">
          <PhotoFrame
            src={activityPhotos.bouquetHands}
            alt="쿨라워 활동에서 꽃다발을 함께 포장하는 손과 꽃"
            label="꽃꾸 현장"
            className="photo-frame--large"
          />
          <PhotoFrame
            src={activityPhotos.plantDisplay}
            alt="테이블 위에 놓인 식물 화분들"
            label="추천 화분"
          />
          <PhotoFrame
            src={activityPhotos.bouquetClose}
            alt="흰 꽃다발 클로즈업"
            label="부스 결과물"
          />
          <div className="hero__ticket">
            <span>GREEN-2026</span>
            <strong>반려화분 체험권</strong>
          </div>
        </div>
      </section>

    </main>
  );
}

function Quiz({
  currentIndex,
  answers,
  onSelect,
  onHome,
}: {
  currentIndex: number;
  answers: ResultKey[];
  onSelect: (answer: ResultKey) => void;
  onHome: () => void;
}) {
  const question = quizQuestions[currentIndex];
  const scene = questionScenes[currentIndex];
  const progress = Math.round(((currentIndex + 1) / quizQuestions.length) * 100);
  const sceneProfile = resultProfiles[scene.accent];

  return (
    <main className="screen screen--quiz">
      <HomeButton onHome={onHome} />
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
        <div className="progress-row">
          <span>
            {currentIndex + 1} / {quizQuestions.length}
          </span>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="quiz-scene">
          <img src={scene.image} alt={scene.title} />
          <div>
            <span>{scene.label}</span>
            <strong>{scene.title}</strong>
          </div>
        </div>

        <h2>{question.title}</h2>
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
            </button>
          ))}
        </div>
        <div className="answer-dots" aria-label={`선택 완료 ${answers.length}개`}>
          {quizQuestions.map((questionItem, index) => (
            <span
              className={index < answers.length ? 'answer-dot answer-dot--filled' : 'answer-dot'}
              key={questionItem.id}
            />
          ))}
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
      <HomeButton onHome={onHome} />
      <section
        className="result-hero"
        style={
          {
            '--accent': profile.colors.accent,
            '--pot': profile.colors.pot,
            '--leaf': profile.colors.leaf,
            '--bloom': profile.colors.bloom,
          } as CSSProperties
        }
      >
        <div className="result-hero__visual">
          <PlantMark profile={profile} />
          <PhotoFrame
            src={resultPhotos[result.key]}
            alt="테이블 위에 진열된 식물 화분들"
            label="실물 화분 분위기"
            className="photo-frame--result"
          />
        </div>
        <div className="result-hero__copy">
          <p className="system-label">관상 완료</p>
          <h1>{profile.name}</h1>
          <p>{profile.summary}</p>
          <div className="result-hero__actions">
            <button className="primary-button" type="button" onClick={onStudent}>
              식물학생증 발급받기
            </button>
            <button className="secondary-button" type="button" onClick={onBooth}>
              부스 정보 보기
            </button>
            {interestFormUrl && (
              <a
                className="secondary-button"
                href={interestFormUrl}
                target="_blank"
                rel="noreferrer"
              >
                쿨라워 더 알아보기 / 관심 남기기
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="capture-card" aria-label="공유용 결과 카드">
        <div className="capture-card__header">
          <span>CAPTURE CARD</span>
          <strong>{profile.name}</strong>
        </div>
        <p>{profile.headline}</p>
        <div className="capture-card__grid">
          <article>
            <span>당신의 쿨라워 포지션</span>
            <strong>{engagement.position}</strong>
          </article>
          <article>
            <span>스태프 멘트</span>
            <strong>{engagement.staffLine}</strong>
          </article>
          <article>
            <span>부스 현장 미션</span>
            <strong>{engagement.mission}</strong>
          </article>
          <article>
            <span>스토리 공유 한 줄</span>
            <strong>{engagement.storyLine}</strong>
          </article>
        </div>
      </section>

      <section className="result-grid">
        <article className="score-card">
          <span>화분 관상 점수</span>
          <strong>{scorePercent}</strong>
          <p>{profile.headline}</p>
        </article>

        <article className="recommend-card">
          <span>추천 화분</span>
          <div className="recommend-card__body">
            <PlantMark profile={profile} compact />
            <div>
              <strong>{profile.recommendation}</strong>
              <p>이 화분, 실제로 만들 수 있음.</p>
            </div>
          </div>
        </article>

        <article className="text-card">
          <h2>축제적 결함</h2>
          <p>{profile.festivalFlaw}</p>
        </article>

        <article className="text-card">
          <h2>처방</h2>
          <p>{profile.prescription}</p>
        </article>
      </section>

      <section className="tag-board" aria-label="결과 성향 태그">
        {profile.vibeTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </section>

      <section className="score-board">
        {resultOrder.map((key) => (
          <div className="score-row" key={key}>
            <span>{resultProfiles[key].plant}</span>
            <div className="score-row__bar" aria-hidden="true">
              <i style={{ width: `${(scores[key] / quizQuestions.length) * 100}%` }} />
            </div>
            <strong>{scores[key]}</strong>
          </div>
        ))}
      </section>

      <section className="cta-row">
        <button className="primary-button" type="button" onClick={copyResult}>
          {copied ? '복사 완료' : '결과 복사'}
        </button>
        <button className="secondary-button" type="button" onClick={onRestart}>
          다시 찾기
        </button>
      </section>

      <p className="booth-copy">
        이 화분, 실제로 만들 수 있음. 쿨라워 부스에서 네 화분 찾아가라.
      </p>
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

  return (
    <div className="app-shell">
      {isAdminPath && <AdminDashboard />}
      {!isAdminPath && step === 'intro' && <Intro onStart={startQuiz} onBooth={() => setStep('booth')} />}
      {!isAdminPath && step === 'quiz' && (
        <Quiz
          currentIndex={currentIndex}
          answers={answers}
          onSelect={selectAnswer}
          onHome={goHome}
        />
      )}
      {!isAdminPath && step === 'loading' && <Loading onDone={() => setStep('gacha')} onHome={goHome} />}
      {!isAdminPath && step === 'gacha' && (
        <Gacha answers={answers} onReveal={() => setStep('result')} onHome={goHome} />
      )}
      {!isAdminPath && step === 'result' && (
        <Result
          answers={answers}
          savedResultFingerprintRef={savedResultFingerprintRef}
          onSavedResult={setSavedResult}
          onRestart={startQuiz}
          onStudent={() => setStep('student')}
          onBooth={() => setStep('booth')}
          onHome={goHome}
        />
      )}
      {!isAdminPath && step === 'student' && (
        <StudentCardScreen
          answers={answers}
          savedResult={savedResult}
          onResult={() => setStep('result')}
          onBooth={() => setStep('booth')}
          onHome={goHome}
        />
      )}
      {!isAdminPath && step === 'booth' && (
        <BoothInfoScreen answers={answers} onResult={() => setStep('result')} onHome={goHome} />
      )}
    </div>
  );
}
