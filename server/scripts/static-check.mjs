import ts from 'typescript';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const dirs=['src/views','src/components'];
let issues=[];let count=0;
for(const dir of dirs){for(const name of readdirSync(dir).filter(f=>f.endsWith('.vue'))){
 const file=join(dir,name),source=readFileSync(file,'utf8');
 const script=source.match(/<script\s+setup\s+lang="ts">([\s\S]*?)<\/script>/)?.[1];
 if(script===undefined){issues.push(`${file}: <script setup lang="ts"> not found`);continue;}
 const sf=ts.createSourceFile(file,script,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 if(sf.parseDiagnostics.length){issues.push(...sf.parseDiagnostics.map(d=>`${file}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`));}
 const compiled=ts.transpileModule(script,{fileName:name+'.ts',reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
 issues.push(...(compiled.diagnostics||[]).map(d=>`${file}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`));count++;
}}
for(const dir of ['src/services','src/router'])for(const name of readdirSync(dir).filter(f=>f.endsWith('.ts'))){
 const file=join(dir,name),sf=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 issues.push(...sf.parseDiagnostics.map(d=>`${file}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`));
}
console.log(`Parsed ${count} Vue SFC script modules + TypeScript services and routes; ${issues.length} syntax diagnostic(s).`);
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}
