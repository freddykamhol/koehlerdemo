import { createReadStream,existsSync,statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHmac,timingSafeEqual } from 'node:crypto';
import { extname,join,normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('.',import.meta.url));
const port=Number(process.env.PORT)||3000;
const demoPassword=process.env.DEMO_PASSWORD||'Köhler2026';
const token=createHmac('sha256',demoPassword).update('koehler-demo-access').digest('hex');

const loginPage=error=>`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#202327"><title>Geschützte Demo | KA Technologies</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at 85% 15%,#ff5a0033,transparent 30%),radial-gradient(circle at 10% 85%,#064ea82e,transparent 32%),#202327;color:#24272b;font-family:Arial,sans-serif}.card{width:min(100%,460px);padding:42px;background:#f7f5f1;border-top:5px solid #ff5a00;box-shadow:0 30px 90px #0006}.eyebrow{color:#064ea8;font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}h1{margin:24px 0 16px;font-size:40px;line-height:1.04;letter-spacing:-.045em}h1 em{color:#ff5a00;font-style:normal}p{margin:0 0 28px;color:#6e7173;font-size:14px;line-height:1.6}label{display:block;margin-bottom:8px;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.input{display:flex;border:1px solid #cfccc6;background:#fff}.input:focus-within{border-color:#064ea8;box-shadow:0 0 0 3px #064ea81a}input{width:100%;height:54px;padding:0 15px;border:0;outline:0;background:transparent;font-size:15px}button{width:100%;height:56px;margin-top:14px;padding:0 18px;border:0;background:#ff5a00;color:#fff;font-size:13px;font-weight:700;cursor:pointer}button:hover{background:#d94c00}.error{margin:12px 0 0;color:#c83220;font-size:11px}.credit{display:block;margin-top:22px;color:#939596;font-size:8px;letter-spacing:.12em;text-align:center;text-transform:uppercase}@media(max-width:520px){.card{padding:30px 22px}h1{font-size:34px}}</style></head><body><main class="card"><span class="eyebrow">KA Technologies · Kunden-Demo</span><h1>Geschützter<br><em>Projektzugang.</em></h1><p>Bitte geben Sie das Passwort ein, um die Website-Demo anzusehen.</p><form method="post" action="/login"><label for="password">Passwort</label><div class="input"><input id="password" name="password" type="password" autocomplete="current-password" autofocus required></div>${error?'<div class="error" role="alert">Das Passwort ist nicht korrekt.</div>':''}<button type="submit">Demo öffnen →</button></form><span class="credit">Konzept & Umsetzung · KA Technologies</span></main></body></html>`;

const validCookie=request=>{
  const cookie=request.headers.cookie?.split(';').map(value=>value.trim()).find(value=>value.startsWith('koehler_demo_auth='));
  const supplied=cookie?.slice('koehler_demo_auth='.length)||'';
  const expectedBuffer=Buffer.from(token);
  const suppliedBuffer=Buffer.from(supplied);
  return suppliedBuffer.length===expectedBuffer.length&&timingSafeEqual(suppliedBuffer,expectedBuffer);
};

const mimeTypes={'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.ico':'image/x-icon','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'};

createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(pathname==='/health'){
    response.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});
    response.end('ok');return;
  }
  if(pathname==='/login'&&request.method==='POST'){
    let body='';
    request.on('data',chunk=>{if(body.length<4096) body+=chunk});
    request.on('end',()=>{
      const password=new URLSearchParams(body).get('password')||'';
      const valid=Buffer.byteLength(password)===Buffer.byteLength(demoPassword)&&timingSafeEqual(Buffer.from(password),Buffer.from(demoPassword));
      if(valid){
        const secure=request.headers['x-forwarded-proto']==='https'?'; Secure':'';
        response.writeHead(303,{Location:'/','Set-Cookie':`koehler_demo_auth=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`,'Cache-Control':'no-store'});response.end();
      }else{response.writeHead(401,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});response.end(loginPage(true))}
    });return;
  }
  if(!validCookie(request)){
    response.writeHead(401,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});response.end(loginPage(false));return;
  }
  const relative=normalize(pathname).replace(/^([/\\])+/,'');
  let filePath=join(root,relative||'index.html');
  if(!filePath.startsWith(root)||!existsSync(filePath)||statSync(filePath).isDirectory()) filePath=join(root,'index.html');
  const extension=extname(filePath).toLowerCase();
  response.writeHead(200,{'Content-Type':mimeTypes[extension]||'application/octet-stream','Cache-Control':extension==='.html'?'no-cache':'public, max-age=31536000, immutable'});
  createReadStream(filePath).pipe(response);
}).listen(port,'0.0.0.0',()=>console.log(`Köhler demo running on port ${port}`));
