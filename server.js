
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const connectDatabase = require("./config/database");
const emailRoutes = require("./routes/emailRoutes");
const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");
const adminRoutes =require("./routes/adminRoutes");
const { modelInfo } = require("./services/mlClassifier");
const app = express();

const PORT = process.env.PORT || 5000;
connectDatabase();

// Middleware
app.use(helmet());
app.use(cors());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Root
app.get("/", (req, res) => {
    res.json({
        success: true,
        service: "PhishAI Backend",
        message: "Backend is running"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "PhishAI Backend",
        status: "healthy",
        emailAnalysis: true,
        urlAnalysis: true,
        aiAnalysis: Boolean(process.env.OPENAI_API_KEY),
        localFallback: true,
        mlAnalysis: true,
        mlModel: "Naive Bayes",
        mlModelSource: modelInfo().source,
        mlTrainedAt: modelInfo().trainedAt || null,
        mlEvaluation: modelInfo().evaluation || null
    });
});
app.get("/api/protected-test", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed successfully",
        user: req.user
    });
});
app.get(
    "/api/admin-test",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.json({
            success: true,
            message: "Admin route accessed successfully",
            user: req.user
        });
    }
);
app.use(
    "/api/admin",
    adminRoutes
);
app.use((req, res, next) => {
    console.log("🌐 REQUEST RECEIVED:", req.method, req.originalUrl);
    next();
});
app.use("/api", emailRoutes);
app.use("/api", urlRoutes);
app.use("/api/auth", authRoutes);

// 404
app.use((req, res, next) => {
    console.log("🌐 REQUEST RECEIVED:", req.method, req.originalUrl);
    next();
});

app.use("/api", emailRoutes);
app.use("/api", urlRoutes);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Backend Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// Start server
app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("🛡️  PhishAI Backend");
    console.log("======================================");
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
    console.log("======================================");
    console.log("");
});
