import Portfolio from '../components/portfolio';
import {getContent} from '../lib/server';
export const dynamic='force-dynamic';
export default async function Page(){return <Portfolio data={await getContent()}/>;}
