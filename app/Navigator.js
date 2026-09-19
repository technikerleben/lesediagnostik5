"use client";

import { useMemo, useState } from "react";
import eiche from "../data/sets/eiche.json";
import ahorn from "../data/sets/ahorn.json";
import birke from "../data/sets/birke.json";
import rules from "../data/scoring/pilot-rules.json";

const SETS = [eiche, ahorn, birke];

const INITIAL_SCORES = {
  reading_base: 0,
  word_sentence: 0,
  text_basic: 0,
  text_deep: 0,
  word_analysis: 0,
  strategy: 0,
  fluency_check: 0,
};

function PathIcon({ type }) {
  if (type === "wave") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" fill="none">
        <path d="M6 26c7-8 13-8 20 0s13 8 20 0 9-7 12-4" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M6 39c7-8 13-8 20 0s13 8 20 0 9-7 12-4" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "compass") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" fill="none">
        <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="4" />
        <path d="m39 21-5 14-13 8 6-15 12-7Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="32" cy="32" r="3" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" fill="none">
      <circle cx="27" cy="27" r="17" stroke="currentColor" strokeWidth="5" />
      <path d="m40 40 16 16" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function flattenSet(set) {
  return set.sections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      sectionId: section.id,
      sectionTitle: section.title,
      contextPassage: section.passage || null,
    }))
  );
}

function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function orderedOptions(options, seed, itemId) {
  if (!seed) return options;
  return [...options]
    .map((option) => ({
      option,
      order: hashText(`${seed}:${itemId}:${option.id}`),
    }))
    .sort((a, b) => a.order - b.order)
    .map(({ option }) => option);
}

function pickRunSeed() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const data = new Uint32Array(1);
    crypto.getRandomValues(data);
    return data[0] || 1;
  }
  return Date.now() % 2147483647;
}

function chooseSet(seed) {
  return SETS[seed % SETS.length];
}

function recommendationFrom(scores) {
  let primary = "magnifier";

  if (scores.reading_base < 7) {
    primary = "wave";
  } else if (scores.word_sentence < 9 || scores.text_basic < 6) {
    primary = "compass";
  }

  let secondary = null;

  if (
    primary === "wave" &&
    scores.reading_base >= 5 &&
    scores.reading_base <= 6 &&
    scores.word_sentence >= 9 &&
    scores.text_basic >= 6
  ) {
    secondary = "compass";
  }

  if (
    primary === "compass" &&
    scores.text_deep >= 5 &&
    (scores.word_sentence === 8 || scores.text_basic === 5)
  ) {
    secondary = "magnifier";
  }

  return {
    primary,
    secondary,
    strategyHint: scores.strategy <= 1,
  };
}

function pathClass(id) {
  if (id === "wave") return "wave";
  if (id === "compass") return "compass";
  return "magnifier";
}

export default function Navigator() {
  const [stage, setStage] = useState("intro");
  const [runSeed, setRunSeed] = useState(null);
  const [activeSet, setActiveSet] = useState(null);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState(INITIAL_SCORES);
  const [responses, setResponses] = useState({});
  const [fluency, setFluency] = useState({
    startedAt: null,
    seconds: null,
    wpm: null,
  });

  const current = queue[index] || null;

  const options = useMemo(() => {
    if (!current?.options) return [];
    return orderedOptions(current.options, runSeed, current.id);
  }, [current, runSeed]);

  const progress = queue.length ? Math.round((index / queue.length) * 100) : 0;

  function startRun() {
    const seed = pickRunSeed();
    const set = chooseSet(seed);
    setRunSeed(seed);
    setActiveSet(set);
    setQueue(flattenSet(set));
    setIndex(0);
    setScores(INITIAL_SCORES);
    setResponses({});
    setFluency({ startedAt: null, seconds: null, wpm: null });
    setStage("task");
  }

  function finishOrAdvance(nextIndex = index + 1) {
    if (nextIndex >= queue.length) {
      setStage("result");
      return;
    }
    setIndex(nextIndex);
  }

  function answer(optionId) {
    if (!current) return;

    setResponses((old) => ({ ...old, [current.id]: optionId }));

    if (
      current.scoreKey &&
      current.correctOption &&
      optionId === current.correctOption
    ) {
      setScores((old) => ({
        ...old,
        [current.scoreKey]: (old[current.scoreKey] || 0) + 1,
      }));
    }

    finishOrAdvance();
  }

  function answerUnknown() {
    if (!current) return;
    setResponses((old) => ({ ...old, [current.id]: "unknown" }));
    finishOrAdvance();
  }

  function startTimedReading() {
    setFluency((old) => ({ ...old, startedAt: performance.now() }));
  }

  function finishTimedReading() {
    if (!current || fluency.startedAt == null) return;
    const seconds = Math.max(1, (performance.now() - fluency.startedAt) / 1000);
    const wpm = Math.round((current.wordCount / seconds) * 60);
    setFluency({ startedAt: fluency.startedAt, seconds, wpm });
    finishOrAdvance();
  }

  function restart() {
    setStage("intro");
    setRunSeed(null);
    setActiveSet(null);
    setQueue([]);
    setIndex(0);
    setScores(INITIAL_SCORES);
    setResponses({});
    setFluency({ startedAt: null, seconds: null, wpm: null });
  }

  if (stage === "intro") {
    return (
      <div className="navigator">
        <header className="brandline">
          <div>
            <h1>Lese-Navigator</h1>
            <p>Finde heraus, welche Leseübungen gerade gut zu dir passen.</p>
          </div>
          <span className="note">Pilotversion 0.1</span>
        </header>

        <div className="path-row" aria-label="Drei Lesewege">
          <div className="path-card wave">
            <PathIcon type="wave" />
            <span>Welle</span>
          </div>
          <div className="path-card compass">
            <PathIcon type="compass" />
            <span>Kompass</span>
          </div>
          <div className="path-card magnifier">
            <PathIcon type="magnifier" />
            <span>Lupe</span>
          </div>
        </div>

        <section className="intro-card">
          <h2>So geht es</h2>
          <p>
            Du löst kleine Leseaufgaben. Du musst nichts schreiben. Lies in deinem
            normalen Tempo und klicke die Antwort an, die für dich passt.
          </p>
          <p>
            Du bekommst keine Note. Am Ende erhältst du einen Tipp, mit welchen
            Übungen du weiterarbeiten kannst.
          </p>
          <button className="primary-button" type="button" onClick={startRun}>
            Lese-Navigator starten
          </button>
          <p className="dev-note">
            Es werden keine Namen abgefragt und keine Ergebnisse dauerhaft gespeichert.
          </p>
        </section>
      </div>
    );
  }

  if (stage === "result") {
    const result = recommendationFrom(scores);
    const primary = rules.recommendations[result.primary];
    const secondary = result.secondary
      ? rules.recommendations[result.secondary]
      : null;

    return (
      <div className="navigator">
        <header className="brandline">
          <div>
            <h1>Dein Lese-Tipp</h1>
            <p>Das passt gerade gut zu deinem Lernen.</p>
          </div>
        </header>

        <section className="result-card">
          <div className={`result-main ${pathClass(result.primary)}`}>
            <div className="path-symbol">
              <PathIcon type={result.primary} />
            </div>
            <div>
              <h3>Starte mit {primary.label}</h3>
              <p>{primary.childText}</p>
            </div>
          </div>

          {secondary && (
            <div className={`result-secondary ${pathClass(result.secondary)}`}>
              <div className="path-symbol">
                <PathIcon type={result.secondary} />
              </div>
              <div>
                <h3>Auch passend: {secondary.label}</h3>
                <p>{secondary.childText}</p>
              </div>
            </div>
          )}

          {result.strategyHint && (
            <p className="strategy-hint">
              <strong>Extra-Tipp:</strong> Nutze beim Üben eine Strategiekarte.
            </p>
          )}

          <p className="note">
            Der Lese-Navigator zeigt dir einen Startpunkt. Er ist kein Test mit Note.
          </p>

          <div className="result-actions">
            <button className="primary-button" type="button" onClick={restart}>
              Noch einmal starten
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!current) return null;

  const isTimed = current.type === "timed_reading";
  const timedStarted = fluency.startedAt != null;

  return (
    <div className="navigator">
      <header className="brandline">
        <div>
          <h1>Lese-Navigator</h1>
          <p>{current.sectionTitle}</p>
        </div>
      </header>

      <div className="progress-wrap" aria-label="Fortschritt">
        <div className="progress-head">
          <span>{current.sectionTitle}</span>
          <span>Du bist unterwegs.</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="task-card">
        {current.contextPassage && (
          <div className="passage-card">
            <p>{current.contextPassage}</p>
          </div>
        )}

        {isTimed ? (
          <div className="timed-reading">
            {!timedStarted ? (
              <>
                <h2>Jetzt liest du einen kurzen Text.</h2>
                <p className="prompt">{current.prompt}</p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={startTimedReading}
                >
                  Text starten
                </button>
              </>
            ) : (
              <>
                <div className="timed-text">{current.text}</div>
                <button
                  className="primary-button"
                  type="button"
                  onClick={finishTimedReading}
                >
                  Fertig gelesen
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <h2>{current.sectionTitle}</h2>
            <p className="prompt">{current.prompt}</p>

            <div
              className={`options ${
                current.type === "visual_choice" ? "visual-options" : ""
              }`}
            >
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="option-button"
                  onClick={() => answer(option.id)}
                  aria-label={
                    current.type === "visual_choice" ? option.alt : undefined
                  }
                >
                  {current.type === "visual_choice"
                    ? option.symbol
                    : option.text}
                </button>
              ))}
            </div>

            {current.type !== "self_report" && (
              <button
                type="button"
                className="unknown-button"
                onClick={answerUnknown}
              >
                Ich weiß es noch nicht.
              </button>
            )}
          </>
        )}
      </section>

      <p className="dev-note" aria-hidden="true">
        Durchlauf ohne Namens- oder Kontodaten.
      </p>
    </div>
  );
}
