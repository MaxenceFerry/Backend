import express from "express";
import { connectUser, deposit } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/connect", connectUser);
router.post("/deposit", deposit);

export default router;