const STORAGE_KEY = "japaneseSentencePwaWords";
const MARKS_KEY = "japaneseSentencePwaMarks";
const AI_SENTENCES_KEY = "japaneseSentencePwaAiSentences";
const GENERATION_OPTIONS_KEY = "japaneseSentencePwaGenerationOptions";
const APP_CONFIG = window.APP_CONFIG || {};

const state = {
  words: [],
  sentences: [],
  aiSentences: [],
  visibleSentences: [],
  marks: {},
  generationOptions: {
    jpStyle: "polite",
    krStyle: "polite",
    translationMode: "natural"
  },
  kanaMode: "hiragana",
  kanaIndex: 0,
  kanaShowAnswer: false,
  kanaList: [],
  wordStudyIndex: 0,
  wordStudyShowAnswer: false,
  wordStudyFilterMode: "all",
  wordStudySelectedDates: [],
  wordStudyShowAllDates: false,
  wordStudyStartDate: "",
  wordStudyEndDate: "",
  todayRevealed: false,
  currentIndex: 0,
  todayIndex: 0,
  showMeaning: false,
  showReading: false,
  deferredInstallPrompt: null,
  remoteSyncing: false,
  wordSaving: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  installBtn: $("#installBtn"),
  tabs: $$(".tab"),
  panels: {
    words: $("#wordsPanel"),
    wordStudy: $("#wordStudyPanel"),
    kana: $("#kanaPanel"),
    sentences: $("#sentencesPanel"),
    manage: $("#managePanel")
  },
  bulkDateInput: $("#bulkDateInput"),
  bulkInput: $("#bulkInput"),
  bulkAddBtn: $("#bulkAddBtn"),
  wordStudyPosition: $("#wordStudyPosition"),
  wordStudyJapanese: $("#wordStudyJapanese"),
  wordStudyMeaning: $("#wordStudyMeaning"),
  wordStudyReading: $("#wordStudyReading"),
  wordStudyAllFilterBtn: $("#wordStudyAllFilterBtn"),
  wordStudyDatesFilterBtn: $("#wordStudyDatesFilterBtn"),
  wordStudyRangeFilterBtn: $("#wordStudyRangeFilterBtn"),
  wordStudyDateOptions: $("#wordStudyDateOptions"),
  wordStudyToggleDatesBtn: $("#wordStudyToggleDatesBtn"),
  wordStudyRangeFields: $("#wordStudyRangeFields"),
  wordStudyStartDate: $("#wordStudyStartDate"),
  wordStudyEndDate: $("#wordStudyEndDate"),
  wordStudyFilterSummary: $("#wordStudyFilterSummary"),
  wordStudyDataStatus: $("#wordStudyDataStatus"),
  wordStudyListCount: $("#wordStudyListCount"),
  wordStudyList: $("#wordStudyList"),
  prevWordStudyBtn: $("#prevWordStudyBtn"),
  nextWordStudyBtn: $("#nextWordStudyBtn"),
  randomWordStudyBtn: $("#randomWordStudyBtn"),
  toggleWordStudyAnswerBtn: $("#toggleWordStudyAnswerBtn"),
  speakWordStudyBtn: $("#speakWordStudyBtn"),
  kanaProgress: $("#kanaProgress"),
  hiraganaModeBtn: $("#hiraganaModeBtn"),
  katakanaModeBtn: $("#katakanaModeBtn"),
  kanaCharacter: $("#kanaCharacter"),
  kanaRomaji: $("#kanaRomaji"),
  kanaKorean: $("#kanaKorean"),
  prevKanaBtn: $("#prevKanaBtn"),
  nextKanaBtn: $("#nextKanaBtn"),
  randomKanaBtn: $("#randomKanaBtn"),
  toggleKanaAnswerBtn: $("#toggleKanaAnswerBtn"),
  speakKanaBtn: $("#speakKanaBtn"),
  shuffleKanaBtn: $("#shuffleKanaBtn"),
  kanaGrid: $("#kanaGrid"),
  todaySentence: $("#todaySentence"),
  revealTodayBtn: $("#revealTodayBtn"),
  speakTodayBtn: $("#speakTodayBtn"),
  changeTodayBtn: $("#changeTodayBtn"),
  cardSentence: $("#cardSentence"),
  cardPosition: $("#cardPosition"),
  prevBtn: $("#prevBtn"),
  nextBtn: $("#nextBtn"),
  randomBtn: $("#randomBtn"),
  toggleMeaningBtn: $("#toggleMeaningBtn"),
  toggleReadingBtn: $("#toggleReadingBtn"),
  speakCardBtn: $("#speakCardBtn"),
  rateInput: $("#rateInput"),
  rateValue: $("#rateValue"),
  toggleSentenceOptionsBtn: $("#toggleSentenceOptionsBtn"),
  sentenceStyleOptions: $("#sentenceStyleOptions"),
  jpStyleSelect: $("#jpStyleSelect"),
  krStyleSelect: $("#krStyleSelect"),
  translationModeSelect: $("#translationModeSelect"),
  generateAiBtn: $("#generateAiBtn"),
  aiStatus: $("#aiStatus"),
  sentenceCount: $("#sentenceCount"),
  sentenceList: $("#sentenceList"),
  exportBtn: $("#exportBtn"),
  importInput: $("#importInput"),
  clearBtn: $("#clearBtn"),
  geminiApiKeyInput: $("#geminiApiKeyInput"),
  geminiKeyStatus: $("#geminiKeyStatus"),
  saveGeminiKeyBtn: $("#saveGeminiKeyBtn"),
  testGeminiKeyBtn: $("#testGeminiKeyBtn"),
  clearGeminiKeyBtn: $("#clearGeminiKeyBtn"),
  testAiConnectionBtn: $("#testAiConnectionBtn"),
  aiConnectionStatus: $("#aiConnectionStatus"),
  exportOutput: $("#exportOutput"),
  toast: $("#toast")
};

const KANA_ROWS = [
  ["あ", "ア", "a", "아"], ["い", "イ", "i", "이"], ["う", "ウ", "u", "우"], ["え", "エ", "e", "에"], ["お", "オ", "o", "오"],
  ["か", "カ", "ka", "카"], ["き", "キ", "ki", "키"], ["く", "ク", "ku", "쿠"], ["け", "ケ", "ke", "케"], ["こ", "コ", "ko", "코"],
  ["さ", "サ", "sa", "사"], ["し", "シ", "shi", "시"], ["す", "ス", "su", "스"], ["せ", "セ", "se", "세"], ["そ", "ソ", "so", "소"],
  ["た", "タ", "ta", "타"], ["ち", "チ", "chi", "치"], ["つ", "ツ", "tsu", "츠"], ["て", "テ", "te", "테"], ["と", "ト", "to", "토"],
  ["な", "ナ", "na", "나"], ["に", "ニ", "ni", "니"], ["ぬ", "ヌ", "nu", "누"], ["ね", "ネ", "ne", "네"], ["の", "ノ", "no", "노"],
  ["は", "ハ", "ha", "하"], ["ひ", "ヒ", "hi", "히"], ["ふ", "フ", "fu", "후"], ["へ", "ヘ", "he", "헤"], ["ほ", "ホ", "ho", "호"],
  ["ま", "マ", "ma", "마"], ["み", "ミ", "mi", "미"], ["む", "ム", "mu", "무"], ["め", "メ", "me", "메"], ["も", "モ", "mo", "모"],
  ["や", "ヤ", "ya", "야"], ["ゆ", "ユ", "yu", "유"], ["よ", "ヨ", "yo", "요"],
  ["ら", "ラ", "ra", "라"], ["り", "リ", "ri", "리"], ["る", "ル", "ru", "루"], ["れ", "レ", "re", "레"], ["ろ", "ロ", "ro", "로"],
  ["わ", "ワ", "wa", "와"], ["を", "ヲ", "wo", "오"], ["ん", "ン", "n", "응"]
];

function getKanaList(mode = state.kanaMode) {
  const charIndex = mode === "hiragana" ? 0 : 1;
  return KANA_ROWS.map((row) => ({
    char: row[charIndex],
    hiragana: row[0],
    katakana: row[1],
    romaji: row[2],
    korean: row[3]
  }));
}

async function init() {
  loadData();
  syncGenerationOptionInputs();
  setDefaultWordDateInputs();
  generateSentences();
  setKanaMode("hiragana");
  bindEvents();
  renderAll();
  registerServiceWorker();
  await loadWordsFromSupabase();
}

function loadData() {
  state.words = [];
  localStorage.removeItem(STORAGE_KEY);
  state.marks = readJson(MARKS_KEY, {});
  state.aiSentences = [];
  localStorage.removeItem(AI_SENTENCES_KEY);
  state.generationOptions = normalizeSentenceStyle(readJson(GENERATION_OPTIONS_KEY, state.generationOptions));
  elements.geminiApiKeyInput.value = getSupabaseDisplayUrl();
  setGeminiKeyStatus(getSupabaseStatusMessage());
  saveAiSentences();
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function saveWords() {
  localStorage.removeItem(STORAGE_KEY);
}

async function loadWordsFromSupabase() {
  if (!window.JapaneseService?.isRemoteReady() || state.remoteSyncing || state.wordSaving) return false;

  state.remoteSyncing = true;
  try {
    const wordRows = await window.JapaneseService.listWords();
    const remoteWords = deduplicateWords(wordRows
      .map(cleanStoredWord)
      .filter(Boolean));
    const missingStudyDateCount = remoteWords.filter((word) => !word.studyDate).length;
    let sentenceWarning = "";

    try {
      const sentenceRows = await window.JapaneseService.listSentences();
      state.aiSentences = sentenceRows
        .map((sentence) => cleanStoredSentence({ ...sentence, category: "AI" }))
        .filter((sentence) => sentence.jp && sentence.reading && sentence.meaning);
    } catch (error) {
      state.aiSentences = [];
      sentenceWarning = ` · 문장 조회 실패 (${shortenMessage(error.message)})`;
    }

    state.words = remoteWords;
    saveWords();
    saveAiSentences();
    generateSentences();
    renderAll();
    setGeminiKeyStatus(
      `Supabase 조회 성공 · DB 단어 ${remoteWords.length}개 · DB 문장 ${state.aiSentences.length}개`
      + `${missingStudyDateCount ? ` · study_date 없는 단어 ${missingStudyDateCount}개` : ""}${sentenceWarning}`
    );
    elements.wordStudyDataStatus.textContent = missingStudyDateCount
      ? `DB 단어 ${remoteWords.length}개 조회 · study_date 없는 단어 ${missingStudyDateCount}개`
      : `DB 단어 ${remoteWords.length}개를 불러왔습니다.`;
    return true;
  } catch (error) {
    state.words = state.words.filter((word) => word.syncStatus === "synced");
    state.aiSentences = [];
    generateSentences();
    renderAll();
    setGeminiKeyStatus(`Supabase 조회 실패 · DB 데이터를 불러오지 못했습니다. (${shortenMessage(error.message)})`);
    elements.wordStudyDataStatus.textContent = `DB 조회 실패: ${shortenMessage(error.message)}`;
    return false;
  } finally {
    state.remoteSyncing = false;
  }
}

async function syncWordToSupabase(word, options = {}) {
  if (!window.JapaneseService?.isRemoteReady() || !navigator.onLine) {
    state.words = state.words.filter((item) => item.syncStatus === "synced");
    saveWords();
    generateSentences();
    renderAll();
    if (!options.silent) showToast("Supabase에 연결되지 않아 단어를 저장하지 못했습니다.");
    return false;
  }

  try {
    const remoteWord = await window.JapaneseService.saveWord(word);
    const syncedWord = cleanStoredWord({ ...remoteWord, syncStatus: "synced" });
    const index = state.words.findIndex((item) => isSameWord(item, word));
    if (index >= 0) state.words[index] = syncedWord;
    saveWords();
    renderWordStudyFilters();
    if (!options.silent) showToast("로컬 및 Supabase 저장 완료");
    return true;
  } catch (error) {
    state.words = state.words.filter((item) => item.syncStatus === "synced");
    saveWords();
    generateSentences();
    renderAll();
    if (!options.silent) {
      showToast(`Supabase 저장 실패 · 단어를 반영하지 않았습니다. (${shortenMessage(error.message)})`);
    }
    return false;
  }
}

async function syncPendingWords() {
  const pendingWords = state.words
    .filter((word) => word.syncStatus !== "synced")
    .map((word) => ({ ...word }));
  if (pendingWords.length === 0) return { saved: 0, failed: 0 };

  while (state.remoteSyncing) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!navigator.onLine) {
    state.words = state.words.filter((word) => word.syncStatus === "synced");
    generateSentences();
    renderAll();
    showToast("오프라인에서는 단어를 저장할 수 없습니다.");
    return { saved: 0, failed: pendingWords.length };
  }

  state.wordSaving = true;
  elements.bulkAddBtn.disabled = true;
  let saved = 0;
  let failed = 0;
  let firstError = "";

  try {
    const batchSize = 6;
    for (let index = 0; index < pendingWords.length; index += batchSize) {
      const batch = pendingWords.slice(index, index + batchSize);
      const results = await Promise.allSettled(
        batch.map((word) => window.JapaneseService.saveWord(word))
      );

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          saved += 1;
          const syncedWord = cleanStoredWord({ ...result.value, syncStatus: "synced" });
          const stateIndex = state.words.findIndex((word) => isSameWord(word, syncedWord));
          if (stateIndex >= 0) state.words[stateIndex] = syncedWord;
          else state.words.push(syncedWord);
        } else {
          failed += 1;
          firstError ||= shortenMessage(result.reason?.message);
        }
      });
      elements.bulkAddBtn.textContent = `DB 저장 중 ${Math.min(index + batch.length, pendingWords.length)} / ${pendingWords.length}`;
    }
  } finally {
    state.wordSaving = false;
    elements.bulkAddBtn.disabled = false;
    elements.bulkAddBtn.textContent = "여러 단어 저장";
  }

  generateSentences();
  renderAll();
  const refreshed = await loadWordsFromSupabase();
  if (failed > 0) {
    showToast(`DB 저장 ${saved}개 성공 · ${failed}개 실패${firstError ? ` (${firstError})` : ""}`);
  } else if (!refreshed) {
    showToast(`DB 저장 ${saved}개 성공 · 재조회는 잠시 후 다시 시도해 주세요.`);
  } else {
    showToast(`Supabase DB에 ${saved}개 단어를 저장했습니다.`);
  }
  return { saved, failed };
}

function saveMarks() {
  localStorage.setItem(MARKS_KEY, JSON.stringify(state.marks));
}

function saveAiSentences() {
  localStorage.removeItem(AI_SENTENCES_KEY);
}

function saveGenerationOptions() {
  localStorage.setItem(GENERATION_OPTIONS_KEY, JSON.stringify(state.generationOptions));
}

function setDefaultWordDateInputs() {
  const today = todayDateKey();
  elements.bulkDateInput.value = elements.bulkDateInput.value || today;
}

function bindEvents() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  elements.bulkAddBtn.addEventListener("click", addBulkWords);
  elements.prevWordStudyBtn.addEventListener("click", () => moveWordStudy(-1));
  elements.nextWordStudyBtn.addEventListener("click", () => moveWordStudy(1));
  elements.randomWordStudyBtn.addEventListener("click", showRandomWordStudy);
  elements.toggleWordStudyAnswerBtn.addEventListener("click", toggleWordStudyAnswer);
  elements.speakWordStudyBtn.addEventListener("click", () => speakText(getCurrentWordStudy()?.jp));
  elements.wordStudyAllFilterBtn.addEventListener("click", () => setWordStudyFilterMode("all"));
  elements.wordStudyDatesFilterBtn.addEventListener("click", () => setWordStudyFilterMode("dates"));
  elements.wordStudyRangeFilterBtn.addEventListener("click", () => setWordStudyFilterMode("range"));
  elements.wordStudyDateOptions.addEventListener("change", updateWordStudySelectedDates);
  elements.wordStudyToggleDatesBtn.addEventListener("click", toggleWordStudyDateList);
  elements.wordStudyStartDate.addEventListener("change", updateWordStudyDateRange);
  elements.wordStudyEndDate.addEventListener("change", updateWordStudyDateRange);
  elements.hiraganaModeBtn.addEventListener("click", () => setKanaMode("hiragana"));
  elements.katakanaModeBtn.addEventListener("click", () => setKanaMode("katakana"));
  elements.prevKanaBtn.addEventListener("click", () => moveKana(-1));
  elements.nextKanaBtn.addEventListener("click", () => moveKana(1));
  elements.randomKanaBtn.addEventListener("click", showRandomKana);
  elements.toggleKanaAnswerBtn.addEventListener("click", toggleKanaAnswer);
  elements.speakKanaBtn.addEventListener("click", () => speakText(getCurrentKana().char));
  elements.shuffleKanaBtn.addEventListener("click", shuffleKanaGrid);
  elements.prevBtn.addEventListener("click", () => moveCard(-1));
  elements.nextBtn.addEventListener("click", () => moveCard(1));
  elements.randomBtn.addEventListener("click", showRandomCard);
  elements.changeTodayBtn.addEventListener("click", changeTodaySentence);
  elements.revealTodayBtn.addEventListener("click", toggleTodayReveal);
  elements.speakTodayBtn.addEventListener("click", () => speakSentence(getTodaySentence()));
  elements.speakCardBtn.addEventListener("click", () => speakSentence(getCurrentSentence()));
  elements.toggleMeaningBtn.addEventListener("click", toggleMeaning);
  elements.toggleReadingBtn.addEventListener("click", toggleReading);
  elements.rateInput.addEventListener("input", updateRateLabel);
  elements.toggleSentenceOptionsBtn.addEventListener("click", toggleSentenceOptions);
  elements.jpStyleSelect.addEventListener("change", updateGenerationOptions);
  elements.krStyleSelect.addEventListener("change", updateGenerationOptions);
  elements.translationModeSelect.addEventListener("change", updateGenerationOptions);
  elements.generateAiBtn.addEventListener("click", generateSentencesWithAi);
  elements.exportBtn.addEventListener("click", exportJson);
  elements.importInput.addEventListener("change", importJson);
  elements.clearBtn.addEventListener("click", resetLocalCache);
  elements.geminiApiKeyInput.addEventListener("input", handleGeminiKeyInput);
  elements.saveGeminiKeyBtn.addEventListener("click", saveGeminiApiKey);
  elements.testGeminiKeyBtn.addEventListener("click", testGeminiApiKey);
  elements.clearGeminiKeyBtn.addEventListener("click", clearGeminiApiKey);
  elements.testAiConnectionBtn.addEventListener("click", testAiConnection);
  elements.installBtn.addEventListener("click", installPwa);
  window.addEventListener("online", syncPendingWords);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    elements.installBtn.classList.remove("hidden");
  });
}

function switchTab(tabName) {
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  Object.entries(elements.panels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });
}

const VALID_POS = [
  "noun", "proper_noun", "pronoun", "demonstrative_prenominal", "demonstrative_pronoun",
  "interrogative", "numeral", "counter", "i_adjective", "na_adjective", "verb",
  "auxiliary", "adverb", "particle", "conjunction", "interjection", "prefix", "suffix",
  "fixed_expression", "sentence_pattern"
];

const SEMANTIC_TAG_ORDER = [
  "person", "human", "relationship", "family", "occupation", "work",
  "country", "city", "place", "facility", "object", "abstract",
  "language", "study", "activity", "hobby", "travel", "sport", "art", "game",
  "food", "drink", "alcohol", "nature", "animal", "weather",
  "time", "date", "weekday", "season", "month",
  "number", "quantity", "emotion", "preference", "ability", "personality",
  "state", "appearance", "evaluation", "distance", "difficulty", "size",
  "space", "weight", "height", "price", "light", "length", "sound",
  "speed", "taste", "color", "movement", "action", "eating", "drinking",
  "seeing", "speaking", "existence", "animate", "inanimate", "degree",
  "frequency", "reason", "contrast", "response", "question", "grammar",
  "greeting", "communication", "clothing", "understanding"
];

const DICTIONARY_FORM_NORMALIZATIONS = {
  "すきです": { jp: "すきだ", reading: "스키다", pos: "na_adjective", semanticTags: "emotion,preference" },
  "だいすきです": { jp: "だいすきだ", reading: "다이스키다", pos: "na_adjective", semanticTags: "emotion,preference" },
  "きらいです": { jp: "きらいだ", reading: "키라이다", pos: "na_adjective", semanticTags: "emotion,preference" },
  "じょうずです": { jp: "じょうずだ", reading: "죠우즈다", pos: "na_adjective", semanticTags: "ability,evaluation" },
  "へたです": { jp: "へただ", reading: "헤타다", pos: "na_adjective", semanticTags: "ability,evaluation" },
  "しんせつです": { jp: "しんせつだ", reading: "신세츠다", pos: "na_adjective", semanticTags: "personality" },
  "まじめです": { jp: "まじめだ", reading: "마지메다", pos: "na_adjective", semanticTags: "personality" },
  "べんりです": { jp: "べんりだ", reading: "벤리다", pos: "na_adjective", semanticTags: "state,evaluation" },
  "ふべんです": { jp: "ふべんだ", reading: "후벤다", pos: "na_adjective", semanticTags: "state,evaluation" },
  "しずかです": { jp: "しずかだ", reading: "시즈카다", pos: "na_adjective", semanticTags: "state" },
  "げんきです": { jp: "げんきだ", reading: "겐키다", pos: "na_adjective", semanticTags: "state,human" },
  "ゆうめいです": { jp: "ゆうめいだ", reading: "유우메이다", pos: "na_adjective", semanticTags: "evaluation" },
  "かんたんです": { jp: "かんたんだ", reading: "칸탄다", pos: "na_adjective", semanticTags: "evaluation" },
  "わかりました": { jp: "わかる", reading: "와카루", pos: "verb", semanticTags: "understanding,response" },
  "やってみます": { jp: "やる", reading: "야루", pos: "verb", semanticTags: "action" }
};

const GENERATION_EXCLUDED_POS = new Set([
  "particle", "auxiliary", "conjunction", "interjection", "prefix", "suffix",
  "fixed_expression", "sentence_pattern"
]);

const LEGACY_CATEGORY_RULES = {
  인칭대명사: { pos: "pronoun", tags: ["person", "human"] },
  지시형용사: { pos: "demonstrative_prenominal", tags: [] },
  지시장소: { pos: "demonstrative_pronoun", tags: ["place"] },
  지시대명사: { pos: "demonstrative_pronoun", tags: ["object"] },
  사람: { pos: "noun", tags: ["person", "human"] },
  국적: { pos: "noun", tags: ["person", "human", "country"] },
  직업: { pos: "noun", tags: ["person", "human", "occupation"] },
  가족: { pos: "noun", tags: ["person", "human", "family"] },
  친구관계: { pos: "noun", tags: ["person", "human", "relationship"] },
  언어: { pos: "noun", tags: ["language", "study"] },
  국가: { pos: "proper_noun", tags: ["country", "place"] },
  도시: { pos: "proper_noun", tags: ["city", "place"] },
  장소: { pos: "noun", tags: ["place"] },
  시설: { pos: "noun", tags: ["facility", "place"] },
  시간: { pos: "noun", tags: ["time"] },
  요일: { pos: "noun", tags: ["weekday", "time"] },
  월: { pos: "noun", tags: ["month", "time"] },
  날짜: { pos: "noun", tags: ["date", "time"] },
  계절: { pos: "noun", tags: ["season", "time"] },
  인원: { pos: "counter", tags: ["quantity", "person"] },
  숫자: { pos: "numeral", tags: ["number"] },
  수량: { pos: "counter", tags: ["quantity"] },
  횟수: { pos: "counter", tags: ["quantity"] },
  취미: { pos: "noun", tags: ["activity", "hobby"] },
  운동: { pos: "noun", tags: ["activity", "sport"] },
  예술: { pos: "noun", tags: ["activity", "art"] },
  게임: { pos: "noun", tags: ["activity", "game"] },
  음식: { pos: "noun", tags: ["food", "object"] },
  음료: { pos: "noun", tags: ["drink", "object"] },
  술: { pos: "noun", tags: ["drink", "alcohol", "object"] },
  자연: { pos: "noun", tags: ["nature", "object"] },
  동물: { pos: "noun", tags: ["animal"] },
  날씨: { pos: "noun", tags: ["weather"] },
  감정형용사: { pos: "na_adjective", tags: ["emotion"] },
  능력형용사: { pos: "na_adjective", tags: ["ability"] },
  성격형용사: { pos: "na_adjective", tags: ["personality"] },
  상태형용사: { pos: "na_adjective", tags: ["state"] },
  외모형용사: { pos: "na_adjective", tags: ["appearance"] },
  평가형용사: { pos: "na_adjective", tags: ["evaluation"] },
  사람상태: { pos: "na_adjective", tags: ["person", "state"] },
  이동동사: { pos: "verb", tags: ["movement"] },
  행동동사: { pos: "verb", tags: ["action"] },
  학습동사: { pos: "verb", tags: ["study"] },
  업무동사: { pos: "verb", tags: ["work"] },
  먹기동사: { pos: "verb", tags: ["eating"] },
  보기동사: { pos: "verb", tags: ["seeing"] },
  말하기동사: { pos: "verb", tags: ["speaking"] },
  존재동사: { pos: "verb", tags: ["existence"] },
  정도부사: { pos: "adverb", tags: ["degree"] },
  빈도부사: { pos: "adverb", tags: ["frequency"] },
  시간부사: { pos: "adverb", tags: ["time"] },
  좋아함표현: { pos: "na_adjective", tags: ["emotion", "preference"] },
  대답표현: { pos: "interjection", tags: ["answer"] },
  설명연결표현: { pos: "conjunction", tags: ["reason"] },
  의문사: { pos: "interrogative", tags: ["question"] },
  조사: { pos: "particle", tags: ["particle"] },
  긍정문: { pos: "sentence_pattern", tags: ["positive"] },
  부정문: { pos: "sentence_pattern", tags: ["negative"] },
  과거문: { pos: "sentence_pattern", tags: ["past"] },
  희망문: { pos: "sentence_pattern", tags: ["wish"] },
  가능문: { pos: "sentence_pattern", tags: ["ability"] },
  존재문: { pos: "sentence_pattern", tags: ["existence"] }
};

const PARTICLE_READING = {
  "は": "와",
  "が": "가",
  "を": "오",
  "に": "니",
  "へ": "에",
  "で": "데",
  "の": "노",
  "と": "토",
  "から": "카라",
  "まで": "마데",
  "けど": "케도"
};

const PRONOUN_TRANSLATIONS = {
  "わたし": { polite: "저", plain: "나" },
  "あなた": { polite: "당신", plain: "너" },
  "かれ": { polite: "그", plain: "그" },
  "かのじょ": { polite: "그녀", plain: "그녀" }
};

const TRANSLATION_OVERRIDES = {
  "すきだ": { dictionary: "좋다, 좋아하다", natural: "좋아하다", polite: "좋아합니다", plain: "좋아해" },
  "すきです": { dictionary: "좋다, 좋아하다", natural: "좋아하다", polite: "좋아합니다", plain: "좋아해" },
  "だいすきだ": { dictionary: "매우 좋다, 매우 좋아하다", natural: "매우 좋아하다", polite: "매우 좋아합니다", plain: "매우 좋아해" },
  "だいすきです": { dictionary: "매우 좋다, 매우 좋아하다", natural: "매우 좋아하다", polite: "매우 좋아합니다", plain: "매우 좋아해" },
  "きらいだ": { dictionary: "싫다", natural: "싫어하다", polite: "싫어합니다", plain: "싫어해" },
  "きらいです": { dictionary: "싫다", natural: "싫어하다", polite: "싫어합니다", plain: "싫어해" },
  "だいきらいだ": { dictionary: "매우 싫다", natural: "매우 싫어하다", polite: "매우 싫어합니다", plain: "매우 싫어해" },
  "じょうずだ": { dictionary: "능숙하다", natural: "잘하다", polite: "잘합니다", plain: "잘해" },
  "じょうずです": { dictionary: "능숙하다", natural: "잘하다", polite: "잘합니다", plain: "잘해" },
  "へただ": { dictionary: "서투르다", natural: "잘 못하다", polite: "잘 못합니다", plain: "잘 못해" },
  "へたです": { dictionary: "서투르다", natural: "잘 못하다", polite: "잘 못합니다", plain: "잘 못해" },
  "たかい": { dictionary: "높다, 비싸다", natural: "비싸다", polite: "비쌉니다", plain: "비싸" },
  "とおい": { dictionary: "멀다", natural: "멀다", polite: "멉니다", plain: "멀어" },
  "おいしい": { dictionary: "맛있다", natural: "맛있다", polite: "맛있습니다", plain: "맛있어" },
  "おもしろい": { dictionary: "재미있다", natural: "재미있다", polite: "재미있습니다", plain: "재미있어" },
  "むずかしい": { dictionary: "어렵다", natural: "어렵다", polite: "어렵습니다", plain: "어려워" },
  "いそがしい": { dictionary: "바쁘다", natural: "바쁘다", polite: "바쁩니다", plain: "바빠" },
  "おおい": { dictionary: "많다", natural: "많다", polite: "많습니다", plain: "많아" },
  "すくない": { dictionary: "적다", natural: "적다", polite: "적습니다", plain: "적어" },
  "かんたんだ": { dictionary: "간단하다", natural: "간단하다", polite: "간단합니다", plain: "간단해" },
  "かんたんです": { dictionary: "간단하다", natural: "간단하다", polite: "간단합니다", plain: "간단해" },
  "しんせつだ": { dictionary: "친절하다", natural: "친절하다", polite: "친절합니다", plain: "친절해" },
  "しんせつです": { dictionary: "친절하다", natural: "친절하다", polite: "친절합니다", plain: "친절해" },
  "ゆうめいだ": { dictionary: "유명하다", natural: "유명하다", polite: "유명합니다", plain: "유명해" },
  "ゆうめいです": { dictionary: "유명하다", natural: "유명하다", polite: "유명합니다", plain: "유명해" },
  "たいへんだ": { dictionary: "힘들다, 큰일이다", natural: "힘들다", polite: "힘듭니다", plain: "힘들어" },
  "たいへんです": { dictionary: "힘들다, 큰일이다", natural: "힘들다", polite: "힘듭니다", plain: "힘들어" }
};

async function addWord(rawWord) {
  if (cleanInputPart(rawWord.pos) && !normalizePos(cleanInputPart(rawWord.pos))) {
    showToast("허용된 pos만 입력해 주세요.");
    return;
  }
  const word = normalizeWord(rawWord);
  if (!word) {
    showToast("일본어, 발음, 뜻, pos, semanticTags를 입력해 주세요.");
    return;
  }

  const result = upsertWord(word, state.words.length);
  afterWordsChanged(result === "updated" ? "기존 단어에 뜻과 태그를 병합했습니다." : "단어를 저장했습니다.");
  const savedWord = state.words.find((item) => isSameWord(item, word));
  if (savedWord) await syncWordToSupabase(savedWord);
}

function normalizeWord(rawWord) {
  const baseWord = normalizeDictionaryForm(normalizeWordFields({
    ...rawWord,
    jp: normalizeJapaneseText(rawWord.jp),
    reading: normalizeKoreanReading(cleanInputPart(rawWord.reading)),
    meaning: normalizeMeaningText(cleanInputPart(rawWord.meaning)),
    legacyCategory: cleanInputPart(rawWord.legacyCategory || rawWord.category)
  }));
  if (cleanInputPart(rawWord.pos) && !normalizePos(cleanInputPart(rawWord.pos))) return null;
  if (!baseWord.jp || !baseWord.reading || !baseWord.meaning) return null;
  return migrateWord(baseWord);
}

function cleanInputPart(value) {
  return String(value || "").trim().replace(/^[\/|,，、\s]+/, "").trim();
}

function normalizeMeaningText(value) {
  return mergeCommaValues(String(value || "").replace(/[\/／|｜]+/g, ","));
}

function normalizeKoreanReading(value) {
  return String(value || "")
    .trim()
    .replace(/[＋+]/g, "")
    .replace(/([가-힣])[-ー－]+/g, (_, syllable) => `${syllable}${longVowelForHangul(syllable)}`)
    .replace(/\s+/g, " ");
}

function longVowelForHangul(syllable) {
  const code = syllable.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return "";
  const vowelIndex = Math.floor((code % 588) / 28);
  const vowelMap = {
    0: "아",
    1: "애",
    2: "아",
    3: "얘",
    4: "어",
    5: "에",
    6: "어",
    7: "예",
    8: "오",
    9: "아",
    10: "왜",
    11: "외",
    12: "오",
    13: "우",
    14: "웨",
    15: "위",
    16: "이",
    17: "우",
    18: "으",
    19: "이",
    20: "이"
  };
  if ([1, 3, 5, 7].includes(vowelIndex)) return "이";
  return vowelMap[vowelIndex] || "";
}

function normalizeWordFields(word) {
  const fixed = { ...word };
  const original = {
    jp: fixed.jp,
    reading: fixed.reading,
    meaning: fixed.meaning
  };
  const fields = [["jp", original.jp], ["reading", original.reading], ["meaning", original.meaning]];
  const japaneseField = fields.find(([, value]) => containsJapanese(value));

  if (japaneseField?.[0] === "meaning") {
    fixed.jp = original.meaning;
    fixed.reading = original.jp;
    fixed.meaning = original.reading;
  } else if (japaneseField?.[0] === "reading") {
    fixed.jp = original.reading;
    fixed.reading = original.meaning;
    fixed.meaning = original.jp;
  }

  if (containsJapanese(fixed.reading) && !containsJapanese(fixed.meaning)) {
    const oldReading = fixed.reading;
    fixed.reading = fixed.meaning;
    fixed.meaning = oldReading;
  }

  return fixed;
}

function containsJapanese(value) {
  return /[\u3040-\u30ff\u3400-\u9fff々ー]/.test(String(value || ""));
}

function dateKeyFromValue(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return todayDateKey();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayDateKey() {
  return dateKeyFromValue(new Date());
}

function cleanStoredWord(word) {
  const normalized = normalizeDictionaryForm(normalizeWordFields({
    ...word,
    jp: cleanInputPart(word.jp),
    reading: normalizeKoreanReading(cleanInputPart(word.reading)),
    meaning: normalizeMeaningText(cleanInputPart(word.meaning)),
    legacyCategory: cleanInputPart(word.legacyCategory || word.category)
  }));
  if (cleanInputPart(word.pos) && !normalizePos(cleanInputPart(word.pos))) return null;
  return migrateWord(normalized);
}

function normalizeDictionaryForm(word) {
  if (normalizePos(word.pos) === "fixed_expression") return word;
  const normalized = DICTIONARY_FORM_NORMALIZATIONS[cleanInputPart(word.jp)];
  if (!normalized) return word;

  return {
    ...word,
    jp: normalized.jp,
    reading: normalized.reading || word.reading,
    pos: normalizePos(word.pos) || normalized.pos,
    semanticTags: normalizeTags(word.semanticTags).length ? word.semanticTags : normalized.semanticTags
  };
}

function cleanStoredSentence(sentence) {
  const style = normalizeSentenceStyle(sentence.style);
  const literalMeaning = cleanInputPart(sentence.literalMeaning || sentence.meaning);
  const naturalMeaning = cleanInputPart(sentence.naturalMeaning || sentence.meaning);
  return {
    ...sentence,
    jp: cleanInputPart(sentence.jp),
    reading: cleanInputPart(sentence.reading),
    meaning: cleanInputPart(style.translationMode === "literal" ? literalMeaning : naturalMeaning),
    literalMeaning,
    naturalMeaning,
    style
  };
}

function migrateWord(word) {
  const legacyCategory = cleanInputPart(word.legacyCategory || word.category || "미분류");
  const requestedDate = normalizeStudyDateKey(word.studyDate);
  const createdAt = cleanInputPart(word.createdAt) || (requestedDate ? `${requestedDate}T00:00:00.000` : new Date().toISOString());
  const createdDate = requestedDate || dateKeyFromValue(createdAt);
  const inferred = inferWordMetadata({ ...word, legacyCategory });
  const pos = normalizePos(word.pos) || inferred.pos;
  const semanticTags = normalizeTags(word.semanticTags).length
    ? normalizeTags(word.semanticTags)
    : inferred.semanticTags;
  const inferredGrammar = inferGrammar({ ...word, pos, semanticTags });
  const grammar = {
    ...inferredGrammar,
    ...(word.grammar && typeof word.grammar === "object" ? word.grammar : {})
  };
  const generation = normalizeGeneration(word.generation, pos, semanticTags);
  const translation = normalizeTranslation(word.translation, word);

  return {
    id: word.id,
    jp: cleanInputPart(word.jp),
    reading: cleanInputPart(word.reading),
    meaning: cleanInputPart(word.meaning),
    createdAt,
    studyDate: requestedDate,
    createdDate,
    translation,
    pos,
    semanticTags,
    grammar,
    generation,
    legacyCategory,
    category: legacyCategory,
    syncStatus: word.syncStatus || "pending"
  };
}

function normalizeTranslation(rawTranslation, word) {
  const override = TRANSLATION_OVERRIDES[cleanInputPart(word.jp)];
  const base = {
    dictionary: cleanInputPart(word.meaning),
    natural: cleanInputPart(word.meaning),
    polite: politeKoreanPredicate(cleanInputPart(word.meaning)),
    plain: plainKoreanPredicate(cleanInputPart(word.meaning))
  };
  return {
    ...base,
    ...(override || {}),
    ...(rawTranslation && typeof rawTranslation === "object" ? rawTranslation : {})
  };
}

function normalizeSentenceStyle(style = {}) {
  return {
    jpStyle: ["polite", "plain"].includes(style.jpStyle) ? style.jpStyle : "polite",
    krStyle: ["polite", "plain"].includes(style.krStyle) ? style.krStyle : "polite",
    translationMode: ["literal", "natural"].includes(style.translationMode) ? style.translationMode : "natural"
  };
}

function politeKoreanPredicate(text) {
  const value = cleanInputPart(text);
  if (!value) return "";
  if (/(합니다|합니다\.|입니다|입니다\.|습니다|습니다\.)$/.test(value)) return value.replace(/\.$/, "");
  if (value.endsWith("하다")) return `${value.slice(0, -2)}합니다`;
  if (value.endsWith("다")) return `${value.slice(0, -1)}습니다`;
  return `${value}입니다`;
}

function plainKoreanPredicate(text) {
  const value = cleanInputPart(text);
  if (!value) return "";
  if (value.endsWith("하다")) return `${value.slice(0, -2)}해`;
  if (value.endsWith("다")) return value.slice(0, -1);
  return value;
}

function inferWordMetadata(word) {
  const legacyRule = LEGACY_CATEGORY_RULES[word.legacyCategory] || {};
  const meaning = cleanInputPart(word.meaning);
  const jp = cleanInputPart(word.jp);
  const tags = [...(legacyRule.tags || [])];
  let pos = legacyRule.pos || "noun";

  if (/い$/.test(jp) && !/(きれい|ゆうめい)$/.test(jp) && /다$/.test(meaning)) pos = "i_adjective";
  if (/だ$/.test(jp) || /(하다|좋아하다|싫어하다|잘하다|서투르다)$/.test(meaning)) pos = pos === "noun" ? "na_adjective" : pos;
  if (/(ます|る|う|く|ぐ|す|つ|ぬ|ぶ|む)$/.test(jp) && /(가다|오다|먹다|마시다|보다|말하다|공부하다|일하다|있다|없다)$/.test(meaning)) pos = "verb";
  if (["の", "は", "が", "を", "と", "だけ", "に", "へ", "で", "から", "まで"].includes(jp)) pos = "particle";
  if (jp === "けど" || (jp === "から" && /(때문|이유)/.test(meaning))) pos = "conjunction";
  if (["はい", "いいえ"].includes(jp)) pos = "interjection";
  if (["だれ", "どこ", "なに", "なん", "どれ", "どの", "いつ", "なんで"].includes(jp)) pos = "interrogative";
  if (["この", "その", "あの", "どの"].includes(jp)) pos = "demonstrative_prenominal";
  if (["これ", "それ", "あれ", "どれ", "ここ", "そこ", "あそこ", "どこ"].includes(jp)) pos = "demonstrative_pronoun";
  if (["わたし", "あなた", "かれ", "かのじょ"].includes(jp)) pos = "pronoun";

  addTagByMeaning(tags, meaning);
  return {
    pos,
    semanticTags: uniqueStrings(tags.length ? tags : ["object"]),
    grammar: inferGrammar({ ...word, pos, semanticTags: tags })
  };
}

function addTagByMeaning(tags, meaning) {
  const tagRules = [
    [["나", "당신", "그", "그녀", "사람", "친구", "한국인", "일본인", "회사원", "학생"], ["person", "human"]],
    [["카페", "화장실", "학교", "회사", "집"], ["place", "facility"]],
    [["일본어", "한국어"], ["language", "study"]],
    [["여행"], ["activity", "hobby", "travel"]],
    [["요리"], ["activity", "hobby", "food"]],
    [["커피"], ["drink", "object"]],
    [["맥주", "소주"], ["drink", "alcohol", "object"]],
    [["오늘", "어제", "지금"], ["time"]],
    [["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"], ["weekday", "time"]],
    [["좋다", "편리하다", "불편하다", "조용하다", "건강하다", "한가하다", "신선하다"], ["state"]],
    [["친절하다", "성실하다"], ["personality"]],
    [["예쁘다"], ["appearance"]],
    [["유명하다", "번화하다", "간단하다", "훌륭하다"], ["evaluation"]],
    [["좋아하다", "싫어하다"], ["emotion", "preference"]],
    [["잘하다", "서투르다"], ["ability"]]
  ];

  tagRules.forEach(([meanings, nextTags]) => {
    if (meanings.includes(meaning)) tags.push(...nextTags);
  });
}

function inferGrammar(word) {
  const tags = normalizeTags(word.semanticTags);
  if (["noun", "proper_noun", "pronoun", "demonstrative_pronoun", "numeral", "counter"].includes(word.pos)) {
    return {
      animate: hasAnyTag(tags, ["person", "human", "animal"]),
      human: hasAnyTag(tags, ["person", "human"]),
      locative: hasAnyTag(tags, ["place", "facility", "city", "country"]),
      countable: hasAnyTag(tags, ["number", "quantity", "person", "object", "food", "drink"]),
      proper: word.pos === "proper_noun"
    };
  }

  if (["i_adjective", "na_adjective"].includes(word.pos)) {
    return {
      adjectiveClass: word.pos === "i_adjective" ? "i" : "na",
      applicableTags: inferApplicableTags(word),
      requiredParticle: hasAnyTag(tags, ["emotion", "ability", "preference"]) ? "が" : null
    };
  }

  if (word.pos === "verb") {
    return {
      verbClass: "unknown",
      transitivity: hasAnyTag(tags, ["eating", "drinking", "study", "seeing", "speaking"]) ? "transitive" : "both",
      caseFrame: inferCaseFrame(tags)
    };
  }

  if (word.pos === "adverb") {
    return {
      modifies: ["verb", "i_adjective", "na_adjective", "sentence"],
      polarity: "both"
    };
  }

  return {};
}

function inferApplicableTags(word) {
  const tags = normalizeTags(word.semanticTags);
  if (hasAnyTag(tags, ["ability"])) return ["activity", "language", "sport", "art", "game", "study"];
  if (hasAnyTag(tags, ["personality", "appearance"])) return ["person", "human"];
  if (hasAnyTag(tags, ["evaluation", "state"])) return ["place", "facility", "object", "activity", "food", "drink", "person"];
  if (hasAnyTag(tags, ["emotion", "preference"])) return ["object", "food", "drink", "activity", "language", "person"];
  return [];
}

function inferCaseFrame(tags) {
  if (hasAnyTag(tags, ["movement"])) return [{ role: "destination", particle: "に", allowedTags: ["place", "facility", "city", "country"] }];
  if (hasAnyTag(tags, ["eating"])) return [{ role: "object", particle: "を", allowedTags: ["food"] }];
  if (hasAnyTag(tags, ["drink"])) return [{ role: "object", particle: "を", allowedTags: ["drink", "alcohol"] }];
  if (hasAnyTag(tags, ["study"])) return [{ role: "object", particle: "を", allowedTags: ["language", "study"] }];
  return [];
}

function normalizeGeneration(rawGeneration, pos, semanticTags) {
  const enabled = rawGeneration?.enabled ?? !GENERATION_EXCLUDED_POS.has(pos);
  return {
    enabled,
    fixedOnly: rawGeneration?.fixedOnly ?? pos === "fixed_expression",
    roles: Array.isArray(rawGeneration?.roles) ? rawGeneration.roles : inferGenerationRoles(pos, semanticTags)
  };
}

function inferGenerationRoles(pos, semanticTags) {
  if (["noun", "proper_noun", "pronoun", "demonstrative_pronoun", "numeral", "counter"].includes(pos)) return ["subject", "object"];
  if (["i_adjective", "na_adjective", "verb"].includes(pos)) return ["predicate"];
  if (["adverb", "demonstrative_prenominal"].includes(pos)) return ["modifier"];
  return [];
}

function normalizePos(pos) {
  return VALID_POS.includes(pos) ? pos : "";
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return sortSemanticTags(uniqueStrings(tags.map(cleanInputPart).filter(Boolean)));
  if (typeof tags === "string") return sortSemanticTags(uniqueStrings(tags.split(",").map(cleanInputPart).filter(Boolean)));
  return [];
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function sortSemanticTags(tags) {
  return [...tags].sort((first, second) => {
    const firstIndex = SEMANTIC_TAG_ORDER.indexOf(first);
    const secondIndex = SEMANTIC_TAG_ORDER.indexOf(second);
    if (firstIndex >= 0 && secondIndex >= 0) return firstIndex - secondIndex;
    if (firstIndex >= 0) return -1;
    if (secondIndex >= 0) return 1;
    return first.localeCompare(second);
  });
}

async function addBulkWords() {
  const originalInput = elements.bulkInput.value;
  const lines = elements.bulkInput.value.split("\n").map((line) => line.trim()).filter(Boolean);
  const bulkDate = elements.bulkDateInput.value || todayDateKey();
  let currentCategory = "미분류";
  let added = 0;
  let updated = 0;

  lines.forEach((line) => {
    const parsed = parseBulkLine(line, currentCategory);
    if (parsed.type === "category") {
      currentCategory = parsed.category;
      return;
    }

    const word = normalizeWord({
      ...parsed.word,
      studyDate: parsed.word.createdDate || bulkDate,
      createdDate: parsed.word.createdDate || bulkDate
    });
    if (word) {
      const result = upsertWord(word, added);
      if (result === "added") added += 1;
      if (result === "updated") updated += 1;
    }
  });

  if (added === 0 && updated === 0) {
    showToast("저장할 수 있는 형식이 없습니다.");
    return;
  }

  elements.bulkInput.value = "";
  afterWordsChanged(`${added}개 저장, ${updated}개 업데이트했습니다.`);
  const result = await syncPendingWords();
  if (result.failed > 0) elements.bulkInput.value = originalInput;
}

function upsertWord(word, addIndex) {
  const existing = state.words.find((item) => isSameWord(item, word));
  if (existing) {
    existing.jp = word.jp;
    existing.reading = word.reading;
    existing.meaning = mergeCommaValues(existing.meaning, word.meaning);
    existing.createdAt = word.createdAt;
    existing.studyDate = word.studyDate;
    existing.createdDate = word.createdDate;
    existing.pos = word.pos;
    existing.semanticTags = normalizeTags([...normalizeTags(existing.semanticTags), ...normalizeTags(word.semanticTags)]);
    existing.grammar = word.grammar;
    existing.generation = word.generation;
    existing.legacyCategory = word.legacyCategory;
    existing.category = word.legacyCategory;
    existing.translation = normalizeTranslation(null, existing);
    existing.syncStatus = "pending";
    return "updated";
  }

  state.words.push({
    ...word,
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${addIndex}`,
    syncStatus: word.syncStatus || "pending"
  });
  return "added";
}

function isSameWord(first, second) {
  return normalizeJapaneseKey(first.jp) === normalizeJapaneseKey(second.jp)
    && normalizeKey(first.pos) === normalizeKey(second.pos);
}

function normalizeKey(value) {
  return String(value || "").trim().replace(/\s+/g, "").toLowerCase();
}

function normalizeJapaneseText(value) {
  return cleanInputPart(String(value || "").normalize("NFKC"));
}

function normalizeJapaneseKey(value) {
  return normalizeKey(normalizeJapaneseText(value));
}

function deduplicateWords(words) {
  const merged = new Map();

  words.forEach((word) => {
    const key = `${normalizeJapaneseKey(word.jp)}::${normalizeKey(word.pos)}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...word });
      return;
    }

    existing.meaning = mergeCommaValues(existing.meaning, word.meaning);
    existing.semanticTags = normalizeTags([
      ...normalizeTags(existing.semanticTags),
      ...normalizeTags(word.semanticTags)
    ]);
    existing.translation = normalizeTranslation(null, existing);
  });

  return [...merged.values()];
}

function mergeCommaValues(first, second) {
  return uniqueStrings(
    `${first || ""},${second || ""}`
      .split(",")
      .map((value) => cleanInputPart(value))
      .filter(Boolean)
  ).join(", ");
}

function afterWordsChanged(message) {
  saveWords();
  state.aiSentences = [];
  saveAiSentences();
  generateSentences();
  state.currentIndex = 0;
  state.todayIndex = 0;
  state.todayRevealed = false;
  state.wordStudyIndex = 0;
  state.wordStudyShowAnswer = false;
  resetWordStudyFilters();
  renderAll();
  showToast(message);
}

function parseBulkLine(line, currentCategory) {
  const categoryMatch = line.match(/^(?:【(.+?)】|\[(.+?)\]|［(.+?)］)$/);
  if (categoryMatch) {
    return {
      type: "category",
      category: (categoryMatch[1] || categoryMatch[2] || categoryMatch[3]).trim()
    };
  }

  const parts = line.split("/").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const isJapaneseFirstFormat = containsJapanese(parts[0]);
    const meta = parseBulkMetadata(parts, currentCategory, isJapaneseFirstFormat);
    return {
      type: "word",
      word: isJapaneseFirstFormat
        ? {
          jp: parts[0],
          reading: parts[1],
          meaning: parts[2],
          ...meta
        }
        : {
          meaning: parts[0],
          jp: parts[1],
          reading: parts[2],
          ...meta
        }
    };
  }

  return {
    type: "word",
    word: parseLooseBulkLine(line, currentCategory)
  };
}

function parseLooseBulkLine(line, currentCategory) {
  const japaneseStart = line.search(/[\u3040-\u30ff\u3400-\u9fff々ー]/);
  if (japaneseStart < 0) {
    return { jp: "", reading: "", meaning: "", legacyCategory: currentCategory };
  }

  const meaning = line.slice(0, japaneseStart).trim();
  const rest = line.slice(japaneseStart).trim();
  const japaneseMatch = rest.match(/^([\u3040-\u30ff\u3400-\u9fff々ー]+)\s*(.*)$/);

  return {
    meaning,
    jp: japaneseMatch ? japaneseMatch[1].trim() : "",
    reading: japaneseMatch ? japaneseMatch[2].trim() : "",
    legacyCategory: currentCategory
  };
}

function parseBulkMetadata(parts, currentCategory, isJapaneseFirstFormat = false) {
  const metaStart = isJapaneseFirstFormat ? 3 : 3;
  const fourth = cleanInputPart(parts[metaStart]);
  const fifth = cleanInputPart(parts[metaStart + 1]);
  const sixth = cleanInputPart(parts[metaStart + 2]);
  const dateValue = isDateKey(sixth) ? sixth : "";
  if (fourth && fifth && !normalizePos(fourth)) {
    return {
      pos: fourth,
      semanticTags: fifth,
      legacyCategory: currentCategory,
      createdDate: dateValue
    };
  }
  if (normalizePos(fourth)) {
    return {
      pos: fourth,
      semanticTags: fifth,
      legacyCategory: currentCategory,
      createdDate: dateValue
    };
  }

  return {
    legacyCategory: fourth || currentCategory,
    createdDate: isDateKey(fifth) ? fifth : dateValue
  };
}

function isDateKey(value) {
  return Boolean(normalizeStudyDateKey(value));
}

function normalizeStudyDateKey(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    ? text
    : "";
}

function getWordStudyDate(word) {
  return normalizeStudyDateKey(word?.studyDate);
}

function generateSentences() {
  const ruleSentences = buildRuleSentences();
  const matchingAiSentences = state.aiSentences.filter((sentence) => sentenceStyleMatches(sentence.style, state.generationOptions));

  state.sentences = uniqueSentences([...matchingAiSentences, ...ruleSentences].filter(isAllowedSentence));
  state.visibleSentences = [...state.sentences];
}

function sentenceStyleMatches(sentenceStyle, targetStyle) {
  const first = normalizeSentenceStyle(sentenceStyle);
  const second = normalizeSentenceStyle(targetStyle);
  return first.jpStyle === second.jpStyle
    && first.krStyle === second.krStyle
    && first.translationMode === second.translationMode;
}

function buildRuleSentences() {
  const sentences = [];
  const usableWords = state.words.filter((word) => word.generation?.enabled !== false);
  const subject = pickSubject(usableWords);
  const nouns = usableWords.filter((word) => isNounLike(word) && word.pos !== "pronoun" && !hasAnyTag(word.semanticTags, ["time"]));
  const likeTargets = usableWords.filter((word) => isNounLike(word) && word.jp !== subject.jp && !hasAnyTag(word.semanticTags, ["time", "weather"]));
  const places = usableWords.filter((word) => hasAnyTag(word.semanticTags, ["place", "facility", "city", "country"]));
  const times = usableWords.filter((word) => hasAnyTag(word.semanticTags, ["time", "weekday", "date", "season"]));
  const adjectives = usableWords.filter((word) => ["i_adjective", "na_adjective"].includes(word.pos));
  const predicativeAdjectives = adjectives.filter((word) => !hasAnyTag(word.semanticTags, ["preference", "ability"]));
  const abilityPredicates = adjectives.filter((word) => hasAnyTag(word.semanticTags, ["ability"]));
  const demonstratives = usableWords.filter((word) => word.pos === "demonstrative_prenominal");
  const interrogatives = usableWords.filter((word) => word.pos === "interrogative");
  const likePredicate = findPredicateWord(usableWords, ["すきだ", "すきです"]) || builtinPredicate("すきだ", "스키다", "좋아하다", ["emotion", "preference"]);

  addAdvancedSentenceTemplates(sentences, usableWords, subject, likePredicate);

  nouns.forEach((noun) => {
    if (hasAnyTag(noun.semanticTags, ["person", "human", "occupation", "country", "language"])) {
      sentences.push(makeSentence(
        [subject, noun],
        `${subject.jp}は ${noun.jp}${jpCopula()}。`,
        `${subject.reading}${particleReading("は")} ${noun.reading} ${state.generationOptions.jpStyle === "plain" ? "다" : "데스"}`,
        `${krSubject(subject)} ${krCopula(krWord(noun))}`,
        "rule",
        {
          literalMeaning: `${krSubject(subject)} ${krCopula(krWord(noun))}`,
          naturalMeaning: `${krSubject(subject)} ${krCopula(krWord(noun))}`,
          style: { ...state.generationOptions }
        }
      ));
    }
  });

  predicativeAdjectives.forEach((adjective) => {
    nouns
      .filter((noun) => canApplyAdjective(adjective, noun))
      .slice(0, 8)
      .forEach((noun) => {
        const jpPredicate = adjective.pos === "na_adjective" ? jpNaAdjectivePredicate(adjective) : jpIAdjectivePredicate(adjective);
        const literalMeaning = `${krSubjectParticle(noun)} ${state.generationOptions.krStyle === "plain" ? plainKoreanPredicate(adjective.translation?.dictionary || adjective.meaning) : politeKoreanPredicate(adjective.translation?.dictionary || adjective.meaning)}`;
        const naturalMeaning = `${krSubject(noun)} ${krPredicate(adjective)}`;
        sentences.push(makeStyledSentence(
          [noun, adjective],
          `${noun.jp}は ${jpPredicate}。`,
          `${noun.reading}${particleReading("は")} ${adjective.reading} ${state.generationOptions.jpStyle === "plain" ? "다" : "데스"}`,
          literalMeaning,
          naturalMeaning
        ));
      });
  });

  likeTargets
    .slice(0, 24)
    .forEach((noun) => {
      const jpLike = jpNaAdjectivePredicate(likePredicate);
      sentences.push(makeStyledSentence(
        [subject, noun, likePredicate],
        `${subject.jp}は ${noun.jp}が ${jpLike}。`,
        `${subject.reading}${particleReading("は")} ${noun.reading}${particleReading("が")} ${naAdjectiveReading(likePredicate)}`,
        `${krSubjectParticle(noun)} ${state.generationOptions.krStyle === "plain" ? "좋아" : "좋습니다"}`,
        `${krSubject(subject)} ${krObject(noun)} ${krPredicate(likePredicate)}`
      ));
    });

  abilityPredicates.forEach((predicate) => {
    usableWords
      .filter((word) => hasAnyTag(word.semanticTags, ["activity", "language", "sport", "art", "game", "study"]))
      .slice(0, 8)
      .forEach((target) => {
        sentences.push(makeStyledSentence(
          [subject, target, predicate],
          `${subject.jp}は ${target.jp}が ${jpNaAdjectivePredicate(predicate)}。`,
          `${subject.reading}${particleReading("は")} ${target.reading}${particleReading("が")} ${naAdjectiveReading(predicate)}`,
          `${krSubjectParticle(target)} ${state.generationOptions.krStyle === "plain" ? plainKoreanPredicate(predicate.translation?.dictionary || predicate.meaning) : politeKoreanPredicate(predicate.translation?.dictionary || predicate.meaning)}`,
          `${krSubject(subject)} ${krObject(target)} ${krPredicate(predicate)}`
        ));
      });
  });

  usableWords
    .filter((word) => hasAnyTag(word.semanticTags, ["language", "study"]))
    .slice(0, 8)
    .forEach((target) => {
      sentences.push(makeStyledSentence(
        [subject, target],
        `${subject.jp}は ${target.jp}を ${jpVerb("べんきょうします", "べんきょうする")}。`,
        `${subject.reading}${particleReading("は")} ${target.reading}${particleReading("を")} ${jpVerbReading("벤쿄시마스", "벤쿄스루")}`,
        `${krSubject(subject)} ${krObject(target)} ${state.generationOptions.krStyle === "plain" ? "공부해" : "공부합니다"}`,
        `${krSubject(subject)} ${krObject(target)} ${state.generationOptions.krStyle === "plain" ? "공부해" : "공부합니다"}`
      ));
    });

  usableWords
    .filter((word) => hasAnyTag(word.semanticTags, ["food"]))
    .slice(0, 8)
    .forEach((food) => {
      sentences.push(makeStyledSentence(
        [subject, food],
        `${subject.jp}は ${food.jp}を ${jpVerb("たべます", "たべる")}。`,
        `${subject.reading}${particleReading("は")} ${food.reading}${particleReading("を")} ${jpVerbReading("타베마스", "타베루")}`,
        `${krSubject(subject)} ${krObject(food)} ${state.generationOptions.krStyle === "plain" ? "먹어" : "먹습니다"}`,
        `${krSubject(subject)} ${krObject(food)} ${state.generationOptions.krStyle === "plain" ? "먹어" : "먹습니다"}`
      ));
    });

  usableWords
    .filter((word) => hasAnyTag(word.semanticTags, ["drink", "alcohol"]))
    .slice(0, 8)
    .forEach((drink) => {
      sentences.push(makeStyledSentence(
        [subject, drink],
        `${subject.jp}は ${drink.jp}を ${jpVerb("のみます", "のむ")}。`,
        `${subject.reading}${particleReading("は")} ${drink.reading}${particleReading("を")} ${jpVerbReading("노미마스", "노무")}`,
        `${krSubject(subject)} ${krObject(drink)} ${state.generationOptions.krStyle === "plain" ? "마셔" : "마십니다"}`,
        `${krSubject(subject)} ${krObject(drink)} ${state.generationOptions.krStyle === "plain" ? "마셔" : "마십니다"}`
      ));
    });

  places.slice(0, 12).forEach((place) => {
    sentences.push(makeStyledSentence(
      [subject, place],
      `${subject.jp}は ${place.jp}に ${jpVerb("いきます", "いく")}。`,
      `${subject.reading}${particleReading("は")} ${place.reading}${particleReading("に")} ${jpVerbReading("이키마스", "이쿠")}`,
      `${krSubject(subject)} ${krWord(place)}에 ${state.generationOptions.krStyle === "plain" ? "가" : "갑니다"}`,
      `${krSubject(subject)} ${krWord(place)}에 ${state.generationOptions.krStyle === "plain" ? "가" : "갑니다"}`
    ));
  });

  places.slice(0, 8).forEach((place) => {
    nouns.filter((noun) => !noun.grammar?.locative).slice(0, 6).forEach((noun) => {
      const existenceVerb = noun.grammar?.animate ? jpVerb("います", "いる") : jpVerb("あります", "ある");
      const existenceReading = noun.grammar?.animate ? jpVerbReading("이마스", "이루") : jpVerbReading("아리마스", "아루");
      const krExist = state.generationOptions.krStyle === "plain" ? "있어" : "있습니다";
      sentences.push(makeStyledSentence(
        [place, noun],
        `${place.jp}に ${noun.jp}が ${existenceVerb}。`,
        `${place.reading}${particleReading("に")} ${noun.reading}${particleReading("が")} ${existenceReading}`,
        `${krWord(place)}에 ${krSubjectParticle(noun)} ${krExist}`,
        `${krWord(place)}에 ${krSubjectParticle(noun)} ${krExist}`
      ));
    });
  });

  times.slice(0, 8).forEach((time) => {
    places.slice(0, 6).forEach((place) => {
      sentences.push(makeStyledSentence(
        [time, subject, place],
        `${time.jp}、${subject.jp}は ${place.jp}に ${jpVerb("いきます", "いく")}。`,
        `${time.reading}, ${subject.reading}${particleReading("は")} ${place.reading}${particleReading("に")} ${jpVerbReading("이키마스", "이쿠")}`,
        `${krWord(time)}, ${krSubject(subject)} ${krWord(place)}에 ${state.generationOptions.krStyle === "plain" ? "가" : "갑니다"}`,
        `${krWord(time)}, ${krSubject(subject)} ${krWord(place)}에 ${state.generationOptions.krStyle === "plain" ? "가" : "갑니다"}`
      ));
    });
  });

  if (times.length >= 2) {
    const rangeStart = times[0];
    const rangeEnd = times[1];
    const studyTarget = usableWords.find((word) => hasAnyTag(word.semanticTags, ["language", "study"]));
    const firstPlace = places[0];

    if (studyTarget) {
      sentences.push(makeStyledSentence(
        [rangeStart, rangeEnd, subject, studyTarget],
        `${rangeStart.jp}から ${rangeEnd.jp}まで、${subject.jp}は ${studyTarget.jp}を ${jpVerb("べんきょうします", "べんきょうする")}。`,
        `${rangeStart.reading}${particleReading("から")} ${rangeEnd.reading}${particleReading("まで")}, ${subject.reading}${particleReading("は")} ${studyTarget.reading}${particleReading("を")} ${jpVerbReading("벤쿄시마스", "벤쿄스루")}`,
        `${krWord(rangeStart)}부터 ${krWord(rangeEnd)}까지, ${krSubject(subject)} ${krObject(studyTarget)} ${state.generationOptions.krStyle === "plain" ? "공부해" : "공부합니다"}`,
        `${krWord(rangeStart)}부터 ${krWord(rangeEnd)}까지, ${krSubject(subject)} ${krObject(studyTarget)} ${state.generationOptions.krStyle === "plain" ? "공부해" : "공부합니다"}`
      ));
    }

    if (firstPlace) {
      sentences.push(makeStyledSentence(
        [rangeStart, rangeEnd, subject, firstPlace],
        `${rangeStart.jp}から ${rangeEnd.jp}まで、${subject.jp}は ${firstPlace.jp}に ${jpVerb("いきます", "いく")}。`,
        `${rangeStart.reading}${particleReading("から")} ${rangeEnd.reading}${particleReading("まで")}, ${subject.reading}${particleReading("は")} ${firstPlace.reading}${particleReading("に")} ${jpVerbReading("이키마스", "이쿠")}`,
        `${krWord(rangeStart)}부터 ${krWord(rangeEnd)}까지, ${krSubject(subject)} ${krWord(firstPlace)}에 ${state.generationOptions.krStyle === "plain" ? "가" : "갑니다"}`,
        `${krWord(rangeStart)}부터 ${krWord(rangeEnd)}까지, ${krSubject(subject)} ${krWord(firstPlace)}에 ${state.generationOptions.krStyle === "plain" ? "가" : "갑니다"}`
      ));
    }
  }

  demonstratives.slice(0, 4).forEach((demo) => {
    nouns.filter((noun) => !hasAnyTag(noun.semanticTags, ["person"])).slice(0, 8).forEach((noun) => {
      sentences.push(makeStyledSentence(
        [demo, noun],
        `${demo.jp} ${noun.jp}は ${state.generationOptions.jpStyle === "plain" ? "いい" : "いいです"}。`,
        `${demo.reading} ${noun.reading}${particleReading("は")} ${state.generationOptions.jpStyle === "plain" ? "이이" : "이이데스"}`,
        `${krWord(demo)} ${krSubject(noun)} ${state.generationOptions.krStyle === "plain" ? "좋아" : "좋습니다"}`,
        `${krWord(demo)} ${krSubject(noun)} ${state.generationOptions.krStyle === "plain" ? "좋아" : "좋습니다"}`
      ));
    });
  });

  interrogatives.slice(0, 4).forEach((question) => {
    if (question.jp === "だれ" && nouns.some((noun) => hasAnyTag(noun.semanticTags, ["person"]))) {
      sentences.push(makeStyledSentence(
        [question],
        `この ひとは ${question.jp}${jpQuestionCopula()}。`,
        `코노 히토와 ${question.reading} ${state.generationOptions.jpStyle === "plain" ? "나노" : "데스카"}`,
        `이 사람은 ${krWord(question)}${state.generationOptions.krStyle === "plain" ? "야?" : "입니까?"}`,
        `이 사람은 ${krWord(question)}${state.generationOptions.krStyle === "plain" ? "야?" : "입니까?"}`
      ));
    }
    if (["どこ", "どちら"].includes(question.jp)) {
      sentences.push(makeStyledSentence(
        [question],
        `${question.jp}${jpQuestionCopula()}。`,
        `${question.reading} ${state.generationOptions.jpStyle === "plain" ? "나노" : "데스카"}`,
        `${krWord(question)}${state.generationOptions.krStyle === "plain" ? "야?" : "입니까?"}`,
        `${krWord(question)}${state.generationOptions.krStyle === "plain" ? "야?" : "입니까?"}`
      ));
    }
  });

  usableWords
    .filter((word) => word.generation?.fixedOnly || word.pos === "fixed_expression")
    .forEach((word) => {
      sentences.push(makeSentence([word], `${word.jp}。`, word.reading, word.meaning));
    });

  return uniqueSentences(sentences).slice(0, 160);
}

function addAdvancedSentenceTemplates(sentences, usableWords, subject, likePredicate) {
  const contrastConnector = findWordByJp(state.words, "けど");
  const reasonConnector = state.words.find((word) => word.jp === "から" && word.pos === "conjunction");
  const ano = findWordByJp(usableWords, "あの");
  const sono = findWordByJp(usableWords, "その");
  const today = findWordByJp(usableWords, "きょう");
  const store = findWordByJp(usableWords, "みせ");
  const work = findWordByJp(usableWords, "しごと");
  const japanese = findWordByJp(usableWords, "にほんご");
  const girlfriend = findWordByJp(usableWords, "かのじょ");
  const atmosphere = findWordByJp(usableWords, "ふんいき");
  const person = findWordByJp(usableWords, "ひと");
  const popularity = findWordByJp(usableWords, "にんき") || findWordByJp(usableWords, "にんきだ");
  const very = findWordByJp(usableWords, "とても") || findWordByJp(usableWords, "ほんとうに");
  const good = findWordByJp(usableWords, "いい");
  const expensive = findWordByJp(usableWords, "たかい");
  const far = findWordByJp(usableWords, "とおい");
  const tasty = findWordByJp(usableWords, "おいしい");
  const many = findWordByJp(usableWords, "おおい");
  const busy = findWordByJp(usableWords, "いそがしい");
  const difficult = findWordByJp(usableWords, "むずかしい");
  const interesting = findWordByJp(usableWords, "おもしろい");
  const kind = findWordByJp(usableWords, "しんせつだ");
  const famous = findWordByJp(usableWords, "ゆうめいだ");
  const few = findWordByJp(usableWords, "すくない");
  const simple = findWordByJp(usableWords, "かんたんだ");

  if (contrastConnector && ano && store && expensive && tasty) {
    pushContrastAdjectiveSentence(sentences, ano, store, expensive, tasty);
  }

  if (contrastConnector && sono && store && far && atmosphere && good) {
    sentences.push(makeStyledSentence(
      [sono, store, far, atmosphere, good, contrastConnector],
      `${sono.jp} ${store.jp}は ${jpAdjectiveConnector(far, "けど")}、${atmosphere.jp}が ${jpFinalAdjective(good)}。`,
      `${sono.reading} ${store.reading}${particleReading("は")} ${jpAdjectiveConnectorReading(far, "けど")}, ${atmosphere.reading}${particleReading("が")} ${jpFinalAdjectiveReading(good)}`,
      `그 ${krWord(store)}${topicParticle(krWord(store))} ${krAdjectiveConnector(far, "contrast")}, ${krSubjectParticle(atmosphere)} ${krPredicate(good)}`,
      `그 ${krWord(store)}${topicParticle(krWord(store))} ${krAdjectiveConnector(far, "contrast")}, ${krSubjectParticle(atmosphere)} ${krPredicate(good)}`
    ));
  }

  if (reasonConnector && today && work && many && busy) {
    const adverbPart = very ? `${very.jp} ` : "";
    const adverbReading = very ? `${very.reading} ` : "";
    const adverbMeaning = very ? `${krWord(very)} ` : "";
    sentences.push(makeStyledSentence(
      [today, work, many, busy, reasonConnector, ...(very ? [very] : [])],
      `${today.jp}は ${work.jp}が ${jpAdjectiveConnector(many, "から")}、${adverbPart}${jpFinalAdjective(busy)}。`,
      `${today.reading}${particleReading("は")} ${work.reading}${particleReading("が")} ${jpAdjectiveConnectorReading(many, "から")}, ${adverbReading}${jpFinalAdjectiveReading(busy)}`,
      `${krWord(today)}${topicParticle(krWord(today))} ${krSubjectParticle(work)} ${krAdjectiveConnector(many, "reason")}, ${adverbMeaning}${krPredicate(busy)}`,
      `${krWord(today)}${topicParticle(krWord(today))} ${krSubjectParticle(work)} ${krAdjectiveConnector(many, "reason")}, ${adverbMeaning}${krPredicate(busy)}`
    ));
  }

  if (contrastConnector && japanese && difficult && interesting) {
    pushContrastAdjectiveSentence(sentences, null, japanese, difficult, interesting);
  }

  if (reasonConnector && japanese && difficult && interesting) {
    pushReasonAdjectiveSentence(sentences, japanese, difficult, interesting, { finalNegative: true });
  }

  if (reasonConnector && girlfriend && kind && likePredicate) {
    pushReasonPredicateSentence(sentences, girlfriend, kind, likePredicate);
  }

  if (reasonConnector && ano && store && famous && likePredicate) {
    pushReasonPredicateSentence(sentences, store, famous, likePredicate, ano);
  }

  if (reasonConnector && ano && store && popularity && many && famous) {
    sentences.push(makeStyledSentence(
      [ano, store, popularity, many, famous, reasonConnector],
      `${ano.jp} ${store.jp}は ${adjectivePredicate(popularity)}が ${jpAdjectiveConnector(many, "から")}、${jpFinalAdjective(famous)}。`,
      `${ano.reading} ${store.reading}${particleReading("は")} ${popularity.reading}${particleReading("が")} ${jpAdjectiveConnectorReading(many, "から")}, ${jpFinalAdjectiveReading(famous)}`,
      `저 ${krWord(store)}${topicParticle(krWord(store))} ${krSubjectParticle(popularity)} ${krAdjectiveConnector(many, "reason")}, ${krPredicate(famous)}`,
      `저 ${krWord(store)}${topicParticle(krWord(store))} ${krSubjectParticle(popularity)} ${krAdjectiveConnector(many, "reason")}, ${krPredicate(famous)}`
    ));
  }

  if (contrastConnector && ano && store && popularity && many && today && person && few) {
    sentences.push(makeStyledSentence(
      [ano, store, popularity, many, today, person, few, contrastConnector],
      `${ano.jp} ${store.jp}は ${adjectivePredicate(popularity)}が ${jpAdjectiveConnector(many, "けど")}、${today.jp}は ${person.jp}が ${jpFinalAdjective(few)}。`,
      `${ano.reading} ${store.reading}${particleReading("は")} ${popularity.reading}${particleReading("が")} ${jpAdjectiveConnectorReading(many, "けど")}, ${today.reading}${particleReading("は")} ${person.reading}${particleReading("が")} ${jpFinalAdjectiveReading(few)}`,
      `저 ${krWord(store)}${topicParticle(krWord(store))} ${krSubjectParticle(popularity)} ${krAdjectiveConnector(many, "contrast")}, ${krWord(today)}${topicParticle(krWord(today))} ${krSubjectParticle(person)} ${krPredicate(few)}`,
      `저 ${krWord(store)}${topicParticle(krWord(store))} ${krSubjectParticle(popularity)} ${krAdjectiveConnector(many, "contrast")}, ${krWord(today)}${topicParticle(krWord(today))} ${krSubjectParticle(person)} ${krPredicate(few)}`
    ));
  }

  if (reasonConnector && japanese && simple && interesting) {
    pushReasonAdjectiveSentence(sentences, japanese, simple, interesting, { reasonNegative: true, finalNegative: true });
  }
}

function pushContrastAdjectiveSentence(sentences, modifier, noun, firstAdjective, secondAdjective) {
  const sourceWords = [noun, firstAdjective, secondAdjective, findWordByJp(state.words, "けど")].filter(Boolean);
  if (modifier) sourceWords.unshift(modifier);
  const jpSubject = modifier ? `${modifier.jp} ${noun.jp}` : noun.jp;
  const readingSubject = modifier ? `${modifier.reading} ${noun.reading}` : noun.reading;
  const krSubjectText = modifier ? `${krWord(modifier)} ${krWord(noun)}` : krWord(noun);

  sentences.push(makeStyledSentence(
    sourceWords,
    `${jpSubject}は ${jpAdjectiveConnector(firstAdjective, "けど")}、${jpFinalAdjective(secondAdjective)}。`,
    `${readingSubject}${particleReading("は")} ${jpAdjectiveConnectorReading(firstAdjective, "けど")}, ${jpFinalAdjectiveReading(secondAdjective)}`,
    `${krSubjectText}${topicParticle(krSubjectText)} ${krAdjectiveConnector(firstAdjective, "contrast")}, ${krPredicate(secondAdjective)}`,
    `${krSubjectText}${topicParticle(krSubjectText)} ${krAdjectiveConnector(firstAdjective, "contrast")}, ${krPredicate(secondAdjective)}`
  ));
}

function pushReasonAdjectiveSentence(sentences, noun, reasonAdjective, finalAdjective, options = {}) {
  const reasonConnector = findWordByJp(state.words, "から");
  sentences.push(makeStyledSentence(
    [noun, reasonAdjective, finalAdjective, reasonConnector].filter(Boolean),
    `${noun.jp}は ${jpAdjectiveConnector(reasonAdjective, "から", options.reasonNegative)}、${jpFinalAdjective(finalAdjective, options.finalNegative)}。`,
    `${noun.reading}${particleReading("は")} ${jpAdjectiveConnectorReading(reasonAdjective, "から", options.reasonNegative)}, ${jpFinalAdjectiveReading(finalAdjective, options.finalNegative)}`,
    `${krSubject(noun)} ${krAdjectiveConnector(reasonAdjective, "reason", options.reasonNegative)}, ${krPredicateWithNegative(finalAdjective, options.finalNegative)}`,
    `${krSubject(noun)} ${krAdjectiveConnector(reasonAdjective, "reason", options.reasonNegative)}, ${krPredicateWithNegative(finalAdjective, options.finalNegative)}`
  ));
}

function pushReasonPredicateSentence(sentences, noun, reasonAdjective, finalPredicate, modifier = null) {
  const reasonConnector = findWordByJp(state.words, "から");
  const jpSubject = modifier ? `${modifier.jp} ${noun.jp}` : noun.jp;
  const readingSubject = modifier ? `${modifier.reading} ${noun.reading}` : noun.reading;
  const krSubjectText = modifier ? `${krWord(modifier)} ${krWord(noun)}` : krWord(noun);
  const sourceWords = [noun, reasonAdjective, finalPredicate, reasonConnector].filter(Boolean);
  if (modifier) sourceWords.unshift(modifier);

  sentences.push(makeStyledSentence(
    sourceWords,
    `${jpSubject}は ${jpAdjectiveConnector(reasonAdjective, "から")}、${jpNaAdjectivePredicate(finalPredicate)}。`,
    `${readingSubject}${particleReading("は")} ${jpAdjectiveConnectorReading(reasonAdjective, "から")}, ${naAdjectiveReading(finalPredicate)}`,
    `${krSubjectText}${topicParticle(krSubjectText)} ${krAdjectiveConnector(reasonAdjective, "reason")}, ${krPredicate(finalPredicate)}`,
    `${krSubjectText}${topicParticle(krSubjectText)} ${krAdjectiveConnector(reasonAdjective, "reason")}, ${krPredicate(finalPredicate)}`
  ));
}

function makeSentence(sourceWords, jp, reading, meaning, category = "rule", details = {}) {
  const style = details.style || { ...state.generationOptions };
  const literalMeaning = cleanInputPart(details.literalMeaning || meaning);
  const naturalMeaning = cleanInputPart(details.naturalMeaning || meaning);
  const selectedMeaning = style.translationMode === "literal" ? literalMeaning : naturalMeaning;
  return {
    id: makeSentenceId(cleanInputPart(jp)),
    sourceIds: sourceWords.map((word) => word.id).filter(Boolean),
    category,
    jp: cleanInputPart(jp),
    reading: cleanInputPart(reading),
    meaning: cleanInputPart(selectedMeaning),
    literalMeaning,
    naturalMeaning,
    style
  };
}

function makeStyledSentence(sourceWords, jp, reading, literalMeaning, naturalMeaning, category = "rule") {
  return makeSentence(sourceWords, jp, reading, naturalMeaning, category, {
    literalMeaning,
    naturalMeaning,
    style: { ...state.generationOptions }
  });
}

function jpCopula() {
  return state.generationOptions.jpStyle === "plain" ? "だ" : "です";
}

function jpQuestionCopula() {
  return state.generationOptions.jpStyle === "plain" ? "なの" : "ですか";
}

function jpNaAdjectivePredicate(word) {
  const stem = word.jp.replace(/です$/, "").replace(/だ$/, "");
  return state.generationOptions.jpStyle === "plain" ? `${stem}だ` : `${stem}です`;
}

function naAdjectiveReading(word) {
  const stem = cleanInputPart(word.reading)
    .replace(/데스$/, "")
    .replace(/다$/, "")
    .replace(/\s+/g, "");
  return state.generationOptions.jpStyle === "plain" ? `${stem}다` : `${stem}데스`;
}

function jpIAdjectivePredicate(word) {
  return state.generationOptions.jpStyle === "plain" ? word.jp : `${word.jp}です`;
}

function jpFinalAdjective(word, negative = false) {
  if (word.pos === "na_adjective") {
    const stem = jpAdjectiveStem(word);
    if (negative) return state.generationOptions.jpStyle === "plain" ? `${stem}じゃない` : `${stem}じゃないです`;
    return jpNaAdjectivePredicate(word);
  }

  const adjective = negative ? jpNegativeIAdjective(word.jp) : word.jp;
  return state.generationOptions.jpStyle === "plain" ? adjective : `${adjective}です`;
}

function jpFinalAdjectiveReading(word, negative = false) {
  const stem = readingStem(word);
  if (word.pos === "na_adjective") {
    if (negative) return state.generationOptions.jpStyle === "plain" ? `${stem}쟈나이` : `${stem}쟈나이데스`;
    return naAdjectiveReading(word);
  }

  const adjective = negative ? jpNegativeIAdjectiveReading(word) : stem;
  return state.generationOptions.jpStyle === "plain" ? adjective : `${adjective}데스`;
}

function jpAdjectiveConnector(word, connector, negative = false) {
  if (word.pos === "na_adjective") {
    const stem = jpAdjectiveStem(word);
    return `${stem}${negative ? "じゃない" : "だ"}${connector}`;
  }

  return `${negative ? jpNegativeIAdjective(word.jp) : word.jp}${connector}`;
}

function jpAdjectiveConnectorReading(word, connector, negative = false) {
  const stem = readingStem(word);
  const connectorReading = particleReading(connector);
  if (word.pos === "na_adjective") {
    return `${stem}${negative ? "쟈나이" : "다"}${connectorReading}`;
  }

  return `${negative ? jpNegativeIAdjectiveReading(word) : stem}${connectorReading}`;
}

function jpAdjectiveStem(word) {
  return cleanInputPart(word.jp).replace(/です$/, "").replace(/だ$/, "");
}

function jpNegativeIAdjective(jp) {
  const value = cleanInputPart(jp);
  if (value === "いい") return "よくない";
  if (value.endsWith("い")) return `${value.slice(0, -1)}くない`;
  return `${value}じゃない`;
}

function jpNegativeIAdjectiveReading(word) {
  const stem = readingStem(word);
  if (word.jp === "いい") return "요쿠나이";
  return `${stem.replace(/이$/, "")}쿠나이`;
}

function readingStem(word) {
  return cleanInputPart(word.reading)
    .replace(/데스$/, "")
    .replace(/다$/, "")
    .replace(/\s+/g, "");
}

function jpVerb(politeForm, plainForm) {
  return state.generationOptions.jpStyle === "plain" ? plainForm : politeForm;
}

function jpVerbReading(politeReading, plainReading) {
  return state.generationOptions.jpStyle === "plain" ? plainReading : politeReading;
}

function krWord(word) {
  const pronoun = PRONOUN_TRANSLATIONS[word.jp];
  if (pronoun) return pronoun[state.generationOptions.krStyle] || pronoun.polite;
  return cleanInputPart(word.translation?.natural || word.meaning);
}

function krPredicate(word) {
  const style = state.generationOptions.krStyle;
  return cleanInputPart(word.translation?.[style] || word.translation?.natural || word.meaning);
}

function krPredicateWithNegative(word, negative = false) {
  if (!negative) return krPredicate(word);
  const base = krWord(word).split(",")[0].trim();
  if (base.endsWith("하다")) {
    return state.generationOptions.krStyle === "plain" ? `${base.slice(0, -2)}하지 않아` : `${base.slice(0, -2)}하지 않습니다`;
  }
  if (base.endsWith("다")) {
    return state.generationOptions.krStyle === "plain" ? `${base.slice(0, -1)}지 않아` : `${base.slice(0, -1)}지 않습니다`;
  }
  return state.generationOptions.krStyle === "plain" ? `${base} 아니야` : `${base} 아닙니다`;
}

function krAdjectiveConnector(word, connectorType, negative = false) {
  const base = krWord(word).split(",")[0].trim();
  const stem = base.endsWith("다") ? base.slice(0, -1) : base;
  if (connectorType === "contrast") {
    return negative ? `${stem}지 않지만` : `${stem}지만`;
  }
  if (negative) return `${stem}지 않기 때문에`;
  if (base.endsWith("하다")) return `${base.slice(0, -2)}하기 때문에`;
  return `${stem}기 때문에`;
}

function krCopula(text) {
  return state.generationOptions.krStyle === "plain"
    ? `${text}${hasFinalConsonant(text) ? "이야" : "야"}`
    : `${text}${hasFinalConsonant(text) ? "입니다" : "입니다"}`;
}

function krSubject(word) {
  const text = krWord(word);
  return `${text}${topicParticle(text)}`;
}

function krTopic(word) {
  const text = krWord(word);
  return `${text}${topicParticle(text)}`;
}

function krSubjectParticle(word) {
  const text = krWord(word);
  return `${text}${withSubjectParticleSuffix(text)}`;
}

function krObject(word) {
  const text = krWord(word);
  return `${text}${objectParticle(text)}`;
}

function objectParticle(text) {
  return hasFinalConsonant(text) ? "을" : "를";
}

function withSubjectParticleSuffix(text) {
  return hasFinalConsonant(text) ? "이" : "가";
}

function pickSubject(words) {
  const preferred = words.find((word) => word.jp === "わたし")
    || words.find((word) => word.pos === "pronoun" && !["あなた", "きみ"].includes(word.jp))
    || words.find((word) => hasAnyTag(word.semanticTags, ["person", "human"]));
  return preferred || {
    id: "builtin-watashi",
    jp: "わたし",
    reading: "와타시",
    meaning: "저",
    pos: "pronoun",
    semanticTags: ["person", "human"],
    grammar: { animate: true, human: true },
    generation: { enabled: true, roles: ["subject"], fixedOnly: false },
    legacyCategory: "기본"
  };
}

function findPredicateWord(words, jpCandidates) {
  return words.find((word) => jpCandidates.includes(word.jp));
}

function builtinPredicate(jp, reading, meaning, semanticTags = []) {
  return migrateWord({
    id: `builtin-${jp}`,
    jp,
    reading,
    meaning,
    pos: "na_adjective",
    semanticTags,
    legacyCategory: "기본술어"
  });
}

function findWordByJp(words, jp) {
  return words.find((word) => word.jp === jp);
}

function isNounLike(word) {
  return ["noun", "proper_noun", "pronoun", "demonstrative_pronoun", "numeral", "counter"].includes(word.pos);
}

function canApplyAdjective(adjective, noun) {
  const applicableTags = adjective.grammar?.applicableTags || [];
  if (applicableTags.length === 0) return true;
  return hasAnyTag(noun.semanticTags, applicableTags);
}

function adjectivePredicate(adjective) {
  if (adjective.pos === "na_adjective") return adjective.jp.replace(/だ$/, "");
  return adjective.jp;
}

function particleReading(particle) {
  return PARTICLE_READING[particle] || particle;
}

function topicParticle(text) {
  return hasFinalConsonant(text) ? "은" : "는";
}

function hasAnyTag(tags, requiredTags) {
  const tagSet = new Set(normalizeTags(tags));
  return requiredTags.some((tag) => tagSet.has(tag));
}

function isSentenceWord(word) {
  return word.generation?.enabled !== false;
}

function isAllowedSentence(sentence) {
  const text = `${sentence.jp} ${sentence.reading} ${sentence.meaning}`;
  const awkwardSubject = /(당신이 좋습니다|너가 좋습니다|あなたが すきです|あなたがすきです)/i;
  return !awkwardSubject.test(text);
}

function withObjectParticle(text) {
  return `${text}${hasFinalConsonant(text) ? "을" : "를"}`;
}

function withSubjectParticle(text) {
  return `${text}${hasFinalConsonant(text) ? "이" : "가"}`;
}

function hasFinalConsonant(text) {
  const last = text.trim().charCodeAt(text.trim().length - 1);
  if (last < 0xac00 || last > 0xd7a3) return false;
  return (last - 0xac00) % 28 !== 0;
}

function makeSentenceId(text) {
  return btoa(unescape(encodeURIComponent(text))).replace(/=+$/g, "");
}

function uniqueSentences(sentences) {
  const seen = new Set();
  return sentences.filter((sentence) => {
    if (seen.has(sentence.jp)) return false;
    seen.add(sentence.jp);
    return true;
  });
}

function renderAll() {
  renderWordStudyFilters();
  renderWordStudy();
  renderKana();
  renderTodaySentence();
  renderCard();
  renderSentenceList();
}

function renderWordStudy() {
  const word = getCurrentWordStudy();
  const studyWords = getWordStudyWords();
  const total = studyWords.length;

  if (!word) {
    elements.wordStudyPosition.textContent = "0 / 0";
    elements.wordStudyJapanese.textContent = "単語";
    elements.wordStudyMeaning.textContent = "단어를 먼저 입력해 주세요.";
    elements.wordStudyReading.textContent = "";
    elements.wordStudyMeaning.classList.remove("hidden");
    elements.wordStudyReading.classList.add("hidden");
    elements.toggleWordStudyAnswerBtn.textContent = "답안 보기";
    renderWordStudyList();
    return;
  }

  elements.wordStudyPosition.textContent = `${state.wordStudyIndex + 1} / ${total}`;
  elements.wordStudyJapanese.textContent = word.jp;
  elements.wordStudyMeaning.textContent = word.meaning;
  elements.wordStudyReading.textContent = word.reading;
  elements.wordStudyMeaning.classList.toggle("hidden", !state.wordStudyShowAnswer);
  elements.wordStudyReading.classList.toggle("hidden", !state.wordStudyShowAnswer);
  elements.toggleWordStudyAnswerBtn.textContent = state.wordStudyShowAnswer ? "답안 숨기기" : "답안 보기";
  renderWordStudyList();
}

function renderWordStudyList() {
  const studyWords = getWordStudyWords();
  elements.wordStudyListCount.textContent = `${studyWords.length}개`;

  if (studyWords.length === 0) {
    const message = state.wordStudyFilterMode === "dates" && state.wordStudySelectedDates.length === 0
      ? "날짜를 하나 이상 선택해 주세요."
      : "조건에 해당하는 단어가 없습니다.";
    elements.wordStudyList.innerHTML = `<p class="helper-text">${message}</p>`;
    return;
  }

  elements.wordStudyList.innerHTML = studyWords.map((word, index) => `
    <article class="word-study-list-item">
      <span class="word-list-number">${index + 1}</span>
      <strong lang="ja">${escapeHtml(word.jp)}</strong>
      <span class="word-study-list-meta">${escapeHtml(word.reading)} · ${escapeHtml(word.meaning)}</span>
      <time datetime="${escapeHtml(word.studyDate || "")}">${escapeHtml(word.studyDate || "학습일 없음")}</time>
    </article>
  `).join("");
}

function getCurrentWordStudy() {
  const studyWords = getWordStudyWords();
  if (state.wordStudyIndex >= studyWords.length) state.wordStudyIndex = 0;
  return studyWords[state.wordStudyIndex] || null;
}

function moveWordStudy(direction) {
  const studyWords = getWordStudyWords();
  if (studyWords.length === 0) return;
  state.wordStudyIndex = (state.wordStudyIndex + direction + studyWords.length) % studyWords.length;
  state.wordStudyShowAnswer = false;
  renderWordStudy();
}

function showRandomWordStudy() {
  const studyWords = getWordStudyWords();
  if (studyWords.length === 0) return;
  state.wordStudyIndex = randomIndex(studyWords.length);
  state.wordStudyShowAnswer = false;
  renderWordStudy();
}

function toggleWordStudyAnswer() {
  if (getWordStudyWords().length === 0) return;
  state.wordStudyShowAnswer = !state.wordStudyShowAnswer;
  renderWordStudy();
}

function getWordStudyWords() {
  if (state.wordStudyFilterMode === "dates") {
    if (state.wordStudySelectedDates.length === 0) return [];
    return state.words.filter((word) => state.wordStudySelectedDates.includes(getWordStudyDate(word)));
  }

  if (state.wordStudyFilterMode === "range") {
    return state.words.filter((word) => {
      const studyDate = getWordStudyDate(word);
      if (!studyDate) return false;
      if (state.wordStudyStartDate && studyDate < state.wordStudyStartDate) return false;
      if (state.wordStudyEndDate && studyDate > state.wordStudyEndDate) return false;
      return true;
    });
  }

  return state.words;
}

function renderWordStudyFilters() {
  const dates = [...new Set(state.words.map(getWordStudyDate).filter(Boolean))].sort().reverse();
  const visibleDates = state.wordStudyShowAllDates ? dates : dates.slice(0, 5);
  state.wordStudySelectedDates = state.wordStudySelectedDates.filter((date) => dates.includes(date));

  elements.wordStudyDateOptions.innerHTML = dates.length
    ? visibleDates.map((date) => {
        const count = state.words.filter((word) => getWordStudyDate(word) === date).length;
        const checked = state.wordStudySelectedDates.includes(date) ? " checked" : "";
        return `
          <label class="date-filter-chip">
            <input type="checkbox" value="${escapeHtml(date)}"${checked} />
            <span>${escapeHtml(date)} · ${count}개</span>
          </label>
        `;
      }).join("")
    : `<p class="helper-text">선택할 입력 날짜가 없습니다.</p>`;

  elements.wordStudyAllFilterBtn.classList.toggle("active", state.wordStudyFilterMode === "all");
  elements.wordStudyDatesFilterBtn.classList.toggle("active", state.wordStudyFilterMode === "dates");
  elements.wordStudyRangeFilterBtn.classList.toggle("active", state.wordStudyFilterMode === "range");
  elements.wordStudyDateOptions.classList.toggle("hidden", state.wordStudyFilterMode !== "dates");
  const hasHiddenDates = dates.length > 5;
  elements.wordStudyToggleDatesBtn.classList.toggle(
    "hidden",
    state.wordStudyFilterMode !== "dates" || !hasHiddenDates
  );
  const dateToggleLabel = state.wordStudyShowAllDates ? "이전 날짜 접기" : "이전 날짜 펼치기";
  elements.wordStudyToggleDatesBtn.classList.toggle("expanded", state.wordStudyShowAllDates);
  elements.wordStudyToggleDatesBtn.setAttribute("aria-expanded", String(state.wordStudyShowAllDates));
  elements.wordStudyToggleDatesBtn.setAttribute("aria-label", dateToggleLabel);
  elements.wordStudyToggleDatesBtn.title = dateToggleLabel;
  elements.wordStudyRangeFields.classList.toggle("hidden", state.wordStudyFilterMode !== "range");
  elements.wordStudyStartDate.value = state.wordStudyStartDate;
  elements.wordStudyEndDate.value = state.wordStudyEndDate;

  const filteredCount = getWordStudyWords().length;
  if (state.wordStudyFilterMode === "dates") {
    elements.wordStudyFilterSummary.textContent = `${state.wordStudySelectedDates.length}개 날짜 · ${filteredCount}개 단어`;
  } else if (state.wordStudyFilterMode === "range") {
    const start = state.wordStudyStartDate || "처음";
    const end = state.wordStudyEndDate || "오늘";
    elements.wordStudyFilterSummary.textContent = `${start} ~ ${end} · ${filteredCount}개 단어`;
  } else {
    elements.wordStudyFilterSummary.textContent = `전체 단어 ${state.words.length}개`;
  }
}

function toggleWordStudyDateList() {
  state.wordStudyShowAllDates = !state.wordStudyShowAllDates;
  renderWordStudyFilters();
}

function setWordStudyFilterMode(mode) {
  state.wordStudyFilterMode = mode;
  state.wordStudyIndex = 0;
  state.wordStudyShowAnswer = false;
  renderWordStudyFilters();
  renderWordStudy();
}

function updateWordStudySelectedDates() {
  state.wordStudySelectedDates = [...elements.wordStudyDateOptions.querySelectorAll("input:checked")]
    .map((input) => input.value);
  state.wordStudyFilterMode = "dates";
  state.wordStudyIndex = 0;
  state.wordStudyShowAnswer = false;
  renderWordStudyFilters();
  renderWordStudy();
}

function updateWordStudyDateRange() {
  state.wordStudyStartDate = elements.wordStudyStartDate.value;
  state.wordStudyEndDate = elements.wordStudyEndDate.value;
  if (
    state.wordStudyStartDate
    && state.wordStudyEndDate
    && state.wordStudyStartDate > state.wordStudyEndDate
  ) {
    [state.wordStudyStartDate, state.wordStudyEndDate] = [
      state.wordStudyEndDate,
      state.wordStudyStartDate
    ];
  }
  state.wordStudyFilterMode = "range";
  state.wordStudyIndex = 0;
  state.wordStudyShowAnswer = false;
  renderWordStudyFilters();
  renderWordStudy();
}

function resetWordStudyFilters() {
  state.wordStudyFilterMode = "all";
  state.wordStudySelectedDates = [];
  state.wordStudyShowAllDates = false;
  state.wordStudyStartDate = "";
  state.wordStudyEndDate = "";
}

function renderTodaySentence() {
  const sentence = getTodaySentence();
  elements.todaySentence.innerHTML = renderTodaySentenceHtml(sentence);
  elements.revealTodayBtn.textContent = state.todayRevealed ? "문장 숨기기" : "문장 보기";
}

function renderTodaySentenceHtml(sentence) {
  if (!sentence) {
    return `
      <p class="meaning">단어를 추가하면 오늘의 문장이 표시됩니다.</p>
      <p class="jp hidden">예: かんこくじん</p>
      <p class="reading hidden">예: 캉코쿠진</p>
    `;
  }

  return `
    <p class="meaning">${escapeHtml(cleanInputPart(sentence.meaning))}</p>
    <p class="jp ${state.todayRevealed ? "" : "hidden"}">${escapeHtml(cleanInputPart(sentence.jp))}</p>
    <p class="reading ${state.todayRevealed ? "" : "hidden"}">${escapeHtml(cleanInputPart(sentence.reading))}</p>
  `;
}

function renderCard() {
  const sentence = getCurrentSentence();
  elements.cardSentence.innerHTML = renderSentenceHtml(sentence, state.showReading, state.showMeaning);
  elements.cardPosition.textContent = `${state.sentences.length ? state.currentIndex + 1 : 0} / ${state.sentences.length}`;
}

function renderSentenceHtml(sentence, showReading, showMeaning) {
  if (!sentence) {
    return `
      <p class="jp">문장이 없습니다.</p>
      <p class="reading">단어를 먼저 입력해 주세요.</p>
      <p class="meaning">입력한 단어만 사용해 문장을 생성합니다.</p>
    `;
  }

  return `
    <p class="jp">${escapeHtml(cleanInputPart(sentence.jp))}</p>
    <p class="reading ${showReading ? "" : "hidden"}">${escapeHtml(cleanInputPart(sentence.reading))}</p>
    <p class="meaning ${showMeaning ? "" : "hidden"}">${escapeHtml(cleanInputPart(sentence.meaning))}</p>
  `;
}

function renderSentenceList() {
  elements.sentenceCount.textContent = `${state.sentences.length}개`;
  const filtered = state.visibleSentences;

  if (filtered.length === 0) {
    elements.sentenceList.innerHTML = `<div class="sentence-item">표시할 문장이 없습니다.</div>`;
    return;
  }

  elements.sentenceList.innerHTML = filtered.map((sentence, index) => {
    const globalIndex = state.sentences.findIndex((item) => item.id === sentence.id) + 1;
    return `
      <article class="sentence-item">
        <div>
          <div class="sentence-title-row">
            <span class="sentence-number">#${globalIndex || index + 1}</span>
            ${sentence.category === "AI" ? `<span class="ai-badge">AI</span>` : ""}
          </div>
          <strong>${escapeHtml(cleanInputPart(sentence.jp))}</strong>
          <div class="sentence-meta">
            ${escapeHtml(cleanInputPart(sentence.reading))}<br />
            ${escapeHtml(cleanInputPart(sentence.meaning))}<br />
            ${escapeHtml(sentenceStyleLabel(sentence.style))}
          </div>
        </div>
        <div class="sentence-actions">
          <button class="small-button" type="button" data-speak="${sentence.id}">듣기</button>
        </div>
      </article>
    `;
  }).join("");

  $$("[data-speak]").forEach((button) => {
    button.addEventListener("click", () => {
      const sentence = state.sentences.find((item) => item.id === button.dataset.speak);
      speakSentence(sentence);
    });
  });
}

function sentenceStyleLabel(style) {
  const normalized = normalizeSentenceStyle(style);
  const jp = normalized.jpStyle === "polite" ? "일본어 존댓말" : "일본어 반말";
  const kr = normalized.krStyle === "polite" ? "한국어 존댓말" : "한국어 반말";
  const mode = normalized.translationMode === "natural" ? "자연번역" : "직역";
  return `${jp} · ${kr} · ${mode}`;
}

function setKanaMode(mode) {
  state.kanaMode = mode;
  state.kanaList = getKanaList(mode);
  state.kanaIndex = 0;
  state.kanaShowAnswer = false;
  renderKana();
}

function renderKana() {
  if (!elements.kanaCharacter) return;
  const kana = getCurrentKana();
  elements.hiraganaModeBtn.classList.toggle("active", state.kanaMode === "hiragana");
  elements.katakanaModeBtn.classList.toggle("active", state.kanaMode === "katakana");
  elements.kanaCharacter.textContent = kana.char;
  elements.kanaRomaji.textContent = kana.romaji;
  elements.kanaKorean.textContent = kana.korean;
  elements.kanaRomaji.classList.toggle("hidden", !state.kanaShowAnswer);
  elements.kanaKorean.classList.toggle("hidden", !state.kanaShowAnswer);
  elements.toggleKanaAnswerBtn.textContent = state.kanaShowAnswer ? "답 숨기기" : "답 보기";
  elements.kanaProgress.textContent = `${state.kanaIndex + 1} / ${state.kanaList.length}`;
  renderKanaGrid();
}

function renderKanaGrid() {
  elements.kanaGrid.innerHTML = state.kanaList.map((kana, index) => `
    <button class="kana-tile ${index === state.kanaIndex ? "active" : ""}" type="button" data-kana-index="${index}">
      <strong>${escapeHtml(kana.char)}</strong>
      <span>${escapeHtml(kana.romaji)} · ${escapeHtml(kana.korean)}</span>
    </button>
  `).join("");

  $$("[data-kana-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.kanaIndex = Number(button.dataset.kanaIndex);
      state.kanaShowAnswer = true;
      renderKana();
    });
  });
}

function getCurrentKana() {
  return state.kanaList[state.kanaIndex] || getKanaList()[0];
}

function moveKana(direction) {
  state.kanaIndex = (state.kanaIndex + direction + state.kanaList.length) % state.kanaList.length;
  state.kanaShowAnswer = false;
  renderKana();
}

function showRandomKana() {
  state.kanaIndex = randomIndex(state.kanaList.length);
  state.kanaShowAnswer = false;
  renderKana();
}

function toggleKanaAnswer() {
  state.kanaShowAnswer = !state.kanaShowAnswer;
  renderKana();
}

function shuffleKanaGrid() {
  state.kanaList = [...state.kanaList].sort(() => Math.random() - 0.5);
  state.kanaIndex = 0;
  state.kanaShowAnswer = false;
  renderKana();
}

function getCurrentSentence() {
  return state.sentences[state.currentIndex] || null;
}

function getTodaySentence() {
  return state.sentences[state.todayIndex] || null;
}

function moveCard(direction) {
  if (state.sentences.length === 0) return;
  state.currentIndex = (state.currentIndex + direction + state.sentences.length) % state.sentences.length;
  renderCard();
}

function showRandomCard() {
  if (state.sentences.length === 0) return;
  state.currentIndex = randomIndex(state.sentences.length);
  renderCard();
}

function changeTodaySentence() {
  if (state.sentences.length === 0) return;
  showRandomTodayFromSentenceList();
}

function showRandomTodayFromSentenceList(message = "목록에서 랜덤 문장으로 바꿨습니다.") {
  if (state.sentences.length === 0) {
    showToast("표시할 문장이 없습니다.");
    return;
  }

  state.todayIndex = randomIndex(state.sentences.length);
  state.todayRevealed = false;
  renderTodaySentence();
  showToast(message);
}

function toggleTodayReveal() {
  state.todayRevealed = !state.todayRevealed;
  renderTodaySentence();
}

function toggleMeaning() {
  state.showMeaning = !state.showMeaning;
  elements.toggleMeaningBtn.textContent = state.showMeaning ? "뜻 숨기기" : "뜻 보기";
  renderCard();
}

function toggleReading() {
  state.showReading = !state.showReading;
  elements.toggleReadingBtn.textContent = state.showReading ? "발음 숨기기" : "발음 보기";
  renderCard();
}

function speakText(text) {
  if (!text) {
    showToast("읽을 내용이 없습니다.");
    return;
  }

  if (!("speechSynthesis" in window)) {
    showToast("이 브라우저는 음성 읽기를 지원하지 않습니다.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = Number(elements.rateInput.value);
  window.speechSynthesis.speak(utterance);
}

function speakSentence(sentence) {
  if (!sentence) {
    showToast("읽을 문장이 없습니다.");
    return;
  }
  speakText(sentence.jp);
}

function updateRateLabel() {
  elements.rateValue.textContent = `${elements.rateInput.value}x`;
}

function toggleSentenceOptions() {
  const isExpanded = elements.toggleSentenceOptionsBtn.getAttribute("aria-expanded") === "true";
  const nextExpanded = !isExpanded;
  elements.sentenceStyleOptions.classList.toggle("hidden", !nextExpanded);
  elements.toggleSentenceOptionsBtn.classList.toggle("expanded", nextExpanded);
  elements.toggleSentenceOptionsBtn.setAttribute("aria-expanded", String(nextExpanded));
  const label = nextExpanded ? "문장 설정 접기" : "문장 설정 펼치기";
  elements.toggleSentenceOptionsBtn.setAttribute("aria-label", label);
  elements.toggleSentenceOptionsBtn.title = label;
}

function updateGenerationOptions() {
  state.generationOptions = {
    jpStyle: elements.jpStyleSelect.value,
    krStyle: elements.krStyleSelect.value,
    translationMode: elements.translationModeSelect.value
  };
  saveGenerationOptions();
  generateSentences();
  state.currentIndex = 0;
  state.todayIndex = 0;
  state.todayRevealed = false;
  renderTodaySentence();
  renderCard();
  renderSentenceList();
  showToast("문장 스타일을 다시 적용했습니다.");
}

function syncGenerationOptionInputs() {
  elements.jpStyleSelect.value = state.generationOptions.jpStyle;
  elements.krStyleSelect.value = state.generationOptions.krStyle;
  elements.translationModeSelect.value = state.generationOptions.translationMode;
}

async function generateSentencesWithAi(options = {}) {
  if (state.words.length === 0) {
    showToast("AI 문장을 만들 단어가 없습니다.");
    return;
  }

  if (!window.JapaneseService?.isRemoteReady()) {
    switchTab("manage");
    setGeminiKeyStatus("Cloudflare Pages에 Supabase 환경변수를 먼저 설정해 주세요.");
    showToast("Supabase 연결 설정이 필요합니다.");
    return;
  }

  setAiStatus(options.focusToday ? "AI로 오늘의 문장을 만들고 있습니다..." : "AI로 문장을 만들고 있습니다...");
  setAiLoading(true, options.focusToday ? "AI 생성 중..." : "생성 중...");

  try {
    const aiSentences = await requestBackendAiSentences();
    if (aiSentences.length === 0) {
      throw new Error("EMPTY_AI_RESULT");
    }

    state.aiSentences = aiSentences;
    await Promise.all(state.aiSentences.map((sentence) => window.JapaneseService.saveSentence(sentence)));
    saveAiSentences();
    generateSentences();
    state.currentIndex = 0;
    state.todayIndex = 0;
    state.todayRevealed = false;
    renderAll();
    setAiStatus(`AI 검수 문장 ${state.aiSentences.length}개 반영. 총 ${state.sentences.length}개 문장입니다.`);
    if (options.focusToday) showRandomTodayFromSentenceList("AI 검수 후 목록에서 랜덤 문장으로 바꿨습니다.");
    showToast(`AI 검수 문장 ${state.aiSentences.length}개를 반영했습니다.`);
  } catch (error) {
    const message = getAiErrorMessage(error);
    setAiStatus(message);
    showToast(message);
  } finally {
    setAiLoading(false);
  }
}

async function requestBackendAiSentences() {
  const data = await window.JapaneseService.generateSentences({
    words: state.words,
    sentences: state.sentences.slice(0, 120),
    generationOptions: state.generationOptions,
    prompt: buildGeminiPrompt()
  });
  return normalizeAiSentences(data.sentences || []);
}

async function testGeminiApiKey() {
  if (!window.JapaneseService?.isRemoteReady()) {
    setGeminiKeyStatus("Supabase 환경변수가 설정되지 않았습니다.");
    showToast("Cloudflare Pages 환경변수를 먼저 설정해 주세요.");
    return;
  }

  elements.testGeminiKeyBtn.disabled = true;
  elements.testGeminiKeyBtn.textContent = "테스트 중...";
  setAiStatus("Supabase 연결을 테스트하고 있습니다...");

  try {
    const remoteWords = await window.JapaneseService.listWords();
    await loadWordsFromSupabase();
    setAiStatus("Supabase 연결 테스트 성공.");
    setGeminiKeyStatus(`Supabase 연결 성공 · 테이블 단어 ${remoteWords.length}개 조회됨`);
    showToast(`Supabase에서 단어 ${remoteWords.length}개를 조회했습니다.`);
  } catch (error) {
    const message = getAiErrorMessage(error);
    setAiStatus(message);
    setGeminiKeyStatus(message);
    showToast(message);
  } finally {
    elements.testGeminiKeyBtn.disabled = false;
    elements.testGeminiKeyBtn.textContent = "DB 연결 확인";
  }
}

async function testAiConnection() {
  if (!window.JapaneseService?.isRemoteReady()) {
    setAiConnectionStatus("Supabase 환경변수를 먼저 설정해 주세요.");
    showToast("Supabase 연결 설정이 필요합니다.");
    return;
  }

  elements.testAiConnectionBtn.disabled = true;
  elements.testAiConnectionBtn.textContent = "AI 연결 확인 중...";
  setAiConnectionStatus();

  try {
    if (typeof window.JapaneseService.testAiConnection === "function") {
      await window.JapaneseService.testAiConnection();
    } else if (typeof window.JapaneseService.generateSentences === "function") {
      await window.JapaneseService.generateSentences({
        prompt: "연결 확인입니다. 반드시 {\"sentences\":[]} JSON만 반환하세요."
      });
    } else {
      throw new Error("AI 서비스 파일이 최신 버전이 아닙니다. 앱을 새로고침해 주세요.");
    }
    setAiConnectionStatus();
    showToast("AI 연결 테스트에 성공했습니다.");
  } catch (error) {
    const message = getAiErrorMessage(error);
    setAiConnectionStatus(message);
    showToast(message);
  } finally {
    elements.testAiConnectionBtn.disabled = false;
    elements.testAiConnectionBtn.textContent = "AI 연결 확인";
  }
}

function buildGeminiPrompt() {
  const words = state.words.map((word) => ({
    japanese: word.jp,
    readingKorean: word.reading,
    meaningKorean: word.meaning,
    translation: word.translation,
    pos: word.pos,
    semanticTags: word.semanticTags,
    grammar: word.grammar,
    generation: word.generation,
    legacyCategory: word.legacyCategory
  }));
  const currentSentences = state.sentences.slice(0, 120).map((sentence, index) => ({
    no: index + 1,
    jp: sentence.jp,
    reading: sentence.reading,
    meaning: sentence.meaning,
    literalMeaning: sentence.literalMeaning,
    naturalMeaning: sentence.naturalMeaning,
    style: sentence.style,
    source: sentence.category === "AI" ? "AI" : "rule"
  }));

  return [
    "너는 일본어 초보 학습용 예문 검수자이자 생성기다.",
    "이 앱의 단어 DB 입력 형식은 영구 고정이다: 일본어/한국어발음/한국어뜻/pos/semanticTags.",
    `허용 pos는 이것뿐이다: ${VALID_POS.join(", ")}. 새로운 pos를 만들지 마라.`,
    "pos는 반드시 일본어 문법 기준으로 판단해라. semanticTags에는 food, drink, person, study, work, emotion, distance, appearance, taste처럼 의미 정보만 넣어라.",
    "동사와 형용사는 사전형 단어만 기준으로 사용해라. すきです, わかりました, やってみます 같은 활용형을 별도 단어처럼 취급하지 마라.",
    "です/ます, plain/polite 문체는 단어가 아니라 문장 생성 규칙으로 처리해라.",
    "한국어 발음 표기에서 장음은 항상 같은 규칙으로 표기해라. 예: 오오, 유우, 에이, 토우처럼 일관되게 써라.",
    `semanticTags는 항상 이 순서 기준으로 판단해라: ${SEMANTIC_TAG_ORDER.join(", ")}.`,
    "한국어 뜻은 기본 의미를 쉼표(,)로 연결하고 뜻 필드에 / 를 쓰지 마라.",
    "같은 일본어와 같은 pos의 단어는 하나로 취급하고, 여러 뜻과 semanticTags는 합친 하나의 단어로 판단해라.",
    "から는 '~부터'이면 particle/time, '~때문에'이면 conjunction/reason으로 구분하고, まで는 particle/time, けど는 conjunction/contrast로 판단해라.",
    "fixed_expression은 회화에서 하나의 표현으로 외우는 인사말과 관용 표현에만 사용해라. 활용 가능한 일반 동사나 형용사는 fixed_expression으로 보지 마라.",
    `현재 생성 옵션: ${JSON.stringify(state.generationOptions)}`,
    "아래 등록 단어와 현재 문장 목록을 바탕으로 문장을 검수하고 생성해라.",
    "category 하나로 판단하지 말고 pos, semanticTags, grammar, generation을 기준으로 단어를 골라라.",
    "문장을 만들 때는 먼저 문장 템플릿을 정하고, 각 슬롯에 필요한 pos/semanticTags/grammar 조건에 맞는 단어만 사용해라.",
    "의미가 어색한 문장, 한국어 뜻이 부자연스러운 문장, 일본어가 초급 학습용으로 어색한 문장은 자연스럽게 고쳐라.",
    "괜찮은 문장은 비슷한 난이도의 더 자연스러운 표현으로 유지하거나 개선해라.",
    "현재 문장이 부족하면 등록 단어 기반으로 새 문장을 추가해라.",
    "particle, auxiliary, conjunction, interjection, prefix, suffix, fixed_expression, sentence_pattern은 무작위 조합 대상으로 쓰지 마라.",
    "단, けど/から/まで 같은 particle/conjunction은 pos와 semanticTags가 맞는 문장 템플릿 안에서만 문법 요소로 사용해라.",
    "fixed_expression은 다른 단어와 억지로 조합하지 말고 저장된 표현 그대로만 사용해라.",
    "조사는 문장 템플릿과 문법 조건으로 결정하되, 등록된 particle/conjunction 단어의 의미가 '~부터', '~까지', '~때문에', '~지만'인지 확인해 용도를 구분해라.",
    "형용사는 applicableTags가 맞는 명사에만 붙여라.",
    "あります는 animate=false 대상에만, います는 animate=true 대상에만 사용해라.",
    "이동 동사는 place/facility/city/country 태그가 있는 목적지와만 사용해라.",
    "먹다/마시다/공부하다 계열 동사는 caseFrame과 대상 semanticTags가 맞을 때만 사용해라.",
    "당신, 너, あなた를 주어로 쓰는 문장은 만들지 마라. 기본 주어는 わたし를 사용해라.",
    "jpStyle=polite이면 일본어는 です/ます체, jpStyle=plain이면 보통체로 통일해라.",
    "krStyle=polite이면 한국어는 존댓말, krStyle=plain이면 반말로 통일해라.",
    "translationMode=literal이면 meaning은 literalMeaning과 같게, natural이면 meaning은 naturalMeaning과 같게 해라.",
    "단어의 translation.dictionary/natural/polite/plain을 참고해서 직역과 자연번역을 섞지 마라.",
    "한국어 뜻은 선택한 krStyle과 translationMode에 맞게 써라. 예: '당신이 좋습니다' 같은 문장은 금지.",
    "각 문장은 초급자가 외우기 쉽게 1문장으로 만들고, 일본어/한국어 발음 표기/한국어 뜻/직역/자연번역/style을 모두 제공해라.",
    "나쁜 예: '맥주에 갑니다', '카페를 마십니다', '사람이あります', '커피가います', '당신이 좋습니다'.",
    "나쁜 예: JP가 です체인데 KR이 반말인 문장, JP가 보통체인데 KR이 존댓말인 문장.",
    "JSON만 출력해라. 마크다운 금지.",
    "형식: {\"sentences\":[{\"jp\":\"...\",\"reading\":\"...\",\"meaning\":\"...\",\"literalMeaning\":\"...\",\"naturalMeaning\":\"...\",\"style\":{\"jpStyle\":\"polite|plain\",\"krStyle\":\"polite|plain\",\"translationMode\":\"literal|natural\"}}]}",
    "최대 100개.",
    `등록 단어: ${JSON.stringify(words)}`,
    `현재 문장 목록: ${JSON.stringify(currentSentences)}`
  ].join("\n");
}

function parseAiJson(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);

  const parsed = JSON.parse(jsonText);
  return Array.isArray(parsed.sentences) ? parsed.sentences : [];
}

function normalizeAiSentences(sentences) {
  return sentences
    .map((sentence) => {
      const style = normalizeSentenceStyle(sentence.style || state.generationOptions);
      const literalMeaning = cleanInputPart(sentence.literalMeaning || sentence.meaning);
      const naturalMeaning = cleanInputPart(sentence.naturalMeaning || sentence.meaning);
      return {
        jp: cleanInputPart(sentence.jp),
        reading: cleanInputPart(sentence.reading),
        meaning: cleanInputPart(style.translationMode === "literal" ? literalMeaning : naturalMeaning),
        literalMeaning,
        naturalMeaning,
        style
      };
    })
    .filter((sentence) => sentence.jp && sentence.reading && sentence.meaning)
    .map((sentence) => ({
      ...sentence,
      id: makeSentenceId(`ai-${sentence.jp}-${sentence.meaning}`),
      sourceIds: [],
      category: "AI"
    }));
}

function getAiErrorMessage(error) {
  const message = String(error.message || "");
  if (error.code === "AI_TIMEOUT" || /5분을 초과|timed? ?out|timeout/i.test(message)) {
    return "AI 응답이 5분 안에 오지 않아 요청을 중단했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const quotaLike = error.status === 429 || /quota|rate|limit|exhausted|credit/i.test(message);
  if (quotaLike) {
    return "AI 무료 사용량 또는 credit이 소진되어 지금은 사용할 수 없습니다.";
  }

  if (error.status === 400 || error.status === 401 || error.status === 403) {
    return `Cloudflare Pages의 GEMINI_API_KEY 또는 Gemini API 권한을 확인해 주세요. (${error.status}: ${shortenMessage(message)})`;
  }

  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return "Cloudflare Pages Function 연결에 실패했습니다. GEMINI_API_KEY와 Pages 배포 상태를 확인해 주세요.";
  }

  if (message === "EMPTY_AI_RESULT") {
    return "AI가 문장을 만들지 못했습니다. 단어를 더 추가해 주세요.";
  }

  return `AI 문장 생성에 실패했습니다. ${shortenMessage(message)}`;
}

function shortenMessage(message) {
  return String(message || "알 수 없는 오류").slice(0, 160);
}

function setAiStatus(message) {
  elements.aiStatus.textContent = message;
}

function setGeminiKeyStatus(message) {
  const isError = /실패|오류|미설정|설정되지|입력해|확인해|필요|없(?:는|습니다)/.test(message);
  elements.geminiKeyStatus.textContent = isError ? message : "";
  elements.geminiKeyStatus.classList.toggle("hidden", !isError);
}

function setAiConnectionStatus(message = "") {
  elements.aiConnectionStatus.textContent = message;
  elements.aiConnectionStatus.classList.toggle("hidden", !message);
}

function setAiLoading(isLoading, label = "생성 중...") {
  elements.generateAiBtn.disabled = isLoading;
  elements.generateAiBtn.textContent = isLoading ? label : "문장 생성 (with AI)";
}

function exportJson() {
  const data = {
    words: state.words,
    marks: state.marks,
    aiSentences: state.aiSentences,
    generationOptions: state.generationOptions,
    exportedAt: new Date().toISOString()
  };
  elements.exportOutput.value = JSON.stringify(data, null, 2);
  showToast("JSON을 만들었습니다.");
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.words)) throw new Error("Invalid words");
      state.words = data.words.map((word) => cleanStoredWord({
        id: word.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        jp: String(word.jp || ""),
        reading: String(word.reading || ""),
        meaning: String(word.meaning || ""),
        translation: word.translation || null,
        pos: String(word.pos || ""),
        semanticTags: word.semanticTags || "",
        grammar: word.grammar || {},
        generation: word.generation || null,
        legacyCategory: String(word.legacyCategory || word.category || "")
      })).filter(Boolean);
      state.marks = data.marks || {};
      state.aiSentences = Array.isArray(data.aiSentences) ? data.aiSentences.map(cleanStoredSentence) : [];
      if (data.generationOptions) {
        state.generationOptions = normalizeSentenceStyle(data.generationOptions);
        syncGenerationOptionInputs();
      }
      saveWords();
      saveMarks();
      saveAiSentences();
      generateSentences();
      renderAll();
      showToast("JSON을 가져왔습니다.");
    } catch (error) {
      showToast("가져올 수 없는 JSON입니다.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

async function resetLocalCache() {
  const ok = confirm("이 기기에 저장된 캐시만 초기화할까요? Supabase 공용 데이터는 삭제되지 않습니다.");
  if (!ok) return;
  state.words = [];
  state.marks = {};
  state.aiSentences = [];
  state.wordStudyIndex = 0;
  state.wordStudyShowAnswer = false;
  resetWordStudyFilters();
  state.generationOptions = normalizeSentenceStyle();
  saveGenerationOptions();
  syncGenerationOptionInputs();
  saveWords();
  saveMarks();
  saveAiSentences();
  generateSentences();
  renderAll();
  showToast("이 기기 캐시를 초기화했습니다. Supabase 데이터는 유지됩니다.");
  await loadWordsFromSupabase();
}

function getSupabaseDisplayUrl() {
  return APP_CONFIG.SUPABASE_URL || "환경변수 미설정";
}

function handleGeminiKeyInput() {
  setGeminiKeyStatus(getSupabaseStatusMessage());
}

function saveGeminiApiKey() {
  setGeminiKeyStatus(getSupabaseStatusMessage());
  elements.saveGeminiKeyBtn.textContent = "확인됨";
  setTimeout(() => {
    elements.saveGeminiKeyBtn.textContent = "DB 설정 확인";
  }, 1800);
  showToast(getSupabaseStatusMessage());
}

function clearGeminiApiKey() {
  elements.geminiApiKeyInput.value = getSupabaseDisplayUrl();
  setGeminiKeyStatus(getSupabaseStatusMessage());
  showToast("Supabase 설정 상태를 새로고침했습니다.");
}

function getSupabaseStatusMessage() {
  return window.JapaneseService?.isRemoteReady()
    ? `Supabase 설정됨: ${getSupabaseDisplayUrl()}`
    : "Supabase 미설정: Cloudflare Pages 환경변수를 입력해 주세요.";
}

function installPwa() {
  if (!state.deferredInstallPrompt) return;
  state.deferredInstallPrompt.prompt();
  state.deferredInstallPrompt.userChoice.finally(() => {
    state.deferredInstallPrompt = null;
    elements.installBtn.classList.add("hidden");
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {
      showToast("서비스 워커 등록에 실패했습니다.");
    });
  }
}

function randomIndex(length) {
  return Math.floor(Math.random() * length);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

init();
