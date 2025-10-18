const pest = require('../Models/pestDetectionModel')


//Get All Pest History
const getPest = (req, res)=>{
    try{

    }catch(e){
        console.log(e)
        return res.json({e})
    }
}


//Add Pest
const addPest = (req, res)=>{
    try{

    }catch(e){
        console.log({e})
        return res.json({e})
    }
}

//Delete pest
const deletePest = (req, res)=>{
    try{

    }catch{
        console.log({e})
    }
}


module.exports = {deletePest, addPest, getPest}