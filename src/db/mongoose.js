const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_PROD,{
  useNewUrlParser:true,
  useUnifiedTopology:true
})
