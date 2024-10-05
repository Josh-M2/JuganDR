import express from "express";
import { login, logout } from "../Controller/LoginLogout";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
