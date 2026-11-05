import { bindings,digest,json,sameOrigin,authorized } from '../../../lib/server';
export async function GET(r:Request){return json({authenticated:await authorized(r)});}
export async function POST(r:Request){
 if(!sameOrigin(r))return json({error:'Invalid request.'},403);
 const {DB,ADMIN_PASSWORD}=bindings(); if(!ADMIN_PASSWORD)return json({error:'Admin password is not configured.'},503);
 const ip=await digest(r.headers.get('cf-connecting-ip')||'local'); const now=Date.now();
 const a=await DB.prepare('SELECT count,expires FROM attempts WHERE id=?').bind(ip).first<{count:number;expires:number}>();
 if(a&&a.expires>now&&a.count>=8)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 const body=await r.json() as {password?:string};
 if(typeof body.password!=='string'||await digest(body.password)!==await digest(ADMIN_PASSWORD)){
 await DB.prepare('INSERT INTO attempts(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN ? ELSE expires END').bind(ip,now+900000,now,now,now+900000).run();return json({error:'Incorrect password.'},401);}
 await DB.prepare('DELETE FROM attempts WHERE id=?').bind(ip).run();
 await DB.prepare('DELETE FROM sessions WHERE expires<?').bind(now).run();
 const token=crypto.randomUUID()+crypto.randomUUID();await DB.prepare('INSERT INTO sessions(id,expires) VALUES(?,?)').bind(await digest(token),now+28800000).run();
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':`admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${new URL(r.url).protocol==='https:'?'; Secure':''}`}});
}
export async function DELETE(r:Request){if(!sameOrigin(r))return json({error:'Invalid request'},403);const token=r.headers.get('cookie')?.match(/(?:^|; )admin_session=([^;]+)/)?.[1];if(token)await bindings().DB.prepare('DELETE FROM sessions WHERE id=?').bind(await digest(token)).run();return new Response('{}',{headers:{'Set-Cookie':'admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'}});}
