import {getRawDb} from '@/db';
import {validateConsultation} from '@/lib/consultation';

const githubOrigin='https://amirzaee1.github.io';
function allowed(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin||origin===githubOrigin;}
function headers(request:Request){const h=new Headers({'Cache-Control':'no-store','Vary':'Origin'});if(request.headers.get('origin')===githubOrigin)h.set('Access-Control-Allow-Origin',githubOrigin);return h;}
export function OPTIONS(request:Request){
  if(!allowed(request))return new Response(null,{status:403});
  const h=headers(request);h.set('Access-Control-Allow-Methods','POST, OPTIONS');h.set('Access-Control-Allow-Headers','Content-Type');h.set('Access-Control-Max-Age','600');
  return new Response(null,{status:204,headers:h});
}

export async function POST(request:Request){
  const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:headers(request)});
  if(!allowed(request)) return reply({error:'این درخواست قابل ثبت نیست.'},403);
  if(!request.headers.get('content-type')?.includes('application/json')) return reply({error:'فرمت فرم قابل دریافت نیست.'},415);
  const body=await request.text();
  if(body.length>4096) return reply({error:'اطلاعات فرم بیش از حد طولانی است.'},413);
  let lead;
  try{lead=validateConsultation(JSON.parse(body));}catch(error){return reply({error:error instanceof SyntaxError?'اطلاعات فرم قابل خواندن نیست.':error instanceof Error?error.message:'فرم را بررسی کن.'},400);}
  try{
    const db=getRawDb();
    const result=await db.prepare('INSERT INTO consultations (id,name,phone,priority,approach,consent_version,created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(lead.requestId,lead.name,lead.phone,lead.priority,lead.approach,'consultation-contact-v1',Date.now()).run();
    if(!result.success) throw new Error('D1 insert failed');
    return reply({ok:true});
  }catch{
    console.error('Consultation write unavailable');
    return reply({error:'ثبت انجام نشد. اطلاعاتت در فرم مانده؛ کمی بعد دوباره تلاش کن.'},503);
  }
}
