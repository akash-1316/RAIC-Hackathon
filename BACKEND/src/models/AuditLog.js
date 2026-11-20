import mongoose from 'mongoose';
const schema=new mongoose.Schema({adminId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},adminEmail:String,action:{type:String,required:true},entityType:{type:String,required:true},entityId:String,details:String,ip:String},{timestamps:true});schema.index({createdAt:-1});export default mongoose.model('AuditLog',schema);
