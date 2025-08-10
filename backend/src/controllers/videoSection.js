const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideo");
const {sanitizeFilter} = require('mongoose');
const { response } = require('express');
const Profile = require('../models/profile');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const userId = req.result._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};
const generateUploadSignatureImg = async (req, res) => {
  try {
    

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `Profile_img/_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};

const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;

    const userId = req.result._id;

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    // Check if video already exists for this problem and user
    const existingVideo = await SolutionVideo.findOne({
      problemId,
      userId,
      cloudinaryPublicId
    });

    if (existingVideo) {
      return res.status(409).json({ error: 'Video already exists' });
    }

    const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
    resource_type: 'image',  
    transformation: [
    { width: 400, height: 225, crop: 'fill' },
    { quality: 'auto' },
    { start_offset: 'auto' }  
    ],
    format: 'jpg'
    });

    // Create video solution record
    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl
    });


    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
};
const saveProfile = async (req, res) => {
  try {
    const {
      userId,
      cloudinaryPublicId,
      secureUrl,
    } = req.body;

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'image' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Image not found on Cloudinary' });
    }

    // Check if profile photo already exists for this user
    const existingPhoto = await Profile.findOne({ userId });

    if (existingPhoto) {
      // Update existing profile photo
      const updatedPhoto = await Profile.findOneAndUpdate(
        { userId },
        {
          cloudinaryPublicId,
          secureUrl,
        },
        { new: true } // Return the updated document
      );

      return res.status(200).json({
        message: 'Profile photo updated successfully',
        photo: {
          id: updatedPhoto._id,
          secureUrl: updatedPhoto.secureUrl,
          updatedAt: updatedPhoto.updatedAt
        }
      });
    }

    // Create new profile photo record if none exists
    const profilePhoto = await Profile.create({
      userId,
      cloudinaryPublicId,
      secureUrl,
    });

    res.status(201).json({
      message: 'Profile photo saved successfully',
      photo: {
        id: profilePhoto._id,
        secureUrl: profilePhoto.secureUrl,
        createdAt: profilePhoto.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving profile photo:', error);
    res.status(500).json({ 
      error: 'Failed to save profile photo',
      details: error.message 
    });
  }
};
const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;

    const video = await SolutionVideo.findOneAndDelete({problemId:problemId});
    
   

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' , invalidate: true });

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};
 
const geturl = async(req,res)=>{
  try{
    const {problemId}=req.body;
   const solutionVideo = await SolutionVideo.findOne({ problemId: problemId })
   if(!solutionVideo){
    res.status(404).send("NO VEDIO AVIALABLE")
   }
   res.status(200).send(solutionVideo);
  }catch(err){
    res.status(400).send(err);
  }
}
const getPhoto = async(req,res)=>{
  try{
    const {id}=req.body;
    const data = await Profile.findOne({userId:id});
    res.send(data);
  }catch(err){
    res.send("Error"+ err)
  }
}
const Like = async (req, res) => {
  try {
    const { pid, userId } = req.body;

    // Validate inputs
    if (!pid || !userId) {
      return res.status(400).json({ 
        error: "Problem ID and User ID are required" 
      });
    }

    // Find the video by problemId
    const video = await SolutionVideo.findOne({ problemId: pid });
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check if user already liked the video
    const userLikeIndex = video.likes.findIndex(like => 
      like.toString() === userId.toString()
    );

    // Toggle like status
    if (userLikeIndex === -1) {
      video.likes.push(userId); // Add like
    } else {
      video.likes.splice(userLikeIndex, 1); // Remove like
    }

    // Save the updated video
    await video.save();

    res.status(200).json({
      success: true,
      likeCount: video.likes.length,
      isLiked: userLikeIndex === -1
    });

  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};

const Data = async(req,res)=>{
 try{
   const {pid}=req.body;
  const data = await SolutionVideo.findOne({ problemId: pid });

  res.status(200).json({
    success:true,
    like:data.likes,
    comment:data.comments,
    view:data.views,
  })
 }catch{
   res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
 }
}

const View = async (req, res) => {
  try {
    const { pid, userId } = req.body;

    // Validate problem ID
    if (!pid) {
      return res.status(400).json({ 
        error: "Problem ID is required" 
      });
    }

    // Find the video
    const video = await SolutionVideo.findOne({ problemId: pid });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check if user exists in views array (only if userId provided)
    let userAlreadyViewed = false;
    if (userId) {
      userAlreadyViewed = video.views.some(
        view => view.user && view.user.toString() === userId.toString()
      );
    }

    
    if (userId && !userAlreadyViewed) {
      video.views.push({ user: userId });
    }

    await video.save();

    res.status(200).json({
      success: true,
      viewCount: video.viewCount,
      userViewAdded: userId ? !userAlreadyViewed : false
    });

  } catch (err) {
    console.error("View tracking error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};


const comment = async (req, res) => {
  try {
    const { pid, userId, text, user } = req.body;

    // Validate inputs
    if (!pid || !userId || !text || !user) {
      return res.status(400).json({ 
        error: "Problem ID, User ID, User Name, and comment text are required" 
      });
    }

    // Find the video by problemId
    const video = await SolutionVideo.findOne({ problemId: pid });
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Create new comment with name included
    const newComment = {
      name: user,  // Storing the username directly
      user: userId,  // Storing user reference
      text: text,
      createdAt: new Date()
    };

    video.comments.push(newComment);
    await video.save();

    // Get the last added comment
    const addedComment = video.comments[video.comments.length - 1];

    // Return response with all necessary data
    res.status(200).json({
      success: true,
      comment: {
        _id: addedComment._id,
        name: addedComment.name,
        userId: addedComment.user,
        text: addedComment.text,
        createdAt: addedComment.createdAt
      },
      commentCount: video.comments.length
    });

  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};




module.exports = {generateUploadSignature,saveVideoMetadata,deleteVideo
  ,geturl,generateUploadSignatureImg,saveProfile,getPhoto
  ,Like,Data,View,comment};