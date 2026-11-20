import AuditLog from '../models/AuditLog.js';
export async function audit(req,action,entityType,entityId,details=''){return AuditLog.create({adminId:req.user?._id,adminEmail:req.user?.email,action,entityType,entityId:String(entityId||''),details,ip:req.ip})}
