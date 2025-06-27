const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    title: String,
    description: String,
    file: String,
    email: String
})

module.exports = mongoose.model('posts', PostSchema)
