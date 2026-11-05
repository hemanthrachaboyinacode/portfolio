import Portfolio from '../../components/portfolio';import {getContent} from '../../lib/server';import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const data=await getContent();if(!['projects','experience','about','publications','contact'].includes(slug)&&!data.pages.some((x:{slug:string})=>x.slug===slug))notFound();return <Portfolio data={data} path={slug}/>;}
