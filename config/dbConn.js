const { response } = require('express')
const mongoose = require('mongoose')

const connectDB = async () => {
    try{
       await mongoose.connect(process.env.DATABASE__URI);
    }catch(err){
        console.log(err)
    }
}

module.exports = connectDB