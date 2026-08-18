const K=[["बालकाण्ड","Bala Kanda","1_balakanda.json"],["अयोध्याकाण्ड","Ayodhya Kanda","2_ayodhyakanda.json"],["अरण्यकाण्ड","Aranya Kanda","3_aranyakanda.json"],["किष्किन्धाकाण्ड","Kishkindha Kanda","4_kishkindhakanda.json"],["सुन्दरकाण्ड","Sundara Kanda","5_sundarakanda.json"],["युद्धकाण्ड","Yuddha Kanda","6_yudhhakanda.json"],["उत्तरकाण्ड","Uttara Kanda","7_uttarakanda.json"]];let raw=[],items=[],idx=0,kidx=0,sarga=1,speaking=false,playAll=false,voices=[];const $=x=>document.getElementById(x);const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));function norm(d){
  let a=Array.isArray(d)?d:Object.values(d||{});
  return a.map(x=>({
    kaanda:x.kaanda??x.kanda??"",
    s:Number(x.sarg??x.sarga??x.chapter??x.chapterId??1),
    n:Number(x.shloka??x.verse??x.verseId??0),
    t:x.text??x.shloka_text??x.verseSanskrit??x.VERSESANSKRIT??"",
    m:x.meaning??x.translation??x.VERSEENGTRANSLATION??""
  })).filter(x=>x.t&&Number.isFinite(x.s)&&Number.isFinite(x.n)&&x.n>0)
    .sort((a,b)=>a.s-b.s||a.n-b.n);
}
async function load(i){kidx=i;try{let r=await fetch("data/"+K[i][2]);if(!r.ok)throw 0;raw=norm(await r.json());let ss=[...new Set(raw.map(x=>x.s))];$("sarga").innerHTML=`<option value="all">All Sargas</option>`+ss.map(x=>`<option value="${x}">Sarga ${x}</option>`).join("");
sarga=null;
$("sarga").value="all";
$("from").value=1;
$("to").value=Math.min(10,raw.length);
update()}catch(e){raw=[];$("sarga").innerHTML="<option>डेटा उपलब्ध नहीं</option>";$("info").textContent="Run the downloader first."}}function update(){
  const selected = $("sarga").value;
  sarga = selected === "all" ? null : +selected;
  const a = sarga === null ? raw : raw.filter(x=>x.s===sarga);
  const max = a.length;
  $("from").max = max;
  $("to").max = max;
  if (+$("from").value > max) $("from").value = max || 1;
  if (+$("to").value > max) $("to").value = max || 1;
  
  $("info").textContent = sarga === null
    ? `इस काण्ड में ${max} श्लोक उपलब्ध हैं।`
    : `इस सर्ग में ${max} श्लोक उपलब्ध हैं।`;
}function start(){
  let f=+$("from").value,t=+$("to").value;
  if(!Number.isInteger(f)||!Number.isInteger(t)||f<1||t<f){
    alert("कृपया सही श्लोक सीमा चुनें।");
    return;
  }
  const source = sarga === null ? raw : raw.filter(x=>x.s===sarga);
  items = source.slice(Math.max(0,f-1), Math.max(0,t));
  if(!items.length)return alert("इस सीमा में कोई श्लोक नहीं मिला।");
  idx=0;
  localStorage.setItem("progress",JSON.stringify({k:kidx,s:sarga,f,t,i:0}));
  $("home").classList.add("hidden");
  $("reader").classList.remove("hidden");
  render();
}function displayShlokaNumber(){
  if(sarga !== null) return items[idx].n;
  return Number($("from").value) + idx;
}
function render(){let x=items[idx],r=$("right"),l=$("left");r.classList.remove("turn");void r.offsetWidth;r.classList.add("turn");let b=bookmarked(x),meaning=x.m?`<div class="meaning"><b>Meaning</b><br>${esc(x.m)}</div>`:"";r.innerHTML=`<div class="content"><div class="no">॥ श्लोक ${displayShlokaNumber()} ॥</div><div class="shloka">${esc(x.t)}</div>${meaning}<button class="mini" onclick="toggleBm()"> ${b?"★ Bookmarked":"☆ Bookmark"} </button></div>`;l.innerHTML=idx?`<div class="content"><div class="no">पिछला श्लोक</div><div class="shloka">${esc(items[idx-1].t)}</div></div>`:`<div>ॐ<br><b>श्री राम</b></div>`;$("rk").textContent=K[kidx][0]+" · "+K[kidx][1];$("rs").textContent = sarga === null ? `सर्ग ${x.s}` : `सर्ग ${sarga}`;$("count").textContent=`श्लोक ${displayShlokaNumber()} · ${idx+1} / ${items.length}`;$("bar").style.width=((idx+1)/items.length*100)+"%";$("prev").disabled=!idx;$("next").disabled=idx===items.length-1;localStorage.setItem("progress",JSON.stringify({k:kidx,s:sarga,f:+$("from").value,t:+$("to").value,i:idx}));if(speaking)speak()}function bookmarked(x){return JSON.parse(localStorage.getItem("bookmarks")||"[]").some(b=>b.k===kidx&&b.s===sarga&&b.n===x.n)}function toggleBm(){let a=JSON.parse(localStorage.getItem("bookmarks")||"[]"),x=items[idx],i=a.findIndex(b=>b.k===kidx&&b.s===sarga&&b.n===x.n);if(i>=0)a.splice(i,1);else a.push({k:kidx,s:sarga,n:x.n,position:idx+1,t:x.t});localStorage.setItem("bookmarks",JSON.stringify(a));render()}function spokenText(text,currentItem=null){
  let t=String(text).replace(/\r/g,"").trim();
  if(currentItem){
    const s=String(currentItem.s), n=String(currentItem.n);
    const sd=s.replace(/\d/g,d=>"०१२३४५६७८९"[d]);
    const nd=n.replace(/\d/g,d=>"०१२३४५६७८९"[d]);
    const patterns=[
      new RegExp(`\\s*॥\\s*[0-9०-९]+[-–—./]${s}[-–—./]${n}\\s*॥?\\s*$`,"u"),
      new RegExp(`\\s*॥\\s*[0-9०-९]+[-–—./]${sd}[-–—./]${nd}\\s*॥?\\s*$`,"u"),
      new RegExp(`\\s*[0-9०-९]+[-–—./]${s}[-–—./]${n}\\s*$`,"u"),
      new RegExp(`\\s*[0-9०-९]+[-–—./]${sd}[-–—./]${nd}\\s*$`,"u")
    ];
    for(const re of patterns)t=t.replace(re,"");
  }
  return t.replace(/\s*॥\s*[0-9०-९]+[-–—./][0-9०-९]+[-–—./][0-9०-९]+\s*॥?\s*$/u,"").trim();
}
function speak(){stop(false);let x=items[idx], spoken=spokenText(x.t, x), u=new SpeechSynthesisUtterance(spoken);u.lang="hi-IN";u.rate=+$("speed").value;let v=voices.find(v=>v.lang.toLowerCase().startsWith("hi"));if(v)u.voice=v;u.onstart=()=>{speaking=true;$("play").textContent="⏸ Pause"};u.onend=()=>{speaking=false;$("play").textContent="▶ Play Shloka";if(playAll&&idx<items.length-1){idx++;render();speak()}};speechSynthesis.speak(u)}function stop(reset=true){if("speechSynthesis"in window)speechSynthesis.cancel();speaking=false;if(reset)playAll=false;$("play").textContent="▶ Play Shloka"}function play(){if(speaking){speechSynthesis.pause();speaking=false;$("play").textContent="▶ Resume"}else if(speechSynthesis.paused){speechSynthesis.resume();speaking=true;$("play").textContent="⏸ Pause"}else speak()}function showBm(){let a=JSON.parse(localStorage.getItem("bookmarks")||"[]");$("bookmarkList").innerHTML=a.length?a.map((b,i)=>`<div class="bm" data-i="${i}"><small>${K[b.k][0]} · सर्ग ${b.s} · श्लोक ${b.n}</small>${esc(b.t)}</div>`).join(""):"<p>No bookmarks yet.</p>";$("modal").classList.remove("hidden");document.querySelectorAll(".bm").forEach(e=>e.onclick=async()=>{let b=a[+e.dataset.i];await load(b.k);$("sarga").value=b.s===null?"all":b.s;update();
$("from").value=b.position||b.n;$("to").value=b.position||b.n;start();$("modal").classList.add("hidden")})}$("kanda").innerHTML=K.map((x,i)=>`<option value="${i}">${x[0]} — ${x[1]}</option>`).join("");$("kanda").onchange=()=>load(+$("kanda").value);$("sarga").onchange=update;$("start").onclick=start;$("back").onclick=()=>{stop();$("reader").classList.add("hidden");$("home").classList.remove("hidden")};$("prev").onclick=()=>{if(idx){stop();idx--;render()}};$("next").onclick=()=>{if(idx<items.length-1){stop();idx++;render()}};$("play").onclick=play;$("all").onclick=()=>{playAll=true;speak()};$("stop").onclick=()=>stop();$("theme").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light")};$("font").onclick=()=>$("fontPanel").classList.toggle("hidden");let zoom = Number(localStorage.getItem("ramayana-zoom")||100);
function applyZoom(){
  document.documentElement.style.setProperty("--reader-zoom", zoom/100);
  $("book").style.fontSize = zoom+"%";
  localStorage.setItem("ramayana-zoom", zoom);
}
document.querySelectorAll("#fontPanel button").forEach(b=>b.onclick=()=>{
  const f=b.dataset.f;
  if(f==="small"){document.body.classList.remove("fs-large");document.body.classList.add("fs-small")}
  else if(f==="large"){document.body.classList.remove("fs-small");document.body.classList.add("fs-large")}
  else if(f==="normal"){document.body.classList.remove("fs-small","fs-large")}
  else if(f==="zoomout"){zoom=Math.max(75,zoom-10);applyZoom()}
  else if(f==="zoomin"){zoom=Math.min(150,zoom+10);applyZoom()}
  else if(f==="reset"){zoom=100;applyZoom();document.body.classList.remove("fs-small","fs-large")}
});
applyZoom();$("bookmarks").onclick=showBm;$("close").onclick=()=>$("modal").classList.add("hidden");$("modal").onclick=e=>{if(e.target.id==="modal")$("modal").classList.add("hidden")};document.onkeydown=e=>{if($("reader").classList.contains("hidden"))return;if(e.key==="ArrowRight")$("next").click();if(e.key==="ArrowLeft")$("prev").click();if(e.code==="Space"&&!/INPUT|SELECT|BUTTON/.test(document.activeElement.tagName)){e.preventDefault();play()}};if(localStorage.getItem("theme")==="dark")document.body.classList.add("dark");if("speechSynthesis"in window){voices=speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>voices=speechSynthesis.getVoices()}load(0);(function(){let p=JSON.parse(localStorage.getItem("progress")||"null");if(p){let b=document.createElement("button");b.className="resume";b.textContent=`↻ जारी रखें — ${K[p.k][0]}, सर्ग ${p.s===null?"सभी":p.s}, श्लोक ${p.i+1}`;b.onclick=async()=>{await load(p.k);$("sarga").value=p.s===null?"all":p.s;update();$("from").value=p.f;$("to").value=p.t;start();idx=Math.min(p.i,items.length-1);render();b.remove()};$("resume").appendChild(b)}})();