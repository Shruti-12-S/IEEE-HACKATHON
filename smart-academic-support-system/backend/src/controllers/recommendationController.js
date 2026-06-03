import Book from "../models/Book.js";
import IssueRequest from "../models/IssueRequest.js";
import Review from "../models/Review.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateRecommendationInsight, generateAiRecommendations } from "../utils/aiService.js";

export const recommendBooks = asyncHandler(async (req, res) => {
  const user = req.user;
  const [history, ratings, allBooks] = await Promise.all([
    IssueRequest.find({ student: user._id, status: { $in: ["approved", "return_requested", "returned"] } }).populate("book"),
    Review.find({ student: user._id }).populate("book"),
    Book.find().sort({ averageRating: -1, issueCount: -1 })
  ]);
  const highRatings = ratings.filter((item) => item.rating >= 4);
  const lowRatings = ratings.filter((item) => item.rating <= 2);
  const frequency = (values) =>
    values.filter(Boolean).reduce((acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }), {});
  const topKeys = (map, limit = 5) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key]) => key);

  const categoryPattern = frequency(history.map((item) => item.book?.category));
  const topicPattern = frequency(history.map((item) => item.book?.topic));
  const authorPattern = frequency(history.map((item) => item.book?.author));
  const ratingPattern = frequency(highRatings.map((item) => item.book?.category));
  const signals = [
    ...user.interests,
    ...user.favoriteGenres,
    ...user.favoriteAuthors,
    ...topKeys(categoryPattern),
    ...topKeys(topicPattern),
    ...topKeys(authorPattern),
    ...topKeys(ratingPattern),
    ...history.flatMap((item) => [item.book?.category, item.book?.topic, item.book?.author]),
    ...highRatings.flatMap((item) => [item.book?.category, item.book?.topic, item.book?.author])
  ].filter(Boolean);

  const uniqueSignals = [...new Set(signals.map((item) => item.toLowerCase()))];
  const historyIds = new Set(history.map((item) => item.book?._id?.toString()).filter(Boolean));
  const lowRatedSignals = new Set(lowRatings.flatMap((item) => [item.book?.category, item.book?.topic, item.book?.author]).filter(Boolean).map((item) => item.toLowerCase()));

  // Try AI-based recommendation generation first
  try {
    const aiResult = await generateAiRecommendations({ user, history, ratings, books: allBooks });
    
    // Map recommendations back to book documents
    const recommendedBooks = [];
    for (const rec of (aiResult.recommendations || [])) {
      const bookDoc = allBooks.find((b) => b._id.toString() === rec.bookId);
      if (bookDoc) {
        recommendedBooks.push({
          ...bookDoc.toObject(),
          score: 100, // Fixed score indicating high relevance from AI
          matchedSignals: [],
          reason: rec.reason
        });
      }
    }

    if (recommendedBooks.length > 0) {
      return res.json({
        signals: [...new Set(signals)].slice(0, 12),
        readingPatterns: {
          topCategories: topKeys(categoryPattern),
          topTopics: topKeys(topicPattern),
          topAuthors: topKeys(authorPattern),
          highRatedCategories: topKeys(ratingPattern),
          booksReadOrIssued: history.length,
          ratingsSubmitted: ratings.length
        },
        aiProvider: aiResult.provider,
        aiInsight: aiResult.insight,
        recommendations: recommendedBooks
      });
    }
  } catch (error) {
    console.warn("AI recommendation generation failed, falling back to rule-based logic:", error.message);
  }

  const scored = allBooks
    .filter((book) => !historyIds.has(book._id.toString()))
    .map((book) => {
      const fields = [book.title, book.author, book.category, book.topic, ...(book.tags || [])].filter(Boolean);
      const lowerFields = fields.map((field) => field.toLowerCase());
      const matchedSignals = uniqueSignals.filter((signal) => lowerFields.some((field) => field.includes(signal) || signal.includes(field)));
      const reasons = [];
      let score = 0;

      if (user.favoriteAuthors?.some((author) => book.author.toLowerCase().includes(author.toLowerCase()))) {
        score += 25;
        reasons.push("favorite author match");
      }
      if (user.favoriteGenres?.some((genre) => book.category.toLowerCase().includes(genre.toLowerCase()))) {
        score += 20;
        reasons.push("favorite genre match");
      }
      if (user.interests?.some((interest) => [book.topic, book.category, ...(book.tags || [])].join(" ").toLowerCase().includes(interest.toLowerCase()))) {
        score += 20;
        reasons.push("interest match");
      }
      if (categoryPattern[book.category]) {
        score += Math.min(20, categoryPattern[book.category] * 7);
        reasons.push("matches reading category pattern");
      }
      if (topicPattern[book.topic]) {
        score += Math.min(20, topicPattern[book.topic] * 8);
        reasons.push("matches topic pattern");
      }
      if (authorPattern[book.author]) {
        score += Math.min(15, authorPattern[book.author] * 6);
        reasons.push("matches author pattern");
      }
      if (matchedSignals.length) {
        score += Math.min(25, matchedSignals.length * 5);
        reasons.push(`matched signals: ${matchedSignals.slice(0, 4).join(", ")}`);
      }
      if (book.averageRating >= 4.5) score += 10;
      if (book.issueCount > 10) score += 8;
      if (book.availableCopies > 0) score += 5;
      if (lowRatedSignals.has(book.category.toLowerCase()) || lowRatedSignals.has(book.topic.toLowerCase()) || lowRatedSignals.has(book.author.toLowerCase())) {
        score -= 12;
      }

      return {
        book,
        score,
        matchedSignals,
        reason: reasons.length ? reasons.slice(0, 3).join("; ") : "popular and highly rated in the library"
      };
    })
    .sort((a, b) => b.score - a.score);

  const books = scored.slice(0, 8).map((item) => item.book);
  const ai = await generateRecommendationInsight({ user, signals, books });

  res.json({
    signals: [...new Set(signals)].slice(0, 12),
    readingPatterns: {
      topCategories: topKeys(categoryPattern),
      topTopics: topKeys(topicPattern),
      topAuthors: topKeys(authorPattern),
      highRatedCategories: topKeys(ratingPattern),
      booksReadOrIssued: history.length,
      ratingsSubmitted: ratings.length
    },
    aiProvider: ai.provider,
    aiInsight: ai.insight,
    recommendations: scored.slice(0, 8).map(({ book, score, matchedSignals, reason }) => ({
      ...book.toObject(),
      score: Math.max(0, Math.round(score)),
      matchedSignals,
      reason
    }))
  });
});
