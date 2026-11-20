import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,enum:['Basic','Advanced','Hard'],unique:true,required:true},price:{type:Number,required:true,min:0},description:{type:String,default:''},features:{type:[String],default:[]},isActive:{type:Boolean,default:true}},{timestamps:true});
schema.virtual('amount').get(function(){return this.price});
export default mongoose.model('Tier',schema);
