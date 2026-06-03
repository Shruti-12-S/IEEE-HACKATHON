import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Roadmap from "../models/Roadmap.js";
import StudyCircle from "../models/StudyCircle.js";
import P2PBook from "../models/P2PBook.js";
import P2PRequest from "../models/P2PRequest.js";
import SharedResource from "../models/SharedResource.js";
import { generateFallbackRoadmap } from "../utils/aiFallback.js";

dotenv.config();

const run = async () => {
  await connectDB();

  // Baseline Users
  const demoStudent = await User.findOne({ email: "student@sass.edu" });
  const priya = await User.findOne({ email: "priya@sass.edu" });

  if (!demoStudent || !priya) {
    console.log("Seeded users not found. Run npm run seed first.");
    await mongoose.disconnect();
    return;
  }

  // Clear existing P2P collections
  await Promise.all([
    StudyCircle.deleteMany(),
    P2PBook.deleteMany(),
    P2PRequest.deleteMany(),
    SharedResource.deleteMany(),
    Roadmap.deleteMany({ student: { $in: [demoStudent._id, priya._id] } }) // refresh roadmaps
  ]);

  // Clean and create new test accounts to avoid duplicates or missing records
  await User.deleteMany({ email: { $in: ["rohan@sass.edu", "sneha@sass.edu", "rahul@sass.edu"] } });

  const rohan = await User.create({
    name: "Rohan Sharma",
    email: "rohan@sass.edu",
    password: "student123",
    role: "student",
    studentId: "STU1003",
    department: "Computer Science",
    interests: ["MERN Stack", "Python"],
    favoriteGenres: ["Programming"],
    favoriteAuthors: ["Robert C. Martin"]
  });

  const sneha = await User.create({
    name: "Sneha Patel",
    email: "sneha@sass.edu",
    password: "student123",
    role: "student",
    studentId: "STU1004",
    department: "Computer Science",
    interests: ["MERN Stack", "UI/UX Design"],
    favoriteGenres: ["Programming", "Design"],
    favoriteAuthors: ["Steve Krug"]
  });

  const rahul = await User.create({
    name: "Rahul Verma",
    email: "rahul@sass.edu",
    password: "student123",
    role: "student",
    studentId: "STU1005",
    department: "Data Science",
    interests: ["Machine Learning", "Data Science"],
    favoriteGenres: ["Data Science"],
    favoriteAuthors: ["Martin Kleppmann"]
  });

  console.log("Seeding Match Roadmaps...");

  // Seed Demo Student roadmap
  await Roadmap.create({
    student: demoStudent._id,
    ...generateFallbackRoadmap("MERN Stack"),
    progress: 35,
    completedItems: ["Learn core vocabulary and tools"]
  });

  // Seed Priya roadmap
  await Roadmap.create({
    student: priya._id,
    ...generateFallbackRoadmap("MERN Stack"),
    progress: 25,
    completedItems: ["Learn core vocabulary and tools"]
  });

  // Seed Rohan roadmap
  await Roadmap.create({
    student: rohan._id,
    ...generateFallbackRoadmap("MERN Stack"),
    progress: 60,
    completedItems: ["Learn core vocabulary and tools", "Setup local development environment"]
  });

  // Seed Sneha roadmap
  await Roadmap.create({
    student: sneha._id,
    ...generateFallbackRoadmap("MERN Stack"),
    progress: 40,
    completedItems: ["Learn core vocabulary and tools"]
  });

  // Seed Rahul roadmap
  await Roadmap.create({
    student: rahul._id,
    ...generateFallbackRoadmap("Machine Learning"),
    progress: 15,
    completedItems: ["Learn core vocabulary and tools"]
  });

  console.log("Seeding Study Circles...");

  // 2. Create Study Circles
  const circle1 = await StudyCircle.create({
    name: "MERN Stack Wizards 🚀",
    description: "Collaborative study group for full-stack students mastering Node, Express, React, and MongoDB.",
    skill: "MERN Stack",
    members: [demoStudent._id, priya._id, rohan._id, sneha._id],
    messages: [
      { sender: priya._id, text: "Hey! Is anyone working on the MongoDB stage? I am stuck on indexes." },
      { sender: demoStudent._id, text: "Yes Priya! Let's check out the documentation on compound indexes, it really helped me." },
      { sender: rohan._id, text: "I just posted the Vite build optimization guide on the resource board. Check it out!" },
      { sender: sneha._id, text: "Thanks Rohan, that build guide is awesome. Upvoted it." }
    ]
  });

  const circle2 = await StudyCircle.create({
    name: "Machine Learning Pioneers 🧠",
    description: "Study circle focusing on Python models, scikit-learn, and neural network foundations.",
    skill: "Machine Learning",
    members: [priya._id, rahul._id],
    messages: [
      { sender: rahul._id, text: "Hey Priya, do you want to collaborate on the scikit-learn project this weekend?" },
      { sender: priya._id, text: "Definitely Rahul! Let's meet in the library on Saturday." }
    ]
  });

  console.log("Seeding Shared Resources upvotes...");

  // 3. Create Shared Resources
  await SharedResource.create({
    title: "Awesome MERN Stack Resource Collection & Tutorials",
    url: "https://github.com/enaqx/awesome-react",
    type: "documentation",
    skill: "MERN Stack",
    submittedBy: priya._id,
    upvotes: [priya._id, demoStudent._id, rohan._id],
    downvotes: []
  });

  await SharedResource.create({
    title: "Vite and React Production Build Optimization Guide",
    url: "https://vite.dev/guide/build.html",
    type: "documentation",
    skill: "MERN Stack",
    submittedBy: demoStudent._id,
    upvotes: [demoStudent._id, rohan._id, sneha._id],
    downvotes: []
  });

  await SharedResource.create({
    title: "Complete scikit-learn Machine Learning Tutorials",
    url: "https://scikit-learn.org/stable/tutorial/index.html",
    type: "video",
    skill: "Machine Learning",
    submittedBy: priya._id,
    upvotes: [priya._id, rahul._id],
    downvotes: []
  });

  console.log("Seeding P2P Bookshelf...");

  // 4. Create P2P Marketplace books
  const book1 = await P2PBook.create({
    owner: priya._id,
    title: "Effective Java (3rd Edition)",
    author: "Joshua Bloch",
    category: "Computer Science",
    description: "Excellent shape. Covers Java 7, 8, and 9 best practices.",
    status: "available"
  });

  const book2 = await P2PBook.create({
    owner: priya._id,
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    category: "Computer Science",
    description: "189 programming questions and solutions. Good coding prep book.",
    status: "requested"
  });

  const book3 = await P2PBook.create({
    owner: demoStudent._id,
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen",
    category: "Mathematics",
    description: "A bit worn out but fully readable. Essential for DSA lab.",
    status: "borrowed"
  });

  const book4 = await P2PBook.create({
    owner: rohan._id,
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma",
    category: "Computer Science",
    description: "Hardcover, mint condition. Classic gang of four book.",
    status: "available"
  });

  const book5 = await P2PBook.create({
    owner: sneha._id,
    title: "The Pragmatic Programmer",
    author: "Andy Hunt and Dave Thomas",
    category: "Computer Science",
    description: "20th Anniversary Edition. Highly recommended for programming practices.",
    status: "available"
  });

  const book6 = await P2PBook.create({
    owner: rahul._id,
    title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
    author: "Aurélien Géron",
    category: "Computer Science",
    description: "Covers deep learning foundations. Clean book.",
    status: "available"
  });

  console.log("Seeding P2P Requests...");

  // 5. Create P2P borrow requests
  await P2PRequest.create({
    book: book2._id,
    borrower: demoStudent._id,
    owner: priya._id,
    status: "pending",
    message: "Hi Priya! I have a coding interview next week. Could I borrow this book?"
  });

  await P2PRequest.create({
    book: book3._id,
    borrower: priya._id,
    owner: demoStudent._id,
    status: "approved",
    message: "Hi, I need this algorithms book to study graph algorithms.",
    notes: "Approved by Demo Student"
  });

  await P2PRequest.create({
    book: book1._id,
    borrower: rohan._id,
    owner: priya._id,
    status: "pending",
    message: "Hi! I am working on building my Java backend skills. Can I borrow your Java book?"
  });

  console.log("P2P Seed and Matched Data Complete!");
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
