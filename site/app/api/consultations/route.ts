import {getRawDb} from '@/db';
import {validateConsultation} from '@/lib/consultation';

export async function POST(request:Request){
  const origin=request.headers.get('origin');
  if(origin && origin!==new URL(request.url).origin) return Response.json({error:'این درخواست قابل ثبت نیست.'},{status:403});
  if(!request.headers.get('content-type')?.includes('application/json')) return Response.json({error:'فرمت فرم قابل دریافت نیست.'},{status:415});
  const body=await request.text();
  if(body.length>4096) return Response.json({error:'اطلاعات فرم بیش از حد طولانی است.'},{status:413});
  let lead;
  try{lead=validateConsultation(JSON.parse(body));}catch(error){return Response.json({error:error instanceof SyntaxError?'اطلاعات فرم قابل خواندن نیست.':error instanceof Error?error.message:'فرم را بررسی کن.'},{status:400});}
  try{
    const db=getRawDb();
    const result=await db.prepare('INSERT INTO consultations (id,name,phone,priority,approach,consent_version,created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(lead.requestId,lead.name,lead.phone,lead.priority,lead.approach,'consultation-contact-v1',Date.now()).run();
    if(!result.success) throw new Error('D1 insert failed');
    return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  }catch{
    console.error('Consultation write unavailable');
    return Response.json({error:'ثبت انجام نشد. اطلاعاتت در فرم مانده؛ کمی بعد دوباره تلاش کن.'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
