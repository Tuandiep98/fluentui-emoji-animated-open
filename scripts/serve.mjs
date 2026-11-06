import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from './lib.mjs';
const port=Number(process.env.PORT??4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.md':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const parts=pathname.split('/');if(parts.some(p=>p.startsWith('.')||p==='node_modules')){res.writeHead(404).end();return}
    const file=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(ROOT)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Content-Length':fs.statSync(file).size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(400).end()}
}).listen(port,'127.0.0.1',()=>console.log(`Showcase: http://127.0.0.1:${port}`));
