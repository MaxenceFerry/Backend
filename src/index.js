import express from "express";
import cors from "cors";
import loanRoutes from "./routes/loanRoutes.js";

const app = express();

app.use(cors());
app.use(express.json()); // ✅ DOIT ÊTRE AVANT

app.use("/loan", loanRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});