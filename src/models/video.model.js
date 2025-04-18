
import mongoose ,{Schema} from "mongoose";

const videoSchema = new Schema(
    {
        videoFile :{
            type: String,   //cloudnart url
            require:true
        },
        thumbnail:{     //cloudnart url
            type: String,
            require:true 
        },
        title :{
            type: String,
            require:true 
        },
        desciption :{
            type: String,
            require:true 
        },
        duration :{
            type: Number,
            require:true 
        },
        view :{
            type: Number,
            default: 0 
        },
        isPublised :{
            type: String,
            default:true
        },
        owner :{
            type: Schema.Types.ObjectId,
            ref:"User"
        },
    },
    {
        timestamps: true
    }

)



export const Video = mongoose.model("Video",videoSchema) 