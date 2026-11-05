import { env } from 'cloudflare:workers';
import { initial } from './content';
export const bindings = () => env as unknown as {DB:D1Database;BUCKET:R2Bucket;ADMIN_PASSWORD:string};
export async function getContent() { const row = await bindings().DB.prepare('SELECT value FROM content WHERE id=?').bind('site').first<{value:string}>(); const saved = row ? JSON.parse(row.value) : initial; return {...saved, profile: {...initial.profile, ...saved.profile}}; }
export async function digest(s:string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join(''); }
export async function authorized(r:Request) { const token = r.headers.get('cookie')?.match(/(?:^|; )admin_session=([^;]+)/)?.[1]; if(!token)return false; return !!await bindings().DB.prepare('SELECT id FROM sessions WHERE id=? AND expires>?').bind(await digest(token),Date.now()).first(); }
export function sameOrigin(r:Request) { return r.headers.get('origin') === new URL(r.url).origin; }
export const json = (data:unknown,status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
