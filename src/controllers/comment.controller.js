import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video not found");
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    {
      $limit: Number(limit),
    },
    {
      $project: {
        content: 1,
        owner: 1,
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
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: {
          $arrayElemAt: ["$owner", 0],
        },
        likes: {
          $size: "$likes",
        },
      },
    },
  ]);

  if (!comments) {
    throw new ApiError(400, "comments are not fetched");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, comments, "Video comments are fetched successfull")
    );
});
const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(402, "Incorrect video id or missing video");
  }
  if (!content) {
    throw new ApiError(401, "Conetent nto found");
  }
  const addComments = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!addComment) {
    throw new ApiError(404, "no comments");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, addComments, "Comment addded successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!addComment) {
    throw new ApiError(401, "comment not found");
  }
  if (!content) {
    throw new ApiError(404, "comment is empty");
  }
  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!updateComment) {
    throw new ApiError(400, "comment not updqated");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateComment, " Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment\
  const { commentId } = req.params;
  if (!addComment) {
    throw new ApiError(401, "comment not found");
  }
  if (!content) {
    throw new ApiError(404, "comment is empty");
  }
  const deleteComment = await Comment.findByIdAndDelete(commentId);
  if (!deleteComment) {
    throw new ApiError(401, "comment not deleted");
  }
  return res
    .status(400)
    .json(new ApiResponse(400, deleteComment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
