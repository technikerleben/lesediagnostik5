const PREFIX = "lesediagnostik5:v1";
const PARTICIPANTS_KEY = `${PREFIX}:participants`;
const RUNS_KEY = `${PREFIX}:runs`;

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function storageAvailable() {
  try {
    const key = `${PREFIX}:probe`;
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function loadParticipants() {
  if (!storageAvailable()) return [];
  const value = safeParse(localStorage.getItem(PARTICIPANTS_KEY), []);
  return Array.isArray(value) ? value : [];
}

export function loadRuns() {
  if (!storageAvailable()) return [];
  const value = safeParse(localStorage.getItem(RUNS_KEY), []);
  return Array.isArray(value) ? value : [];
}

function saveParticipants(items) {
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(items));
}

function saveRuns(items) {
  localStorage.setItem(RUNS_KEY, JSON.stringify(items));
}

function makeId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function upsertParticipant({ name, className }) {
  const cleanName = String(name || "").trim();
  const cleanClass = String(className || "").trim();

  if (!cleanName) {
    throw new Error("Bitte einen Namen oder ein Kürzel eingeben.");
  }

  const participants = loadParticipants();
  const existing = participants.find(
    (item) =>
      item.name.toLocaleLowerCase("de-DE") === cleanName.toLocaleLowerCase("de-DE") &&
      item.className.toLocaleLowerCase("de-DE") === cleanClass.toLocaleLowerCase("de-DE")
  );

  if (existing) return existing;

  const participant = {
    id: makeId("p"),
    name: cleanName,
    className: cleanClass,
    createdAt: new Date().toISOString(),
  };

  saveParticipants([...participants, participant]);
  return participant;
}

export function saveDiagnosticRun(run) {
  const runs = loadRuns();
  const entry = {
    ...run,
    id: run.id || makeId("r"),
    completedAt: run.completedAt || new Date().toISOString(),
    schemaVersion: 1,
  };
  saveRuns([...runs, entry]);
  return entry;
}

export function deleteAllLocalData() {
  localStorage.removeItem(PARTICIPANTS_KEY);
  localStorage.removeItem(RUNS_KEY);
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[;"\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function downloadCsv(filename, rows) {
  const body = rows.map((row) => row.map(csvEscape).join(";")).join("\r\n");
  const blob = new Blob(["\uFEFF", body], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportSummaryCsv() {
  const participants = loadParticipants();
  const participantMap = new Map(participants.map((item) => [item.id, item]));
  const runs = loadRuns();

  const rows = [[
    "teilnehmer_id",
    "name_oder_kuerzel",
    "klasse",
    "zeitpunkt",
    "parallelform",
    "lesebasis",
    "wort_satz",
    "textverstaendnis",
    "tiefes_textverstaendnis",
    "worterschliessung",
    "strategiewissen",
    "lesetempo_kontrollfragen",
    "woerter_pro_minute",
    "lesezeit_sekunden",
    "hauptempfehlung",
    "zweitempfehlung",
    "ich_weiss_es_nicht_anzahl"
  ]];

  for (const run of runs) {
    const participant = participantMap.get(run.participantId);
    rows.push([
      run.participantId,
      participant?.name || run.participantNameSnapshot || "",
      participant?.className || run.classNameSnapshot || "",
      run.completedAt,
      run.setId,
      run.scores?.reading_base ?? "",
      run.scores?.word_sentence ?? "",
      run.scores?.text_basic ?? "",
      run.scores?.text_deep ?? "",
      run.scores?.word_analysis ?? "",
      run.scores?.strategy ?? "",
      run.scores?.fluency_check ?? "",
      run.fluency?.wpm ?? "",
      run.fluency?.seconds ? Math.round(run.fluency.seconds * 10) / 10 : "",
      run.recommendation?.primary || "",
      run.recommendation?.secondary || "",
      Object.values(run.responses || {}).filter((value) => value === "unknown").length,
    ]);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(`lesediagnostik5-ergebnisse-${stamp}.csv`, rows);
}

export function exportItemCsv() {
  const participants = loadParticipants();
  const participantMap = new Map(participants.map((item) => [item.id, item]));
  const runs = loadRuns();

  const rows = [[
    "teilnehmer_id",
    "name_oder_kuerzel",
    "klasse",
    "zeitpunkt",
    "parallelform",
    "item_id",
    "antwort",
    "kompetenz",
    "auswertungsbereich",
    "richtig"
  ]];

  for (const run of runs) {
    const participant = participantMap.get(run.participantId);
    const itemResults = Array.isArray(run.itemResults)
      ? run.itemResults
      : Object.entries(run.responses || {}).map(([itemId, response]) => ({
          itemId,
          response,
          competency: "",
          scoreKey: "",
          correct: "",
        }));

    for (const item of itemResults) {
      rows.push([
        run.participantId,
        participant?.name || run.participantNameSnapshot || "",
        participant?.className || run.classNameSnapshot || "",
        run.completedAt,
        run.setId,
        item.itemId,
        item.response,
        item.competency || "",
        item.scoreKey || "",
        item.correct === true ? "1" : item.correct === false ? "0" : "",
      ]);
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(`lesediagnostik5-itemdaten-${stamp}.csv`, rows);
}
