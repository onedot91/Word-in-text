export interface StoryWord {
  id: string;
  word: string;
  meaning: string;
  contextHint: string;
}

export interface StoryChoice {
  id: string;
  label: string;
  text: string;
  nextSceneId: string;
  feedback: string;
  points: number;
  wordId?: string;
}

export interface StoryScene {
  id: string;
  chapter: string;
  location: string;
  focusWordId?: string;
  questionType?: "meaning" | "blank" | "definitionToWord" | "synonym" | "situation";
  narrative: string[];
  prompt: string;
  choices: StoryChoice[];
  ending?: {
    title: string;
    message: string;
  };
}

export interface StoryAdventure {
  id: string;
  title: string;
  subtitle: string;
  mission: string;
  startSceneId: string;
  words: StoryWord[];
  scenes: StoryScene[];
}
