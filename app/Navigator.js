"use client";

import { useEffect, useMemo, useState } from "react";
import eiche from "../data/sets/eiche.json";
import ahorn from "../data/sets/ahorn.json";
import birke from "../data/sets/birke.json";
import rules from "../data/scoring/pilot-rules.json";
import {
  deleteAllLocalData,
  exportItemCsv,
  exportSummaryCsv,
  loadParticipants,
  loadRuns,
  saveDiagnosticRun,
  storageAvailable,
  upsertParticipant,
} from "./localData";

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

function applyScore(scores, item, optionId) {
  if (!item?.scoreKey || !item?.correctOption || optionId !== item.correctOption) {
    return scores;
  }

  return {
    ...scores,
    [item.scoreKey]: (scores[item.scoreKey] || 0) + 1,
  };
}

function buildItemResults(queue, responses) {
  return queue
    .filter((item) => Object.prototype.hasOwnProperty.call(responses, item.id))
    .map((item) => {
      const response = responses[item.id];
      return {
        itemId: item.id,
        response,
        competency: item.competency || "",
        scoreKey: item.scoreKey || "",
        correct:
          item.correctOption == null
            ? null
            : response !== "unknown" && response === item.correctOption,
      };
    });
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
  const [participantName, setParticipantName] = useState("");
  const [className, setClassName] = useState("");
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [storageReady, setStorageReady] = useState(null);
  const [localCounts, setLocalCounts] = useState({ participants: 0, runs: 0 });
  const [formError, setFormError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const available = storageAvailable();
    setStorageReady(available);
    if (available) {
      setLocalCounts({
        participants: loadParticipants().length,
        runs: loadRuns().length,
      });
    }
  }, []);

  const current = queue[index] || null;

  const options = useMemo(() => {
    if (!current?.options) return [];
    return orderedOptions(current.options, runSeed, current.id);
  }, [current, runSeed]);

  const progress = queue.length ? Math.round((index / queue.length) * 100) : 0;

  function refreshLocalCounts() {
    if (!storageAvailable()) return;
    setLocalCounts({
      participants: loadParticipants().length,
      runs: loadRuns().length,
    });
  }

  function startRun() {
    setFormError("");

    if (!storageAvailable()) {
      setFormError(
        "Der lokale Browserspeicher ist auf diesem Gerät nicht verfügbar. Der Durchlauf wird deshalb nicht gestartet."
      );
      return;
    }

    let participant;
    try {
      participant = upsertParticipant({
        name: participantName,
        className,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Die lokalen Angaben konnten nicht gespeichert werden.");
      return;
    }

    const seed = pickRunSeed();
    const set = chooseSet(seed);

    setCurrentParticipant(participant);
    setRunSeed(seed);
    setActiveSet(set);
    setQueue(flattenSet(set));
    setIndex(0);
    setScores(INITIAL_SCORES);
    setResponses({});
    setFluency({ startedAt: null, seconds: null, wpm: null });
    setResultData(null);
    setSaveMessage("");
    setStage("task");
    refreshLocalCounts();
  }

  function completeRun(finalScores, finalResponses) {
    const recommendation = recommendationFrom(finalScores);
    const itemResults = buildItemResults(queue, finalResponses);

    const result = {
      scores: finalScores,
      responses: finalResponses,
      recommendation,
      itemResults,
    };

    setResultData(result);
    setScores(finalScores);
    setResponses(finalResponses);

    try {
      saveDiagnosticRun({
        participantId: currentParticipant.id,
        participantNameSnapshot: currentParticipant.name,
        classNameSnapshot: currentParticipant.className,
        setId: activeSet.setId,
        setVersion: activeSet.version,
        scores: finalScores,
        responses: finalResponses,
        itemResults,
        fluency: {
          seconds: fluency.seconds,
          wpm: fluency.wpm,
        },
        recommendation,
      });
      setSaveMessage("Ergebnis wurde nur auf diesem Gerät gespeichert.");
      refreshLocalCounts();
    } catch {
      setSaveMessage(
        "Das Ergebnis konnte nicht im lokalen Browserspeicher gespeichert werden."
      );
    }

    setStage("result");
  }

  function finishOrAdvance(finalScores, finalResponses, nextIndex = index + 1) {
    if (nextIndex >= queue.length) {
      completeRun(finalScores, finalResponses);
      return;
    }
    setScores(finalScores);
    setResponses(finalResponses);
    setIndex(nextIndex);
  }

  function answer(optionId) {
    if (!current) return;

    const nextResponses = { ...responses, [current.id]: optionId };
    const nextScores = applyScore(scores, current, optionId);
    finishOrAdvance(nextScores, nextResponses);
  }

  function answerUnknown() {
    if (!current) return;
    const nextResponses = { ...responses, [current.id]: "unknown" };
    finishOrAdvance(scores, nextResponses);
  }

  function startTimedReading() {
    setFluency((old) => ({ ...old, startedAt: performance.now() }));
  }

  function finishTimedReading() {
    if (!current || fluency.startedAt == null) return;
    const seconds = Math.max(1, (performance.now() - fluency.startedAt) / 1000);
    const wpm = Math.round((current.wordCount / seconds) * 60);
    setFluency({ startedAt: fluency.startedAt, seconds, wpm });

    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      completeRun(scores, responses);
    } else {
      setIndex(nextIndex);
    }
  }

  function restart({ keepParticipant = true } = {}) {
    setStage("intro");
    setRunSeed(null);
    setActiveSet(null);
    setQueue([]);
    setIndex(0);
    setScores(INITIAL_SCORES);
    setResponses({});
    setFluency({ startedAt: null, seconds: null, wpm: null });
    setResultData(null);
    setSaveMessage("");

    if (!keepParticipant) {
      setParticipantName("");
      setClassName("");
      setCurrentParticipant(null);
    }
  }

  function handleDeleteAll() {
    const confirmed = window.confirm(
      "Alle lokal gespeicherten Namen/Kürzel und Diagnoseergebnisse auf diesem Browser wirklich löschen?"
    );
    if (!confirmed) return;

    deleteAllLocalData();
    setParticipantName("");
    setClassName("");
    setCurrentParticipant(null);
    setLocalCounts({ participants: 0, runs: 0 });
    setSaveMessage("");
  }

  if (stage === "intro") {
    return (
      <div className="navigator">
        <header className="brandline">
          <div>
            <h1>Lese-Navigator</h1>
            <p>Finde heraus, welche Leseübungen gerade gut zu dir passen.</p>
          </div>
          <span className="note">Pilotversion 0.2</span>
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

          <div className="participant-box">
            <h3>Dieser Durchlauf</h3>
            <p className="note">
              Die Angaben werden nur im Browser dieses Geräts gespeichert.
              Du kannst auch ein eindeutiges Kürzel statt des Namens verwenden.
            </p>
            <div className="form-grid">
              <label>
                <span>Name oder Kürzel</span>
                <input
                  type="text"
                  value={participantName}
                  onChange={(event) => setParticipantName(event.target.value)}
                  autoComplete="off"
                  maxLength={80}
                />
              </label>
              <label>
                <span>Klasse (optional)</span>
                <input
                  type="text"
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                  autoComplete="off"
                  maxLength={40}
                />
              </label>
            </div>
          </div>

          {formError && <p className="error-message">{formError}</p>}

          <button
            className="primary-button"
            type="button"
            onClick={startRun}
            disabled={storageReady === false}
          >
            Lese-Navigator starten
          </button>

          <p className="local-only-note">
            <strong>Nur lokal:</strong> Diagnoseergebnisse werden nicht an einen
            Server gesendet. Vercel stellt ausschließlich die App-Dateien bereit.
          </p>
        </section>

        <details className="local-admin">
          <summary>Lokale Datenverwaltung – Lehrkraft</summary>
          <div className="local-admin-body">
            <p>
              Auf diesem Browser gespeichert: <strong>{localCounts.participants}</strong>{" "}
              Teilnehmer · <strong>{localCounts.runs}</strong> Durchläufe
            </p>
            <p className="note">
              Browserdaten können beim Löschen des Website-Speichers verloren gehen.
              Sichere die Ergebnisse deshalb bei Bedarf als CSV in deinem geschützten
              schulischen Ablageort.
            </p>
            <div className="result-actions">
              <button
                className="secondary-button"
                type="button"
                onClick={exportSummaryCsv}
                disabled={localCounts.runs === 0}
              >
                Ergebnisse als CSV
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={exportItemCsv}
                disabled={localCounts.runs === 0}
              >
                Itemdaten als CSV
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={handleDeleteAll}
                disabled={localCounts.participants === 0 && localCounts.runs === 0}
              >
                Lokale Daten löschen
              </button>
            </div>
          </div>
        </details>
      </div>
    );
  }

  if (stage === "result") {
    const result = resultData || {
      scores,
      responses,
      recommendation: recommendationFrom(scores),
    };
    const recommendation = result.recommendation;
    const primary = rules.recommendations[recommendation.primary];
    const secondary = recommendation.secondary
      ? rules.recommendations[recommendation.secondary]
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
          <div className={`result-main ${pathClass(recommendation.primary)}`}>
            <div className="path-symbol">
              <PathIcon type={recommendation.primary} />
            </div>
            <div>
              <h3>Starte mit {primary.label}</h3>
              <p>{primary.childText}</p>
            </div>
          </div>

          {secondary && (
            <div className={`result-secondary ${pathClass(recommendation.secondary)}`}>
              <div className="path-symbol">
                <PathIcon type={recommendation.secondary} />
              </div>
              <div>
                <h3>Auch passend: {secondary.label}</h3>
                <p>{secondary.childText}</p>
              </div>
            </div>
          )}

          {recommendation.strategyHint && (
            <p className="strategy-hint">
              <strong>Extra-Tipp:</strong> Nutze beim Üben eine Strategiekarte.
            </p>
          )}

          <p className="note">
            Der Lese-Navigator zeigt dir einen Startpunkt. Er ist kein Test mit Note.
          </p>

          {saveMessage && <p className="save-message">{saveMessage}</p>}

          <div className="result-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => restart({ keepParticipant: false })}
            >
              Nächster Durchlauf
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => restart({ keepParticipant: true })}
            >
              Noch einmal für dieselbe Person
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
        Dieser Durchlauf wird ausschließlich lokal im Browser gespeichert.
      </p>
    </div>
  );
}
