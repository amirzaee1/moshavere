export type Consultation = {requestId:string;name:string;phone:string;priority:string;approach:string;consent:true};
export function normalizePhone(value:string):string {
  const digits = value.replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[\s()\-]/g,'');
  return digits.replace(/^(?:\+98|0098)/,'0');
}
export function validateConsultation(input:unknown):Consultation {
  if(!input || typeof input !== 'object') throw new Error('اطلاعات فرم کامل نیست.');
  const data=input as Record<string,unknown>;
  if(data.website) throw new Error('ثبت درخواست انجام نشد.');
  const name=typeof data.name==='string'?data.name.trim().replace(/\s+/g,' '):'';
  if(name.length<2||name.length>80||/[<>\u0000-\u001f]/.test(name)) throw new Error('نام را بین ۲ تا ۸۰ حرف وارد کن.');
  const phone=normalizePhone(typeof data.phone==='string'?data.phone:'');
  if(!/^09\d{9}$/.test(phone)) throw new Error('شماره موبایل معتبر وارد کن؛ مثل ۰۹۱۲۱۲۳۴۵۶۷.');
  if(data.consent!==true) throw new Error('برای ثبت درخواست، اجازهٔ تماس را مشخص کن.');
  if(!['result','quality','price'].includes(String(data.priority))||!['try','experience','difference'].includes(String(data.approach))) throw new Error('اول به دو سؤال مسیر پاسخ بده.');
  if(typeof data.requestId!=='string'||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(data.requestId)) throw new Error('لطفاً دوباره از شروع مسیر ادامه بده.');
  return {requestId:data.requestId,name,phone,priority:String(data.priority),approach:String(data.approach),consent:true};
}
