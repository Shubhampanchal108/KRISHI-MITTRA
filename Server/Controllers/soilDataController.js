const soilData = require('../Models/soilDataModel')

//Get SoilData 
const getSoilData = async (req, res)=>{
    try{
        const data = await soilData.find()

        if (!data){
            return res.json({msg: "No data found"})
        }
        return res.json(data)

    }catch(e){
        console.log(e)
        return res.json({e})
    }
}

//Add SoilData
const addSoilData = async (req, res)=>{
    try{
        const {userId, soilType, phLevel, nitrogen, organicMatter, phosphorus, potassium, moisture} = req.body

        const isUserIdExist = await soilData.findOne({userId})

        if(isUserIdExist){
            return res.json({msg: "Data for this user already exists"})
        }

        const newSoilData = new soilData({
            userId,
            soilType,
            phLevel,
            nitrogen,
            organicMatter,
            phosphorus,
            potassium,
            moisture
        })
        await newSoilData.save()
        return res.json(newSoilData)
    }catch(e){
        console.log(e)
        return res.json({e})
    }
}

//Update SoilData
const updateSoilData = async (req, res)=>{
    try{
        const {id} = req.params
        const {soilType, phLevel, nitrogen, organicMatter, phosphorus, potassium, moisture} = req.body

        const updatedSoilData = await soilData.findByIdAndUpdate(id, {
            soilType,
            phLevel,
            nitrogen,
            organicMatter,
            phosphorus,
            potassium,
            moisture
        }, {new: true})

        if (!updatedSoilData) {
            return res.json({msg: "No data found"})
        }

        return res.json(updatedSoilData)
    }catch(e){
        console.log(e)
        return res.json({e})
    }
}

//Delete SoilData
const deleteSoilData = async (req, res)=>{
    try{
        const {id} = req.params
        const deletedSoilData = await soilData.findByIdAndDelete(id)

        if (!deletedSoilData) {
            return res.json({msg: "No data found"})
        }

        return res.json({msg: "Data deleted successfully"})
    }catch(e){
        console.log(e)
        return res.json({e})
    }
}

//get SoilData by userId
const getSoilDataByUserId = async (req, res)=>{
    try{
        const {id} = req.params
        const data = await soilData.findOne({userId: id})

        if (!data){
            return res.json({msg: "No data found"})
        }
        return res.json(data)
    }catch(e){
        console.log(e)
        return res.json({e})
    }
}


module.exports = {getSoilData, addSoilData, updateSoilData, deleteSoilData, getSoilDataByUserId}