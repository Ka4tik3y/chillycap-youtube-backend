import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
// import {cloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res, next) => {
  // get user details from frontend
  // validation - not empty
  // check if user is already registered: username and email
  // check for images and avater
  // uplaod them to cloudinaray, avatar
  // create user object coz mongodb accpets only objects as entries- create entry in db
  // remove password and refresh token field from response
  //check for user creation
  // rerurn res
  const { fullName, username, email, password } = req.body;
  console.log("email: ", email);

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "Username or email  already exists");
  }
  const avatarLocalPath = req.files?.avatar[0].path;
  // console.log("avatar",avatarLocalPath);
  const coverImageLocalPath = req.files?.coverImage[0].path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is neccessary!");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});
export { registerUser };
