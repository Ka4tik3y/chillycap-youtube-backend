import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const user = await User.req.user._id;
  if (!user) {
    throw new ApiError(401, "user not found");
  }
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(404, "tweet not done");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tyweeted succeessfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, " user not found");
  }
  const getTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likes: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);
  if (getTweets.length == 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, "the user could not tweet yet"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, getTweets, "the user tweet fetched successfull")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!tweetId) {
    throw new ApiError(401, "tweetid is missing");
  }

  if (!content) {
    throw new ApiError(401, "content is missing");
  }
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!updatedTweet) {
    throw new ApiError(402, "tweet not updated");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweeet is updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  // const { content } = req.body;
  if (!tweetId) {
    throw new ApiError(401, "tweetid is missing");
  }

  if (!content) {
    throw new ApiError(401, "content is missing");
  }
  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(402, "tweet not deleted");
  }
  return res.status(200).json(new ApiResponse(200, tweet, "tweeet is deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
