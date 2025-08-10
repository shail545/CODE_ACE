const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const videoRouter =  express.Router();
const {generateUploadSignature,saveVideoMetadata,deleteVideo,geturl,generateUploadSignatureImg,saveProfile,getPhoto
    ,Like,Data,View,comment
} = require("../controllers/videoSection")

const {transcript,videoQuery}=require('../controllers/transcript');
const userMiddleware = require('../middleware/userMiddleware');

videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
videoRouter.delete("/delete/:problemId",adminMiddleware,deleteVideo);
videoRouter.post("/transcript",adminMiddleware,transcript);
videoRouter.post("/videoquery",userMiddleware,videoQuery);
videoRouter.post("/geturl",userMiddleware,geturl);
videoRouter.get('/image/upload-signature',generateUploadSignatureImg);
videoRouter.post('/image/save',saveProfile);
videoRouter.post('/image/get',getPhoto);
videoRouter.post('/like',Like);
videoRouter.post('/data',Data);
videoRouter.post('/view',View);
videoRouter.post('/comment',comment);


module.exports = videoRouter;