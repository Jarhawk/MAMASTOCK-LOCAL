#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');

const IGNORED_DIRS = new Set(['node_modules','dist','src-tauri','coverage','.vite']);
const EXTENSIONS = ['.js','.jsx','.ts','.tsx'];

function toPosix(p){return p.split(path.sep).join('/');}

async function walk(dir){
  const out=[];
  const entries=await fs.readdir(dir,{withFileTypes:true});
  for(const e of entries){
    if(IGNORED_DIRS.has(e.name)) continue;
    const full=path.join(dir,e.name);
    if(e.isDirectory()) out.push(...await walk(full));
    else if(EXTENSIONS.includes(path.extname(e.name))) out.push(full);
  }
  return out;
}

function parseImports(code){
  const specs=new Set();
  const re=/^\s*import\s+[^'";]*?from\s+['"]([^'"']+)['"]/gm;
  const side=/^\s*import\s+['"]([^'"']+)['"]/gm;
  const dyn=/import\(\s*['"]([^'"']+)['"]\s*\)/g;
  let m;
  while((m=re.exec(code))) specs.add(m[1]);
  while((m=side.exec(code))) specs.add(m[1]);
  while((m=dyn.exec(code))) specs.add(m[1]);
  return [...specs];
}

async function resolveSpec(fromFile,spec){
  let s=spec.split('?')[0].split('#')[0];
  if(s.startsWith('@/')){
    s='./'+s.slice(2);
    fromFile=path.join(SRC_DIR,'dummy.js');
  }
  if(!s.startsWith('.')) return {kind:'external',id:s};
  const base=path.resolve(path.dirname(fromFile),s);
  const tries=[base,...EXTENSIONS.map(ext=>base+ext)];
  for(const p of tries){
    try{
      const st=await fs.stat(p);
      if(st.isFile()) return {kind:'file',file:p};
      if(st.isDirectory()){
        for(const ext of EXTENSIONS){
          const idx=path.join(p,'index'+ext);
          try{const st2=await fs.stat(idx);if(st2.isFile()) return {kind:'file',file:idx};}catch{}
        }
      }
    }catch{}
  }
  return {kind:'missing',id:spec};
}

function buildImportNameMap(code){
  const map={};
  const re=/^\s*import\s+([^;]+)\s+from\s+['"]([^'"']+)['"]/gm;
  let m;
  while((m=re.exec(code))){
    const clause=m[1].trim();
    const spec=m[2];
    if(clause.startsWith('{')){
      const inner=clause.slice(1,-1);
      inner.split(',').map(s=>s.trim()).filter(Boolean).forEach(n=>{
        const [orig,alias]=n.split(/\s+as\s+/);
        map[(alias||orig).trim()]=spec;
      });
    }else if(clause.startsWith('*')){
      const alias=clause.split(/\s+as\s+/)[1];
      if(alias) map[alias.trim()]=spec;
    }else if(clause.includes('{')){
      const [defPart,rest]=clause.split('{');
      const defName=defPart.replace(',','').trim();
      if(defName) map[defName]=spec;
      const inner=rest.replace('}','');
      inner.split(',').map(s=>s.trim()).filter(Boolean).forEach(n=>{
        const [orig,alias]=n.split(/\s+as\s+/);
        map[(alias||orig).trim()]=spec;
      });
    }else{
      map[clause]=spec;
    }
  }
  return map;
}

async function extractRoutes(routerFile){
  const code=await fs.readFile(routerFile,'utf8');
  const importMap=buildImportNameMap(code);
  const routes=[];
  const objRe=/\{[^{}]*path\s*:\s*['"]([^'"`]+)['"][^{}]*element\s*:\s*<([A-Za-z0-9_]+)/gs;
  let m;
  while((m=objRe.exec(code))){
    const routePath=m[1];
    const comp=m[2];
    const spec=importMap[comp];
    let fileRel=null;
    if(spec){
      const res=await resolveSpec(routerFile,spec);
      if(res.kind==='file') fileRel=toPosix(path.relative(ROOT,res.file));
    }
    routes.push({path:routePath,component:comp,file:fileRel});
  }
  const jsxRe=/<Route[^>]*path\s*=\s*['"]([^'"`]+)['"][^>]*element\s*=\s*{<([A-Za-z0-9_]+)/g;
  while((m=jsxRe.exec(code))){
    const routePath=m[1];
    const comp=m[2];
    const spec=importMap[comp];
    let fileRel=null;
    if(spec){
      const res=await resolveSpec(routerFile,spec);
      if(res.kind==='file') fileRel=toPosix(path.relative(ROOT,res.file));
    }
    routes.push({path:routePath,component:comp,file:fileRel});
  }
  return routes;
}

function slugify(str){return str.replace(/\s+/g,'-').toLowerCase();}
function labelize(str){const s=str.replace(/[-_]/g,' ');return s.charAt(0).toUpperCase()+s.slice(1);} 
function uniq(arr){return [...new Set(arr)];}

async function main(){
  const files=await walk(SRC_DIR);
  files.sort();
  const imports={};
  const edges=[];
  for(const file of files){
    const code=await fs.readFile(file,'utf8');
    const specs=parseImports(code);
    const rel=toPosix(path.relative(ROOT,file));
    const internal=[], external=[], missing=[];
    for(const s of specs){
      const res=await resolveSpec(file,s);
      if(res.kind==='file'){
        const relDep=toPosix(path.relative(ROOT,res.file));
        internal.push(relDep);
        edges.push({from:rel,to:relDep});
      }else if(res.kind==='external'){
        external.push(res.id);
      }else{
        missing.push(res.id);
      }
    }
    imports[rel]={internal:uniq(internal),external:uniq(external),missing:uniq(missing)};
  }

  const pages=files.filter(f=>toPosix(f).startsWith(toPosix(path.join(SRC_DIR,'pages'))))
                   .map(f=>toPosix(path.relative(ROOT,f)));

  const routerCandidates=['router.tsx','router.jsx','router.ts','router.js'].map(f=>path.join(SRC_DIR,f));
  let routerFile=null;
  for(const cand of routerCandidates){
    try{const st=await fs.stat(cand);if(st.isFile()){routerFile=cand;break;}}catch{}
  }
  if(!routerFile){
    for(const f of files){
      const code=await fs.readFile(f,'utf8');
      if(/createBrowserRouter|<Route/g.test(code)){routerFile=f;break;}
    }
  }
  const routes=routerFile?await extractRoutes(routerFile):[];
  const pagesRouted=uniq(routes.map(r=>r.file).filter(Boolean));
  const orphans=pages.filter(p=>!pagesRouted.includes(p));

  const entrypoints=[];
  for(const ep of ['main.jsx','main.tsx']){
    const p=path.join(SRC_DIR,ep);try{const st=await fs.stat(p);if(st.isFile()) entrypoints.push(toPosix(path.relative(ROOT,p)));}catch{}
  }
  if(routerFile) entrypoints.push(toPosix(path.relative(ROOT,routerFile)));

  const sidebar={};
  function groupFor(file){
    const after=file.replace(/^src\/pages\//,'');
    const parts=after.split('/');
    if(parts.length===1) return labelize(parts[0].replace(/\.(js|jsx|ts|tsx)$/,''));
    return labelize(parts[0]);
  }
  for(const file of pagesRouted){
    const after=file.replace(/^src\/pages\//,'');
    const noExt=after.replace(/\.(js|jsx|ts|tsx)$/,'');
    const slug=noExt.split('/').map(slugify).join('/');
    const label=labelize(path.basename(noExt));
    const group=groupFor(file);
    if(!sidebar[group]) sidebar[group]=[];
    sidebar[group].push({label,path:slug,file});
  }
  if(orphans.length){
    sidebar['__orphans__']=orphans.map(f=>({label:labelize(path.basename(f).replace(/\.(js|jsx|ts|tsx)$/,'')),file:f,why:'non trouvé dans le routeur'}));
  }

  const stats={pages:pages.length,routes:routes.length,routedPages:pagesRouted.length,orphans:orphans.length};
  const routerRel=routerFile?toPosix(path.relative(ROOT,routerFile)):null;

  const report={
    generatedAt:new Date().toISOString(),
    root:toPosix(ROOT),
    srcDir:toPosix(SRC_DIR),
    entrypoints,
    routerFile:routerRel,
    routes,
    pages,
    imports,
    graph:edges,
    pageSidebar:Object.entries(sidebar).flatMap(([g,items])=>g==='__orphans__'?[]:items.map(it=>({...it,group:g}))),
    orphans,
    stats
  };

  await fs.writeFile(path.join(ROOT,'src-inventory.json'),JSON.stringify(report,null,2));
  const md=[];
  md.push('# Inventaire src/');
  md.push(`_Généré: ${report.generatedAt}_`);
  md.push('');
  md.push('## Entrypoints');
  md.push(entrypoints.map(p=>`- \`${p}\``).join('\n') || '- (aucun)');
  md.push('');
  md.push('## Router');
  md.push(routerRel?`- \`${routerRel}\``:'- (non détecté)');
  md.push('');
  md.push('## Routes');
  if(routes.length){
    md.push('| path | file |');
    md.push('| --- | --- |');
    for(const r of routes){md.push(`| \`${r.path}\` | ${r.file?`\`${r.file}\``:''} |`);}
  }else{
    md.push('- (aucune)');
  }
  md.push('');
  md.push('## Pages routées');
  md.push(pagesRouted.map(p=>`- \`${p}\``).join('\n') || '- (aucune)');
  md.push('');
  md.push('## Pages orphelines');
  md.push(orphans.map(p=>`- \`${p}\``).join('\n') || '- (aucune)');
  md.push('');
  md.push('## Stats');
  md.push(`- Pages: ${stats.pages}`);
  md.push(`- Routes: ${stats.routes}`);
  md.push(`- Pages routées: ${stats.routedPages}`);
  md.push(`- Orphelines: ${stats.orphans}`);
  await fs.writeFile(path.join(ROOT,'src-inventory.md'),md.join('\n'));
  await fs.writeFile(path.join(ROOT,'sidebar.plan.json'),JSON.stringify(sidebar,null,2));

  console.log(`Pages routées: ${pagesRouted.length} / ${pages.length}`);
  console.log(`Orphelines: ${orphans.length}`);
  console.log(`Router: ${routerRel || 'non détecté'}`);
  const actions=[];
  if(orphans[0]) actions.push(`ajouter route pour ${orphans[0]}`);
  if(orphans[1]) actions.push(`retirer page ${orphans[1]}`);
  actions.push('fusionner routes ou nettoyer la sidebar');
  while(actions.length<3) actions.push('revoir la configuration du routeur');
  console.log('Actions suggérées:');
  for(const a of actions.slice(0,3)) console.log(`- ${a}`);
}

main().catch(err=>{console.error(err);process.exit(1);});
