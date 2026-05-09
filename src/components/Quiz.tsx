import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { Word, QuizQuestion } from "../types";
import confetti from "canvas-confetti";

interface QuizProps {
  onBack: () => void;
  words: Omit<Word, 'id'>[];
}

export function Quiz({ onBack, words }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Quiz
  useEffect(() => {
    if (words.length < 4) {
      alert("단어가 부족해요! 먼저 단어 학습 화면에서 새로운 단어를 불러오세요.");
      onBack();
      return;
    }

    // Generate up to 10 questions
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, Math.min(10, words.length));

    const generatedQuestions: QuizQuestion[] = selectedWords.map((wordObj) => {
      // Pick 3 random distractor words
      const diffWords = words.filter((w) => w.word !== wordObj.word);
      const randomDistractors = [...diffWords].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const options = [wordObj.word, ...randomDistractors.map(w => w.word)];
      // Shuffle options
      const shuffledOptions = options.sort(() => 0.5 - Math.random());

      return {
        id: Math.random().toString(36).substr(2, 9),
        question: wordObj.meaning,
        options: shuffledOptions,
        correctAnswer: wordObj.word
      };
    });

    setQuestions(generatedQuestions);
  }, [words, onBack]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple clicks

    setSelectedAnswer(answer);
    
    const isCorrect = answer === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4ADE80', '#FBBF24', '#60A5FA']
      });
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
        if (score + (isCorrect ? 1 : 0) > questions.length / 2) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });
        }
      }
    }, 1500); // Wait 1.5 seconds to show result before next question
  };

  if (questions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-[#FFFBEB] font-black text-2xl text-black">로딩 중...</div>;
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBEB] text-black p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-[12px_12px_0px_0px_#000] border-4 border-black max-w-md w-full"
        >
          <div className="text-[#FFD93D] drop-shadow-[4px_4px_0px_#000] flex justify-center mb-6">
            <Trophy size={80} fill="currentColor" />
          </div>
          <h2 className="text-4xl font-black text-black mb-4">학습 완료!</h2>
          <p className="text-2xl font-black bg-[#4ECDC4] border-2 border-black text-black py-4 rounded-2xl mb-8 shadow-[4px_4px_0px_0px_#000]">
            {questions.length}문제 중 <span className="text-4xl">{score}</span>문제 정답!
          </p>
          <button
            onClick={onBack}
            className="w-full bg-[#FF6B6B] border-4 border-black text-white font-black text-xl py-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all"
          >
            홈으로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FFFBEB] text-black p-6">
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-black border-2 border-black text-white font-black px-6 py-3 rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:scale-105 transition-transform"
        >
          <ArrowLeft size={24} />
          <span>나가기</span>
        </button>
        
        {/* Progress bar */}
        <div className="flex-1 max-w-sm mx-4 bg-white border-2 border-black rounded-full h-6 overflow-hidden">
          <motion.div 
            className="bg-[#4ECDC4] h-full border-r-2 border-black"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>

        <div className="bg-[#FF6B6B] border-2 border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] font-black text-xl text-white">
          {score} 점
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-2xl mt-4">
        <h3 className="text-center text-xl font-black text-black mb-2 uppercase tracking-widest">
          문제 {currentIndex + 1}
        </h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="bg-white rounded-[40px] shadow-[12px_12px_0px_0px_#000] border-4 border-black p-8 sm:p-12 text-center mb-8"
          >
            <p className="text-2xl sm:text-4xl font-black leading-tight text-black break-keep">
              "{currentQ.question}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correctAnswer;
            
            // Determine styles based on selection state
            let btnStyle = "bg-white border-black text-black shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000]";
            let resultIcon = null;

            if (selectedAnswer) {
              if (isCorrect) {
                btnStyle = "bg-[#4ECDC4] border-black text-black shadow-none translate-y-[6px] translate-x-[6px]";
                if (isSelected) resultIcon = <CheckCircle2 className="text-black absolute right-6" size={32} />;
              } else if (isSelected) {
                btnStyle = "bg-[#FF6B6B] border-black text-white shadow-none translate-y-[6px] translate-x-[6px]";
                resultIcon = <XCircle className="text-white absolute right-6" size={32} />;
              } else {
                btnStyle = "bg-gray-200 border-black text-gray-500 shadow-[6px_6px_0px_0px_#000] opacity-60";
              }
            }

            return (
              <motion.button
                key={option}
                disabled={!!selectedAnswer}
                whileTap={!selectedAnswer ? { y: 6, x: 6, boxShadow: "0 0 0 0 #000" } : {}}
                onClick={() => handleAnswer(option)}
                className={`relative flex items-center justify-center p-6 rounded-[24px] border-4 text-2xl font-black transition-all ${btnStyle}`}
              >
                <span>{option}</span>
                {resultIcon}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
