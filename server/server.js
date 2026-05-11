import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import apiRoute from "./routes/apiRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

/** Split comma-separated origins; strip trailing slashes (Origin header never has one). */
function parseOriginsList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://memora-ai-9jvr.vercel.app",
];

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...parseOriginsList(process.env.ALLOWED_ORIGINS),
  ...parseOriginsList(process.env.CLIENT_ORIGIN),
]);

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      console.warn("[cors] blocked request from origin:", origin);
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);


// middlewares for cors and parsing incoming JSON requests

app.use(express.json())
app.use(cookieParser());

// user router
app.use("/api/auth", authRoutes);
// home
app.use("/api/gemini", apiRoute);

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI — set it in the server host environment (e.g. Vercel).");
}
if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET — auth will fail until it is set.");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("<html> <body> <h1>Server is running</h1> </body> </html>");
});
