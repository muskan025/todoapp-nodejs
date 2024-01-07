const mongoose = require("mongoose");

const accessSchema = new mongoose.Schema({
    sessionID:{
        type:String,
        require:true
    },
    time:{
        type:String,
        require:true
    }
});

module.exports =  mongoose.model("acess",accessSchema)