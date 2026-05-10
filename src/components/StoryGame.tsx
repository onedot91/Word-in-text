import { useMemo, useState } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { ArrowLeft, BookOpen, CheckCircle2, RotateCcw, Sparkles, Star, XCircle } from "lucide-react";
import { DialogueLine, StoryAdventure, StoryCharacter, StoryChoice, StoryScene, VocabularyWord } from "../types";
import bookshelfCornerBackground from "../assets/backgrounds/bookshelf-corner.png";
import classroomLibraryBackground from "../assets/backgrounds/classroom-library.png";
import quietHallwayBackground from "../assets/backgrounds/quiet-hallway.png";
import secretLibraryBackground from "../assets/backgrounds/secret-library.png";

interface StoryGameProps {
  adventure: StoryAdventure;
  playerName: string;
  onBack: () => void;
}

interface GameState {
  sceneId: string;
  score: number;
  flags: string[];
  learnedWords: string[];
  reviewWords: string[];
  relationships: Record<string, number>;
  path: string[];
}

const intentStyle = {
  correct: "border-emerald-700 bg-emerald-50",
  partial: "border-amber-700 bg-amber-50",
  wrong: "border-rose-700 bg-rose-50",
};

export function StoryGame({ adventure, playerName, onBack }: StoryGameProps) {
  const [state, setState] = useState<GameState>(() => createInitialState(adventure.startSceneId));
  const [lineIndex, setLineIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<StoryChoice | null>(null);
  const [showNotebook, setShowNotebook] = useState(false);

  const scene = useMemo(
    () => adventure.scenes.find((item) => item.id === state.sceneId) ?? adventure.scenes[0],
    [adventure.scenes, state.sceneId],
  );
  const currentLine = scene.lines[Math.min(lineIndex, scene.lines.length - 1)];
  const isDialogueComplete = lineIndex >= scene.lines.length - 1;
  const focusWord = scene.focusWordId ? findWord(adventure.words, scene.focusWordId) : undefined;
  const learnedWords = toWords(adventure.words, state.learnedWords);
  const reviewWords = toWords(
    adventure.words,
    state.reviewWords.filter((id) => !state.learnedWords.includes(id)),
  );
  const playableSceneCount = adventure.scenes.filter((item) => item.choices.length > 0).length;
  const progress = Math.round(((state.path.length - 1) / Math.max(playableSceneCount, 1)) * 100);

  const advanceLine = () => {
    if (selectedChoice) return;
    setLineIndex((current) => Math.min(current + 1, scene.lines.length - 1));
  };

  const choose = (choice: StoryChoice) => {
    if (selectedChoice) return;
    setSelectedChoice(choice);

    if (choice.intent === "correct") {
      confetti({
        particleCount: 36,
        spread: 52,
        origin: { y: 0.78 },
        colors: ["#10B981", "#F59E0B", "#38BDF8"],
      });
    }

    window.setTimeout(() => {
      setState((current) => ({
        sceneId: choice.effect.nextSceneId,
        score: current.score + choice.effect.score,
        flags: unique([...current.flags, ...(choice.effect.flags ?? [])]),
        learnedWords: unique([...current.learnedWords, ...(choice.effect.learnedWords ?? []), ...(choice.wordId ? [choice.wordId] : [])]),
        reviewWords: unique([...current.reviewWords, ...(choice.effect.reviewWords ?? [])]),
        relationships: mergeTrust(current.relationships, choice.effect.trust),
        path: [...current.path, choice.effect.nextSceneId],
      }));
      setLineIndex(0);
      setSelectedChoice(null);
    }, 950);
  };

  const restart = () => {
    setState(createInitialState(adventure.startSceneId));
    setLineIndex(0);
    setSelectedChoice(null);
    setShowNotebook(false);
  };

  return (
    <main className="h-screen overflow-hidden bg-[#F7F3EA] px-3 py-3 text-slate-950 sm:px-5 sm:py-5">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-3">
        <GameHeader score={state.score} progress={progress} onBack={onBack} onNotebook={() => setShowNotebook(true)} />

        <article className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border-2 border-slate-950 bg-[#DDEFE7] shadow-[8px_8px_0_#111827]">
          <SceneBackdrop scene={scene} />

          <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div className="rounded-full border-2 border-slate-950 bg-white/95 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#111827] backdrop-blur">
              {scene.chapter} · {scene.location}
            </div>
          </div>

          <CharacterStage characters={adventure.characters} line={currentLine} />

          <div className="relative z-20 mt-auto p-3 pt-0 sm:p-5 sm:pt-0">
            <SimpleDialogue
              scene={scene}
              line={currentLine}
              focusWord={focusWord}
              characters={adventure.characters}
              playerName={playerName}
              isComplete={isDialogueComplete}
              selectedChoice={selectedChoice}
              onNext={advanceLine}
              onChoose={choose}
            />
          </div>
        </article>
      </div>

      {showNotebook && (
        <NotebookModal
          focusWord={focusWord}
          learnedWords={learnedWords}
          reviewWords={reviewWords}
          flags={state.flags}
          onClose={() => setShowNotebook(false)}
        />
      )}

      {scene.ending && isDialogueComplete && (
        <EndingOverlay
          scene={scene}
          score={state.score}
          learnedWords={learnedWords}
          reviewWords={reviewWords}
          playerName={playerName}
          onRestart={restart}
          onBack={onBack}
        />
      )}

      {selectedChoice && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border-2 p-4 text-center shadow-[5px_5px_0_#111827] ${intentStyle[selectedChoice.intent]}`}
        >
          <p className="break-keep text-xl font-black leading-8">{formatPlayerName(selectedChoice.feedback, playerName)}</p>
        </motion.div>
      )}
    </main>
  );
}

function GameHeader({
  score,
  progress,
  onBack,
  onNotebook,
}: {
  score: number;
  progress: number;
  onBack: () => void;
  onNotebook: () => void;
}) {
  return (
    <header className="flex items-center gap-2 sm:gap-3">
      <button
        onClick={onBack}
        className="inline-flex h-[52px] min-h-[52px] items-center gap-2 rounded-2xl border-2 border-slate-950 bg-white px-4 text-base font-black shadow-[3px_3px_0_#111827] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <ArrowLeft size={20} />
        처음
      </button>
      <div className="min-w-0 flex-1 rounded-full border-2 border-slate-950 bg-white p-1 shadow-[3px_3px_0_#111827]">
        <div className="h-4 rounded-full bg-emerald-500" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      <div className="flex h-[52px] min-h-[52px] items-center gap-2 rounded-2xl border-2 border-slate-950 bg-[#FDE68A] px-4 text-base font-black shadow-[3px_3px_0_#111827]">
        <Star size={19} fill="currentColor" />
        {score}
      </div>
      <button
        onClick={onNotebook}
        className="hidden h-[52px] min-h-[52px] items-center gap-2 rounded-2xl border-2 border-slate-950 bg-[#BFDBFE] px-4 text-base font-black shadow-[3px_3px_0_#111827] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-300 active:translate-x-1 active:translate-y-1 active:shadow-none sm:inline-flex"
      >
        <BookOpen size={19} />
        낱말
      </button>
    </header>
  );
}

function SceneBackdrop({ scene }: { scene: StoryScene }) {
  const background = getSceneBackground(scene.id);

  return (
    <div className="absolute inset-0">
      <img src={background} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-white/20" />
      <div className="absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-white/45 to-transparent" />
    </div>
  );
}

function getSceneBackground(sceneId: string) {
  if (sceneId === "under-shelf") return bookshelfCornerBackground;
  if (sceneId === "quiet-hall") return quietHallwayBackground;
  if (["library-door", "misunderstanding", "notebook", "cause-room", "last-voice", "ending-soft"].includes(sceneId)) {
    return secretLibraryBackground;
  }
  return classroomLibraryBackground;
}

function CharacterStage({ characters, line }: { characters: StoryCharacter[]; line?: DialogueLine }) {
  const friends = characters.filter((character) => ["rumi", "daram", "bambi"].includes(character.id));
  const activeId = line?.speakerId;

  return (
    <div className="relative z-10 flex flex-1 items-end justify-center gap-3 px-3 pb-1 sm:gap-8 sm:pb-2 lg:gap-10">
      {friends.map((character, index) => {
        const isActive = activeId === character.id || (!activeId && index === 1);
        return (
          <motion.div
            key={character.id}
            animate={{ y: isActive ? -12 : 0, opacity: isActive ? 1 : 0.55, scale: isActive ? 1.05 : 0.94 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className={`relative flex flex-col items-center ${character.image ? "w-52 sm:w-64 lg:w-72" : "w-32 sm:w-48 lg:w-52"}`}
          >
            {isActive && <div className="absolute -inset-x-5 bottom-10 top-3 rounded-full bg-white/45 blur-xl" />}
            {character.image ? (
              <div className="relative flex aspect-[3/4] w-full translate-y-5 items-end justify-center">
                <img
                  src={character.image}
                  alt=""
                  className="max-h-full max-w-full object-contain drop-shadow-[5px_6px_0_rgba(17,24,39,0.35)]"
                />
              </div>
            ) : (
              <div
                className="relative flex aspect-[3/4] w-full items-end justify-center rounded-t-[44px] border-2 border-slate-950 shadow-[5px_5px_0_rgba(17,24,39,0.45)]"
                style={{ backgroundColor: character.color }}
              >
                <div className="mb-7 h-20 w-20 rounded-full border-2 border-slate-950 bg-white sm:mb-10 sm:h-24 sm:w-24" style={{ boxShadow: `0 12px 0 ${character.accent}` }} />
              </div>
            )}
            <div className={`relative mt-2 rounded-full border-2 border-slate-950 bg-white px-3 py-1 text-base font-black shadow-[2px_2px_0_#111827] ${isActive ? "" : "grayscale"}`}>
              {character.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function SimpleDialogue({
  scene,
  line,
  focusWord,
  characters,
  playerName,
  isComplete,
  selectedChoice,
  onNext,
  onChoose,
}: {
  scene: StoryScene;
  line?: DialogueLine;
  focusWord?: VocabularyWord;
  characters: StoryCharacter[];
  playerName: string;
  isComplete: boolean;
  selectedChoice: StoryChoice | null;
  onNext: () => void;
  onChoose: (choice: StoryChoice) => void;
}) {
  const speaker = getSpeaker(line?.speakerId, characters, playerName);

  return (
    <section className={`rounded-[24px] border-2 border-slate-950 bg-white/98 shadow-[7px_7px_0_#111827] backdrop-blur ${isComplete ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}>
      <div className={`${isComplete ? "mb-2" : "mb-4"} flex items-center gap-3`}>
        <SpeakerLabel speaker={speaker} fallback={line?.speakerId === "seed" ? "작은 목소리" : ""} />
      </div>

      <div className={`${isComplete ? "gap-2" : "gap-4"} flex flex-col sm:flex-row sm:items-end sm:justify-between`}>
        <p className={`min-w-0 flex-1 break-keep font-black text-slate-950 ${isComplete ? "min-h-0 text-[1.55rem] leading-[1.45] sm:text-[1.9rem]" : "min-h-20 text-[1.7rem] leading-[1.58] sm:text-[2.05rem]"}`}>
          {renderLineText(formatPlayerName(line?.text ?? "", playerName), scene.focusText ?? focusWord?.word)}
        </p>

        {!isComplete && (
          <button
            onClick={onNext}
            className="ml-auto inline-flex min-h-14 min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-2xl border-2 border-slate-950 bg-slate-950 px-6 py-3 text-lg font-black text-white shadow-[3px_3px_0_#94A3B8] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-300 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            다음
          </button>
        )}
      </div>

      {isComplete && scene.choices.length > 0 && (
        <div className="mt-3 border-t-2 border-slate-100 pt-3">
          <h2 className="mb-2 max-w-[28em] break-keep text-[1.35rem] font-black leading-snug sm:text-[1.55rem]">{formatPlayerName(scene.prompt ?? "", playerName)}</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {scene.choices.map((choice) => {
              const isSelected = selectedChoice?.id === choice.id;
              return (
                <button
                  key={choice.id}
                  disabled={Boolean(selectedChoice)}
                  onClick={() => onChoose(choice)}
                  className={`relative min-h-20 rounded-2xl border-2 bg-white p-3 pr-11 text-left text-lg font-black leading-7 shadow-[3px_3px_0_#111827] transition-all hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-default disabled:opacity-75 sm:text-xl ${
                    isSelected ? intentStyle[choice.intent] : "border-slate-950"
                  }`}
                >
                  <span className="break-keep">{choice.text}</span>
                  {isSelected && <ChoiceResultIcon intent={choice.intent} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function ChoiceResultIcon({ intent }: { intent: StoryChoice["intent"] }) {
  const isCorrect = intent === "correct";
  const Icon = isCorrect ? CheckCircle2 : XCircle;
  const colorClass = isCorrect ? "text-emerald-700" : "text-rose-700";

  return (
    <span className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white">
      <Icon className={colorClass} size={24} />
    </span>
  );
}

function SpeakerLabel({ speaker, fallback }: { speaker?: StoryCharacter; fallback: string }) {
  if (!speaker && !fallback) return null;

  if (!speaker) {
    return (
      <div className="mt-1 inline-flex rounded-xl border-2 border-slate-950 bg-slate-100 px-4 py-2 text-2xl font-black shadow-[3px_3px_0_#111827] sm:text-3xl">
        {fallback}
      </div>
    );
  }

  return (
    <div
      className="mt-1 inline-flex rounded-xl border-2 border-slate-950 px-4 py-2 text-2xl font-black shadow-[3px_3px_0_#111827] sm:text-3xl"
      style={{ backgroundColor: speaker.color, color: speaker.accent }}
    >
      {speaker.name}
    </div>
  );
}

function getSpeaker(speakerId: string | undefined, characters: StoryCharacter[], playerName: string) {
  if (speakerId === "player") {
    return {
      id: "player",
      name: playerName,
      role: "주인공",
      color: "#F8FAFC",
      accent: "#111827",
    };
  }

  return speakerId ? characters.find((character) => character.id === speakerId) : undefined;
}

function renderLineText(text: string, focusWord?: string) {
  if (!focusWord || !text.includes(focusWord)) return text;

  const parts = text.split(focusWord);
  return parts.flatMap((part, index) => {
    if (index === parts.length - 1) return [part];
    return [
      part,
      <mark key={`${focusWord}-${index}`} className="inline-block rounded-lg bg-emerald-100 px-1.5 py-0.5 text-emerald-950">
        {focusWord}
      </mark>,
    ];
  });
}

function formatPlayerName(text: string, playerName: string) {
  return text.replaceAll("{player}", playerName);
}

function NotebookModal({
  focusWord,
  learnedWords,
  reviewWords,
  flags,
  onClose,
}: {
  focusWord?: VocabularyWord;
  learnedWords: VocabularyWord[];
  reviewWords: VocabularyWord[];
  flags: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-2xl rounded-[24px] border-2 border-slate-950 bg-white p-5 shadow-[8px_8px_0_#111827]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-3xl font-black">낱말장</h2>
          <button onClick={onClose} className="rounded-2xl border-2 border-slate-950 bg-slate-950 px-4 py-2 text-lg font-black text-white shadow-[3px_3px_0_#94A3B8] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none">
            닫기
          </button>
        </div>

        {focusWord && (
          <article className="mb-4 rounded-2xl bg-emerald-50 p-4 ring-2 ring-emerald-100">
            <p className="text-sm font-black text-emerald-800">오늘의 낱말</p>
            <h3 className="mt-1 text-4xl font-black">{focusWord.word}</h3>
            <p className="mt-2 break-keep text-xl font-bold leading-8">{focusWord.meaning}</p>
          </article>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniList title="배운 낱말" items={learnedWords.map((word) => word.word)} empty="아직 없어요." />
          <MiniList title="다시 볼 낱말" items={reviewWords.map((word) => word.word)} empty="아직 없어요." />
          <MiniList title="찾은 단서" items={flagsToText(flags)} empty="아직 없어요." />
        </div>
      </div>
    </div>
  );
}

function MiniList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3">
      <h3 className="mb-2 text-lg font-black">{title}</h3>
      <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
        {items.length === 0 ? (
          <span className="text-base font-bold text-slate-500">{empty}</span>
        ) : (
          items.slice(0, 12).map((item) => (
            <span key={item} className="rounded-full bg-white px-3 py-1 text-sm font-black">
              {item}
            </span>
          ))
        )}
      </div>
    </section>
  );
}

function EndingOverlay({
  scene,
  score,
  learnedWords,
  reviewWords,
  playerName,
  onRestart,
  onBack,
}: {
  scene: StoryScene;
  score: number;
  learnedWords: VocabularyWord[];
  reviewWords: VocabularyWord[];
  playerName: string;
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-[28px] border-2 border-slate-950 bg-white p-6 text-center shadow-[8px_8px_0_#111827]"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-950 bg-[#FDE68A] shadow-[4px_4px_0_#111827]">
          <Sparkles size={42} fill="currentColor" />
        </div>
        <p className="text-lg font-black text-slate-500">점수 {score}</p>
        <h2 className="mt-1 break-keep text-4xl font-black">{scene.ending?.title}</h2>
        <p className="mx-auto mt-3 max-w-xl break-keep text-xl font-bold leading-8 text-slate-700">{formatPlayerName(scene.ending?.message ?? "", playerName)}</p>
        <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-left sm:grid-cols-2">
          <MiniList title="잘 쓴 낱말" items={learnedWords.map((word) => word.word)} empty="아직 없어요." />
          <MiniList title="다시 볼 낱말" items={reviewWords.map((word) => word.word)} empty="없어요." />
        </div>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-950 bg-[#FDE68A] px-5 py-3 text-lg font-black shadow-[4px_4px_0_#111827] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <RotateCcw size={20} />
            다시 하기
          </button>
          <button onClick={onBack} className="rounded-2xl border-2 border-slate-950 bg-slate-950 px-5 py-3 text-lg font-black text-white shadow-[4px_4px_0_#94A3B8] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none">
            처음으로
          </button>
        </div>
      </motion.section>
    </div>
  );
}

function createInitialState(startSceneId: string): GameState {
  return {
    sceneId: startSceneId,
    score: 0,
    flags: [],
    learnedWords: [],
    reviewWords: [],
    relationships: {},
    path: [startSceneId],
  };
}

function findWord(words: VocabularyWord[], id: string) {
  return words.find((word) => word.id === id);
}

function toWords(words: VocabularyWord[], ids: string[]) {
  return unique(ids)
    .map((id) => findWord(words, id))
    .filter(Boolean) as VocabularyWord[];
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

function mergeTrust(current: Record<string, number>, next?: Record<string, number>) {
  if (!next) return current;
  const merged = { ...current };
  for (const [id, value] of Object.entries(next)) {
    merged[id] = (merged[id] ?? 0) + value;
  }
  return merged;
}

function flagsToText(flags: string[]) {
  const labels: Record<string, string> = {
    saw_footprints: "발자국",
    read_board: "칠판 글",
    missed_first_clue: "놓친 단서",
    found_note: "쪽지",
    smelled_pollen: "꽃향기",
    pollen_scattered: "흩어진 가루",
    compared_pollen: "꽃가루 차이",
    found_common: "공통점",
    guessed_library: "도서관",
    classified_cards: "단어 카드",
    friends_reconciled: "풀린 오해",
    kept_record: "공책 기록",
    understood_cause: "사라진 까닭",
    seed_restored: "씨앗",
    seed_found: "씨앗",
  };
  return flags.map((flag) => labels[flag] ?? flag);
}
