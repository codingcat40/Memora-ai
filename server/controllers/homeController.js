const GeminiModel = require('../models/GeminiModel.js');

module.exports.getMyData = async (req, res) => {
    try {   
        const userId = req.userId
        const data = await GeminiModel.find({user: userId})
        if(data.length === 0){
           return res.status(200).json({message: 'No data'})
        }
        res.status(200).json({message: 'Data Has been fetched',data})


    } catch (error) {
        console.error("gemini error: ",error)
        res.status(500).json({message: 'Error getting Gemini Data',data})
    }
}


module.exports.deleteQuery = async (req, res) => {
    try{
        const {id} = req.params
        if(!id){
            return res.status(400).json({message:"Id is required"})
        }
        const deleted = await GeminiModel.findByIdAndDelete(id);
        if(!deleted){
            res.status(404).json({message: "Chat not found"})
        }
        res.status(200).json({message: "chat deleted successfully"})
    }catch(err){
        res.status(500).json({Error: 'error deleting'});
    }
}