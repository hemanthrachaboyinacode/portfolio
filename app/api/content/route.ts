import { getContent, authorized, sameOrigin, bindings, json } from '../../../lib/server';
export async function GET() { return json(await getContent()); }
export async function PUT(r:Request) {
 if(!sameOrigin(r)||!await authorized(r))return json({error:'Please log in again.'},401);
 const raw=await r.text(); if(raw.length>1000000)return json({error:'Content is too large.'},413);
 try { const d=JSON.parse(raw); if(!d.profile?.name || !d.settings || !['projects','publications','experience','skills','education','achievements','pages'].every(k=>Array.isArray(d[k])))throw Error();
 await bindings().DB.prepare('INSERT INTO content (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind('site',raw).run();return json({ok:true});
 }catch{return json({error:'Invalid content. Please check the fields.'},400);}
}
