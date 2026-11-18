import { useEffect, useRef, useState } from 'react';
import { checkFor, errorFeedback, isCorrect, stepsFor, type Answer, type ChoiceQuestion, type Mission } from '../../domain/mission';
import type { Child, Homework, MissionProgress } from '../../domain/types';
import { useCompanionEmit } from '../../companion/CompanionProvider';
import type { Action } from '../../domain/logic';
import { useStore } from '../../state/store';
import { Icon } from '../components/Icon';
import { Panda, type PandaMood } from '../components/Panda';
import { Button } from '../components/ui';

/** Niveaux de l'échelle d'aide, dans l'ordre pédagogique. */
const LADDER = ['reformulation', 'indice', 'decomposition', 'exemple'] as const;
type Rung = (typeof LADDER)[number];

export interface MissionHandle {
  /** Ouvre l'aide suivante (bouton « J'ai besoin d'un indice »). */
  nextHelp: () => void;
  /** Ouvre directement la décomposition (bouton « Je suis bloqué »). */
  openDecomposition: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

function AnswerInput({ answer, value, onChange, onSubmit, id, label }: { answer: Answer; value: string; onChange: (v: string) => void; onSubmit: () => void; id: string; label: string }) {
  if (answer.kind === 'choice') {
    return (
      <div className="choice-list" role="group" aria-label={label}>
        {answer.options.map((o, i) => (
          <button key={i} className="choice-btn" aria-pressed={value === String(i)} onClick={() => onChange(String(i))}>
            <span className="choice-btn__letter" aria-hidden>{LETTERS[i]}</span>
            {o}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="answer-row">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        className="input answer-input"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
        placeholder="?"
      />
      {answer.unit && <span style={{ alignSelf: 'center', fontWeight: 800, fontSize: '1.2rem' }}>{answer.unit}</span>}
    </div>
  );
}

function Companion({ child, mood, children }: { child: Child; mood: PandaMood; children: React.ReactNode }) {
  return (
    <div className="companion-panel pop-in" role="status" aria-live="polite">
      <Panda mood={mood} size={76} animated={child.preferences.animations} />
      <div>
        <div className="companion-panel__name">{child.companionName}</div>
        <div className="companion-panel__text">{children}</div>
      </div>
    </div>
  );
}

function MiniChoice({ q, onAnswered }: { q: ChoiceQuestion; onAnswered?: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div>
      <p style={{ fontWeight: 800 }}>{q.question}</p>
      <div className="choice-list">
        {q.options.map((o, i) => (
          <button key={i} className="choice-btn" aria-pressed={picked === i} disabled={picked !== null} onClick={() => { setPicked(i); onAnswered?.(i === q.correct); }}>
            <span className="choice-btn__letter" aria-hidden>{LETTERS[i]}</span>{o}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className={`feedback ${picked === q.correct ? 'feedback--ok' : 'feedback--info'}`}>
          <Icon name={picked === q.correct ? 'check-circle' : 'bulb'} />
          <span>{picked === q.correct ? 'Oui ! ' : 'Pas tout à fait. '}{q.explanation}</span>
        </div>
      )}
    </div>
  );
}

function SubSteps({ substeps, onAllDone }: { substeps: { prompt: string; answer: Answer }[]; onAllDone: () => void }) {
  const [vals, setVals] = useState<string[]>(substeps.map(() => ''));
  const [ok, setOk] = useState<boolean[]>(substeps.map(() => false));
  const [tried, setTried] = useState<boolean[]>(substeps.map(() => false));
  const current = ok.findIndex((x) => !x);
  const check = (i: number, v = vals[i]) => {
    const good = isCorrect(substeps[i].answer, v);
    setTried(tried.map((t, j) => (j === i ? true : t)));
    if (good) {
      const next = ok.map((x, j) => (j === i ? true : x));
      setOk(next);
      if (next.every(Boolean)) onAllDone();
    }
  };
  return (
    <div>
      {substeps.map((s, i) => (
        <div key={i} className="substep" style={{ opacity: i > current && current !== -1 ? 0.45 : 1 }}>
          <span className="substep__prompt">{s.prompt}</span>
          {ok[i] ? (
            <span className="substep-done"><Icon name="check" /> {s.answer.kind === 'number' ? s.answer.value : s.answer.options[s.answer.correct]}</span>
          ) : s.answer.kind === 'choice' ? (
            <div className="flex">
              {s.answer.options.map((o, k) => (
                <Button key={k} variant="secondary" disabled={i !== current} onClick={() => { const v = String(k); setVals(vals.map((x, j) => (j === i ? v : x))); check(i, v); }}>{o}</Button>
              ))}
            </div>
          ) : (
            <>
              <label className="sr-only" htmlFor={`sub-${i}`}>{s.prompt}</label>
              <input id={`sub-${i}`} className="input" inputMode="decimal" disabled={i !== current} value={vals[i]} onChange={(e) => setVals(vals.map((x, j) => (j === i ? e.target.value : x)))} onKeyDown={(e) => { if (e.key === 'Enter') check(i); }} />
              <Button variant="secondary" disabled={i !== current || !vals[i]} onClick={() => check(i)}>Vérifier</Button>
            </>
          )}
          {tried[i] && !ok[i] && <span className="small" style={{ color: 'var(--sun-ink)', fontWeight: 700, width: '100%' }}>Pas encore, réessaie tranquillement.</span>}
        </div>
      ))}
    </div>
  );
}

export function MissionPlayer({ mission, hw, child, handleRef, onFinished, practice = false }: {
  mission: Mission;
  hw: Homework;
  child: Child;
  handleRef: React.MutableRefObject<MissionHandle | null>;
  onFinished: () => void;
  /** Mission d'essai : rien n'est enregistré dans les devoirs ni dans la progression. */
  practice?: boolean;
}) {
  const store = useStore();
  const data = store.data;
  const dispatch = practice ? (_a: Action) => { void _a; } : store.dispatch;
  const emit = useCompanionEmit();
  const steps = stepsFor(mission, child.level);
  const check = checkFor(mission, child.level);
  const saved = practice ? undefined : data.missionProgress[hw.id];
  const [progress, setProgress] = useState<MissionProgress>(
    () => saved ?? { stepIndex: 0, steps: steps.map(() => ({ firstTry: null, solved: false, hints: 0 })), checkPassed: null },
  );
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'retry'; text: string } | null>(null);
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [subDone, setSubDone] = useState(false);
  const [checkAnswered, setCheckAnswered] = useState(progress.checkPassed !== null);
  const wrongThisStep = useRef(0);
  const helpPanelRef = useRef<HTMLDivElement>(null);

  const inCheck = progress.stepIndex >= steps.length;
  const step = steps[Math.min(progress.stepIndex, steps.length - 1)];
  const solved = !inCheck && progress.steps[progress.stepIndex]?.solved;

  const persist = (p: MissionProgress) => { setProgress(p); dispatch({ type: 'mission/save', id: hw.id, progress: p }); };

  const addRung = (r: Rung) => {
    if (inCheck || solved) return;
    setRungs((prev) => (prev.includes(r) ? prev : [...prev, r]));
    dispatch({ type: 'hw/help', id: hw.id, kind: r });
    emit({ type: 'hint' });
    const p = { ...progress, steps: progress.steps.map((s, i) => (i === progress.stepIndex ? { ...s, hints: s.hints + 1 } : s)) };
    persist(p);
    setTimeout(() => helpPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  };

  handleRef.current = {
    nextHelp: () => {
      const next = LADDER.find((r) => !rungs.includes(r));
      if (next) addRung(next);
    },
    openDecomposition: () => addRung('decomposition'),
  };

  // Réinitialise l'état local à chaque nouvelle étape.
  useEffect(() => {
    setValue(''); setFeedback(null); setRungs([]); setSubDone(false); wrongThisStep.current = 0;
  }, [progress.stepIndex]);

  const submit = () => {
    if (!value.trim() || solved) return;
    const good = isCorrect(step.answer, value);
    const st = progress.steps[progress.stepIndex];
    if (good) {
      if (wrongThisStep.current > 0) dispatch({ type: 'hw/errorCorrected', id: hw.id });
      const firstTry = st.firstTry === null ? st.hints === 0 : st.firstTry;
      persist({ ...progress, steps: progress.steps.map((s, i) => (i === progress.stepIndex ? { ...s, solved: true, firstTry } : s)) });
      emit({ type: 'step_correct' });
      setFeedback({ tone: 'ok', text: wrongThisStep.current > 0 ? `Tu as corrigé ton erreur, c’est exactement comme ça qu’on progresse. ${step.success}` : step.success });
    } else {
      wrongThisStep.current += 1;
      emit({ type: 'wrong' });
      dispatch({ type: 'hw/wrongAttempt', id: hw.id });
      if (st.firstTry === null) persist({ ...progress, steps: progress.steps.map((s, i) => (i === progress.stepIndex ? { ...s, firstTry: false } : s)) });
      const specific = errorFeedback(step, value);
      setFeedback({
        tone: 'retry',
        text: specific ?? (wrongThisStep.current >= 2
          ? 'Pas encore. Essaie l’aide : je peux découper le calcul avec toi.'
          : 'Pas encore. Relis la consigne et réessaie, tu en es capable.'),
      });
    }
  };

  const nextStep = () => persist({ ...progress, stepIndex: progress.stepIndex + 1 });

  const mood: PandaMood = rungs.includes('exemple') ? 'explication' : rungs.includes('decomposition') ? 'explication' : rungs.includes('indice') ? 'reflexion' : 'encouragement';

  if (inCheck) {
    return (
      <div className="work-card">
        <h3 className="flex"><Icon name="sparkle" /> Petite question pour vérifier</h3>
        <p className="small muted">Elle aide à voir si la méthode est comprise, au-delà des réponses.</p>
        <MiniChoice
          q={check}
          onAnswered={(ok) => { setCheckAnswered(true); persist({ ...progress, checkPassed: ok }); emit({ type: ok ? 'check_correct' : 'check_retry' }); }}
        />
        {checkAnswered && (
          <div className="center mt-1">
            <Button variant="sun" size="lg" icon="flag" onClick={() => { dispatch({ type: 'mission/complete', id: hw.id, progress }); onFinished(); }}>
              {practice ? 'Terminer la mission d’essai' : 'Terminer la mission'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="work-card">
      <div className="flex between">
        <span className="small" style={{ fontWeight: 800 }}>Question {progress.stepIndex + 1} sur {steps.length}</span>
        <span className="session-steps" aria-hidden>
          {steps.map((_, i) => <span key={i} className={`dot ${progress.steps[i].solved ? 'dot--done' : i === progress.stepIndex ? 'dot--current' : ''}`} />)}
        </span>
      </div>
      <p className="consigne">{step.prompt}</p>
      {step.support && <div className="support-box">{step.support}</div>}

      <AnswerInput answer={step.answer} value={value} onChange={(v) => { setValue(v); if (feedback?.tone === 'retry') setFeedback(null); }} onSubmit={submit} id={`ans-${step.id}`} label="Ta réponse" />

      {!solved ? (
        <div className="flex mt-1">
          <Button size="lg" icon="check" onClick={submit} disabled={!value.trim()}>Vérifier ma réponse</Button>
        </div>
      ) : null}

      {feedback && (
        <div className={`feedback feedback--${feedback.tone}`} role="status" aria-live="polite">
          <Icon name={feedback.tone === 'ok' ? 'check-circle' : 'refresh'} />
          <span>{feedback.text}</span>
        </div>
      )}
      {solved && (
        <div className="flex mt-1">
          <Button variant="sun" size="lg" iconRight="arrow-right" onClick={nextStep}>
            {progress.stepIndex + 1 < steps.length ? 'Question suivante' : 'Dernière petite question'}
          </Button>
        </div>
      )}

      <div ref={helpPanelRef}>
        {rungs.length > 0 && !solved && (
          <Companion child={child} mood={mood}>
            {rungs.includes('reformulation') && (
              <div style={{ marginBottom: '.75rem' }}>
                <p className="mb-0" style={{ fontWeight: 700 }}>Avant tout, dis-moi avec tes mots ce qu’on te demande.</p>
                <MiniChoice q={step.reformulate} />
              </div>
            )}
            {rungs.includes('indice') && (
              <p><b>Indice :</b> {step.hint}</p>
            )}
            {rungs.includes('decomposition') && (
              <div style={{ marginBottom: '.75rem' }}>
                <p className="mb-0"><b>On découpe ensemble.</b> {step.decompose.intro}</p>
                <SubSteps substeps={step.decompose.substeps} onAllDone={() => setSubDone(true)} />
                {subDone && <p className="mt-1" style={{ fontWeight: 700 }}>{step.decompose.outro}</p>}
              </div>
            )}
            {rungs.includes('exemple') && (
              <p><b>Un exemple différent :</b> {step.example}</p>
            )}
            {rungs.length < LADDER.length ? (
              <p className="small muted mb-0">Réessaie quand tu veux. Si tu as besoin, demande un autre indice.</p>
            ) : (
              <p className="small muted mb-0">Tu as toutes les aides. Prends ton temps, ou signale que tu es bloqué·e : ce n’est pas grave.</p>
            )}
          </Companion>
        )}
      </div>
    </div>
  );
}
