const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name bust be not null']
  },
  lastname: {
    type: String,
    required: [true, 'lastname bust be not null']
  },
  email: {
    type: String,
    required: [true, 'email bust be not null']
  },
  password: {
    type: String,
    required: [true, 'password bust be not null'],
    maxLength: 200
  },
  reviews: [String],
  signUpDate: String,
  token: String,
  favouriteProfessionals: [String],
  resetToken: String,
  securityQuestion: {
    type: String,
    required: [true, 'security question bust be not null']
  },
  securityAnswer: {
    type: String,
    required: [true, 'security answer bust be not null']
  },
  tags: [String],
});

const businessConsultantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name bust be not null']
  },
  lastname: {
    type: String,
    required: [true, 'lastname bust be not null']
  },
  email: {
    type: String,
    required: [true, 'email bust be not null']
  },
  password: {
    type: String,
    required: [true, 'password bust be not null'],
    maxLength: 200
  },
  pIva: {
    type: String,
    required: [true, 'P.iva bust be not null']
  },
  address: {
    type: String,
    required: [true, 'adress bust be not null']
  },
  city: {
    type: String,
    required: [true, 'city bust be not null']
  },
  province: {
    type: String,
    required: [true, 'province bust be not null']
  },
  iban: {
    type: String,
    required: [true, 'iban bust be not null']
  },
  selfCertified: {
    type: String,
    required: [true, 'self certified bust be not null']
  },
  signUpDate: String,
  token: String,
  professionals: [String],
  resetToken: String,
  securityQuestion: {
    type: String,
    required: [true, 'security question bust be not null']
  },
  securityAnswer: {
    type: String,
    required: [true, 'security answer bust be not null']
  }
})

const professionalSchema = new mongoose.Schema({
  ragioneSociale: {
    type: String,
    required: [true, 'ragioneSociale bust be not null']
  },
  email: String,
  password: String,
  number: String,
  pIva: {
    type: String,
    required: [true, 'P.iva bust be not null']
  },
  address: {
    type: String,
    required: [true, 'adress bust be not null']
  },
  city: {
    type: String,
    required: [true, 'city bust be not null']
  },
  province: {
    type: String,
    required: [true, 'province bust be not null']
  },
  cap: {
    type: String,
    required: [true, 'province bust be not null']
  },
  category: String,
  ateco: String,
  durcExp: {
    type: String,
    required: [true, 'durc expired date must be not null']
  },
  visuraExp: {
    type: String,
    required: [true, 'visure expired date must be not null']
  },
  insuranceExp: {
    type: String,
    required: [true, 'insurance expired date must be not null']
  },
  profilePic: String,
  intro: String,
  aboutUsGallery: [String],
  aboutUsCopy: String,
  latitude: String,
  longitude: String,
  specializationsGallery: [String],
  businessConsultant: {
    type: String,
    required: [true, 'business consultant must be not null']
  },
  posts: [String],
  followedProfessionals: [String],
  followingProfessionals: [String],
  reviews: [String],
  profileStatus: Map,
  signUpDate: String,
  token: String,
  resetToken: String,
  securityQuestion: String,
  securityAnswer: String,
  tags: [String],
})

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'email must not be null']
  },
  password: String,
  level: {
    type: Number,
    required: [true, 'level must be not null']
  },
  signUpToken: String,
  loginToken: String,
  securityQuestion: String,
  securityAnswer: String,
  resetToken: String
})

const postSchema = new mongoose.Schema({
  image: String,
  video: String,
  copy: String,
  shares: Number,
  sell: Boolean,
  professionalID: String,
  likes: [String],
  comments: [String],
  date: String
})

const commentSchema = new mongoose.Schema({
  text: String,
  professionalID: String,
  lastModifiedDate: String
})

const reviewSchema = new mongoose.Schema({
  vote: {
    type: Number,
    validate: function (v) {
      return v == 0 || v == 1 || v == 2 || v == 3 || v == 4 || v == 5
    }
  },
  text: String,
  date: String,
  userID: String,
  professionalID: String
})

const macroAtecoSchema = new mongoose.Schema({
  code: String,
  detail: String,
  professionals: [String]
})

const atecoSchema = new mongoose.Schema({
  code: String,
  detail: String
})

const chatSchema = new mongoose.Schema({
  userID: String,
  professionalID: String,
  messages: [Object]
})


const tagSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  userModel: mongoose.model('user', userSchema),
  businessConsultantModel: mongoose.model('businessConsultant', businessConsultantSchema),
  professionalModel: mongoose.model('professional', professionalSchema),
  adminModel: mongoose.model('admin', adminSchema),
  postModel: mongoose.model('post', postSchema),
  commentModel: mongoose.model('comment', commentSchema),
  reviewModel: mongoose.model('review', reviewSchema),
  atecoModel: mongoose.model('ateco', atecoSchema),
  macroAtecoModel: mongoose.model('macroAteco', macroAtecoSchema),
  chatModel: mongoose.model('chat', chatSchema),
  tagModel: mongoose.model('tag', tagSchema),

}