import mongoose from "mongoose";
import dotenv from "dotenv";
import { Video } from "./src/models/video.model.js"; // adjust path if needed
import  {User}  from "./src/models/User.model.js"; // adjust path if needed

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || "your-mongodb-connection-string";

const seedVideos = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");

   // Replace the section where we find a user:
let user = await User.findOne();

if (!user) {
  user = await User.create({
    username: "demoUser",
    fullName: "Demo User",
    email: "demo@example.com",
    password: "securePassword123", // Make sure your User model hashes this
    avatar: "https://example.com/avatar.jpg",
  });

  console.log("✅ Dummy user created:", user.email);
}

    const userId = user._id;

    const dummyVideos = [
  {
    title: "Test Video 1",
    description: "This is a test video about Node.js",
    owner: userId,
    videoFile: "https://example.com/video1.mp4",
    thumbnail: "https://example.com/thumb1.jpg",
    duration: 300, // 5 minutes
  },
  {
    title: "Test Video 2",
    description: "Learn about Express.js in this video",
    owner: userId,
    videoFile: "https://example.com/video2.mp4",
    thumbnail: "https://example.com/thumb2.jpg",
    duration: 420, // 7 minutes
  },
  {
    title: "Test Video 3",
    description: "MongoDB aggregation explained",
    owner: userId,
    videoFile: "https://example.com/video3.mp4",
    thumbnail: "https://example.com/thumb3.jpg",
    duration: 180, // 3 minutes
  },
];


    await Video.insertMany(dummyVideos);
    console.log("✅ Dummy videos inserted!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedVideos();
