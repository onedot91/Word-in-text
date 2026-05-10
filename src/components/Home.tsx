import { motion } from "motion/react";
import { Play } from "lucide-react";
import { StoryAdventure } from "../types";

interface HomeProps {
  adventure: StoryAdventure;
  onStart: () => void;
}

export function Home({ adventure, onStart }: HomeProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-5 py-8 text-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <p className="inline-block rounded-full border-2 border-black bg-[#4ECDC4] px-4 py-2 text-sm font-black shadow-[3px_3px_0px_0px_#000]">
          문맥 낱말 게임
        </p>

        <h1 className="break-keep text-5xl font-black leading-tight sm:text-7xl">{adventure.title}</h1>

        <p className="break-keep text-2xl font-black text-[#284B63]">{adventure.subtitle}</p>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-3 rounded-2xl border-4 border-black bg-[#FFD93D] px-8 py-5 text-2xl font-black shadow-[7px_7px_0px_0px_#000] transition-all hover:-translate-y-1 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          <Play size={30} fill="currentColor" />
          시작하기
        </button>
      </motion.div>
    </main>
  );
}
