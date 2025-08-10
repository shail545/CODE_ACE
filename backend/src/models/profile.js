const mongoose = require('mongoose');
const {Schema} = mongoose;

const profilePhoto = new Schema({
    userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
   },
   cloudinaryPublicId: {
    type: String,
    required: true,
    unique: true
  },
  secureUrl: {
    type: String,
    required: true
  },
},{
    timestamps:true
});



const Profile = mongoose.model("profile",profilePhoto);

module.exports = Profile;
