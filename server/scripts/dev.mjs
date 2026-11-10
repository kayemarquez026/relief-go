import {spawn} from 'node:child_process';
const children=[];
for (const command of ['dev:server','dev']) {
  const child=spawn('npm',['run',command],{cwd:process.cwd(),shell:process.platform==='win32',stdio:'inherit'});
  children.push(child);
  child.on('error',error=>{console.error(`${command} failed to start:`,error);process.exitCode=1;});
}
let ending=false;
function stop(){if(ending)return;ending=true;for(const c of children){if(c.exitCode===null) c.kill();}}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
for (const c of children)c.on('exit',(code)=>{if(!ending&&code!==0){process.exitCode=code||1;stop();}});
