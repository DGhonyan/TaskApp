const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

router.post('/tasks',auth,async (req,res)=>{
  const task = new Task({
    ...req.body,
    owner:req.user._id
  })
  try{
    await task.save()
    res.send(task)
  } catch (e) {
    res.send(e)
  }

})

//tasks?completed=`boolean`
//tasks?sortBy='smth:asc/desc'
//tasks?limit= & skip = 
router.get('/tasks',auth,async (req,res)=>{
  try{
    const match = {}
    const sort = {}

    if(req.query.completed){
      match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
    // const tasks = await Task.find({})
    // res.send(tasks)
  } catch (e) {
    res.send(e)
  }
})

router.get('/tasks/:id',auth,async (req,res)=>{
  const _id = req.params.id

  try{
    const task = await Task.findOne({_id ,owner:req.user._id})

    if(!task){
      return res.send('no such task')
    }

    res.send(task)
  } catch (e) {
    res.send(e)
  }

})

router.patch("/tasks/:id",auth,async (req,res)=>{
  const _id = req.params.id
  const updates = Object.keys(req.body)
  const allowedUpdates = ["description","completed"]
  const isValid = updates.every((update) => allowedUpdates.includes(update))

  if (!isValid) {
    return res.status(400).send('no such property of a task')
  }

  try{
    const task = await Task.findOne({_id, owner:req.user._id})

    if(!task){
      return res.status(400).send('no such task gandon')
    }

    updates.forEach((update) => {
      task[update] = req.body[update]
    })

    await task.save()

    res.send(task)
  } catch (e) {
    console.log(e);
    res.status(400).send('ha yani inch')
  }
})


router.delete('/tasks/:id',auth,async (req,res) => {
  const _id = req.params.id
  try{
    const task = await Task.findOneAndDelete({ _id, owner:req.user._id })

    if (!task) {
      res.send('idi naxuy')
    }
    res.send(task)
  } catch (e) {
    res.status(500).send("something sent wrong")
  }
})

module.exports = router
