
import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
       username : {
            type: String,
            require:true,
            unique : true,
            lowercase :true,
            trim :true,
            index :true
       }, 
       email : {
            type: String,
            require:true,
            unique : true,
            lowercase :true,
            trim :true
        }, 
        fullname : {
            type: String,
            require:true,
            trim :true 
        },
        avatar:{
            type: String,  //cloudnary url service
            require:true, 
        } ,
        coverimage   :{
            type: String,  //cloudnary url service
            require:true, 
        } ,
        watchHistory:{
            type: Schema.Types.ObjectId,
            ref : "Video" 
        } ,
        password:{
            type: String,  
            require: [true, 'Password is required']
        } ,
    },
    {
        timestamps: true
    }

)


userSchema.pre("save" , async function (next) {
    this.password = bcrypt.hash()
})



export const User = mongoose.model("User",userSchema) 