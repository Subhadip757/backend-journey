import { Router } from "express";
import { registerUser } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middlewire.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 }, // ✅ Ensure the name is EXACTLY "avatar"
        { name: "coverImage", maxCount: 1 }, // ✅ Not "Cover Image"
    ]),
    registerUser
);

export default router;
