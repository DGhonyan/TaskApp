const User = require('../models/user');
const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const multer = require('multer');
//const sharp = require('sharp');
const { sendWelcomeMessage, sendCancellationMessage } = require('../emails/account.js');

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
    return cb(new Error('upload a valid format image'))
    }
    cb(undefined, true)
  }
})

router.post('/users', async (req,res) => {
  const user = new User(req.body)
  try{
    await user.save();
    await sendWelcomeMessage(user.email, user.name)
    const token = await user.generatingToken()
    res.send({user})
  } catch(e){
    console.log(e);
    res.send(e);
  }
})

router.post('/users/login', async (req,res) => {
  try{
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generatingToken()
    res.send({user})
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/users/logout',auth,async (req,res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send('du indz dzir')
  } catch (e) {
    res.status(400).send('smth went wrong')
  }
})

router.post('/users/logoutall',auth,async (req,res) => {
  try {
    console.log('barev');
    req.user.tokens = []
    await req.user.save()
    res.send('Logout succesfull')
  } catch (e) {
    res.status(400).send('idi naxuy')
  }
})

router.get('/users/me',auth,async (req,res)=>{
  res.send(req.user)
})

router.patch("/users/me",auth,async (req,res)=>{
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name','email','password','age']
  const validUpdate = updates.every((update) => allowedUpdates.includes(update))

  if (validUpdate === false) {
    return res.status(400).send("invalid update")
  }

  try{
    updates.forEach((update) => {
      req.user[update] = req.body[update]
    })

    await req.user.save()

    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete("/users/me",auth,async (req,res) => {
  try{
    await req.user.remove();
    await sendCancellationMessage(req.user.email, req.user.name);
    res.send(req.user)
  } catch (e) {
    res.send(e)
  }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res) => {
  //const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

  //req.user.avatar = buffer
  await req.user.save()
  res.send('avatar added')
},(error, req, res, next) => {
  res.status(502).send({ error: error.message })
})

router.delete('/users/me/avatar',auth,async (req,res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatar',async (req,res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type','image/png')
    res.send(user.avatar)
  } catch (e) {
      res.status(404).send('holy cow')
  }
})

module.exports = router
