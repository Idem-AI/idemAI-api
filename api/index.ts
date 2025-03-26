import express from "express";

const port = process.env.PORT || 3000;
const app = express();
var cors = require("cors");
import promptRouter from "./routes/promptRoute";

app.use(express.json());
app.use(
  cors({
    origin: ["https://lexis.pharaon.me", "http://localhost:4200"],
    methods: ["POST"],
  })
);

app.get("/", (req, res) => {
  res.status(200).json("Welcome to Lexis Api");
});

app.use("/api", promptRouter);

app.listen(port, () => {
  console.log(`our application is running at port ${port}`);
});


module.exports = app;