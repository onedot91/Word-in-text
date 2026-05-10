import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, ChevronDown, Star, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { StoryAdventure, StoryChoice, StoryScene } from "../types";

const KOREAN_CHOICE_LABELS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ"];

interface StoryGameProps {
  adventure: StoryAdventure;
  onBack: () => void;
}

export function StoryGame({ adventure, onBack }: StoryGameProps) {
  const [sceneId, setSceneId] = useState(adventure.startSceneId);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(0);
  const [scenePath, setScenePath] = useState([adventure.startSceneId]);
  const [showPreviousScenes, setShowPreviousScenes] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<StoryChoice | null>(null);
  const [visibleChars, setVisibleChars] = useState(0);
  const [visibleChoices, setVisibleChoices] = useState(0);
  const storyScrollRef = useRef<HTMLDivElement>(null);
  const currentSceneRef = useRef<HTMLElement | null>(null);
  const typingAnchorRef = useRef<HTMLDivElement | null>(null);

  const scene = useMemo(() => adventure.scenes.find((item) => item.id === sceneId) ?? adventure.scenes[0], [adventure.scenes, sceneId]);
  const previousScenes = scenePath
    .slice(0, -1)
    .map((pathSceneId) => adventure.scenes.find((item) => item.id === pathSceneId))
    .filter((item): item is StoryScene => Boolean(item));
  const progress = Math.round((step / Math.max(adventure.scenes.length - 1, 1)) * 100);
  const fullText = scene.narrative.join("\n");
  const isTextComplete = visibleChars >= fullText.length;
  const focusWord = scene.focusWordId ? adventure.words.find((word) => word.id === scene.focusWordId)?.word : undefined;
  const shouldHideFocusWord = scene.questionType === "blank" || scene.questionType === "definitionToWord" || scene.questionType === "situation";
  const choices = useMemo(() => stableShuffle(scene.choices, scene.id), [scene.choices, scene.id]);

  useEffect(() => {
    setVisibleChars(0);
    setVisibleChoices(0);

    const intervalId = window.setInterval(() => {
      setVisibleChars((current) => {
        if (current >= fullText.length) {
          window.clearInterval(intervalId);
          return current;
        }
        return current + 1;
      });
    }, 45);

    return () => window.clearInterval(intervalId);
  }, [fullText]);

  useEffect(() => {
    if (!isTextComplete || scene.ending) return;

    setVisibleChoices(0);
    const intervalId = window.setInterval(() => {
      setVisibleChoices((current) => {
        if (current >= choices.length) {
          window.clearInterval(intervalId);
          return current;
        }
        return current + 1;
      });
    }, 300);

    return () => window.clearInterval(intervalId);
  }, [isTextComplete, choices.length, scene.ending]);

  useLayoutEffect(() => {
    const element = storyScrollRef.current;
    const currentSceneElement = currentSceneRef.current;
    if (!element || !currentSceneElement) return;

    window.requestAnimationFrame(() => {
      const elementTop = element.getBoundingClientRect().top;
      const sceneTop = currentSceneElement.getBoundingClientRect().top;

      element.scrollTo({
        top: Math.max(element.scrollTop + sceneTop - elementTop - 24, 0),
        behavior: "auto",
      });
    });
  }, [sceneId]);

  useLayoutEffect(() => {
    const element = storyScrollRef.current;
    const anchor = typingAnchorRef.current;
    const currentSceneElement = currentSceneRef.current;
    if (!element || !anchor || !currentSceneElement) return;

    window.requestAnimationFrame(() => {
      const elementRect = element.getBoundingClientRect();
      const sceneRect = currentSceneElement.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const sceneTopOffset = sceneRect.top - elementRect.top;
      const currentSceneFits = sceneRect.height <= elementRect.height - 56;

      if (sceneTopOffset > 36 || (currentSceneFits && sceneTopOffset < 16)) {
        element.scrollTo({
          top: Math.max(element.scrollTop + sceneTopOffset - 24, 0),
          behavior: "auto",
        });
        return;
      }

      if (currentSceneFits) return;

      const isBelowView = anchorRect.bottom > elementRect.bottom - 24;

      if (!isBelowView) return;

      element.scrollTo({
        top: element.scrollTop + anchorRect.bottom - elementRect.bottom + 40,
        behavior: "auto",
      });
    });
  }, [visibleChars, sceneId]);

  const choose = (choice: StoryChoice) => {
    if (selectedChoice) return;

    setSelectedChoice(choice);
    setScore((current) => current + choice.points);

    if (choice.points > 0) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.82 },
        colors: ["#4ECDC4", "#FFD93D", "#FF6B6B"],
      });
    }

    window.setTimeout(() => {
      setSceneId(choice.nextSceneId);
      setScenePath((current) => [...current, choice.nextSceneId]);
      setStep((current) => current + 1);
      setShowPreviousScenes(false);
      setSelectedChoice(null);
    }, 1300);
  };

  const restart = () => {
    setSceneId(adventure.startSceneId);
    setScenePath([adventure.startSceneId]);
    setScore(0);
    setStep(0);
    setShowPreviousScenes(false);
    setSelectedChoice(null);
  };

  return (
    <main className="min-h-screen overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col justify-center gap-3 sm:min-h-[calc(100vh-3rem)]">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex h-12 items-center gap-2 rounded-2xl border-2 border-black bg-black px-4 text-base font-black text-white shadow-[3px_3px_0px_0px_#000]"
          >
            <ArrowLeft size={20} />
            처음
          </button>

          <div className="min-w-20 flex-1 rounded-full border-2 border-black bg-white p-1">
            <div className="h-4 rounded-full bg-[#4ECDC4]" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>

          <div className="flex h-12 items-center gap-1 rounded-2xl border-2 border-black bg-[#FF6B6B] px-4 text-base font-black text-white shadow-[3px_3px_0px_0px_#000]">
            <Star size={18} fill="currentColor" />
            {score}
          </div>
        </header>

        <article className="flex flex-col rounded-[24px] border-4 border-black bg-white p-4 shadow-[7px_7px_0px_0px_#000]">
          <div
            ref={storyScrollRef}
            className="max-h-[48vh] space-y-5 overflow-y-auto rounded-2xl border-2 border-black bg-[#FFF8E7] px-6 py-5 pr-10"
          >
            {previousScenes.length > 0 && (
              <div className="max-w-3xl">
                <button
                  type="button"
                  onClick={() => setShowPreviousScenes((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-2 text-base font-black shadow-[2px_2px_0px_0px_#000]"
                  aria-expanded={showPreviousScenes}
                >
                  지난 이야기
                  <ChevronDown className={`transition-transform ${showPreviousScenes ? "rotate-180" : ""}`} size={18} />
                </button>

                {showPreviousScenes && (
                  <div className="mt-3 space-y-4 rounded-2xl border-2 border-black bg-white/75 p-4">
                    {previousScenes.map((previousScene) => (
                      <section key={previousScene.id} className="space-y-1">
                        <p className="text-sm font-black text-[#284B63]">
                          {previousScene.chapter} · {previousScene.location}
                        </p>
                        {previousScene.narrative.map((paragraph, index) => (
                          <p key={`${previousScene.id}-${index}`} className="break-keep text-lg font-bold leading-8 text-[#5F5A50]">
                            {paragraph}
                          </p>
                        ))}
                      </section>
                    ))}
                  </div>
                )}
              </div>
            )}

            <section key={scene.id} ref={currentSceneRef} className="space-y-3">
              {getVisibleParagraphs(scene.narrative, visibleChars).map((paragraph, index) => (
                <p
                  key={`${scene.id}-${index}`}
                  className="min-h-8 max-w-4xl break-keep text-2xl font-bold leading-10 text-black sm:text-3xl sm:leading-[3.25rem]"
                >
                  {renderStoryText(paragraph, focusWord, shouldHideFocusWord)}
                </p>
              ))}
              <div ref={typingAnchorRef} className="h-1" />
            </section>
          </div>

          {scene.ending ? (
            <EndingPanel score={score} onRestart={restart} title={scene.ending.title} />
          ) : (
            <div className={`mt-3 transition-opacity ${isTextComplete ? "opacity-100" : "pointer-events-none opacity-0"}`}>
              <h2 className="mb-3 break-keep text-2xl font-black sm:text-3xl">{scene.prompt}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {choices.slice(0, visibleChoices).map((choice, index) => {
                  const isSelected = selectedChoice?.id === choice.id;
                  const isDimmed = Boolean(selectedChoice) && !isSelected;

                  return (
                    <motion.button
                      key={choice.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      disabled={Boolean(selectedChoice)}
                      whileTap={!selectedChoice ? { y: 4, x: 4, boxShadow: "0 0 0 0 #000" } : {}}
                      onClick={() => choose(choice)}
                      className={`min-h-20 rounded-2xl border-4 border-black p-4 text-left transition-all ${
                        isSelected
                          ? choice.points > 0
                            ? "translate-x-[4px] translate-y-[4px] bg-[#4ECDC4] shadow-none"
                            : "translate-x-[4px] translate-y-[4px] bg-[#FF6B6B] text-white shadow-none"
                          : isDimmed
                            ? "bg-gray-200 text-gray-500 opacity-60 shadow-[4px_4px_0px_0px_#000]"
                            : "bg-white shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg border-2 border-black bg-[#FFD93D] px-2 py-0.5 text-base font-black text-black">
                          {KOREAN_CHOICE_LABELS[index]}
                        </span>
                        <span className="break-keep text-xl font-black sm:text-2xl">{choice.text}</span>
                        {isSelected && choice.points > 0 && <CheckCircle2 className="ml-auto shrink-0" size={22} />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </article>

        {selectedChoice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border-4 border-black bg-white p-3 shadow-[6px_6px_0px_0px_#000]"
          >
            <p className="break-keep text-base font-black">{selectedChoice.points > 0 ? "좋아요!" : "다시 생각해 봐요."}</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function getVisibleParagraphs(paragraphs: string[], visibleChars: number) {
  const visible: string[] = [];
  let remaining = visibleChars;

  for (const paragraph of paragraphs) {
    if (remaining <= 0) break;
    visible.push(paragraph.slice(0, remaining));
    remaining -= paragraph.length + 1;
  }

  return visible.length > 0 ? visible : [""];
}

function renderStoryText(text: string, focusWord?: string, shouldBlank = false) {
  if (!focusWord) return text;

  const matchedWord = findWordInText(text, focusWord);
  if (!matchedWord) return text;
  const blankText = shouldBlank ? "____" : matchedWord;

  const parts = text.split(matchedWord);
  return parts.flatMap((part, index) => {
    if (index === parts.length - 1) return [part];
    return [
      part,
      <mark key={`${matchedWord}-${index}`} className="rounded-md bg-[#FFD93D] px-1.5 py-0.5 font-black text-black">
        {blankText}
      </mark>,
    ];
  });
}

function findWordInText(text: string, word: string) {
  if (text.includes(word)) return word;

  const roots = [
    word,
    word.endsWith("하다") ? word.slice(0, -2) : "",
    word.endsWith("이다") ? word.slice(0, -2) : "",
    word.endsWith("다") ? word.slice(0, -1) : "",
  ]
    .filter((root) => root.length >= 2)
    .sort((a, b) => b.length - a.length);

  for (const root of roots) {
    const match = text.match(new RegExp(`${root}[가-힣]*`));
    if (match?.[0]) return match[0];
  }

  return null;
}

function stableShuffle<T>(items: T[], seed: string) {
  const shuffled = [...items];
  let state = hashSeed(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function EndingPanel({ score, title, onRestart }: { score: number; title: string; onRestart: () => void }) {
  return (
    <div className="mt-4 rounded-2xl border-4 border-black bg-[#4ECDC4] p-5 text-center shadow-[5px_5px_0px_0px_#000]">
      <div className="mb-2 flex justify-center text-[#FFD93D] drop-shadow-[3px_3px_0px_#000]">
        <Trophy size={60} fill="currentColor" />
      </div>
      <h2 className="break-keep text-3xl font-black">{title}</h2>
      <p className="mt-3 rounded-2xl border-2 border-black bg-white p-3 text-xl font-black">최종 {score}점</p>
      <button
        onClick={onRestart}
        className="mt-4 rounded-2xl border-4 border-black bg-[#FFD93D] px-5 py-3 text-lg font-black shadow-[4px_4px_0px_0px_#000]"
      >
        다시 하기
      </button>
    </div>
  );
}
