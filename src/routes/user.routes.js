import { Router } from "express";
import express from "express";
import { registerUser } from "../controllers/user.controller.js";
const router = express();
import { upload } from "../middlewares/multer.middleware.js";

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
