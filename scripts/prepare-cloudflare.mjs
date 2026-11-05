import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
function required(name, pattern){const value=process.env[name];if(!value||!pattern.test(value))throw new Error('Set a valid '+name+' before preparing deployment.');return value;}
const account=required('CLOUDFLARE_ACCOUNT_ID',/^[a-f0-9]{32}$/i);
const database=required('CLOUDFLARE_D1_DATABASE_ID',/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i);
if(database==='00000000-0000-4000-8000-000000000000')throw new Error('The preview database cannot be deployed.');
const bucket=required('CLOUDFLARE_R2_BUCKET',/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/);
const name=process.env.CLOUDFLARE_WORKER_NAME||'hemanth-portfolio';
if(!/^[a-z][a-z0-9-]{0,62}$/.test(name))throw new Error('Invalid Worker name.');
const file=resolve('dist/server/wrangler.json');
const config=JSON.parse(await readFile(file,'utf8'));
config.name=name;config.account_id=account;config.workers_dev=true;
config.d1_databases=[{binding:'DB',database_name:process.env.CLOUDFLARE_D1_DATABASE_NAME||'hemanth-portfolio',database_id:database,migrations_dir:resolve('drizzle')}];
config.r2_buckets=[{binding:'BUCKET',bucket_name:bucket}];
config.observability={enabled:true};
await writeFile(file,JSON.stringify(config,null,2)+'\n');
console.log('Prepared deployment for Worker '+name+'. No resources were created or deployed.');

