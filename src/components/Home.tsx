import { motion } from "motion/react";
import { Play } from "lucide-react";
import { StoryAdventure } from "../types";
import classroomLibraryBackground from "../assets/backgrounds/classroom-library.png";

interface HomeProps {
  adventure: StoryAdventure;
  onStart: () => void;
}

export function Home({ adventure, onStart }: HomeProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA] px-5 py-8 text-slate-950">
      <section className="mx-auto grid w-full max-w-5xl items-center gap-9 lg:grid-cols-[1fr_360px]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center lg:text-left">
          <h1 className="break-keep text-6xl font-black leading-tight tracking-normal sm:text-7xl">{adventure.title}</h1>
          <p className="mt-5 break-keep text-2xl font-black leading-snug text-slate-600">이야기를 읽고 낱말을 맞혀요.</p>

          <button
            type="button"
            onClick={onStart}
            className="mt-10 inline-flex min-h-[76px] items-center gap-3 rounded-[22px] border-2 border-slate-950 bg-[#FDE68A] px-10 py-5 text-3xl font-black shadow-[7px_7px_0_#111827] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Play size={34} fill="currentColor" />
            시작
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="relative mx-auto h-[390px] w-full max-w-[360px] overflow-hidden rounded-[30px] border-2 border-slate-950 bg-white shadow-[9px_9px_0_#111827]"
          aria-hidden="true"
        >
          <img src={classroomLibraryBackground} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/15" />
          <div className="absolute bottom-20 left-8 right-8 h-28 rounded-[22px] border-2 border-slate-950 bg-white/92 shadow-[5px_5px_0_#111827]" />
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-end gap-3">
            {adventure.characters.slice(1, 4).map((character) => (
              character.image ? (
                <div key={character.id} className="flex h-36 w-32 items-end justify-center">
                  <img src={character.image} alt="" className="max-h-full max-w-full object-contain drop-shadow-[3px_3px_0_#111827]" />
                </div>
              ) : (
                <div key={character.id} className="h-28 w-20 rounded-t-full border-2 border-slate-950 shadow-[3px_3px_0_#111827]" style={{ backgroundColor: character.color }}>
                  <div className="mx-auto mt-8 h-10 w-10 rounded-full border-2 border-slate-950 bg-white" />
                </div>
              )
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
