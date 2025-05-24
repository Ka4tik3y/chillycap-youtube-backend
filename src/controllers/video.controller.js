import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { application } from "express";
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    // query,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;
  //   console.log(req.query)

  const userId = req.user?._id;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "User is not authenticated or userId is invalid");
  }
  console.log(userId);

//   if (!query) {
//     throw new ApiError(400, "Query not found!");
//   }
//   console.log(query);

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const videos = await Video.aggregate([
    {
      $match: {


        // $or: [
        //   { title: { $regex: query, $options: "i" } },
        //   { description: { $regex: query, $options: "i" } },
        // ],


        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likes" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
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
    { $unwind: "$ownerDetails" },
    {
      $sort: {
        [sortBy]: sortType === "desc" ? -1 : 1,
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
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        ownerDetails: 1,
        createdAt: 1,
        updatedAt: 1,
        likes: 1,
        views: 1,
      },
    },
  ]);
  console.log(videos);

  if (videos.length === 0) {
    throw new ApiError(404, "No videos found matching your query");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(401, "all fields are neccessary");
  }
  if (!req?.files?.videoFile || !req?.files?.thumbnail) {
    throw new ApiError(401, "videofole and thumbnail is req");
  }
  const videoFileLocalPath = req.files.videoFile[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!videoFile || !thumbnail) {
    throw new ApiError(401, "error while uplaoading on clodinary");
  }
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner: req?.user._id,
  });
  if (!video) {
    throw new ApiError(404, "video is missing");
  }
  return res.status(200).json(new ApiResponse(200, video, "video is uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id



});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail


  
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
