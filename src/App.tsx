import { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateResult,
  loadingMessages,
  quizQuestions,
  resultOrder,
  resultProfiles,
  type ResultKey,
  type ResultProfile,
} from './data/coolbti';
import { supabase } from './lib/supabase';

type Step = 'intro' | 'quiz' | 'loading' | 'result';

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
        } as React.CSSProperties
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

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen screen--intro">
      <section className="hero">
        <div className="hero__copy">
          <p className="system-label">쿨라워 화분 관상소</p>
          <h1>네 화분 찾아가라</h1>
          <p className="hero__lead">
            당신의 화분 자아를 찾아준다. 7문항만 고르면 마지막 화분 가챠를
            거쳐 결과 카드가 나온다.
          </p>
          <button className="primary-button" type="button" onClick={onStart}>
            <span aria-hidden="true">▶</span>
            관상 시작
          </button>
        </div>
        <div className="hero__visual" aria-label="축제 화분 네 가지">
          {resultOrder.map((key) => (
            <PlantMark key={key} profile={resultProfiles[key]} compact />
          ))}
        </div>
      </section>
      <section className="quick-results" aria-label="결과 유형">
        {resultOrder.map((key) => {
          const profile = resultProfiles[key];
          return (
            <article className="mini-card" key={key}>
              <strong>{profile.plant}</strong>
              <span>{profile.headline}</span>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function Quiz({
  currentIndex,
  answers,
  onSelect,
}: {
  currentIndex: number;
  answers: ResultKey[];
  onSelect: (answer: ResultKey) => void;
}) {
  const question = quizQuestions[currentIndex];
  const progress = Math.round(((currentIndex + 1) / quizQuestions.length) * 100);

  return (
    <main className="screen">
      <section className="quiz-panel">
        <div className="progress-row">
          <span>
            {currentIndex + 1} / {quizQuestions.length}
          </span>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
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

function Loading({ onDone }: { onDone: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (messageIndex >= loadingMessages.length - 1) {
      const doneTimer = window.setTimeout(onDone, 700);
      return () => window.clearTimeout(doneTimer);
    }

    const timer = window.setTimeout(() => {
      setMessageIndex((index) => index + 1);
    }, 620);

    return () => window.clearTimeout(timer);
  }, [messageIndex, onDone]);

  return (
    <main className="screen">
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

function Result({
  answers,
  onRestart,
}: {
  answers: ResultKey[];
  onRestart: () => void;
}) {
  const result = useMemo(() => calculateResult(answers), [answers]);
  const { profile, scores, scorePercent } = result;
  const [copied, setCopied] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current || !supabase) return;
    savedRef.current = true;

    supabase
      .from('coolbti_results')
      .insert({
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
      .then(({ error }) => {
        if (error) console.warn('[coolbti] result save failed', error.message);
      });
  }, [answers, profile, result.key, result.scores, scorePercent]);

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
      <section
        className="result-hero"
        style={
          {
            '--accent': profile.colors.accent,
            '--pot': profile.colors.pot,
            '--leaf': profile.colors.leaf,
            '--bloom': profile.colors.bloom,
          } as React.CSSProperties
        }
      >
        <div className="result-hero__visual">
          <PlantMark profile={profile} />
        </div>
        <div className="result-hero__copy">
          <p className="system-label">관상 완료</p>
          <h1>{profile.name}</h1>
          <p>{profile.summary}</p>
        </div>
      </section>

      <section className="result-grid">
        <article className="score-card">
          <span>화분 관상 점수</span>
          <strong>{scorePercent}</strong>
          <p>{profile.headline}</p>
        </article>

        <article className="student-card">
          <div>
            <span>식물학생증</span>
            <strong>{profile.studentId}</strong>
          </div>
          <dl>
            <div>
              <dt>이름</dt>
              <dd>{profile.plant}</dd>
            </div>
            <div>
              <dt>소속</dt>
              <dd>쿨라워 화분 관상소</dd>
            </div>
            <div>
              <dt>처방</dt>
              <dd>{profile.prescription}</dd>
            </div>
          </dl>
        </article>

        <article className="text-card">
          <h2>축제적 결함</h2>
          <p>{profile.festivalFlaw}</p>
        </article>

        <article className="text-card">
          <h2>추천 화분</h2>
          <p>{profile.recommendation}</p>
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
          <span aria-hidden="true">⧉</span>
          {copied ? '복사 완료' : '결과 복사'}
        </button>
        <button className="secondary-button" type="button" onClick={onRestart}>
          <span aria-hidden="true">↻</span>
          다시 찾기
        </button>
      </section>

      <p className="booth-copy">
        이 화분, 실제로 만들 수 있음. 쿨라워 부스에서 네 화분 찾아가라.
      </p>
    </main>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ResultKey[]>([]);

  function startQuiz() {
    setAnswers([]);
    setCurrentIndex(0);
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
      {step === 'intro' && <Intro onStart={startQuiz} />}
      {step === 'quiz' && (
        <Quiz currentIndex={currentIndex} answers={answers} onSelect={selectAnswer} />
      )}
      {step === 'loading' && <Loading onDone={() => setStep('result')} />}
      {step === 'result' && <Result answers={answers} onRestart={startQuiz} />}
    </div>
  );
}
