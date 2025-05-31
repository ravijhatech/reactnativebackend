import mongoose from "mongoose";

const AirConditionerServicesSchema=new mongoose.Schema({
    airConditionerImageUrl:{
        type:String,
    },
    airConditionertext:{
        type:String,
        
    }
});
const AirConditionerServices = mongoose.model('AirConditioningAndHeating', AirConditionerServicesSchema);
export default AirConditionerServices;