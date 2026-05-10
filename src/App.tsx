import { useState } from "react";
import { Home } from "./components/Home";
import { StoryGame } from "./components/StoryGame";
import { DEFAULT_ADVENTURE } from "./services/aiService";

type View = "home" | "game";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");

  return (
    <div className="min-h-screen bg-[#FFF8E7] font-sans text-black selection:bg-[#4ECDC4] selection:text-black">
      {currentView === "home" && <Home adventure={DEFAULT_ADVENTURE} onStart={() => setCurrentView("game")} />}
      {currentView === "game" && <StoryGame adventure={DEFAULT_ADVENTURE} onBack={() => setCurrentView("home")} />}
    </div>
  );
}
