import express from "express";
import { take, swap } from "../controllers/loanController.js";

const router = express.Router();

router.post("/take", take);
router.post("/swap", swap);

export default router;