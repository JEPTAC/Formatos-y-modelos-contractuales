import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, appSettings } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const state = { items: [], q: "", category: "", origin: "" };
const $ = s => document.querySelector(s);
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const bytes = n => { if (!Number.isFinite(n)) return "—"; const u=["B","KB","MB","GB"]; let i=0; while(n>=1024&&i<u.length-1){n/=1024;i++} return `${n.toFixed(i?1:0)} ${u[i]}`; };

async function loadStatic(){
  try{
    const res=await fetch(appSettings.staticManifestUrl,{cache:"no-store"});
    if(!res.ok) return [];
    const m=await res.json();
    return (m.files||[]).map(x=>({
      id:x.id||x.filename,title:x.title||x.filename,description:x.purpose||"Documento institucional",
      category:x.group||"Formatos",code:x.id||"",trd:x.trd||"",version:x.version||"",
      updated:x.updated||"",url:x.download||"",size:x.bytes||0,origin:"static",status:"published"
    }));
  }catch{return []}
}
async function loadOverrides(){
  try{const snap=await getDocs(collection(db,appSettings.overridesCollection));const map=new Map();snap.forEach(d=>map.set(d.id,d.data()));return map;}catch{return new Map()}
}
async function loadFirebase(){
  try{
    const snap=await getDocs(collection(db,appSettings.publicCollection));
    const out=[];snap.forEach(d=>{const x=d.data();if(x.published!==false)out.push({id:d.id,...x,origin:"firebase",status:"published"})});return out;
  }catch(err){console.warn("No fue posible leer Firebase",err);return []}
}
function populateCategories(){const cats=[...new Set(state.items.map(x=>x.category).filter(Boolean))].sort();$("#category").innerHTML='<option value="">Todas</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("");}
function filtered(){const q=state.q.toLowerCase().trim();return state.items.filter(x=>{const text=[x.title,x.description,x.category,x.code,x.trd].join(" ").toLowerCase();return(!q||text.includes(q))&&(!state.category||x.category===state.category)&&(!state.origin||x.origin===state.origin)});}
function render(){const arr=filtered();$("#catalog").innerHTML=arr.length?arr.map(x=>`<article class="card"><div class="chips"><span class="chip ${x.origin==='firebase'?'dynamic':''}">${x.origin==='firebase'?'Firebase':'GitHub'}</span><span class="chip warn">Solo lectura pública</span></div><h3>${esc(x.title)}</h3><p>${esc(x.description||'')}</p><div class="meta"><strong>Código:</strong> ${esc(x.code||'Sin código')}<br><strong>TRD:</strong> ${esc(x.trd||'Pendiente')}<br><strong>Versión:</strong> ${esc(x.version||'—')} · <strong>Tamaño:</strong> ${bytes(Number(x.size||0))}</div><div class="actions"><a class="btn primary" href="${esc(x.url)}" target="_blank" rel="noopener" download>Descargar / abrir</a></div></article>`).join(""):'<div class="empty">No se encontraron documentos.</div>';}
async function init(){const [staticItems,dynamicItems,overrides]=await Promise.all([loadStatic(),loadFirebase(),loadOverrides()]);const visibleStatic=staticItems.filter(x=>!overrides.get(x.id)?.hidden);const replaced=new Set(dynamicItems.map(x=>x.replacesStaticId).filter(Boolean));state.items=[...visibleStatic.filter(x=>!replaced.has(x.id)),...dynamicItems];populateCategories();render();$("#search").addEventListener("input",e=>{state.q=e.target.value;render()});$("#category").addEventListener("change",e=>{state.category=e.target.value;render()});$("#origin").addEventListener("change",e=>{state.origin=e.target.value;render()});}
init();
