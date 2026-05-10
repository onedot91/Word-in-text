import { useState } from "react";
import { Home } from "./components/Home";
import { StoryGame } from "./components/StoryGame";
import { DEFAULT_ADVENTURE } from "./services/aiService";

type View = "home" | "game";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [playerName, setPlayerName] = useState("민준");

  const startGame = (name: string) => {
    setPlayerName(name.trim() || "민준");
    setCurrentView("game");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] font-sans text-slate-950 selection:bg-emerald-200 selection:text-slate-950">
      {currentView === "home" && <Home adventure={DEFAULT_ADVENTURE} defaultName={playerName} onStart={startGame} />}
      {currentView === "game" && <StoryGame adventure={DEFAULT_ADVENTURE} playerName={playerName} onBack={() => setCurrentView("home")} />}
    </div>
  );
}
