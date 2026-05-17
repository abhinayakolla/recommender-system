const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const recommendRoutes = require("./routes/recommendations");
const agentRoutes = require("./routes/agents");
const { initRewardEngine } = require("./rl_engine/rewardEngine");

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [
    "http://localhost:3000",
    "http://localhost:80",
    "https://recommender-system-1-xhz6.onrender.com",
    "https://recommender-system-ef15.onrender.com",
  ];

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json({ limit: "10kb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again after 15 minutes." },
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/mtech_rl_rec")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB Error:", err));

app.get("/", (req, res) => {
  res.send("API Running Successfully");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/recommendations", recommendRoutes);
app.use("/api/agents", agentRoutes);

app.get("/api/seed", async (req, res) => {
  try {
    const User = require("./models/User");
    const Item = require("./models/Item");

    await Item.deleteMany({});
    await User.deleteMany({});

    const admin = await User.create({
      username: "admin",
      email: "admin@mtech.edu",
      password: "admin123",
      role: "admin",
    });

    const items = [
      { title: "Deep Learning Fundamentals", category: "AI/ML", tags: ["neural-networks"], rating: 4.8, imageUrl: "https://picsum.photos/seed/dl/400/300", description: "A comprehensive course on neural networks and deep learning architectures.", createdBy: admin._id },
      { title: "Reinforcement Learning in Practice", category: "AI/ML", tags: ["rl", "q-learning"], rating: 4.9, imageUrl: "https://picsum.photos/seed/rl/400/300", description: "Hands-on guide to building RL agents from scratch.", createdBy: admin._id },
      { title: "Distributed Systems Design", category: "Backend", tags: ["microservices"], rating: 4.6, imageUrl: "https://picsum.photos/seed/ds/400/300", description: "Design scalable distributed systems with modern tools.", createdBy: admin._id },
      { title: "React Advanced Patterns", category: "Frontend", tags: ["react", "hooks"], rating: 4.7, imageUrl: "https://picsum.photos/seed/react/400/300", description: "Master advanced React patterns for production apps.", createdBy: admin._id },
      { title: "MongoDB Mastery", category: "Database", tags: ["mongodb", "nosql"], rating: 4.5, imageUrl: "https://picsum.photos/seed/mongo/400/300", description: "Complete guide to MongoDB from basics to advanced.", createdBy: admin._id },
      { title: "Graph Neural Networks", category: "AI/ML", tags: ["gnn", "pytorch"], rating: 4.8, imageUrl: "https://picsum.photos/seed/gnn/400/300", description: "Learn GNNs for recommendation and social network analysis.", createdBy: admin._id },
      { title: "Kubernetes & Docker", category: "DevOps", tags: ["k8s", "docker"], rating: 4.6, imageUrl: "https://picsum.photos/seed/k8s/400/300", description: "Deploy and manage containerized applications at scale.", createdBy: admin._id },
      { title: "Natural Language Processing", category: "AI/ML", tags: ["nlp", "transformers"], rating: 4.9, imageUrl: "https://picsum.photos/seed/nlp/400/300", description: "From tokenization to transformers — complete NLP guide.", createdBy: admin._id },
      { title: "System Design Interview Prep", category: "Backend", tags: ["system-design"], rating: 4.7, imageUrl: "https://picsum.photos/seed/sdi/400/300", description: "Crack system design interviews with real-world examples.", createdBy: admin._id },
      { title: "Computer Vision with OpenCV", category: "AI/ML", tags: ["opencv", "cnn"], rating: 4.6, imageUrl: "https://picsum.photos/seed/cv/400/300", description: "Build image recognition and object detection systems.", createdBy: admin._id },
      { title: "Real-Time Data Pipelines", category: "Data Engineering", tags: ["kafka", "spark"], rating: 4.5, imageUrl: "https://picsum.photos/seed/pipe/400/300", description: "Design event-driven pipelines with Kafka and Spark.", createdBy: admin._id },
      { title: "WebSockets & Socket.IO", category: "Backend", tags: ["websockets", "nodejs"], rating: 4.4, imageUrl: "https://picsum.photos/seed/ws/400/300", description: "Build real-time applications with WebSockets.", createdBy: admin._id },
    ];

    await Item.insertMany(items);

    await User.create({
      username: "student01",
      email: "student@mtech.edu",
      password: "student123",
      role: "user",
    });

    res.json({ message: "Seeded successfully! 12 items, admin + student created." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("user_interaction", async (data) => {
    const { userId, itemId, action } = data;
    const reward = initRewardEngine(action);

    socket.emit("reward_signal", {
      reward,
      itemId,
      action,
      timestamp: Date.now(),
    });

    io.emit("live_feed", { userId, action, itemId, reward });
  });

  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));