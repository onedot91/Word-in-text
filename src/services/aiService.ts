import { GoogleGenAI, Type } from "@google/genai";
import { Word } from "../types";

// Fallback hardcoded words for 3rd grade level if API fails or for initial state
export const DEFAULT_WORDS: Word[] = [
  {
    id: "1",
    word: "관찰하다",
    meaning: "사물이나 현상을 주의 깊게 자세히 살펴보는 것",
    example: "돋보기로 나뭇잎의 잎맥을 관찰했어요.",
  },
  {
    id: "2",
    word: "상상하다",
    meaning: "실제로 경험하지 않은 것을 마음속으로 그려 보는 것",
    example: "나는 구름 위를 나는 상상을 해요.",
  },
  {
    id: "3",
    word: "경험하다",
    meaning: "자신이 실제로 해 보거나 겪어 보는 것",
    example: "캠핑을 가서 텐트에서 자는 것을 경험했어요.",
  },
  {
    id: "4",
    word: "발견하다",
    meaning: "미처 찾아내지 못했거나 아직 알려지지 않은 것을 찾아내는 것",
    example: "공원에서 네잎클로버를 발견했어요.",
  },
  {
    id: "5",
    word: "협동하다",
    meaning: "서로 마음과 힘을 하나로 합치는 것",
    example: "친구들과 협동해서 종이탑을 높이 쌓았어요.",
  },
  {
    id: "6",
    word: "겸손하다",
    meaning: "남을 존중하고 자기를 낮추는 태도",
    example: "칭찬을 듣고 겸손하게 대답했습니다.",
  },
  {
    id: "7",
    word: "배려하다",
    meaning: "도와주거나 보살펴 주려고 마음을 쓰는 것",
    example: "무거운 짐을 드신 할머니를 위해 자리를 배려했습니다.",
  },
  {
    id: "8",
    word: "노력하다",
    meaning: "목적을 이루기 위하여 몸과 마음을 다하여 애를 쓰는 것",
    example: "시험을 잘 보기 위해 매일 꾸준히 노력했습니다.",
  }
];

export async function generateNewWords(): Promise<Word[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "한국 초등학교 3학년 국어 및 생활 수준에 맞는 새로운 필수 낱말 5개를 생성해줘. 단어, 뜻, 그리고 아이들이 이해하기 쉬운 예문을 포함해.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: {
                type: Type.STRING,
                description: "초등학교 3학년 수준의 낱말",
              },
              meaning: {
                type: Type.STRING,
                description: "낱말의 뜻풀이 (아이들이 이해하기 쉽게)",
              },
              example: {
                type: Type.STRING,
                description: "그 낱말이 사용된 자연스러운 짧은 예문",
              },
            },
            required: ["word", "meaning", "example"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim() || "";
    // Handle potential markdown code block formatting
    const cleanJson = jsonStr.replace(/^```json/g, "").replace(/```$/g, "").trim();
    
    let generatedWords = JSON.parse(cleanJson);
    
    // Add unique IDs to the generated words
    return generatedWords.map((w: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      word: w.word,
      meaning: w.meaning,
      example: w.example,
    }));
  } catch (error) {
    console.error("AI 단어 생성 실패:", error);
    throw error;
  }
}
