import express from 'express'
import { loginUser, userProfile, verifyuser } from '../controller/userController.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router()

router.post("/login", loginUser)
router.post("/verify", verifyuser)
router.get("/me", isAuth, userProfile)

export default router;