
const state={manifest:null,items:[],filter:"",group:"Todos",nature:"Todos",view:"cards",expected:null};
const $=(q,ctx=document)=>ctx.querySelector(q);
const $$=(q,ctx=document)=>[...ctx.querySelectorAll(q)];
const fmtBytes=n=>{if(!Number.isFinite(n))return "—";const u=["B","KB","MB","GB"];let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return `${n.toFixed(i?1:0)} ${u[i]}`};
const shortHash=h=>`${h.slice(0,12)}…${h.slice(-10)}`;
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2500)}
async function sha256File(file){const buffer=await file.arrayBuffer();const hash=await crypto.subtle.digest("SHA-256",buffer);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function sha256Response(response){const buffer=await response.arrayBuffer();const hash=await crypto.subtle.digest("SHA-256",buffer);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("")}
function icon(type){return ({docx:"W",xlsx:"X"})[type]||"F"}
function renderStats(){
 const m=state.manifest;
 $("#statDocs").textContent=m.publication.documentCount;
 $("#statFiles").textContent=m.files.length;
 $("#statPackages").textContent=m.packages.length;
 const total=m.files.reduce((a,b)=>a+b.bytes,0);
 $("#statSize").textContent=fmtBytes(total);
 $("#globalFingerprint").textContent=m.publication.packageFingerprintSha256;
 $("#publicationDate").textContent=new Date(m.publication.generatedAt).toLocaleString("es-CO",{dateStyle:"long",timeStyle:"short"});
}
function populateFilters(){
 const groups=["Todos",...new Set(state.items.map(x=>x.group))];
 const natures=["Todos",...new Set(state.items.map(x=>x.nature))];
 $("#groupFilter").innerHTML=groups.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
 $("#natureFilter").innerHTML=natures.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
}
function filtered(){
 const q=state.filter.trim().toLowerCase();
 return state.items.filter(x=>{
  const hay=[x.id,x.title,x.group,x.nature,x.stage,x.trd,x.purpose,x.filename].join(" ").toLowerCase();
  return (!q||hay.includes(q))&&(state.group==="Todos"||x.group===state.group)&&(state.nature==="Todos"||x.nature===state.nature);
 });
}
function renderCatalog(){
 const arr=filtered();const box=$("#catalog");box.className=`catalog ${state.view==="table"?"table-view":""}`;
 $("#resultCount").textContent=`${arr.length} de ${state.items.length} documentos`;
 $("#liveResults").textContent=`Se muestran ${arr.length} documentos`;
 if(!arr.length){box.innerHTML=`<div class="empty"><strong>No se encontraron documentos.</strong><br>Pruebe otra búsqueda o cambie los filtros.</div>`;return}
 box.innerHTML=arr.map(x=>{
  const ext=x.filename.split(".").pop().toLowerCase();
  const preview=x.preview?`<img src="${x.preview}" alt="Vista previa de ${escapeHtml(x.title)}" loading="lazy">`:`<div class="nopreview" aria-hidden="true">${icon(ext)}</div>`;
  return `<article class="doc-card" data-id="${escapeHtml(x.id)}">
   <button class="preview" type="button" data-preview="${escapeHtml(x.preview)}" data-title="${escapeHtml(x.title)}" aria-label="Abrir vista previa de ${escapeHtml(x.title)}">${preview}</button>
   <div class="doc-body">
    <div class="badges"><span class="badge">${escapeHtml(x.group)}</span><span class="badge warn">En aprobación</span></div>
    <h3>${escapeHtml(x.title)}</h3>
    <p>${escapeHtml(x.purpose)}</p>
    <div class="meta"><div><strong>Código</strong>${escapeHtml(x.id)}</div><div><strong>TRD</strong>${escapeHtml(x.trd)}</div><div><strong>Versión</strong>${escapeHtml(x.version)}</div><div><strong>Tamaño</strong>${fmtBytes(x.bytes)}</div></div>
    <div class="hashline" title="${x.sha256}"><strong>SHA-256:</strong> ${shortHash(x.sha256)}</div>
    <div class="doc-actions">
      <a class="btn btn-blue" href="${x.download}" download>Descargar</a>
      <button class="btn btn-soft verify-this" type="button" data-id="${escapeHtml(x.id)}">Verificar</button>
      <button class="btn btn-line copy-hash" type="button" data-hash="${x.sha256}">Copiar SHA</button>
      ${x.preview?`<button class="btn btn-line open-preview" type="button" data-preview="${escapeHtml(x.preview)}" data-title="${escapeHtml(x.title)}">Vista previa</button>`:""}
    </div>
   </div>
  </article>`
 }).join("");
 bindCatalogActions();
}
function bindCatalogActions(){
 $$(".copy-hash").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.hash);toast("SHA-256 copiado")});
 $$(".verify-this").forEach(b=>b.onclick=()=>{const x=state.items.find(i=>i.id===b.dataset.id);state.expected=x;$("#expectedFile").textContent=`Esperado: ${x.filename}`;$("#localFile").click();location.hash="verificacion"});
 $$("[data-preview]").forEach(b=>b.onclick=()=>openPreview(b.dataset.preview,b.dataset.title));
}
function openPreview(src,title){
 if(!src){toast("Este archivo no tiene vista previa visual");return}
 $("#modalTitle").textContent=title;$("#modalImage").src=src;$("#modalImage").alt=`Vista previa de ${title}`;$("#previewModal").classList.add("open");$("#previewModal").setAttribute("aria-hidden","false");$("#modalClose").focus();
}
function closePreview(){$("#previewModal").classList.remove("open");$("#previewModal").setAttribute("aria-hidden","true");$("#modalImage").src=""}
function renderVerificationMethods(){
 $("#verificationMethods").innerHTML=state.manifest.verificationMethods.map((x,i)=>`<article class="verify-card"><div class="verify-icon" aria-hidden="true">${i+1}</div><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.description)}</p></article>`).join("");
}
function renderPackages(){
 $("#packages").innerHTML=state.manifest.packages.map(p=>`<article class="package"><h3>${escapeHtml(p.title)}</h3><div class="size">${p.fileCount} archivos · ${fmtBytes(p.bytes)}</div><code>${shortHash(p.sha256)}</code><a class="btn btn-blue" href="${p.download}" download>Descargar ZIP</a></article>`).join("");
}
async function handleLocalFile(file){
 const out=$("#localResult");if(!file)return;
 out.className="verify-result";out.textContent="Calculando SHA-256…";
 const hash=await sha256File(file);
 let expected=state.expected;
 if(!expected) expected=state.items.find(x=>x.filename===file.name);
 if(expected){
   const ok=hash===expected.sha256;
   out.className=`verify-result ${ok?"ok":"bad"}`;
   out.innerHTML=`<strong>${ok?"Archivo auténtico e íntegro":"No coincide con el manifiesto"}</strong><br>Archivo: ${escapeHtml(file.name)}<br>Calculado: <code>${hash}</code><br>Esperado: <code>${expected.sha256}</code>`;
 }else{
   out.className="verify-result";
   out.innerHTML=`No se encontró un archivo con ese nombre en el manifiesto.<br>SHA-256 calculado: <code>${hash}</code>`;
 }
 state.expected=null;$("#expectedFile").textContent="Puede seleccionar cualquier archivo descargado.";
}
async function verifyOnline(){
 const btn=$("#bulkVerify");const progress=$("#bulkProgress span");const out=$("#bulkResult");
 btn.disabled=true;out.className="verify-result";out.textContent="Iniciando verificación…";
 const records=state.items;let ok=0,bad=0,errors=0;
 for(let i=0;i<records.length;i++){
  const r=records[i];
  out.textContent=`Verificando ${i+1} de ${records.length}: ${r.filename}`;
  try{
   const response=await fetch(r.download,{cache:"no-store"});
   if(!response.ok)throw new Error(`HTTP ${response.status}`);
   const hash=await sha256Response(response);
   if(hash===r.sha256)ok++;else bad++;
  }catch(e){errors++}
  progress.style.width=`${((i+1)/records.length)*100}%`;
 }
 out.className=`verify-result ${(bad||errors)?"bad":"ok"}`;
 out.innerHTML=`<strong>Verificación finalizada</strong><br>Íntegros: ${ok} · No coinciden: ${bad} · Errores de acceso: ${errors}.`;
 btn.disabled=false;
}
function setupDrop(){
 const dz=$("#dropzone"),input=$("#localFile");
 dz.onclick=()=>input.click();dz.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();input.click()}};
 ["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("drag")}));
 ["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("drag")}));
 dz.addEventListener("drop",e=>handleLocalFile(e.dataTransfer.files[0]));
 input.addEventListener("change",()=>handleLocalFile(input.files[0]));
}
function setup(){
 $("#search").oninput=e=>{state.filter=e.target.value;renderCatalog()};
 $("#groupFilter").onchange=e=>{state.group=e.target.value;renderCatalog()};
 $("#natureFilter").onchange=e=>{state.nature=e.target.value;renderCatalog()};
 $$(".view-toggle button").forEach(b=>b.onclick=()=>{$$(".view-toggle button").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.view=b.dataset.view;renderCatalog()});
 $("#bulkVerify").onclick=verifyOnline;$("#modalClose").onclick=closePreview;$("#previewModal").onclick=e=>{if(e.target.id==="previewModal")closePreview()};
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closePreview()});
 setupDrop();
}
async function init(){
 const res=await fetch("assets/data/manifest.json",{cache:"no-store"});state.manifest=await res.json();state.items=state.manifest.files;
 renderStats();populateFilters();renderCatalog();renderVerificationMethods();renderPackages();setup();
}
init().catch(err=>{$("#catalog").innerHTML=`<div class="empty">No fue posible cargar el manifiesto: ${escapeHtml(err.message)}</div>`});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
