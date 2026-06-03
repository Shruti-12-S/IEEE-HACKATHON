const resourceLinks = {
  python: [
    ["Corey Schafer Python Playlist", "YouTube", "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU"],
    ["Python Docs", "Documentation", "https://docs.python.org/3/"],
    ["freeCodeCamp Python", "Course", "https://www.freecodecamp.org/learn/scientific-computing-with-python/"],
    ["Exercism Python", "Practice", "https://exercism.org/tracks/python"],
    ["Automate the Boring Stuff", "Book", "https://automatetheboringstuff.com/"]
  ],
  "web development": [
    ["freeCodeCamp Web Development Playlist", "YouTube", "https://www.youtube.com/@freecodecamp"],
    ["MDN Web Docs", "Documentation", "https://developer.mozilla.org/"],
    ["The Odin Project", "Course", "https://www.theodinproject.com/"],
    ["Frontend Mentor", "Practice", "https://www.frontendmentor.io/"],
    ["JavaScript.info", "Article", "https://javascript.info/"]
  ],
  "data science": [
    ["StatQuest", "YouTube", "https://www.youtube.com/@statquest"],
    ["Kaggle Learn", "Course", "https://www.kaggle.com/learn"],
    ["Pandas Docs", "Documentation", "https://pandas.pydata.org/docs/"],
    ["Google ML Crash Course", "Course", "https://developers.google.com/machine-learning/crash-course"],
    ["Kaggle Datasets", "Practice", "https://www.kaggle.com/datasets"]
  ],
  "machine learning": [
    ["Andrew Ng ML Playlist", "YouTube", "https://www.youtube.com/@Deeplearningai"],
    ["Google ML Crash Course", "Course", "https://developers.google.com/machine-learning/crash-course"],
    ["scikit-learn Docs", "Documentation", "https://scikit-learn.org/stable/user_guide.html"],
    ["Kaggle Competitions", "Practice", "https://www.kaggle.com/competitions"]
  ],
  "ui/ux design": [
    ["Figma YouTube", "YouTube", "https://www.youtube.com/@Figma"],
    ["Figma Learn", "Course", "https://www.figma.com/resource-library/"],
    ["Nielsen Norman Group", "Articles", "https://www.nngroup.com/articles/"],
    ["Laws of UX", "Reference", "https://lawsofux.com/"]
  ],
  "communication skills": [
    ["TED Talks", "YouTube", "https://www.youtube.com/@TED"],
    ["Toastmasters Resources", "Practice", "https://www.toastmasters.org/resources"],
    ["Coursera Communication", "Course", "https://www.coursera.org/courses?query=communication"],
    ["Purdue OWL", "Writing", "https://owl.purdue.edu/"]
  ],
  "cloud computing": [
    ["AWS YouTube", "YouTube", "https://www.youtube.com/@amazonwebservices"],
    ["AWS Skill Builder", "Course", "https://skillbuilder.aws/"],
    ["Google Cloud Skills Boost", "Practice", "https://www.cloudskillsboost.google/"],
    ["Microsoft Learn Azure", "Documentation", "https://learn.microsoft.com/azure/"]
  ]
};

const normalizeSkill = (skill = "") => {
  const value = skill.toLowerCase();
  if (value.includes("mern") || value.includes("react") || value.includes("web") || value.includes("html") || value.includes("javascript")) return "web development";
  if (value.includes("ml") || value.includes("machine") || value.includes("deep") || value.includes("neural")) return "machine learning";
  if (value.includes("data") || value.includes("sql") || value.includes("analysis")) return "data science";
  if (value.includes("ux") || value.includes("design") || value.includes("ui") || value.includes("figma")) return "ui/ux design";
  if (value.includes("cloud") || value.includes("aws") || value.includes("azure") || value.includes("docker")) return "cloud computing";
  if (value.includes("communicat") || value.includes("public") || value.includes("resume")) return "communication skills";
  if (value.includes("python")) return "python";
  return value || "web development";
};

export const generateFallbackRoadmap = (skill) => {
  const key = normalizeSkill(skill);
  const title = skill?.trim() || key;
  const resources = (resourceLinks[key] || resourceLinks["web development"]).map(([name, type, url]) => ({
    title: name,
    type,
    url
  }));

  return {
    skill: title,
    summary: `A practical 12-week path to build confidence in ${title}, moving from fundamentals to portfolio-ready projects.`,
    stages: [
      {
        name: "Beginner",
        goals: ["Learn core vocabulary and tools", "Complete guided exercises", "Build a small reference notebook"],
        resources,
        projectIdeas: [
          `Build a CLI automation tool or web scraper to collect real-world data and save it in a clean structured format (JSON/CSV) to show command-line scripting mastery.`,
          `Develop a responsive personal landing page or web portal showcasing key ${title} concepts and custom styled interactive elements.`
        ]
      },
      {
        name: "Intermediate",
        goals: ["Work with real-world examples", "Practice debugging and research habits", "Join a public practice challenge"],
        resources,
        projectIdeas: [
          `Create a full-stack dashboard featuring complete CRUD operations, database persistence, secure student/admin authentication, and data visualization.`,
          `Build an API middleware or utility integration that combines multiple developer endpoints to solve a real-world workflow automation problem.`
        ]
      },
      {
        name: "Advanced",
        goals: ["Design a capstone project", "Document tradeoffs", "Prepare a demo and interview story"],
        resources,
        projectIdeas: [
          `Develop and deploy a production-ready, cloud-deployed capstone project with clean state-management, full unit test coverage, and a CI/CD automation pipeline.`,
          `Design and package a lightweight developer utility library or custom plugin and publish it to npm or PyPI with comprehensive documentation.`
        ]
      }
    ]
  };
};

export const fallbackChat = (message = "") => {
  // Extract student query from history
  let query = message;
  const lastStudentIndex = message.lastIndexOf("Student:");
  if (lastStudentIndex !== -1) {
    query = message.slice(lastStudentIndex + "Student:".length).trim();
  }

  const text = query.toLowerCase();

  // GREETINGS
  if (text.match(/^(hello|hi|hey|greetings|good morning|good afternoon)/i)) {
    return `Hello! 👋 I'm your **AI Academic Coach**. How can I help you succeed today?\n\nI can:\n- 🎯 Generate detailed **12-week study roadmaps** (e.g., *'roadmap for React'*)\n- 📚 Recommend **academic textbooks** & official documentation\n- 💡 Suggest **resume-boosting projects** to help you get hired\n- 👥 Connect you with matching **P2P Study Circles**`;
  }

  // CREATE ROADMAP / LEARN
  if (text.includes("roadmap") || text.includes("learn")) {
    const topic = query.replace(/create|roadmap|for|learn|generate/gi, "").trim() || "web development";
    const normalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    return `I have generated a custom roadmap for **${normalizedTopic}**! You can access it by going to the **Roadmaps** tab on the left sidebar.\n\n**What's inside your roadmap**:\n- 📅 A **12-week milestone schedule** (Beginner, Intermediate, Advanced)\n- 🔗 Hand-picked links to **official docs** and **video tutorials**\n- 🛠️ Realistic **portfolio-ready project ideas** with tech stacks.`;
  }

  // BOOK SUGGESTIONS
  if (text.includes("book") || text.includes("suggest") || text.includes("read")) {
    if (text.includes("python")) {
      return `Here are the top book recommendations for **Python**:\n\n- 📖 **Python Crash Course** by *Eric Matthes* (Excellent hands-on project workbook)\n- 📖 **Automate the Boring Stuff with Python** by *Al Sweigart* (Great for practical scripts)\n\n*Tip: Check our Library Catalog or Shadow Library to see if classmates have listed copies available!*`;
    }
    if (text.includes("machine") || text.includes("ml") || text.includes("data") || text.includes("ai") || text.includes("artificial") || text.includes("intelligence") || text.includes("engineering")) {
      return `Here are the top book recommendations for **AI & Machine Learning Engineering**:\n\n- 📖 **Artificial Intelligence: A Modern Approach** by *Stuart Russell and Peter Norvig* (The definitive, comprehensive academic textbook)\n- 📖 **Hands-On Machine Learning** by *Aurélien Géron* (Best hands-on guide with Scikit-Learn/TensorFlow)\n- 📖 **Designing Data-Intensive Applications** by *Martin Kleppmann* (Essential reading for database architectures)\n\n*Tip: Search for 'Artificial Intelligence' in our library catalog to see if copies are available!*`;
    }
    if (text.includes("web") || text.includes("react") || text.includes("mern")) {
      return `Here are the top book recommendations for **Web Development**:\n\n- 📖 **Clean Code** by *Robert C. Martin* (A must-read for professional coding practices)\n- 📖 **Eloquent JavaScript** by *Marijn Haverbeke* (Deep dive into core JS concepts)\n\n*Tip: Check the Shadow Library under P2P bookshelf for shared copies!*`;
    }
    return `Try combining one **conceptual handbook**, one **project-based workbook**, and the **official documentation API stream**.\n\nLet me know which specific skill track (e.g. *Python*, *ML*, *React*, *Java*) you are focusing on, and I'll recommend the best books!`;
  }

  // PYTHON TOPIC EXPLANATIONS
  if (text.includes("python")) {
    return `**Python** is a highly versatile programming language used for Web Dev, Data Science, and AI.\n\n**Core Pillars to Study**:\n- 🐍 **Data Structures**: Lists, Dictionaries, Sets, and Tuples\n- ⚙️ **OOP & Functions**: Modular, reusable code structures\n- 📦 **Libraries**: \`pandas\` for data, \`requests\` for APIs, and \`scikit-learn\` for ML.\n\n**Actionable Step**: Check out **docs.python.org** or request *Python Crash Course* from our catalog!`;
  }

  // REACT / WEB DEV TOPIC EXPLANATIONS
  if (text.includes("react") || text.includes("mern") || text.includes("web development")) {
    return `The **MERN Stack** (MongoDB, Express, React, Node) is a modern JavaScript framework standard for Web Applications.\n\n**Essential Concepts**:\n- 🧩 **React Components**: Reusable UI blocks managed via state (\`useState\`, \`useEffect\`)\n- 🌐 **Express APIs**: Routing middleware and controllers in Node\n- 💾 **MongoDB**: NoSQL database modeling with Mongoose\n\n**Actionable Step**: Join the **MERN Stack Wizards 🚀** study circle to learn with peers!`;
  }

  // MACHINE LEARNING & AI TOPIC EXPLANATIONS
  if (text.includes("machine learning") || text.includes("ml") || text.includes("deep learning") || text.includes("ai") || text.includes("artificial") || text.includes("intelligence") || text.includes("engineering")) {
    return `**AI & Machine Learning Engineering** focuses on building statistical models and intelligent agents that learn patterns from training data.\n\n**Recommended Study Path**:\n- 📐 **Mathematics**: Linear algebra, calculus, and basic probability\n- 🤖 **Classical ML**: Data preprocessing, regression, and random forests using \`scikit-learn\`\n- 🧠 **Deep Learning**: Neural networks and transformers using \`TensorFlow\` or \`PyTorch\`\n\n**Actionable Step**: Read the **scikit-learn User Guide** and check out Kaggle Competitions!`;
  }

  // PROJECT IDEAS
  if (text.includes("project") || text.includes("build") || text.includes("idea")) {
    return `Here are some great resume-boosting project ideas:\n\n1. 📊 **Student Finance Tracker (MERN)**: CRUD app tracking expenses with charts and CSV exports.\n2. 🤖 **House Price Predictor (Python/ML)**: Model predicting prices based on dataset features using scikit-learn.\n3. 📦 **Shadow Library Portal (Full-stack)**: P2P book-sharing network with custom borrow requests.\n\nWhich track are you interested in? I can provide the full tech stack and milestones!`;
  }

  // DEFAULT CHAT RESPONSE
  return `I'm here to act as your **AI Academic Coach**! \n\nTell me what you are working on, and I can help you with:\n- 🎯 Creating **custom roadmaps** (e.g. *'roadmap for Python'*)\n- 📚 Recommending **textbooks & documentation**\n- 💡 Formulating **project ideas**\n- 👥 Connecting with **Study Circles**`;
};
