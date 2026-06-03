import { fallbackChat, generateFallbackRoadmap } from "./aiFallback.js";

const baseSystemPrompt =
  `You are an expert AI Academic Coach and Study Assistant. Your goal is to guide university students toward academic success with friendly, structured, and highly encouraging advice.
When chatting with students:
1. Help them outline study schedules, break down complex topics (e.g., computer science, data science, mathematics, literature) into digestible parts, and suggest books or research strategies.
2. Recommend free, high-quality, and well-known academic resources (such as MDN Web Docs, freeCodeCamp, MIT OpenCourseWare, Khan Academy, arXiv, W3Schools, and official documentation).
3. If they ask about project ideas, provide realistic, career-boosting project concepts complete with tech stacks and implementation tips.
4. Keep your answers concise, well-formatted (using bullet points and bold text for readability), and actionable.
5. Maintain a supportive, motivational, and academic tone. If a question is too broad, ask a brief clarifying question to give them the best possible help.`;

const stripJsonFence = (text = "") =>
  text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

export const getAiProvider = () => {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "fallback";
};

export const parseJsonFromAi = (text) => {
  const cleaned = stripJsonFence(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("AI response was not valid JSON");
  }
};

export const askOpenAI = async ({ system = baseSystemPrompt, message, json = false }) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message }
      ],
      temperature: 0.45,
      ...(json ? { response_format: { type: "json_object" } } : {})
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenAI request failed");
  return data.choices?.[0]?.message?.content || "";
};

export const askGemini = async ({ system = baseSystemPrompt, message, json = false }) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: system }] },
      ...(json ? { generationConfig: { responseMimeType: "application/json" } } : {})
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini request failed");
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") || "";
};

export const askAiText = async (message, options = {}) => {
  if (process.env.OPENAI_API_KEY) {
    try {
      return { provider: "openai", text: await askOpenAI({ ...options, message }) };
    } catch (error) {
      console.error("OpenAI text completion failed, trying Gemini:", error.message);
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      return { provider: "gemini", text: await askGemini({ ...options, message }) };
    } catch (error) {
      console.error("Gemini text completion failed:", error.message);
    }
  }
  console.log("No AI keys succeeded, falling back to rule-based engine");
  return { provider: "fallback", text: fallbackChat(message) };
};

export const generateAiRoadmap = async ({ skill, user }) => {
  const fallback = generateFallbackRoadmap(skill);
  const system =
    `You are an expert academic curriculum designer. Generate a highly structured, valid JSON learning roadmap for the requested skill.
The JSON must strictly follow this structure:
{
  "skill": "Name of the skill",
  "summary": "A 1-2 sentence overview of the learning journey",
  "stages": [
    {
      "name": "Beginner",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "resources": [
        {
          "title": "Title of a free learning resource",
          "type": "Course | Tutorial | Documentation | Book | Practice",
          "url": "A real, active, valid HTTPS URL to the resource (e.g., on developer.mozilla.org, docs.python.org, freecodecamp.org, kaggle.com, github.com, etc.)"
        }
      ],
      "projectIdeas": ["Beginner project idea 1", "Beginner project idea 2"]
    },
    {
      "name": "Intermediate",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "resources": [
        {
          "title": "Title of an intermediate resource",
          "type": "Course | Tutorial | Documentation | Book | Practice",
          "url": "A real, active, valid HTTPS URL to the resource"
        }
      ],
      "projectIdeas": ["Intermediate project idea 1", "Intermediate project idea 2"]
    },
    {
      "name": "Advanced",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "resources": [
        {
          "title": "Title of an advanced resource",
          "type": "Course | Tutorial | Documentation | Book | Practice",
          "url": "A real, active, valid HTTPS URL to the resource"
        }
      ],
      "projectIdeas": ["Advanced capstone project idea 1", "Advanced capstone project idea 2"]
    }
  ]
}
Rules:
- The "stages" array must contain exactly 3 objects with "name" values "Beginner", "Intermediate", and "Advanced" in that order.
- Under "resources", provide real and stable educational websites (like official docs, MDN, freeCodeCamp, MIT OpenCourseWare, W3Schools, Kaggle, Udemy free courses, Coursera free audit).
- DO NOT invent/hallucinate broken or random URLs like http://localhost or invalid YouTube links. Ensure all URLs start with https://.
- Output ONLY the raw JSON object. Do not wrap the JSON in markdown code blocks or add any additional conversational text.`;
  const message = `Create a roadmap for skill: ${skill}. Student interests: ${(user.interests || []).join(", ") || "not provided"}. Favorite genres: ${(user.favoriteGenres || []).join(", ") || "not provided"}.`;

  if (process.env.OPENAI_API_KEY) {
    try {
      const text = await askOpenAI({ system, message, json: true });
      return { provider: "openai", roadmap: { ...fallback, ...parseJsonFromAi(text) } };
    } catch (error) {
      console.error("OpenAI roadmap generation failed, trying Gemini:", error.message);
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await askGemini({ system, message: `${message}\nReturn strict JSON only.`, json: true });
      return { provider: "gemini", roadmap: { ...fallback, ...parseJsonFromAi(text) } };
    } catch (error) {
      console.error("Gemini roadmap generation failed:", error.message);
    }
  }

  return { provider: "fallback", roadmap: fallback };
};

export const generateRecommendationInsight = async ({ user, signals, books }) => {
  const fallback = signals.length
    ? `Recommendations are based on ${signals.slice(0, 5).join(", ")} plus your reading and rating history.`
    : "Recommendations are based on popular and highly rated books because your profile has limited reading signals.";
  const compactBooks = books.map((book) => ({
    title: book.title,
    author: book.author,
    category: book.category,
    topic: book.topic,
    rating: book.averageRating
  }));

  const system =
    "You are an academic recommendation advisor. Briefly explain to the student why the recommended books are selected based on their specific academic interests, reading history, and profile signals. Keep your response within exactly 2 concise, friendly, and helpful sentences.";
  const message = `Student: ${user.name}. Interests: ${(user.interests || []).join(", ")}. Signals: ${signals.join(", ")}. Candidate books: ${JSON.stringify(compactBooks)}.`;
  
  const result = await askAiText(message, { system });
  return { provider: result.provider, insight: result.provider === "fallback" ? fallback : result.text };
};

export const generateAiRecommendations = async ({ user, history, ratings, books }) => {
  const system =
    `You are an expert academic library recommendation engine. Recommend up to 8 books for the student based on their profile, reading history, and ratings.
Output ONLY a raw, valid JSON object with the following structure:
{
  "recommendations": [
    {
      "bookId": "string (matching the exact book id from the list)",
      "reason": "1 sentence explaining why this book is recommended"
    }
  ],
  "insight": "A 1-2 sentence friendly explanation of the overall recommendation strategy for the student's dashboard banner."
}
Rules:
- Select only bookIds that exist in the provided books list.
- Prioritize books matching student interests, favorite genres, favorite authors, and positive rating patterns.
- Avoid recommending books the student has already read/issued (provided in history).
- Output ONLY valid JSON. No markdown formatting.`;

  const compactBooks = books.map((b) => ({
    id: b._id.toString(),
    title: b.title,
    author: b.author,
    category: b.category,
    topic: b.topic,
    tags: b.tags || [],
    rating: b.averageRating,
    available: b.availableCopies > 0
  }));

  const studentProfile = {
    name: user.name,
    department: user.department,
    interests: user.interests || [],
    favoriteGenres: user.favoriteGenres || [],
    favoriteAuthors: user.favoriteAuthors || [],
    history: history.map((h) => ({ title: h.book?.title, category: h.book?.category })),
    ratings: ratings.map((r) => ({ title: r.book?.title, rating: r.rating }))
  };

  const message = `Student Profile: ${JSON.stringify(studentProfile)}\nAvailable Books: ${JSON.stringify(compactBooks)}`;

  if (process.env.OPENAI_API_KEY) {
    try {
      const text = await askOpenAI({ system, message, json: true });
      return { provider: "openai", ...parseJsonFromAi(text) };
    } catch (error) {
      console.error("OpenAI recommendations failed, trying Gemini:", error.message);
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await askGemini({ system, message: `${message}\nReturn strict JSON only.`, json: true });
      return { provider: "gemini", ...parseJsonFromAi(text) };
    } catch (error) {
      console.error("Gemini recommendations failed:", error.message);
    }
  }

  throw new Error("All AI recommendation attempts failed");
};
