import { useState } from "react";
import { Home } from "./components/Home";
import { Flashcards } from "./components/Flashcards";
import { Quiz } from "./components/Quiz";
import { DEFAULT_WORDS } from "./services/aiService";
import { Word } from "./types";

type View = "home" | "flashcards" | "quiz";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [words, setWords] = useState<Word[]>(DEFAULT_WORDS);

  const handleAddWords = (newWords: Omit<Word, "id">[]) => {
    const wordsWithId = newWords.map((w) => ({
      ...w,
      id: Math.random().toString(36).substr(2, 9),
    }));
    setWords((prev) => [...prev, ...wordsWithId]);
  };

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans selection:bg-[#4ECDC4] selection:text-white">
      {currentView === "home" && <Home onNavigate={setCurrentView} />}
      
      {currentView === "flashcards" && (
        <Flashcards 
          onBack={() => setCurrentView("home")} 
          words={words} 
          onAddWords={handleAddWords} 
        />
      )}
      
      {currentView === "quiz" && (
        <Quiz 
          onBack={() => setCurrentView("home")} 
          words={words} 
        />
      )}
    </div>
  );
}
