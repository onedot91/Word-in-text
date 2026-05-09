import { motion } from "motion/react";
import { BookOpen, Gamepad2, Star } from "lucide-react";

interface HomeProps {
  onNavigate: (view: 'flashcards' | 'quiz') => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFBEB] text-black p-6">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-center mb-12 relative"
      >
        <motion.div
           animate={{ rotate: [0, 10, -10, 0] }}
           transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
           className="absolute -top-10 -left-10 text-[#FFD93D] drop-shadow-[2px_2px_0px_#000]"
        >
          <Star size={48} fill="currentColor" stroke="black" strokeWidth={2} />
        </motion.div>
        <motion.div
           animate={{ rotate: [0, -10, 10, 0] }}
           transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
           className="absolute -top-6 -right-8 text-[#FF6B6B] drop-shadow-[2px_2px_0px_#000]"
        >
          <Star size={36} fill="currentColor" stroke="black" strokeWidth={2} />
        </motion.div>
        
        <h1 className="text-5xl sm:text-6xl font-black text-black mb-4 tracking-tighter uppercase" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
          초3 낱말 탐험대
        </h1>
        <p className="text-xl text-black font-bold">
          재미있게 낱말을 배우고 퀴즈로 쑥쑥 실력을 키워요!
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl px-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('flashcards')}
          className="flex-1 bg-[#4ECDC4] border-4 border-black rounded-[32px] p-8 flex flex-col items-center justify-center shadow-[8px_8px_0px_0px_#000] cursor-pointer hover:-translate-y-1 transition-all"
        >
          <div className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] mb-4">
            <BookOpen size={48} className="text-black" />
          </div>
          <span className="text-2xl font-black text-white px-3 py-1 bg-black rounded-xl mb-2">낱말 카드 학습</span>
          <span className="text-black font-bold mt-2 text-sm text-center">
            새로운 낱말을 소리 내어 읽고 뜻을 알아보아요.
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('quiz')}
          className="flex-1 bg-[#FFD93D] border-4 border-black rounded-[32px] p-8 flex flex-col items-center justify-center shadow-[8px_8px_0px_0px_#000] cursor-pointer hover:-translate-y-1 transition-all"
        >
          <div className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] mb-4">
            <Gamepad2 size={48} className="text-black" />
          </div>
          <span className="text-2xl font-black text-white px-3 py-1 bg-black rounded-xl mb-2">도전! 낱말 퀴즈</span>
          <span className="text-black font-bold mt-2 text-sm text-center">
            배운 낱말들을 재미있는 객관식 퀴즈로 맞춰보아요.
          </span>
        </motion.button>
      </div>
    </div>
  );
}
