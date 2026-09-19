"use strict";

const PREFIX = "lesediagnostik5:v1";
const PARTICIPANTS_KEY = PREFIX + ":participants";
const RUNS_KEY = PREFIX + ":runs";
const TEACHER_PIN_KEY = PREFIX + ":teacher-pin";

const INITIAL_SCORES = {
  reading_base: 0,
  word_sentence: 0,
  text_basic: 0,
  text_deep: 0,
  word_analysis: 0,
  strategy: 0,
  fluency_check: 0
};

const state = {
  sets: [],
  rules: null,
  stage: "intro",
  runSeed: null,
  activeSet: null,
  queue: [],
  index: 0,
  scores: { ...INITIAL_SCORES },
  responses: {},
  fluency: { startedAt: null, seconds: null, wpm: null },
  participantName: "",
  className: "",
  currentParticipant: null,
  resultData: null,
  teacherUnlocked: false,
  saveMessage: ""
};

const app = document.getElementById("app");
document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const values = await Promise.all([
      loadJson("./data/sets/eiche.json"),
      loadJson("./data/sets/ahorn.json"),
      loadJson("./data/sets/birke.json"),
      loadJson("./data/scoring/pilot-rules.json")
    ]);
    state.sets = values.slice(0, 3);
    state.rules = values[3];
    render();
  } catch (error) {
    console.error(error);
    app.innerHTML =
      '<div class="navigator"><section class="intro-card">' +
      '<h1>Lese-Navigator</h1>' +
      '<p class="error-message">Die Aufgabendaten konnten nicht geladen werden.</p>' +
      '<p class="note">Bitte die Seite neu laden. Wenn der Fehler bleibt, muss die Deployment-Struktur geprüft werden.</p>' +
      '</section></div>';
  }
}

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Fehler beim Laden von " + url);
  return response.json();
}

function storageAvailable() {
  try {
    const key = PREFIX + ":probe";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function loadParticipants() {
  if (!storageAvailable()) return [];
  const value = safeParse(localStorage.getItem(PARTICIPANTS_KEY), []);
  return Array.isArray(value) ? value : [];
}

function loadRuns() {
  if (!storageAvailable()) return [];
  const value = safeParse(localStorage.getItem(RUNS_KEY), []);
  return Array.isArray(value) ? value : [];
}

function makeId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return prefix + "-" + crypto.randomUUID();
  }
  return prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

function upsertParticipant(name, className) {
  const cleanName = String(name || "").trim();
  const cleanClass = String(className || "").trim();
  if (!cleanName) throw new Error("Bitte einen Namen oder ein Kürzel eingeben.");

  const participants = loadParticipants();
  const existing = participants.find(function (item) {
    return item.name.toLocaleLowerCase("de-DE") === cleanName.toLocaleLowerCase("de-DE") &&
      item.className.toLocaleLowerCase("de-DE") === cleanClass.toLocaleLowerCase("de-DE");
  });
  if (existing) return existing;

  const participant = {
    id: makeId("p"),
    name: cleanName,
    className: cleanClass,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants.concat([participant])));
  return participant;
}

function saveDiagnosticRun(run) {
  const runs = loadRuns();
  const entry = Object.assign({}, run, {
    id: run.id || makeId("r"),
    completedAt: run.completedAt || new Date().toISOString(),
    schemaVersion: 1
  });
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs.concat([entry])));
  return entry;
}

function deleteAllLocalData() {
  localStorage.removeItem(PARTICIPANTS_KEY);
  localStorage.removeItem(RUNS_KEY);
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, function (char) { return char.charCodeAt(0); });
}

async function derivePinHash(pin, salt) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt, iterations: 180000, hash: "SHA-256" },
    material,
    256
  );
  return new Uint8Array(bits);
}

function hasTeacherPin() {
  return storageAvailable() && Boolean(localStorage.getItem(TEACHER_PIN_KEY));
}

async function setTeacherPin(pin) {
  const clean = String(pin || "").trim();
  if (!/^\d{4,10}$/.test(clean)) {
    throw new Error("Die Lehrkraft-PIN muss aus 4 bis 10 Ziffern bestehen.");
  }
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Dieser Browser unterstützt die lokale PIN-Sicherung nicht.");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePinHash(clean, salt);
  localStorage.setItem(TEACHER_PIN_KEY, JSON.stringify({
    version: 1,
    salt: bytesToBase64(salt),
    hash: bytesToBase64(hash)
  }));
}

async function verifyTeacherPin(pin) {
  if (typeof crypto === "undefined" || !crypto.subtle) return false;
  const stored = safeParse(localStorage.getItem(TEACHER_PIN_KEY), null);
  if (!stored || !stored.salt || !stored.hash) return false;
  const salt = base64ToBytes(stored.salt);
  const expected = base64ToBytes(stored.hash);
  const actual = await derivePinHash(String(pin || "").trim(), salt);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i += 1) difference |= actual[i] ^ expected[i];
  return difference === 0;
}

function flattenSet(set) {
  return set.sections.flatMap(function (section) {
    return section.items.map(function (item) {
      return Object.assign({}, item, {
        sectionId: section.id,
        sectionTitle: section.title,
        contextPassage: section.passage || null
      });
    });
  });
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
  return options.slice().map(function (option) {
    return { option: option, order: hashText(seed + ":" + itemId + ":" + option.id) };
  }).sort(function (a, b) {
    return a.order - b.order;
  }).map(function (entry) {
    return entry.option;
  });
}

function pickRunSeed() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const data = new Uint32Array(1);
    crypto.getRandomValues(data);
    return data[0] || 1;
  }
  return Date.now() % 2147483647;
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
  ) secondary = "compass";

  if (
    primary === "compass" &&
    scores.text_deep >= 5 &&
    (scores.word_sentence === 8 || scores.text_basic === 5)
  ) secondary = "magnifier";

  return { primary: primary, secondary: secondary, strategyHint: scores.strategy <= 1 };
}

function applyScore(scores, item, optionId) {
  if (!item || !item.scoreKey || !item.correctOption || optionId !== item.correctOption) return scores;
  const next = Object.assign({}, scores);
  next[item.scoreKey] = (next[item.scoreKey] || 0) + 1;
  return next;
}

function buildItemResults(queue, responses) {
  return queue.filter(function (item) {
    return Object.prototype.hasOwnProperty.call(responses, item.id);
  }).map(function (item) {
    const response = responses[item.id];
    return {
      itemId: item.id,
      response: response,
      competency: item.competency || "",
      scoreKey: item.scoreKey || "",
      correct: item.correctOption == null ? null : response !== "unknown" && response === item.correctOption
    };
  });
}

function pathIcon(type) {
  if (type === "wave") {
    return '<svg viewBox="0 0 64 64" aria-hidden="true" fill="none">' +
      '<path d="M6 26c7-8 13-8 20 0s13 8 20 0 9-7 12-4" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path>' +
      '<path d="M6 39c7-8 13-8 20 0s13 8 20 0 9-7 12-4" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path></svg>';
  }
  if (type === "compass") {
    return '<svg viewBox="0 0 64 64" aria-hidden="true" fill="none">' +
      '<circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="4"></circle>' +
      '<path d="m39 21-5 14-13 8 6-15 12-7Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"></path>' +
      '<circle cx="32" cy="32" r="3" fill="currentColor"></circle></svg>';
  }
  return '<svg viewBox="0 0 64 64" aria-hidden="true" fill="none">' +
    '<circle cx="27" cy="27" r="17" stroke="currentColor" stroke-width="5"></circle>' +
    '<path d="m40 40 16 16" stroke="currentColor" stroke-width="6" stroke-linecap="round"></path></svg>';
}

function render() {
  if (state.stage === "task") return renderTask();
  if (state.stage === "result") return renderResult();
  return renderIntro();
}

function renderIntro(message) {
  message = message || "";
  const participantCount = loadParticipants().length;
  const runCount = loadRuns().length;
  const configured = hasTeacherPin();

  app.innerHTML =
    '<div class="navigator">' +
      '<header class="brandline"><div><h1>Lese-Navigator</h1>' +
      '<p>Finde heraus, welche Leseübungen gerade gut zu dir passen.</p></div>' +
      '<span class="note">Pilotversion 0.3 · HTML</span></header>' +
      '<div class="path-row" aria-label="Drei Lesewege">' +
        '<div class="path-card wave">' + pathIcon("wave") + '<span>Welle</span></div>' +
        '<div class="path-card compass">' + pathIcon("compass") + '<span>Kompass</span></div>' +
        '<div class="path-card magnifier">' + pathIcon("magnifier") + '<span>Lupe</span></div>' +
      '</div>' +
      '<section class="intro-card"><h2>So geht es</h2>' +
        '<p>Du löst kleine Leseaufgaben. Du musst nichts schreiben. Lies in deinem normalen Tempo und klicke die Antwort an, die für dich passt.</p>' +
        '<p>Du bekommst keine Note. Am Ende erhältst du einen Tipp, mit welchen Übungen du weiterarbeiten kannst.</p>' +
        '<div class="participant-box"><h3>Dieser Durchlauf</h3>' +
          '<p class="note">Die Angaben werden nur im Browser dieses Geräts gespeichert. Du kannst auch ein eindeutiges Kürzel statt des Namens verwenden.</p>' +
          '<div class="form-grid">' +
            '<label><span>Name oder Kürzel</span><input id="participant-name" type="text" autocomplete="off" maxlength="80" value="' + escapeAttribute(state.participantName) + '"></label>' +
            '<label><span>Klasse (optional)</span><input id="class-name" type="text" autocomplete="off" maxlength="40" value="' + escapeAttribute(state.className) + '"></label>' +
          '</div></div>' +
        (message ? '<p class="error-message">' + escapeHtml(message) + '</p>' : '') +
        '<button id="start-run" class="primary-button" type="button">Lese-Navigator starten</button>' +
        '<p class="local-only-note"><strong>Nur lokal:</strong> Diagnoseergebnisse werden nicht an einen Server gesendet. Die Website liefert ausschließlich statische Dateien aus.</p>' +
      '</section>' +
      '<details class="local-admin"><summary>Lokale Datenverwaltung – Lehrkraft</summary>' +
        '<div class="local-admin-body">' +
          (state.teacherUnlocked ? teacherAdminUnlocked(participantCount, runCount) : teacherAdminLocked(configured)) +
        '</div></details>' +
    '</div>';

  document.getElementById("participant-name").addEventListener("input", function (event) {
    state.participantName = event.target.value;
  });
  document.getElementById("class-name").addEventListener("input", function (event) {
    state.className = event.target.value;
  });
  document.getElementById("start-run").addEventListener("click", startRun);

  const pinButton = document.getElementById("pin-action");
  if (pinButton) pinButton.addEventListener("click", handleTeacherPin);

  const lockButton = document.getElementById("teacher-lock");
  if (lockButton) lockButton.addEventListener("click", function () {
    state.teacherUnlocked = false;
    renderIntro();
  });

  const exportSummary = document.getElementById("export-summary");
  if (exportSummary) exportSummary.addEventListener("click", exportSummaryCsv);

  const exportItems = document.getElementById("export-items");
  if (exportItems) exportItems.addEventListener("click", exportItemCsv);

  const deleteButton = document.getElementById("delete-local");
  if (deleteButton) deleteButton.addEventListener("click", handleDeleteAll);
}

function teacherAdminLocked(configured) {
  return '<div class="pin-gate">' +
    '<p class="note">' +
      (configured
        ? 'Gib die Geräte-PIN ein, um gespeicherte Ergebnisse zu sehen oder zu exportieren.'
        : 'Lege einmalig eine 4- bis 10-stellige Geräte-PIN für die lokale Datenverwaltung fest.') +
    '</p>' +
    '<div class="pin-row"><label><span>' +
      (configured ? 'Lehrkraft-PIN' : 'Neue Lehrkraft-PIN') +
      '</span><input id="teacher-pin" type="password" inputmode="numeric" autocomplete="off" maxlength="10"></label>' +
      '<button id="pin-action" class="secondary-button" type="button">' +
      (configured ? 'Entsperren' : 'PIN festlegen') +
      '</button></div>' +
    '<p id="pin-error" class="error-message" hidden></p></div>';
}

function teacherAdminUnlocked(participantCount, runCount) {
  return '<p>Auf diesem Browser gespeichert: <strong>' + participantCount +
    '</strong> Teilnehmer · <strong>' + runCount + '</strong> Durchläufe</p>' +
    '<p class="note">Browserdaten können beim Löschen des Website-Speichers verloren gehen. Sichere Ergebnisse bei Bedarf als CSV in deinem geschützten schulischen Ablageort.</p>' +
    '<div class="result-actions">' +
      '<button id="export-summary" class="secondary-button" type="button"' + (runCount ? '' : ' disabled') + '>Ergebnisse als CSV</button>' +
      '<button id="export-items" class="secondary-button" type="button"' + (runCount ? '' : ' disabled') + '>Itemdaten als CSV</button>' +
      '<button id="delete-local" class="danger-button" type="button"' + ((participantCount || runCount) ? '' : ' disabled') + '>Lokale Daten löschen</button>' +
      '<button id="teacher-lock" class="secondary-button" type="button">Lehrkraftbereich sperren</button>' +
    '</div>';
}

async function handleTeacherPin() {
  const input = document.getElementById("teacher-pin");
  const errorBox = document.getElementById("pin-error");
  const pin = String(input ? input.value : "").replace(/\D/g, "").slice(0, 10);

  try {
    if (!hasTeacherPin()) {
      await setTeacherPin(pin);
      state.teacherUnlocked = true;
      renderIntro();
      return;
    }
    const valid = await verifyTeacherPin(pin);
    if (!valid) throw new Error("Die PIN ist nicht richtig.");
    state.teacherUnlocked = true;
    renderIntro();
  } catch (error) {
    if (errorBox) {
      errorBox.hidden = false;
      errorBox.textContent = error instanceof Error ? error.message : "Die PIN konnte nicht verarbeitet werden.";
    }
  }
}

function startRun() {
  state.participantName = document.getElementById("participant-name").value || "";
  state.className = document.getElementById("class-name").value || "";

  if (!storageAvailable()) {
    renderIntro("Der lokale Browserspeicher ist auf diesem Gerät nicht verfügbar.");
    return;
  }
  if (!hasTeacherPin()) {
    renderIntro("Vor dem ersten Durchlauf muss die Lehrkraft unten eine Geräte-PIN festlegen.");
    return;
  }

  try {
    state.currentParticipant = upsertParticipant(state.participantName, state.className);
  } catch (error) {
    renderIntro(error instanceof Error ? error.message : "Die lokalen Angaben konnten nicht gespeichert werden.");
    return;
  }

  state.runSeed = pickRunSeed();
  state.activeSet = state.sets[state.runSeed % state.sets.length];
  state.queue = flattenSet(state.activeSet);
  state.index = 0;
  state.scores = Object.assign({}, INITIAL_SCORES);
  state.responses = {};
  state.fluency = { startedAt: null, seconds: null, wpm: null };
  state.resultData = null;
  state.saveMessage = "";
  state.stage = "task";
  render();
}

function renderTask() {
  const current = state.queue[state.index];
  if (!current) return;

  const progress = state.queue.length ? Math.round((state.index / state.queue.length) * 100) : 0;
  const isTimed = current.type === "timed_reading";
  const timedStarted = state.fluency.startedAt != null;
  let body = "";

  if (isTimed) {
    if (timedStarted) {
      body = '<div class="timed-reading"><div class="timed-text">' +
        escapeHtml(current.text) +
        '</div><button id="finish-reading" class="primary-button" type="button">Fertig gelesen</button></div>';
    } else {
      body = '<div class="timed-reading"><h2>Jetzt liest du einen kurzen Text.</h2>' +
        '<p class="prompt">' + escapeHtml(current.prompt) + '</p>' +
        '<button id="start-reading" class="primary-button" type="button">Text starten</button></div>';
    }
  } else {
    const options = orderedOptions(current.options || [], state.runSeed, current.id);
    const optionHtml = options.map(function (option) {
      const content = current.type === "visual_choice"
        ? escapeHtml(option.symbol || option.alt || "")
        : escapeHtml(option.text || "");
      const aria = current.type === "visual_choice"
        ? ' aria-label="' + escapeAttribute(option.alt || "") + '"'
        : "";
      return '<button class="option-button" type="button" data-option="' +
        escapeAttribute(option.id) + '"' + aria + '>' + content + '</button>';
    }).join("");

    body =
      '<h2>' + escapeHtml(current.sectionTitle) + '</h2>' +
      '<p class="prompt">' + escapeHtml(current.prompt) + '</p>' +
      '<div class="options ' + (current.type === "visual_choice" ? "visual-options" : "") + '">' +
        optionHtml +
      '</div>' +
      (current.type !== "self_report"
        ? '<button id="unknown-answer" class="unknown-button" type="button">Ich weiß es noch nicht.</button>'
        : '');
  }

  app.innerHTML =
    '<div class="navigator">' +
      '<header class="brandline"><div><h1>Lese-Navigator</h1><p>' +
        escapeHtml(current.sectionTitle) +
      '</p></div></header>' +
      '<div class="progress-wrap" aria-label="Fortschritt">' +
        '<div class="progress-head"><span>' + escapeHtml(current.sectionTitle) +
        '</span><span>Du bist unterwegs.</span></div>' +
        '<div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:' +
          progress + '%"></div></div>' +
      '</div>' +
      '<section class="task-card">' +
        (current.contextPassage
          ? '<div class="passage-card"><p>' + escapeHtml(current.contextPassage) + '</p></div>'
          : '') +
        body +
      '</section>' +
      '<p class="dev-note" aria-hidden="true">Dieser Durchlauf wird ausschließlich lokal im Browser gespeichert.</p>' +
    '</div>';

  document.querySelectorAll("[data-option]").forEach(function (button) {
    button.addEventListener("click", function () {
      answer(button.dataset.option);
    });
  });

  const unknown = document.getElementById("unknown-answer");
  if (unknown) unknown.addEventListener("click", answerUnknown);

  const startReading = document.getElementById("start-reading");
  if (startReading) startReading.addEventListener("click", function () {
    state.fluency.startedAt = performance.now();
    renderTask();
  });

  const finishReading = document.getElementById("finish-reading");
  if (finishReading) finishReading.addEventListener("click", finishTimedReading);
}

function answer(optionId) {
  const current = state.queue[state.index];
  const nextResponses = Object.assign({}, state.responses);
  nextResponses[current.id] = optionId;
  const nextScores = applyScore(state.scores, current, optionId);
  advance(nextScores, nextResponses);
}

function answerUnknown() {
  const current = state.queue[state.index];
  const nextResponses = Object.assign({}, state.responses);
  nextResponses[current.id] = "unknown";
  advance(state.scores, nextResponses);
}

function advance(nextScores, nextResponses) {
  state.scores = nextScores;
  state.responses = nextResponses;
  state.index += 1;
  if (state.index >= state.queue.length) {
    completeRun();
    return;
  }
  renderTask();
}

function finishTimedReading() {
  const current = state.queue[state.index];
  if (!current || state.fluency.startedAt == null) return;
  const seconds = Math.max(1, (performance.now() - state.fluency.startedAt) / 1000);
  state.fluency.seconds = seconds;
  state.fluency.wpm = Math.round((current.wordCount / seconds) * 60);
  state.index += 1;
  if (state.index >= state.queue.length) {
    completeRun();
    return;
  }
  renderTask();
}

function completeRun() {
  const recommendation = recommendationFrom(state.scores);
  const itemResults = buildItemResults(state.queue, state.responses);
  state.resultData = {
    scores: state.scores,
    responses: state.responses,
    recommendation: recommendation,
    itemResults: itemResults
  };

  try {
    saveDiagnosticRun({
      participantId: state.currentParticipant.id,
      participantNameSnapshot: state.currentParticipant.name,
      classNameSnapshot: state.currentParticipant.className,
      setId: state.activeSet.setId,
      setVersion: state.activeSet.version,
      scores: state.scores,
      responses: state.responses,
      itemResults: itemResults,
      fluency: { seconds: state.fluency.seconds, wpm: state.fluency.wpm },
      recommendation: recommendation
    });
    state.saveMessage = "Ergebnis wurde nur auf diesem Gerät gespeichert.";
  } catch {
    state.saveMessage = "Das Ergebnis konnte nicht im lokalen Browserspeicher gespeichert werden.";
  }

  state.stage = "result";
  render();
}

function renderResult() {
  const recommendation = state.resultData
    ? state.resultData.recommendation
    : recommendationFrom(state.scores);
  const primary = state.rules.recommendations[recommendation.primary];
  const secondary = recommendation.secondary
    ? state.rules.recommendations[recommendation.secondary]
    : null;

  app.innerHTML =
    '<div class="navigator">' +
      '<header class="brandline"><div><h1>Dein Lese-Tipp</h1><p>Das passt gerade gut zu deinem Lernen.</p></div></header>' +
      '<section class="result-card">' +
        '<div class="result-main ' + pathClass(recommendation.primary) + '">' +
          '<div class="path-symbol">' + pathIcon(recommendation.primary) + '</div>' +
          '<div><h3>Starte mit ' + escapeHtml(primary.label) + '</h3><p>' +
            escapeHtml(primary.childText) + '</p></div>' +
        '</div>' +
        (secondary
          ? '<div class="result-secondary ' + pathClass(recommendation.secondary) + '">' +
              '<div class="path-symbol">' + pathIcon(recommendation.secondary) + '</div>' +
              '<div><h3>Auch passend: ' + escapeHtml(secondary.label) + '</h3><p>' +
                escapeHtml(secondary.childText) + '</p></div></div>'
          : '') +
        (recommendation.strategyHint
          ? '<p class="strategy-hint"><strong>Extra-Tipp:</strong> Nutze beim Üben eine Strategiekarte.</p>'
          : '') +
        '<p class="note">Der Lese-Navigator zeigt dir einen Startpunkt. Er ist kein Test mit Note.</p>' +
        (state.saveMessage ? '<p class="save-message">' + escapeHtml(state.saveMessage) + '</p>' : '') +
        '<div class="result-actions">' +
          '<button id="next-person" class="primary-button" type="button">Nächster Durchlauf</button>' +
          '<button id="same-person" class="secondary-button" type="button">Noch einmal für dieselbe Person</button>' +
        '</div>' +
      '</section>' +
    '</div>';

  document.getElementById("next-person").addEventListener("click", function () {
    resetToIntro(false);
  });
  document.getElementById("same-person").addEventListener("click", function () {
    resetToIntro(true);
  });
}

function resetToIntro(keepParticipant) {
  state.stage = "intro";
  state.runSeed = null;
  state.activeSet = null;
  state.queue = [];
  state.index = 0;
  state.scores = Object.assign({}, INITIAL_SCORES);
  state.responses = {};
  state.fluency = { startedAt: null, seconds: null, wpm: null };
  state.resultData = null;
  state.saveMessage = "";
  if (!keepParticipant) {
    state.participantName = "";
    state.className = "";
    state.currentParticipant = null;
  }
  render();
}

function pathClass(id) {
  if (id === "wave") return "wave";
  if (id === "compass") return "compass";
  return "magnifier";
}

function handleDeleteAll() {
  if (!confirm("Alle lokal gespeicherten Namen/Kürzel und Diagnoseergebnisse auf diesem Browser wirklich löschen?")) {
    return;
  }
  deleteAllLocalData();
  state.participantName = "";
  state.className = "";
  state.currentParticipant = null;
  renderIntro();
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[;"\n\r]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

function downloadCsv(filename, rows) {
  const body = rows.map(function (row) {
    return row.map(csvEscape).join(";");
  }).join("\r\n");
  const blob = new Blob(["\uFEFF", body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function exportSummaryCsv() {
  const participants = loadParticipants();
  const participantMap = new Map(participants.map(function (item) {
    return [item.id, item];
  }));
  const runs = loadRuns();
  const rows = [[
    "teilnehmer_id","name_oder_kuerzel","klasse","zeitpunkt","parallelform",
    "lesebasis","wort_satz","textverstaendnis","tiefes_textverstaendnis",
    "worterschliessung","strategiewissen","lesetempo_kontrollfragen",
    "woerter_pro_minute","lesezeit_sekunden","hauptempfehlung",
    "zweitempfehlung","ich_weiss_es_nicht_anzahl"
  ]];

  runs.forEach(function (run) {
    const participant = participantMap.get(run.participantId);
    rows.push([
      run.participantId,
      participant ? participant.name : (run.participantNameSnapshot || ""),
      participant ? participant.className : (run.classNameSnapshot || ""),
      run.completedAt,
      run.setId,
      run.scores && run.scores.reading_base != null ? run.scores.reading_base : "",
      run.scores && run.scores.word_sentence != null ? run.scores.word_sentence : "",
      run.scores && run.scores.text_basic != null ? run.scores.text_basic : "",
      run.scores && run.scores.text_deep != null ? run.scores.text_deep : "",
      run.scores && run.scores.word_analysis != null ? run.scores.word_analysis : "",
      run.scores && run.scores.strategy != null ? run.scores.strategy : "",
      run.scores && run.scores.fluency_check != null ? run.scores.fluency_check : "",
      run.fluency && run.fluency.wpm != null ? run.fluency.wpm : "",
      run.fluency && run.fluency.seconds ? Math.round(run.fluency.seconds * 10) / 10 : "",
      run.recommendation ? run.recommendation.primary : "",
      run.recommendation ? (run.recommendation.secondary || "") : "",
      Object.values(run.responses || {}).filter(function (value) { return value === "unknown"; }).length
    ]);
  });

  downloadCsv(
    "lesediagnostik5-ergebnisse-" + new Date().toISOString().slice(0, 10) + ".csv",
    rows
  );
}

function exportItemCsv() {
  const participants = loadParticipants();
  const participantMap = new Map(participants.map(function (item) {
    return [item.id, item];
  }));
  const runs = loadRuns();
  const rows = [[
    "teilnehmer_id","name_oder_kuerzel","klasse","zeitpunkt","parallelform",
    "item_id","antwort","kompetenz","auswertungsbereich","richtig"
  ]];

  runs.forEach(function (run) {
    const participant = participantMap.get(run.participantId);
    const items = Array.isArray(run.itemResults) ? run.itemResults : [];
    items.forEach(function (item) {
      rows.push([
        run.participantId,
        participant ? participant.name : (run.participantNameSnapshot || ""),
        participant ? participant.className : (run.classNameSnapshot || ""),
        run.completedAt,
        run.setId,
        item.itemId,
        item.response,
        item.competency || "",
        item.scoreKey || "",
        item.correct === true ? "1" : item.correct === false ? "0" : ""
      ]);
    });
  });

  downloadCsv(
    "lesediagnostik5-itemdaten-" + new Date().toISOString().slice(0, 10) + ".csv",
    rows
  );
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}