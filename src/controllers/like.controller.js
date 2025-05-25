import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "VideoId is missing");
  }
  // console.log(req.user._id)
  const isAlreadyExists = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  let isLiked;

  if (isAlreadyExists != null) {
    await Like.findOneAndDelete({
      video: videoId,
      likedBy: req.user._id,
    });

    isLiked = false;
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    // console.log(req.user._id)

    isLiked = true;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        `Video ${isLiked ? "Liked" : "UnLiked"} Succssfull`
      )
    );

  //TODO: toggle like on video
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "CommentId is missing");
  }
  // console.log(req.user._id)
  const isAlreadyExists = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  let isLiked;

  if (isAlreadyExists != null) {
    await Like.findOneAndDelete({
      comment: commentId,
      likedBy: req.user._id,
    });

    isLiked = false;
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    // console.log(req.user._id)

    isLiked = true;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        `comment ${isLiked ? "Liked" : "UnLiked"} Succssfull`
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //   const { tweetId } = req.params;

  const { tweetId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "tweetId is missing");
  }
  // console.log(req.user._id)
  const isAlreadyExists = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  let isLiked;

  if (isAlreadyExists != null) {
    await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    isLiked = false;
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    // console.log(req.user._id)

    isLiked = true;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        `tweet ${isLiked ? "Liked" : "UnLiked"} Succssfull`
      )
    );
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "video",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "like",
              as: "likes",
            },
          },
          {
            $addFields: {
              likes: {
                $size: "$like",
              },
              isLiked: {
                $cond: {
                  if: { $in: [req.user._id, "$likes.likedBy"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $replaceRoot: {
        newRoot: "$videos",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "liked Videos are fetched Successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
