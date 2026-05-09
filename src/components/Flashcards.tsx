import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Volume2 } from "lucide-react";
import { Word } from "../types";
import { generateNewWords } from "../services/aiService";

interface FlashcardsProps {
  onBack: () => void;
  words: Omit<Word, 'id'>[];
  onAddWords: (newWords: Omit<Word, 'id'>[]) => void;
}

export function Flashcards({ onBack, words, onAddWords }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentWord = words[currentIndex];

  if (!currentWord) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAIWords = async () => {
    try {
      setIsGenerating(true);
      const newWords = await generateNewWords();
      onAddWords(newWords);
      // Automatically move to the first newly added word
      setDirection(1);
      setCurrentIndex(words.length);
    } catch (error) {
      alert("단어를 생성하는 중 오류가 발생했어요. 다시 시도해 주세요!");
    } finally {
      setIsGenerating(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FFFBEB] p-6 overscroll-none overflow-hidden text-black">
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white bg-black border-2 border-black hover:scale-105 px-6 py-3 rounded-2xl font-black text-xl transition-transform"
        >
          <ArrowLeft size={24} />
          <span>홈으로</span>
        </button>
        <div className="text-xl font-black text-black bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] px-6 py-2 rounded-xl">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="flex-1 w-full flex items-center justify-center relative [perspective:1000px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              rotateY: { duration: 0.4 }
            }}
            className="w-full max-w-lg bg-white rounded-[40px] shadow-[12px_12px_0px_0px_#000] border-4 border-black p-8 sm:p-12 flex flex-col items-center justify-center text-center absolute"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <button 
              onClick={() => handleSpeak(currentWord.word)}
              className="absolute top-6 right-6 text-black bg-[#FFD93D] border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-1 hover:shadow-none p-3 rounded-2xl transition-all"
              title="소리내어 읽기"
            >
              <Volume2 size={32} />
            </button>
            
            <h2 className="text-6xl sm:text-[100px] font-black text-black tracking-tighter leading-none mb-6 mt-4">
              {currentWord.word}
            </h2>
            
            <div className="h-2 w-24 bg-black rounded-full mb-8"></div>
            
            <div className="w-full">
              <p className="text-xl sm:text-2xl text-black font-bold mb-6 leading-relaxed bg-gray-100 border-2 border-black rounded-3xl p-6">
                {currentWord.meaning}
              </p>
              
              <div className="text-left bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] rounded-2xl p-6">
                <span className="inline-block text-sm font-black bg-[#FF6B6B] border-2 border-black text-white px-3 py-1 rounded-lg mb-3 uppercase tracking-wider">
                  예문
                </span>
                <p className="text-lg text-black font-bold leading-relaxed break-keep">
                  {currentWord.example.split(currentWord.word).reduce((prev: any, current: string, i: number) => {
                    if (!i) return [current];
                    return prev.concat(<strong key={i} className="text-white font-black bg-black px-2 py-0.5 rounded-lg mx-1">{currentWord.word}</strong>, current);
                  }, [])}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="w-full max-w-3xl flex justify-between items-center mt-8 gap-4 px-4 z-10">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="bg-black border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl text-white shadow-[4px_4px_0px_0px_#000] hover:scale-105 transition-all active:scale-95"
        >
          <ChevronLeft size={36} />
        </button>

        <button
          onClick={handleAIWords}
          disabled={isGenerating}
          className="flex-1 max-w-[240px] bg-[#FFD93D] border-2 border-black text-black font-black text-lg py-4 px-6 rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Sparkles size={24} />
            </motion.div>
          ) : (
            <Sparkles size={24} />
          )}
          <span>{isGenerating ? "단어 찾는 중..." : "새로운 단어 가져오기"}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="bg-black border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl text-white shadow-[4px_4px_0px_0px_#000] hover:scale-105 transition-all active:scale-95"
        >
          <ChevronRight size={36} />
        </button>
      </div>
    </div>
  );
}
