const mongoose = require("mongoose");
const User = require("../models/User");
const Item = require("../models/Item");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mtech_rl_rec";

const items = [
  { title: "Deep Learning Fundamentals", category: "AI/ML", tags: ["neural-networks", "deep-learning"], rating: 4.8, imageUrl: "https://picsum.photos/seed/dl/400/300", description: "A comprehensive course on neural networks and deep learning architectures." },
  { title: "Reinforcement Learning in Practice", category: "AI/ML", tags: ["rl", "q-learning", "agents"], rating: 4.9, imageUrl: "https://picsum.photos/seed/rl/400/300", description: "Hands-on guide to building RL agents from scratch." },
  { title: "Distributed Systems Design", category: "Backend", tags: ["microservices", "kafka", "redis"], rating: 4.6, imageUrl: "https://picsum.photos/seed/ds/400/300", description: "Design scalable distributed systems with modern tools." },
  { title: "React Advanced Patterns", category: "Frontend", tags: ["react", "hooks", "context"], rating: 4.7, imageUrl: "https://picsum.photos/seed/react/400/300", description: "Master advanced React patterns for production apps." },
  { title: "MongoDB Mastery", category: "Database", tags: ["mongodb", "nosql", "aggregation"], rating: 4.5, imageUrl: "https://picsum.photos/seed/mongo/400/300", description: "Complete guide to MongoDB from basics to advanced aggregation." },
  { title: "Graph Neural Networks", category: "AI/ML", tags: ["gnn", "graph-theory", "pytorch"], rating: 4.8, imageUrl: "https://picsum.photos/seed/gnn/400/300", description: "Learn GNNs for recommendation and social network analysis." },
  { title: "Kubernetes & Docker", category: "DevOps", tags: ["k8s", "docker", "deployment"], rating: 4.6, imageUrl: "https://picsum.photos/seed/k8s/400/300", description: "Deploy and manage containerized applications at scale." },
  { title: "Natural Language Processing", category: "AI/ML", tags: ["nlp", "transformers", "bert"], rating: 4.9, imageUrl: "https://picsum.photos/seed/nlp/400/300", description: "From tokenization to transformers — complete NLP guide." },
  { title: "System Design Interview Prep", category: "Backend", tags: ["system-design", "architecture"], rating: 4.7, imageUrl: "https://picsum.photos/seed/sdi/400/300", description: "Crack system design interviews with real-world examples." },
  { title: "Computer Vision with OpenCV", category: "AI/ML", tags: ["opencv", "image-processing", "cnn"], rating: 4.6, imageUrl: "https://picsum.photos/seed/cv/400/300", description: "Build image recognition and object detection systems." },
  { title: "Real-Time Data Pipelines", category: "Data Engineering", tags: ["kafka", "spark", "streaming"], rating: 4.5, imageUrl: "https://picsum.photos/seed/pipe/400/300", description: "Design event-driven pipelines with Kafka and Apache Spark." },
  { title: "WebSockets & Socket.IO", category: "Backend", tags: ["websockets", "real-time", "nodejs"], rating: 4.4, imageUrl: "https://picsum.photos/seed/ws/400/300", description: "Build real-time applications with WebSockets and Socket.IO." }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Item.deleteMany({});
  await User.deleteMany({});

  // Create admin
  const admin = await User.create({ username: "admin", email: "admin@mtech.edu", password: "admin123", role: "admin" });
  // Create demo user
  await User.create({ username: "student01", email: "student@mtech.edu", password: "student123", role: "user" });

  await Item.insertMany(items.map(i => ({ ...i, createdBy: admin._id })));
  console.log("✅ Seeded 12 items, 1 admin, 1 student");
  console.log("   Admin: admin@mtech.edu / admin123");
  console.log("   User:  student@mtech.edu / student123");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
