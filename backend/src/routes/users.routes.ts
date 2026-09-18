import { Router } from "express";
import { connectTelegram, getTelegramConnectionStatus } from "../controllers/telegram.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { connectTelegramBodySchema } from "../schemas/telegram.schemas";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.post("/me/telegram", validate({ body: connectTelegramBodySchema }), connectTelegram);
usersRouter.get("/me/telegram", getTelegramConnectionStatus);
