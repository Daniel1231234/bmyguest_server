const express = require("express");
const cors = require("cors");
const path = require("path");
const expressSession = require("express-session");

const app = express();
const http = require("http").createServer(app);
app.use(express.static("public"));

const session = expressSession({
  secret: "coding is amazing",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
});
app.use(express.json());
app.use(session);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "public")));
} else {
  const corsOptions = {
    origin: [
      "http://127.0.0.1:3030",
      "http://localhost:3030",
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

const authRoutes = require("./api/auth/auth.routes");
const userRoutes = require("./api/user/user.routes");
const stayRoutes = require("./api/stay/stay.routes");
const orderRoutes = require("./api/order/order.routes");
const { connectSockets } = require("./services/socket.service");

// routes
const setupAsyncLocalStorage = require("./middlewares/setupAls.middleware.js");
app.all("*", setupAsyncLocalStorage);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stay", stayRoutes);
app.use("/api/order", orderRoutes);

connectSockets(http, session);

const logger = require("./services/logger.service");
const port = process.env.PORT || 3030;

app.get("/**", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

http.listen(port, () => {
  logger.info("Server is running on port: " + port);
});
