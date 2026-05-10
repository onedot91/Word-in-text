export type WordCategory = "thinking" | "expression" | "emotion" | "state" | "sense" | "logic";

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  simple: string;
  category: WordCategory;
  difficulty: 1 | 2 | 3;
}

export interface StoryCharacter {
  id: string;
  name: string;
  role: string;
  color: string;
  accent: string;
  image?: string;
}

export interface DialogueLine {
  speakerId?: string;
  text: string;
  tone?: "normal" | "quiet" | "urgent" | "warm";
}

export interface ChoiceEffect {
  score: number;
  nextSceneId: string;
  flags?: string[];
  learnedWords?: string[];
  reviewWords?: string[];
  trust?: Record<string, number>;
}

export interface StoryChoice {
  id: string;
  text: string;
  intent: "correct" | "wrong";
  wordId?: string;
  feedback: string;
  effect: ChoiceEffect;
}

export interface StoryQuiz {
  quizType: "meaning" | "synonym" | "blank" | "usage" | "situation";
  prompt: string;
  choices: StoryChoice[];
}

export interface StoryScene {
  id: string;
  chapter: string;
  location: string;
  title: string;
  quizType?: "meaning" | "synonym" | "blank" | "usage" | "situation";
  focusWordId?: string;
  focusText?: string;
  backgroundWordIds?: string[];
  reviewWordIds?: string[];
  lines: DialogueLine[];
  prompt?: string;
  choices: StoryChoice[];
  quizzes?: StoryQuiz[];
  requiredFlags?: string[];
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
  characters: StoryCharacter[];
  words: VocabularyWord[];
  scenes: StoryScene[];
}
