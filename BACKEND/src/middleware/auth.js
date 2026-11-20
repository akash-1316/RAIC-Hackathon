import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function auth(req,res,next){try{const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):'';if(!token)return res.status(401).json({message:'Authentication required.'});const payload=jwt.verify(token,process.env.JWT_SECRET);const user=await User.findById(payload.id);if(!user||!user.isActive)return res.status(401).json({message:'Session is invalid or account is inactive.'});req.user=user;next()}catch{return res.status(401).json({message:'Invalid or expired session.'})}}
export function adminOnly(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({message:'Administrator access required.'});next()}
