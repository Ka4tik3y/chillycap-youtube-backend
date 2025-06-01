import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { useOptimistic } from "react";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(404, "name is missing");
  }
  if (!description) {
    throw new ApiError(404, "desscription is missing");
  }
  const playlist = await Playlist.create({
    name,
    description,
    // videos: req.videos._id,
    owner: req.users._id,
  });
  if (!playlist) {
    throw new ApiError(401, "playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist is created"));

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "userid is incorrect or missing");
  }
  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              foreignField: "video",
              localField: "_id",
              as: "likes",
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
        ],
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
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        videos: 1,
        name: 1,
        description: 1,
        owner: 1,
      },
    },
  ]);
  if (userPlaylists.length <= 0) {
    return res.status(200).json(new ApiResponse(400, "No Playlists yet"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylists,
        "user playLists are fetched successfull"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlistId is not correct");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              foreignField: "video",
              localField: "_id",
              as: "likes",
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
        ],
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
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        videos: 1,
        name: 1,
        description: 1,
        owner: 1,
      },
    },
  ]);

  if (!playlist.length) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "PlayList fetched successfull"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "playlistid is missing or incorrect");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "video is missing or not found");
  }
  const video = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "video added to the playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "playlistid is missing or incorrect");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "video is missing or not found");
  }
  const video = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        "video removed from the playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "playlist id is incorrect");
  }
  const delPlay = await Playlist.findByIdAndDelete(playlistId);
  if (!delPlay) {
    throw new ApiError(402, "playlisty not deleted");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletePlaylist, "playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(401, "playlist id is incorrect");
  }
  if (!name || !description) {
    throw new ApiError(402, "name and description is missing");
  }
  const upPlay = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );
  if (!upPlay) {
    throw new ApiError(402, "playlist not updated");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatePlaylist, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
