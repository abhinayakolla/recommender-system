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

// SECURITY 1: Allowed Origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:80"];

// SECURITY 2: Socket.IO with restricted CORS
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
});

// SECURITY 3: Helmet - 14 HTTP security headers
app.use(helmet());

// SECURITY 4: CORS restricted to allowed origins only
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: origin not allowed"));
    }
  },
  credentials: true
}));

// Limit body size to prevent payload attacks
app.use(express.json({ limit: "10kb" }));

// SECURITY 5: Global Rate Limiter - 100 requests/15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});
app.use(globalLimiter);

// SECURITY 6: Strict Auth Rate Limiter - 20 attempts/15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts, please try again after 15 minutes." }
});

// DB Connect
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/mtech_rl_rec")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("DB Error:", err));

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/recommendations", recommendRoutes);
app.use("/api/agents", agentRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// Socket.IO Real-Time Streaming
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("user_interaction", async (data) => {
    const { userId, itemId, action } = data;
    const reward = initRewardEngine(action);
    socket.emit("reward_signal", { reward, itemId, action, timestamp: Date.now() });
    io.emit("live_feed", { userId, action, itemId, reward });
  });
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
