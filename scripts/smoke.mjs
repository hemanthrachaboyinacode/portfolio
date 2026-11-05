import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:5173';
const token=randomUUID();const id=createHash('sha256').update(token).digest('hex');
function sql(command){const r=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',command],{encoding:'utf8'});if(r.status)throw Error(r.stderr);}
const headers={Origin:base,'Content-Type':'application/json',Cookie:'admin_session='+token};
const old=await (await fetch(base+'/api/content')).json();
assert.equal((await fetch(base+'/api/content',{method:'PUT',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(old)})).status,401);
assert.equal((await fetch(base+'/api/upload',{method:'POST',headers:{Origin:base}})).status,401);
sql("INSERT INTO sessions(id,expires) VALUES('"+id+"',"+(Date.now()+120000)+")");
try{
 assert.ok([401,403].includes((await fetch(base+'/api/content',{method:'PUT',headers:{...headers,Origin:'https://untrusted.example'},body:JSON.stringify(old)})).status));
 const edited=structuredClone(old);edited.profile.headline='Persistence check';
 assert.equal((await fetch(base+'/api/content',{method:'PUT',headers,body:JSON.stringify(edited)})).status,200);
 assert.equal((await (await fetch(base+'/api/content')).json()).profile.headline,'Persistence check');
 const form=new FormData();form.set('file',new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')],'test.png',{type:'image/png'}));
 const upload=await fetch(base+'/api/upload',{method:'POST',headers:{Origin:base,Cookie:'admin_session='+token},body:form});assert.equal(upload.status,200);const media=await upload.json();const image=await fetch(base+media.url);assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');
 for(const p of ['/','/projects','/experience','/about','/publications','/contact','/admin','/resume.pdf'])assert.equal((await fetch(base+p)).status,200,p);
 console.log('PASS: protected writes, CSRF rejection, saved content readback, image upload/readback, all portfolio routes.');
}finally{await fetch(base+'/api/content',{method:'PUT',headers,body:JSON.stringify(old)});sql("DELETE FROM sessions WHERE id='"+id+"'");}


