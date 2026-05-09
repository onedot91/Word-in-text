export interface Word {
  id: string;
  word: string;
  meaning: string;
  example: string;
}

export interface QuizQuestion {
  id: string;
  question: string; // The meaning
  options: string[]; // 4 options (words)
  correctAnswer: string; // The correct word
}
