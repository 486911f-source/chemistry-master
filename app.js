const $=id=>document.getElementById(id);
const KEY="cm-free-v1";
let data;
try{data=JSON.parse(localStorage.getItem(KEY)||"{}")}catch{data={}}
data.questions=Array.isArray(data.questions)?data.questions:[];
data.answers=Array.isArray(data.answers)?data.answers:[];
data.settings={timeLimitSeconds:60,...(data.settings||{})};
let files=[],quiz=[],at=0,correctCount=0,wrongCount=0,timeoutCount=0,done=false,timerInterval=null,questionDeadline=0,questionStartedAt=0;
let timeLimitSeconds=Number.isFinite(Number(data.settings.timeLimitSeconds))?Math.max(0,Number(data.settings.timeLimitSeconds)):60;
const FORMULAS={
"H2O":"水","CO2":"二酸化炭素","CO":"一酸化炭素","O2":"酸素","H2":"水素","N2":"窒素","NH3":"アンモニア",
"CH4":"メタン","C2H6":"エタン","C2H4":"エチレン","C2H2":"アセチレン","C2H5OH":"エタノール",
"CH3COOH":"酢酸","C6H12O6":"グルコース","C12H22O11":"スクロース","NaCl":"塩化ナトリウム",
"HCl":"塩化水素","H2SO4":"硫酸","HNO3":"硝酸","NaOH":"水酸化ナトリウム","KOH":"水酸化カリウム",
"Ca(OH)2":"水酸化カルシウム","CaCO3":"炭酸カルシウム","Na2CO3":"炭酸ナトリウム","NaHCO3":"炭酸水素ナトリウム",
"CuO":"酸化銅(II)","Fe2O3":"酸化鉄(III)","MgO":"酸化マグネシウム","Al2O3":"酸化アルミニウム",
"AgNO3":"硝酸銀","BaCl2":"塩化バリウム","CuSO4":"硫酸銅(II)","NH4Cl":"塩化アンモニウム",
"NO":"一酸化窒素","NO2":"二酸化窒素","SO2":"二酸化硫黄","SO3":"三酸化硫黄","H2S":"硫化水素",
"KMnO4":"過マンガン酸カリウム","K2Cr2O7":"二クロム酸カリウム","H2O2":"過酸化水素","Cl2":"塩素",
"Br2":"臭素","I2":"ヨウ素","SiO2":"二酸化ケイ素","Fe":"鉄","Cu":"銅","Zn":"亜鉛","Mg":"マグネシウム",
"Al":"アルミニウム","Ag":"銀","Au":"金","Na":"ナトリウム","K":"カリウム","Ca":"カルシウム"
};
const TERMS={
"中和":"酸と塩基が反応し、互いの性質を打ち消し合う反応。水溶液中では水などが生じる。",
"酸化":"物質が電子を失う反応。酸化数は増加する。",
"還元":"物質が電子を受け取る反応。酸化数は減少する。",
"酸化還元反応":"電子の授受を伴い、酸化と還元が同時に起こる反応。",
"エステル化":"カルボン酸とアルコールからエステルと水が生じる反応。",
"けん化":"油脂などのエステルが塩基性条件で加水分解され、カルボン酸塩などを生じる反応。",
"付加反応":"二重結合や三重結合などに原子団が付け加わる反応。",
"置換反応":"分子中の原子または原子団が別の原子または原子団に置き換わる反応。",
"脱離反応":"分子から原子または原子団が取れて、多重結合などが生じる反応。",
"加水分解":"物質が水と反応して、結合が切断される反応。",
"重合":"小さな分子（単量体）が多数結合して高分子をつくる反応。",
"付加重合":"不飽和結合をもつ単量体が次々に付加して高分子をつくる反応。",
"縮合重合":"複数の単量体が結合する際に、水などの小分子を脱離して高分子をつくる反応。",
"熱分解":"加熱によって物質が複数の物質に分解する反応。",
"電気分解":"電気エネルギーによって化合物を化学変化させる操作。",
"沈殿反応":"水溶液中のイオンが反応し、水に溶けにくい固体（沈殿）を生じる反応。",
"蒸留":"液体混合物を加熱して蒸気にし、冷却・凝縮して成分を分離する操作。",
"昇華":"固体が液体を経ずに気体になる変化、または気体から固体になる変化。",
"イオン化エネルギー":"気体原子から電子を1個取り去って陽イオンにするために必要なエネルギー。",
"電子親和力":"気体原子が電子を1個受け取るときに関係するエネルギー変化。",
"電気陰性度":"共有結合において、原子が共有電子対を引きつける強さの尺度。",
"モル濃度":"溶液1 Lあたりに含まれる溶質の物質量（mol）。",
"アボガドロ定数":"1 molあたりの粒子数を表す定数。約6.02×10²³ mol⁻¹。",
"共有結合":"原子どうしが電子対を共有してできる結合。",
"イオン結合":"陽イオンと陰イオンの静電気的引力による結合。",
"金属結合":"金属陽イオンと自由電子の間の静電気的引力による結合。",
"水素結合":"電気陰性度の大きい原子に結合した水素原子と、別の電気陰性度の大きい原子との間に働く相互作用。",
"触媒":"反応速度を変えるが、反応の前後でそれ自体は全体として消費されない物質。",
"化学平衡":"正反応と逆反応の速度が等しくなり、各物質の濃度が見かけ上一定になった状態。",
"ルシャトリエの原理":"平衡状態にある系に変化を加えると、その変化を打ち消す向きに平衡が移動するという原理。",
"緩衝液":"少量の酸や塩基を加えてもpHが大きく変化しにくい溶液。",
"同位体":"原子番号が同じで、質量数が異なる原子どうし。",
"電離":"物質が水に溶けるなどして陽イオンと陰イオンに分かれること。",
"酸":"水溶液中で水素イオンを生じる物質（ブレンステッド・ローリーの定義ではH⁺を与える物質）。",
"塩基":"水溶液中で水酸化物イオンを生じる物質（ブレンステッド・ローリーの定義ではH⁺を受け取る物質）。"
};

function save(){localStorage.setItem(KEY,JSON.stringify(data));stats()}
function getWrongIds(){return new Set(data.answers.filter(a=>a&&a.ok===false&&a.timedOut!==true&&a.status!=="timeout").map(a=>a.id))}
function getTimeoutIds(){return new Set(data.answers.filter(a=>a&&(a.timedOut===true||a.status==="timeout")).map(a=>a.id))}
function stats(){
  $("savedCount").textContent=data.questions.length;
  $("answerCount").textContent=data.answers.length;
  const n=data.answers.length;
  $("accuracy").textContent=n?Math.round(data.answers.filter(a=>a.ok===true).length/n*100)+"%":"—";
  $("allCount").textContent=data.questions.length;
  $("wrongCount").textContent=[...getWrongIds()].filter(id=>data.questions.some(q=>q.id===id)).length;
  $("timeoutCount").textContent=[...getTimeoutIds()].filter(id=>data.questions.some(q=>q.id===id)).length;
}
function view(id){["home","quiz","result"].forEach(x=>$(x).classList.toggle("hidden",x!==id));window.scrollTo(0,0)}
function addFiles(list){
  const incoming=Array.from(list||[]).filter(f=>f&&f.type.startsWith("image/"));
  const seen=new Set(files.map(f=>`${f.name}|${f.size}|${f.lastModified}`));
  const unique=incoming.filter(f=>{const k=`${f.name}|${f.size}|${f.lastModified}`;if(seen.has(k))return false;seen.add(k);return true});
  files.push(...unique);addPreviews();
  if(incoming.length&&!unique.length)$("ocrStatus").textContent="選択した写真はすでに追加されています。";
}
function addPreviews(){
  const root=$("previews");
  root.querySelectorAll("img").forEach(img=>{if(img.src.startsWith("blob:"))URL.revokeObjectURL(img.src)});
  root.innerHTML="";
  files.forEach((f,i)=>{
    const wrap=document.createElement("div");wrap.className="preview";
    const img=document.createElement("img");img.src=URL.createObjectURL(f);img.alt=`選択した写真 ${i+1}`;
    const index=document.createElement("span");index.className="preview-index";index.textContent=String(i+1).padStart(2,"0");
    const b=document.createElement("button");b.type="button";b.textContent="×";b.setAttribute("aria-label",`${i+1}枚目を削除`);b.onclick=()=>{files.splice(i,1);addPreviews()};
    wrap.append(img,index,b);root.append(wrap);
  });
  $("fileSummary").classList.toggle("hidden",files.length===0);
  $("fileSummary").textContent=files.length?`${files.length}枚の写真を追加中 · すべて順番に読み取ります`:"";
  $("ocrBtn").disabled=!files.length;
}
$("choosePhotosBtn").onclick=()=>$("photos").click();
$("cameraBtn").onclick=()=>$("cameraPhoto").click();
$("photos").onchange=e=>{addFiles(e.target.files);e.target.value=""};
$("cameraPhoto").onchange=e=>{addFiles(e.target.files);e.target.value=""};
$("ocrText").oninput=()=>{$("makeBtn").disabled=!$("ocrText").value.trim()};
$("ocrBtn").onclick=async()=>{
 if(!files.length||!window.Tesseract){$("ocrStatus").textContent="OCRエンジンを読み込めません。通信状態を確認してください。";return}
 const selected=[...files];
 $("ocrBtn").disabled=true;$("choosePhotosBtn").disabled=true;$("cameraBtn").disabled=true;$("ocrStatus").textContent="OCRエンジンを準備しています…";
 let worker;
 try{
  worker=await Tesseract.createWorker("jpn+eng",1,{logger:m=>{if(m.status==="recognizing text")$("ocrStatus").textContent=`文字を読み取り中… ${Math.round((m.progress||0)*100)}%`;}});
  const texts=[];
  for(let i=0;i<selected.length;i++){
    $("ocrStatus").textContent=`${i+1}/${selected.length}枚目を読み取り中…（全${selected.length}枚）`;
    const result=await worker.recognize(selected[i]);
    texts.push(`【${i+1}枚目】\n${result.data.text||""}`);
  }
  const extracted=texts.join("\n\n");
  $("ocrText").value=$("ocrText").value.trim()?$("ocrText").value.trim()+"\n\n"+extracted:extracted;
  $("makeBtn").disabled=!$("ocrText").value.trim();
  $("ocrStatus").textContent=`${selected.length}枚すべての読み取りが完了しました。内容を確認・修正してから問題を作成してください。`;
 }catch(e){$("ocrStatus").textContent="読み取りに失敗しました："+(e&&e.message?e.message:"不明なエラー")}
 finally{if(worker)await worker.terminate();$("ocrBtn").disabled=!files.length;$("choosePhotosBtn").disabled=false;$("cameraBtn").disabled=false}
};

function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function makeQuestion(category,question,answer,explain,pool){
 let distractors=shuffle(pool.filter(x=>x!==answer)).slice(0,3);
 if(distractors.length<3)return null;
 let opts=shuffle([answer,...distractors]);let idx=opts.indexOf(answer);
 return {id:"q-"+Date.now()+"-"+Math.random().toString(36).slice(2),category,question,options:opts,correct_index:idx,explanation:explain,option_explanations:opts.map(v=>v===answer?"正解。"+explain:`誤り。正しくは「${answer}」です。`),topic:"教科書OCR"};
}
const ADMISSION_RULES=[
 {key:"中和",needs:["HCl","NaOH"],build:()=>({category:"入試応用・反応の理解",question:"塩酸と水酸化ナトリウム水溶液を過不足なく混合した。中和反応を表す正味のイオン反応式はどれか。",answer:"H⁺ + OH⁻ → H₂O",options:["H⁺ + OH⁻ → H₂O","Na⁺ + Cl⁻ → NaCl","H₂O → H⁺ + OH⁻","H⁺ + Na⁺ → NaH"],explanation:"塩酸と水酸化ナトリウムは強酸・強塩基で、それぞれほぼ完全に電離する。反応の本質は水素イオンと水酸化物イオンから水が生じること。Na⁺とCl⁻は反応前後で変化しない。"})},
 {key:"化学平衡",needs:["ルシャトリエの原理"],build:()=>({category:"入試応用・化学平衡",question:"正反応が発熱反応である可逆反応が平衡状態にある。温度を上げたとき、平衡はどちらに移動するか。",answer:"吸熱方向である逆反応の方向",options:["吸熱方向である逆反応の方向","発熱方向である正反応の方向","温度を変えても平衡は移動しない","触媒を加えた場合と同じ方向"],explanation:"温度上昇は熱を加える操作とみなせる。ルシャトリエの原理により、その変化を打ち消す吸熱方向へ平衡が移動する。正反応が発熱なら、逆反応が吸熱である。"})},
 {key:"緩衝液",needs:[],build:()=>({category:"入試応用・酸塩基",question:"緩衝液に少量の塩酸を加えたとき、pHの変化が小さい主な理由はどれか。",answer:"溶液中の塩基成分が加えたH⁺を受け取るため",options:["溶液中の塩基成分が加えたH⁺を受け取るため","塩酸が水中で電離しなくなるため","水のイオン積がゼロになるため","加えたH⁺がすべて気体として逃げるため"],explanation:"緩衝液には弱酸とその共役塩基などが含まれる。加えたH⁺は塩基成分に取り込まれるため、遊離したH⁺の増加が抑えられ、pH変化が小さくなる。"})},
 {key:"酸化還元反応",needs:["KMnO4"],build:()=>({category:"入試応用・酸化還元",question:"過マンガン酸カリウム KMnO₄ に含まれるマンガン Mn の酸化数はいくつか。",answer:"+7",options:["+7","+4","+2","−1"],explanation:"Kは+1、Oは−2である。化合物全体は電気的に中性なので、1 + x + 4(−2) = 0。したがってMnの酸化数xは+7。"})},
 {key:"エステル化",needs:["CH3COOH","C2H5OH"],build:()=>({category:"入試応用・有機化学",question:"酢酸とエタノールを濃硫酸の存在下で加熱したとき、主に生成するエステルはどれか。",answer:"酢酸エチル",options:["酢酸エチル","酢酸メチル","ギ酸エチル","プロピオン酸メチル"],explanation:"カルボン酸の酸部分（酢酸）とアルコールのアルキル部分（エチル基）が組み合わさり、酢酸エチルと水が生じる。"})},
 {key:"付加重合",needs:["C2H4"],build:()=>({category:"入試応用・高分子",question:"エチレンが付加重合してできる高分子はどれか。",answer:"ポリエチレン",options:["ポリエチレン","ポリ塩化ビニル","ポリスチレン","ナイロン66"],explanation:"エチレンの二重結合が開いて単量体どうしが次々に結合し、ポリエチレンになる。塩化ビニルやスチレンは別の単量体である。"})}
];
function generateAdmissionQuestions(text){
 const t=text.normalize("NFKC");
 const out=[];
 for(const rule of ADMISSION_RULES){
  if(!t.includes(rule.key))continue;
  if(rule.needs.some(token=>!t.includes(token)))continue;
  const item=rule.build();
  if(data.questions.some(q=>q.question===item.question)||out.some(q=>q.question===item.question))continue;
  const opts=shuffle(item.options);
  const correct=opts.indexOf(item.answer);
  const explanations=opts.map(option=>option===item.answer?"正しい。"+item.explanation:`この選択肢は正しくない。${item.explanation}`);
  out.push({id:"q-"+Date.now()+"-"+Math.random().toString(36).slice(2),category:item.category,question:item.question,options:opts,correct_index:correct,explanation:item.explanation,option_explanations:explanations,topic:"大学入試・応用"});
 }
 return out;
}

function generate(text){
 let t=text.normalize("NFKC").replace(/[₀-₉]/g,c=>String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)));
 let out=[];
 const names=Object.values(FORMULAS);
 for(const [formula,name] of Object.entries(FORMULAS)){
  const pattern=new RegExp(`(^|[^A-Za-z0-9])${formula.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}($|[^A-Za-z0-9])`);
  if(pattern.test(t)){
   let q=makeQuestion("化学式",`化学式 ${formula} で表される物質はどれか。`,name,`${formula} は ${name} の化学式です。`,names);
   if(q)out.push(q);
  }
 }
 const termPool=Object.keys(TERMS);
 for(const term of termPool){
  if(t.includes(term)){
   let q=makeQuestion("反応・用語",`「${term}」の説明として正しいものはどれか。`,TERMS[term],TERMS[term],Object.values(TERMS));
   if(q)out.push(q);
  }
 }
 const arrows=t.match(/[A-Za-z0-9()]+(?:\s*[+＋]\s*[A-Za-z0-9()]+)*\s*(?:→|⟶|⇄|↔|->|＝|=)\s*[A-Za-z0-9()]+(?:\s*[+＋]\s*[A-Za-z0-9()]+)*/g)||[];
 for(const eq of arrows){
  const sides=eq.split(/→|⟶|⇄|↔|->|＝|=/);if(sides.length!==2)continue;
  const left=sides[0].split(/[+＋]/).map(x=>x.trim()).filter(x=>/^[A-Za-z][A-Za-z0-9()]*$/.test(x));
  const right=sides[1].split(/[+＋]/).map(x=>x.trim()).filter(x=>/^[A-Za-z][A-Za-z0-9()]*$/.test(x));
  const all=[...left,...right];if(left.length&&right.length&&all.length>=3){
   const target=left[0];let q=makeQuestion("反応式",`次の反応式の左辺（反応物）に含まれる物質はどれか。\n${eq}`,target,`反応式の矢印の左側が反応物です。左辺は ${left.join(" + ")} です。`,all.filter(x=>x!==target).concat(Object.keys(FORMULAS).filter(x=>!all.includes(x))));
   if(q)out.push(q);
   const target2=right[0];let q2=makeQuestion("反応式",`次の反応式の右辺（生成物）に含まれる物質はどれか。\n${eq}`,target2,`反応式の矢印の右側が生成物です。右辺は ${right.join(" + ")} です。`,all.filter(x=>x!==target2).concat(Object.keys(FORMULAS).filter(x=>!all.includes(x))));
   if(q2)out.push(q2);
  }
 }
 return [...new Map(out.map(q=>[q.question,q])).values()];
}
$("makeBtn").onclick=()=>{
 const source=$("ocrText").value;const mode=$("questionMode").value;
 const basic=generate(source);
 const advanced=mode==="admission"?generateAdmissionQuestions(source):[];
 const known=new Set(data.questions.map(q=>q.question));
 const fresh=[...basic,...advanced].filter(q=>!known.has(q.question));
 data.questions.push(...fresh);save();
 if(fresh.length){
  const advancedCount=fresh.filter(q=>q.topic==="大学入試・応用").length;
  $("makeStatus").textContent=mode==="admission"?`${fresh.length}問を追加しました（入試応用 ${advancedCount}問）。`:`${fresh.length}問を追加しました。`;
  start(fresh);
 }else{
  $("makeStatus").textContent=mode==="admission"?"対応する基本問題・入試応用問題が見つかりませんでした。読み取り文章に対象の化学式や単元名が含まれているか確認してください。":"辞書に一致する化学式・用語・反応式が見つかりませんでした。OCR文を修正するか、辞書に登録された語句を含むページを読み込んでください。";
 }
};
function start(items){
 if(!items.length){$("makeStatus").textContent="この条件に合う問題はまだありません。先に教科書の写真から問題を作成してください。";return}
 clearTimer();quiz=items.slice();at=0;correctCount=0;wrongCount=0;timeoutCount=0;view("quiz");render();
}
function clearTimer(){if(timerInterval){clearInterval(timerInterval);timerInterval=null}}
function updateTimer(){
 if(!timeLimitSeconds)return;
 const remain=Math.max(0,questionDeadline-Date.now());
 const seconds=Math.ceil(remain/1000);
 $("timerText").textContent=String(seconds);
 $("timerFill").style.width=`${Math.max(0,remain/(timeLimitSeconds*1000)*100)}%`;
 const urgent=remain<=10000;
 $("timerWrap").classList.toggle("urgent",urgent);$("timerTrack").classList.toggle("urgent",urgent);
 if(remain<=0)answer(null,true);
}
function startTimer(){
 clearTimer();
 questionStartedAt=Date.now();
 if(!timeLimitSeconds){$("timerWrap").classList.remove("hidden");$("timerText").textContent="∞";$("timerTrack").classList.add("hidden");$("timerWrap").classList.remove("urgent");return}
 $("timerTrack").classList.remove("hidden");$("timerWrap").classList.remove("hidden");
 questionDeadline=questionStartedAt+timeLimitSeconds*1000;
 $("timerFill").style.width="100%";updateTimer();timerInterval=setInterval(updateTimer,200);
}
function render(){
 done=false;const q=quiz[at];
 $("position").textContent=`${at+1} / ${quiz.length}`;$("trackFill").style.width=`${(at+1)/quiz.length*100}%`;
 $("category").textContent=q.category;$("topic").textContent=q.topic;$("qText").textContent=q.question;
 $("choices").innerHTML="";$("explanation").classList.add("hidden");$("explanation").innerHTML="";$("nextBtn").disabled=true;$("nextBtn").innerHTML=at===quiz.length-1?"結果を見る <span>→</span>":"次の問題 <span>→</span>";
 q.options.forEach((v,i)=>{let b=document.createElement("button");b.className="choice";b.type="button";let l=document.createElement("span");l.className="letter";l.textContent="ABCD"[i];let s=document.createElement("span");s.textContent=v;b.append(l,s);b.onclick=()=>answer(i,false);$("choices").append(b)});
 startTimer();
}
function answer(i,timedOut=false){
 if(done)return;done=true;clearTimer();
 const q=quiz[at],ok=!timedOut&&i===q.correct_index;
 if(ok)correctCount++;else if(timedOut)timeoutCount++;else wrongCount++;
 const elapsed=Math.max(0,Math.round((Date.now()-questionStartedAt)/1000));
 data.answers.push({id:q.id,ok,timedOut,status:timedOut?"timeout":(ok?"correct":"wrong"),selectedIndex:i,at:Date.now(),elapsedSeconds:elapsed});save();
 [...$("choices").children].forEach((b,j)=>{b.disabled=true;if(j===q.correct_index)b.classList.add("correct");if(i===j&&!ok)b.classList.add("incorrect")});
 const box=$("explanation");box.classList.remove("hidden");
 const h=document.createElement("h3");h.textContent=timedOut?"時間切れ":(ok?"正解":"不正解");box.append(h);
 if(timedOut){const timeoutNote=document.createElement("p");timeoutNote.textContent="制限時間内に回答できませんでした。正解と解説を確認しておきましょう。";box.append(timeoutNote)}
 const p=document.createElement("p");p.textContent=q.explanation;box.append(p);
 const h2=document.createElement("h3");h2.textContent="選択肢ごとの解説";h2.style.marginTop="12px";box.append(h2);
 q.options.forEach((v,j)=>{let p=document.createElement("p");let strong=document.createElement("span");strong.className=j===q.correct_index?"good":"bad";strong.textContent=`${"ABCD"[j]}：${j===q.correct_index?"正解 ":"不正解 "}`;p.append(strong,document.createTextNode(q.option_explanations[j]));box.append(p)});
 $("nextBtn").disabled=false;
}
$("nextBtn").onclick=()=>{
 if(at<quiz.length-1){at++;render()}
 else{
  $("score").textContent=correctCount;$("scoreTotal").textContent=` / ${quiz.length} 問正解`;
  $("resultText").textContent=`正解 ${correctCount}問・不正解 ${wrongCount}問・時間切れ ${timeoutCount}問。間違えた問題と時間切れの問題はホームから別々に再挑戦できます。`;
  clearTimer();view("result");
 }
};
$("allBtn").onclick=()=>start(data.questions);
$("wrongBtn").onclick=()=>{const ids=getWrongIds();start(data.questions.filter(q=>ids.has(q.id)))};
$("timeoutBtn").onclick=()=>{const ids=getTimeoutIds();start(data.questions.filter(q=>ids.has(q.id)))};
$("timeLimit").value=String(timeLimitSeconds);
$("timeLimit").onchange=e=>{timeLimitSeconds=Math.max(0,Number(e.target.value)||0);data.settings.timeLimitSeconds=timeLimitSeconds;save()};
$("backBtn").onclick=()=>{clearTimer();view("home")};$("homeBtn").onclick=()=>{clearTimer();view("home")};
let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").classList.add("hidden")};
window.addEventListener("appinstalled",()=>{$("installBtn").classList.add("hidden");deferredInstallPrompt=null});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
stats();
