const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    trim:true,
    required:true
  },
  email:{
    type:String,
    required:true,
    trim:true,
    lowercase:true,
    index: true,
    unique: true,
    validate(value){
      if (!validator.isEmail(value)) {
        throw new Error('email is invalid');
      }
    }
  },
  password:{
    type:String,
    trim:true,
    required:true,
    validate(value){
      if (!(value.length > 6)){
        throw new Error('password length is invalid');
      }else if(value.toLowerCase().includes('password')){
        throw new Error('password is insecure');
      }
    }
  },
  age:{
    type:Number,
    default:0
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }],
  avatar: {
    type: Buffer
  }
},{
  timestamps: true
})

userSchema.virtual('tasks',{
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
  const user = this
  const userObj = user.toObject()

  delete userObj.password
  delete userObj.tokens
  delete userObj.avatar

  return userObj
}

userSchema.methods.generatingToken = async function() {
  const user = this

  const token = jwt.sign({_id : user._id.toString()}, process.env.JSON_WEB_TOKEN_SECRET)

  user.tokens.push({token})
  await user.save()

  return token
}

userSchema.statics.findByCredentials = async (email,password) => {
  const user = await User.findOne({email})
  if(!user){
   throw new Error('no user with this email')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if(!isMatch){
   throw new Error('unable to login')
  }
  return user
}

//secure password
userSchema.pre('save',async function(next){
  const user = this

  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

userSchema.pre('remove',async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model('User', userSchema)


module.exports = User
