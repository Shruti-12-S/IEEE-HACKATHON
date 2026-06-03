import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Book from "../models/Book.js";
import IssueRequest from "../models/IssueRequest.js";
import IssuedBook from "../models/IssuedBook.js";
import Reservation from "../models/Reservation.js";
import Review from "../models/Review.js";
import Roadmap from "../models/Roadmap.js";
import Progress from "../models/Progress.js";
import Notification from "../models/Notification.js";
import { generateFallbackRoadmap } from "../utils/aiFallback.js";

dotenv.config();

const books = [
  {
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell and Peter Norvig",
    isbn: "9780134610993",
    category: "Artificial Intelligence",
    topic: "AI Engineering",
    description: "A comprehensive foundation for intelligent agents, search, reasoning, learning, and responsible AI.",
    coverUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80",
    totalCopies: 6,
    availableCopies: 4,
    shelfLocation: "AI-101",
    tags: ["ai", "machine learning", "agents"],
    averageRating: 4.8,
    ratingCount: 12,
    issueCount: 18
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    category: "Software Engineering",
    topic: "Programming Practices",
    description: "Practical principles for writing readable, maintainable, professional software.",
    coverUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
    totalCopies: 8,
    availableCopies: 6,
    shelfLocation: "SE-022",
    tags: ["programming", "software", "craft"],
    averageRating: 4.6,
    ratingCount: 20,
    issueCount: 25
  },
  {
    title: "Python Crash Course",
    author: "Eric Matthes",
    isbn: "9781593279288",
    category: "Programming",
    topic: "Python",
    description: "A hands-on introduction to Python fundamentals, data, web apps, and games.",
    coverUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80",
    totalCopies: 10,
    availableCopies: 7,
    shelfLocation: "PR-014",
    tags: ["python", "beginner", "projects"],
    averageRating: 4.7,
    ratingCount: 16,
    issueCount: 30
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "9781449373320",
    category: "Data Science",
    topic: "Distributed Systems",
    description: "Deep coverage of reliable, scalable, maintainable data systems.",
    coverUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    totalCopies: 5,
    availableCopies: 1,
    shelfLocation: "DS-210",
    tags: ["data", "systems", "databases"],
    averageRating: 4.9,
    ratingCount: 10,
    issueCount: 14
  },
  {
    title: "Don't Make Me Think",
    author: "Steve Krug",
    isbn: "9780321965516",
    category: "Design",
    topic: "UI/UX Design",
    description: "A friendly, direct guide to usability and user-centered interfaces.",
    coverUrl: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&q=80",
    totalCopies: 4,
    availableCopies: 0,
    shelfLocation: "UX-018",
    tags: ["ux", "design", "usability"],
    averageRating: 4.5,
    ratingCount: 9,
    issueCount: 11
  },
  {
    title: "Computer Networking: A Top-Down Approach",
    author: "James Kurose and Keith Ross",
    isbn: "9780136681557",
    category: "Cloud Computing",
    topic: "Networking",
    description: "Networking fundamentals that support cloud systems, APIs, and infrastructure.",
    coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    totalCopies: 7,
    availableCopies: 5,
    shelfLocation: "CL-044",
    tags: ["cloud", "networking", "infrastructure"],
    averageRating: 4.4,
    ratingCount: 7,
    issueCount: 9
  },
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson, and Ronald L. Rivest",
    isbn: "9780262033848",
    category: "Computer Science",
    topic: "Algorithms",
    description: "The standard reference and textbook for algorithms and data structures worldwide.",
    coverUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80",
    totalCopies: 10,
    availableCopies: 8,
    shelfLocation: "CS-301",
    tags: ["algorithms", "theory", "math"],
    averageRating: 4.9,
    ratingCount: 15,
    issueCount: 22
  },
  {
    title: "You Don't Know JS Yet",
    author: "Kyle Simpson",
    isbn: "9781944823917",
    category: "Programming",
    topic: "JavaScript",
    description: "Deep dive into the core mechanics of the JavaScript language, scopes, and closures.",
    coverUrl: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80",
    totalCopies: 7,
    availableCopies: 5,
    shelfLocation: "PR-088",
    tags: ["javascript", "web dev", "frontend"],
    averageRating: 4.8,
    ratingCount: 11,
    issueCount: 19
  },
  {
    title: "The Pragmatic Programmer",
    author: "David Thomas and Andrew Hunt",
    isbn: "9780135957059",
    category: "Software Engineering",
    topic: "Software Craftsmanship",
    description: "A handbook of career advice and engineering practices to write clean, effective code.",
    coverUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=600&q=80",
    totalCopies: 6,
    availableCopies: 4,
    shelfLocation: "SE-110",
    tags: ["craftsmanship", "engineering", "careers"],
    averageRating: 4.7,
    ratingCount: 9,
    issueCount: 13
  },
  {
    title: "Pattern Recognition and Machine Learning",
    author: "Christopher Bishop",
    isbn: "9780387310732",
    category: "Artificial Intelligence",
    topic: "Machine Learning",
    description: "A comprehensive introduction to statistical pattern recognition and machine learning theory.",
    coverUrl: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80",
    totalCopies: 4,
    availableCopies: 2,
    shelfLocation: "AI-202",
    tags: ["ai", "machine learning", "math"],
    averageRating: 4.6,
    ratingCount: 8,
    issueCount: 10
  },
  {
    title: "Compilers: Principles, Techniques, and Tools",
    author: "Alfred Aho and Monica Lam",
    isbn: "9780321486813",
    category: "Computer Science",
    topic: "Compiler Design",
    description: "The classic reference book on compiler construction, lexers, and syntax analysis.",
    coverUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80",
    totalCopies: 3,
    availableCopies: 3,
    shelfLocation: "CS-402",
    tags: ["compilers", "languages", "theory"],
    averageRating: 4.5,
    ratingCount: 5,
    issueCount: 6
  }
];

const run = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Book.deleteMany(),
    IssueRequest.deleteMany(),
    IssuedBook.deleteMany(),
    Reservation.deleteMany(),
    Review.deleteMany(),
    Roadmap.deleteMany(),
    Progress.deleteMany(),
    Notification.deleteMany()
  ]);

  const admin = await User.create({
    name: "Library Admin",
    email: "admin@sass.edu",
    password: "admin123",
    role: "admin",
    department: "Central Library"
  });
  const student = await User.create({
    name: "Demo Student",
    email: "student@sass.edu",
    password: "student123",
    role: "student",
    studentId: "STU1001",
    department: "Computer Science",
    interests: ["AI Engineering", "Python", "Data Science"],
    favoriteGenres: ["Programming", "Artificial Intelligence"],
    favoriteAuthors: ["Eric Matthes", "Stuart Russell"],
    loginCount: 2
  });
  const studentTwo = await User.create({
    name: "Priya Nair",
    email: "priya@sass.edu",
    password: "student123",
    role: "student",
    studentId: "STU1002",
    department: "Data Science",
    interests: ["Machine Learning", "Data Science", "Cloud Computing"],
    favoriteGenres: ["Data Science", "Cloud Computing"],
    favoriteAuthors: ["Martin Kleppmann"],
    loginCount: 2
  });
  const insertedBooks = await Book.insertMany(books);
  const issue = await IssueRequest.create({
    student: student._id,
    book: insertedBooks[0]._id,
    status: "approved",
    approvedAt: new Date(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
  });
  await IssuedBook.create({ issueRequest: issue._id, student: student._id, book: insertedBooks[0]._id, dueDate: issue.dueDate });
  const pendingIssue = await IssueRequest.create({
    student: studentTwo._id,
    book: insertedBooks[2]._id,
    status: "pending",
    notes: "Student wants this for Python lab work."
  });
  const overdueIssue = await IssueRequest.create({
    student: studentTwo._id,
    book: insertedBooks[3]._id,
    status: "approved",
    approvedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: "Overdue demo record."
  });
  await IssuedBook.create({
    issueRequest: overdueIssue._id,
    student: studentTwo._id,
    book: insertedBooks[3]._id,
    issueDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    dueDate: overdueIssue.dueDate,
    status: "overdue",
    fine: 25
  });
  await IssueRequest.create({
    student: student._id,
    book: insertedBooks[1]._id,
    status: "returned",
    approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    returnedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    notes: "Returned on time."
  });
  const returnRequestedIssue = await IssueRequest.create({
    student: student._id,
    book: insertedBooks[5]._id,
    status: "return_requested",
    approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    notes: "Student requested return; librarian confirmation pending."
  });
  await IssuedBook.create({
    issueRequest: returnRequestedIssue._id,
    student: student._id,
    book: insertedBooks[5]._id,
    issueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    dueDate: returnRequestedIssue.dueDate,
    status: "return_requested"
  });
  await Reservation.create({ student: student._id, book: insertedBooks[4]._id, queuePosition: 1 });
  await Reservation.create({ student: studentTwo._id, book: insertedBooks[4]._id, queuePosition: 2 });
  await Reservation.create({ student: student._id, book: insertedBooks[3]._id, status: "fulfilled", queuePosition: 1 });
  await Review.create({ student: student._id, book: insertedBooks[2]._id, rating: 5, comment: "Great for building confidence quickly." });
  await Review.create({ student: studentTwo._id, book: insertedBooks[3]._id, rating: 5, comment: "Excellent systems thinking book." });
  await Roadmap.create({ student: student._id, ...generateFallbackRoadmap("MERN Stack"), progress: 35, completedItems: ["Learn core vocabulary and tools"] });
  await Roadmap.create({ student: studentTwo._id, ...generateFallbackRoadmap("Machine Learning"), progress: 20, completedItems: ["Learn core vocabulary and tools"] });
  await Notification.create({
    user: student._id,
    title: "Due date reminder",
    message: "Artificial Intelligence: A Modern Approach is due in 9 days.",
    type: "warning"
  });
  await Notification.create({
    user: student._id,
    title: "Reservation queue update",
    message: "Don't Make Me Think is still reserved. You are first in queue.",
    type: "info"
  });
  await Notification.create({
    user: studentTwo._id,
    title: "Overdue alert",
    message: "Designing Data-Intensive Applications is overdue. Estimated fine is Rs. 25.",
    type: "danger"
  });

  console.log("Seed complete");
  console.log("Admin: admin@sass.edu / admin123");
  console.log("Student: student@sass.edu / student123");
  console.log("Student 2: priya@sass.edu / student123");
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
