'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:'#060608', surface:'rgba(255,255,255,0.025)', surfaceHi:'rgba(255,255,255,0.045)',
  border:'rgba(255,255,255,0.07)', borderHi:'rgba(255,255,255,0.14)',
  text:'#F2F0EB', muted:'rgba(242,240,235,0.35)', muted2:'rgba(242,240,235,0.55)',
  violet:'#5B4FE9', violetLo:'rgba(91,79,233,0.1)', violetHi:'rgba(91,79,233,0.25)',
  violetBr:'#a5b4fc', green:'#6ee7b7', greenLo:'rgba(110,231,183,0.09)',
  gold:'#fcd34d', goldLo:'rgba(252,211,77,0.09)', red:'#fca5a5',
  redLo:'rgba(255,96,64,0.09)', pink:'#f9a8d4', pinkLo:'rgba(249,168,212,0.09)',
  cyan:'#67e8f9', cyanLo:'rgba(103,232,249,0.09)',
};
const EO = { duration:0.65, ease:[0.16,1,0.3,1] } as const;
const SP = { type:'spring', stiffness:210, damping:26 } as const;

// ─── Context config ────────────────────────────────────────────────────────────
const CONTEXTS = [
  { id:'dating',        label:'Dating',        sub:'Romantic / flirting',           color:C.pink,    bg:C.pinkLo },
  { id:'situationship', label:'Situationship', sub:'Undefined / talking stage',     color:C.violet,  bg:C.violetLo },
  { id:'office',        label:'Work',          sub:'Colleague / client / manager',  color:C.violetBr,bg:C.violetLo },
  { id:'friendship',    label:'Friendship',    sub:'Friends / group chat',          color:C.green,   bg:C.greenLo },
  { id:'networking',    label:'Networking',    sub:'Professional outreach',         color:C.gold,    bg:C.goldLo },
  { id:'family',        label:'Family',        sub:'Parent / sibling / relative',   color:'#c4b5fd', bg:'rgba(196,181,253,0.09)' },
  { id:'reconnecting',  label:'Reconnecting',  sub:'Someone from the past',         color:'#fdba74', bg:'rgba(253,186,116,0.09)' },
];

const LANGUAGES = [
  {id:'auto',label:'Auto-detect'},{id:'en',label:'English'},{id:'hi',label:'Hindi / Hinglish'},
  {id:'es',label:'Spanish'},{id:'fr',label:'French'},{id:'pt',label:'Portuguese'},
  {id:'ar',label:'Arabic'},{id:'ja',label:'Japanese'},{id:'ko',label:'Korean'},
  {id:'de',label:'German'},{id:'tr',label:'Turkish'},{id:'ru',label:'Russian'},
  {id:'it',label:'Italian'},{id:'zh',label:'Chinese'},{id:'id',label:'Indonesian'},
];

const LANG_NAMES: Record<string,string> = Object.fromEntries(LANGUAGES.map(l=>[l.id,l.label]));

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScoreObj { score:number; explanation:string; }
interface AnalysisResult {
  overallScore:number; interestLevel:number; attractionProbability:number;
  conversationMomentum:string; emotionalTone:string; replyEnergyMatch:string;
  detectedLanguage:string; context:string; inputMode:string;
  tags:string[]; roastMode:boolean; roastText?:string;
  contextFit:string;
  layer1_diagnosis:{ summary:string; stage:string; verdict:string };
  layer2_scores:Record<string,ScoreObj>;
  layer3_psychSignals:Array<{signal:string;detected:boolean;evidence:string;meaning:string}>;
  layer4_powerDynamics:{ whoHoldsPower:string; whoIsChasing:string; whoIsLeading:string; analysis:string; rebalanceTip:string };
  layer5_mistakes:Array<{mistake:string;whatHappened:string;whyItHurts:string;severity:string}>;
  layer6_missedOpportunities:Array<{moment:string;whatWasMissed:string;betterResponse:string}>;
  layer7_rewrites:{ originalMessage:string; playful:{message:string;why:string}; confident:{message:string;why:string}; curious:{message:string;why:string} };
  layer8_attractionSignals:Array<{signal:string;type:string;evidence:string;interpretation:string}>;
  layer9_nextMoves:{ playful:{message:string;intent:string}; curious:{message:string;intent:string}; confident:{message:string;intent:string} };
  layer10_strategy:{ primaryAdvice:string; doThis:string; avoidThis:string; urgency:string; longTermRead:string };
  extractedText:string;
}

interface CoachResult {
  verdict:string; verdictLabel:string; analysis:string;
  improvedVersion:string; whyItsBetter:string; quickTips:string[];
  energyLevel:string; flags:string[];
}

// ─── Shared primitives ─────────────────────────────────────────────────────────
function I({children,c=C.violetBr}:{children:React.ReactNode;c?:string}){
  return <span style={{fontFamily:"'Instrument Serif',serif",fontStyle:'italic',color:c,fontWeight:400}}>{children}</span>;
}
function Reveal({children,delay=0,y=16}:{children:React.ReactNode;delay?:number;y?:number}){
  return <motion.div initial={{opacity:0,y}} animate={{opacity:1,y:0}} transition={{...EO,delay}}>{children}</motion.div>;
}
function Tag({label,color,bg}:{label:string;color:string;bg:string}){
  return <span style={{display:'inline-block',fontSize:10,fontWeight:600,padding:'4px 10px',borderRadius:6,background:bg,color,textTransform:'uppercase',letterSpacing:'0.07em',fontFamily:"'DM Sans',sans-serif"}}>{label}</span>;
}
function ScoreBar({val,color,delay=0}:{val:number;color:string;delay?:number}){
  return(
    <div style={{height:3,background:'rgba(255,255,255,0.07)',borderRadius:99,overflow:'hidden'}}>
      <motion.div style={{height:'100%',background:color,borderRadius:99}}
        initial={{width:0}} animate={{width:`${(val/10)*100}%`}}
        transition={{duration:1.3,delay,ease:[0.16,1,0.3,1]}}/>
    </div>
  );
}

const STAGE_CFG:Record<string,{label:string;color:string}> = {
  early_interest:{label:'Early Interest',color:C.cyan},
  flirting:{label:'Flirting',color:C.pink},
  escalating:{label:'Escalating',color:C.green},
  neutral:{label:'Neutral',color:C.muted2},
  fading:{label:'Fading',color:C.red},
  reconnecting:{label:'Reconnecting',color:C.gold},
  professional:{label:'Professional',color:C.violetBr},
  platonic:{label:'Platonic',color:C.muted2},
};
const MOM:Record<string,{label:string;color:string;bg:string}> = {
  escalating:{label:'Rising',color:C.green,bg:C.greenLo},
  neutral:{label:'Neutral',color:C.gold,bg:C.goldLo},
  dying:{label:'Fading',color:C.red,bg:C.redLo},
};
const SEV:Record<string,string> = { high:C.red, medium:C.gold, low:C.muted2 };
const SIG:Record<string,string> = { positive:C.green, negative:C.red, neutral:C.muted2 };
const SCORE_META = [
  {key:'attraction',label:'Attraction',color:C.pink},
  {key:'interestLevel',label:'Interest',color:C.violetBr},
  {key:'engagement',label:'Engagement',color:C.green},
  {key:'curiosity',label:'Curiosity',color:C.cyan},
  {key:'confidence',label:'Confidence',color:C.gold},
  {key:'humor',label:'Humor',color:'#fdba74'},
  {key:'emotionalConnection',label:'Emotional Bond',color:C.pink},
  {key:'conversationalMomentum',label:'Momentum',color:C.green},
];

// ──────────────────────────────────────────────────────────────────────────────
// STEP 1 — Context picker
// ──────────────────────────────────────────────────────────────────────────────
function StepContext({onNext}:{onNext:(ctx:string)=>void}){
  const [sel,setSel]=useState<string|null>(null);
  return(
    <div>
      <Reveal>
        <div style={{marginBottom:28}}>
          <p style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:600,marginBottom:10}}>Step 1 of 3</p>
          <h2 style={{fontSize:'clamp(24px,5vw,38px)',fontWeight:500,lineHeight:1.05,letterSpacing:'-0.02em',color:C.text,margin:'0 0 8px',fontFamily:"'DM Sans',sans-serif"}}>
            What kind of<br/><I>conversation is this?</I>
          </h2>
          <p style={{fontSize:13,color:C.muted,lineHeight:1.7,margin:0}}>Context shapes the whole analysis. Dating vs office chats are judged completely differently.</p>
        </div>
      </Reveal>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,200px),1fr))',gap:9,marginBottom:24}}>
        {CONTEXTS.map((ctx,i)=>{
          const active=sel===ctx.id;
          return(
            <Reveal key={ctx.id} delay={0.04+i*0.04}>
              <motion.button onClick={()=>setSel(ctx.id)} whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                style={{width:'100%',textAlign:'left',cursor:'pointer',background:active?ctx.bg:C.surface,
                  border:`1px solid ${active?ctx.color+'50':C.border}`,borderRadius:14,padding:'14px 16px',
                  transition:'all 0.2s',outline:'none',
                  boxShadow:active?`0 0 0 1px ${ctx.color}25,0 4px 20px ${ctx.color}10`:'none'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:13,fontWeight:600,color:active?ctx.color:C.text,fontFamily:"'DM Sans',sans-serif",transition:'color 0.2s'}}>{ctx.label}</span>
                  {active&&<motion.div initial={{scale:0}} animate={{scale:1}} transition={SP}
                    style={{width:16,height:16,borderRadius:'50%',background:ctx.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2L7.5 2" stroke="#060608" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </motion.div>}
                </div>
                <div style={{fontSize:11,color:C.muted}}>{ctx.sub}</div>
              </motion.button>
            </Reveal>
          );
        })}
      </div>
      <Reveal delay={0.32}>
        <motion.button onClick={()=>sel&&onNext(sel)} whileHover={sel?{scale:1.02}:{}} whileTap={sel?{scale:0.98}:{}}
          style={{width:'100%',padding:'14px 24px',borderRadius:13,border:'none',
            background:sel?C.text:'rgba(255,255,255,0.06)',color:sel?C.bg:C.muted,
            fontSize:14,fontWeight:600,cursor:sel?'pointer':'not-allowed',fontFamily:"'DM Sans',sans-serif",
            transition:'all 0.25s',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          Continue
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7.5 2.5l4.5 4.5-4.5 4.5" stroke={sel?C.bg:C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </Reveal>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP 2 — Upload / Text input
// ──────────────────────────────────────────────────────────────────────────────
function StepUpload({context,onBack,onAnalyze}:{context:string;onBack:()=>void;onAnalyze:(file:File|null,text:string|null,lang:string,roast:boolean)=>void}){
  const [inputMode,setInputMode]=useState<'screenshot'|'text'>('screenshot');
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState<string|null>(null);
  const [chatText,setChatText]=useState('');
  const [language,setLanguage]=useState('auto');
  const [roastMode,setRoastMode]=useState(false);
  const [dragging,setDragging]=useState(false);
  const inputRef=useRef<HTMLInputElement>(null);
  const ctxObj=CONTEXTS.find(c=>c.id===context)!;

  const handleFile=useCallback((f:File)=>{
    if(!f.type.startsWith('image/'))return;
    setFile(f); setPreview(URL.createObjectURL(f));
  },[]);

  const canSubmit = inputMode==='screenshot' ? !!file : chatText.trim().length>30;

  return(
    <div>
      <Reveal>
        <div style={{marginBottom:22}}>
          <button onClick={onBack} style={{display:'inline-flex',alignItems:'center',gap:6,background:'none',border:'none',color:C.muted,fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",padding:0,marginBottom:12}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H2M5.5 3L2 7l3.5 4" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
          <p style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:600,marginBottom:10}}>Step 2 of 3</p>
          <h2 style={{fontSize:'clamp(22px,5vw,34px)',fontWeight:500,lineHeight:1.05,letterSpacing:'-0.02em',color:C.text,margin:'0 0 6px',fontFamily:"'DM Sans',sans-serif"}}>
            Add your <I c={ctxObj.color}>{ctxObj.label.toLowerCase()} chat.</I>
          </h2>
        </div>
      </Reveal>

      {/* Mode toggle */}
      <Reveal delay={0.06}>
        <div style={{display:'flex',background:C.surface,borderRadius:12,padding:4,marginBottom:16,border:`1px solid ${C.border}`}}>
          {(['screenshot','text'] as const).map(m=>(
            <button key={m} onClick={()=>setInputMode(m)}
              style={{flex:1,padding:'9px 12px',borderRadius:9,border:'none',cursor:'pointer',
                background:inputMode===m?C.surfaceHi:'transparent',
                color:inputMode===m?C.text:C.muted,
                fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",
                textTransform:'uppercase',letterSpacing:'0.08em',transition:'all 0.2s'}}>
              {m==='screenshot'?'Screenshot':'Paste Text'}
            </button>
          ))}
        </div>
      </Reveal>

      <AnimatePresence mode="wait">
        {inputMode==='screenshot'?(
          <motion.div key="ss" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={EO}>
            <div onClick={()=>inputRef.current?.click()}
              onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              style={{border:`1.5px dashed ${dragging?ctxObj.color:file?C.border:'rgba(255,255,255,0.1)'}`,
                borderRadius:18,cursor:'pointer',marginBottom:14,
                background:dragging?`${ctxObj.color}06`:C.surface,
                transition:'all 0.2s',overflow:'hidden',minHeight:file?0:140}}>
              {file&&preview?(
                <div style={{position:'relative'}}>
                  <img src={preview} alt="preview" style={{width:'100%',maxHeight:340,objectFit:'contain',display:'block',borderRadius:16}}/>
                  <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                    onClick={e=>{e.stopPropagation();setFile(null);setPreview(null);}}
                    style={{position:'absolute',top:10,right:10,background:'rgba(6,6,8,0.85)',border:`1px solid ${C.border}`,
                      borderRadius:9,padding:'6px 14px',color:C.text,fontSize:12,fontWeight:600,cursor:'pointer',
                      fontFamily:"'DM Sans',sans-serif",backdropFilter:'blur(8px)'}}>
                    Change
                  </motion.button>
                </div>
              ):(
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'36px 24px',gap:10}}>
                  <motion.div animate={dragging?{scale:1.15}:{scale:1}} transition={SP}
                    style={{width:44,height:44,borderRadius:12,background:C.surfaceHi,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 13V3M6 7l4-4 4 4" stroke={C.muted2} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 16h14" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:13,fontWeight:500,color:C.muted2,marginBottom:3}}>Drop screenshot or tap to browse</div>
                    <div style={{fontSize:11,color:C.muted}}>JPG, PNG, WebP · Max 10MB</div>
                  </div>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
          </motion.div>
        ):(
          <motion.div key="txt" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={EO}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,display:'block',marginBottom:8}}>
                Paste your conversation
              </label>
              <textarea
                value={chatText} onChange={e=>setChatText(e.target.value)}
                placeholder={`Format like:\nYou: hey what's up\nThem: not much, you?\nYou: just chilling...\n\n(or paste it however you have it)`}
                style={{width:'100%',minHeight:200,background:C.surface,border:`1px solid ${C.border}`,
                  borderRadius:14,padding:'14px 16px',color:C.text,fontSize:13,lineHeight:1.7,
                  fontFamily:"'DM Sans',sans-serif",resize:'vertical',outline:'none',
                  transition:'border-color 0.2s',boxSizing:'border-box'}}
                onFocus={e=>e.currentTarget.style.borderColor=C.violetHi}
                onBlur={e=>e.currentTarget.style.borderColor=C.border}
              />
              <div style={{fontSize:11,color:chatText.length>30?C.green:C.muted,marginTop:6,textAlign:'right'}}>
                {chatText.length} chars {chatText.length<30&&'— add more for better analysis'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language */}
      <Reveal delay={0.12}>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,display:'block',marginBottom:8}}>Language</label>
          <div style={{position:'relative'}}>
            <select value={language} onChange={e=>setLanguage(e.target.value)}
              style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:11,
                padding:'11px 38px 11px 14px',color:C.text,fontSize:13,fontWeight:500,
                fontFamily:"'DM Sans',sans-serif",cursor:'pointer',appearance:'none',outline:'none'}}>
              {LANGUAGES.map(l=><option key={l.id} value={l.id} style={{background:'#111'}}>{l.label}</option>)}
            </select>
            <div style={{position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 3.5l3.5 3.5L9 3.5" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Roast toggle */}
      <Reveal delay={0.16}>
        <motion.button onClick={()=>setRoastMode(r=>!r)} whileTap={{scale:0.98}}
          style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
            background:roastMode?C.redLo:C.surface,border:`1px solid ${roastMode?C.red+'40':C.border}`,
            borderRadius:13,padding:'13px 16px',cursor:'pointer',transition:'all 0.2s',marginBottom:18,outline:'none'}}>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:13,fontWeight:600,color:roastMode?C.red:C.text,fontFamily:"'DM Sans',sans-serif"}}>Roast Mode</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Brutal honesty. No mercy.</div>
          </div>
          <div style={{width:42,height:23,borderRadius:12,background:roastMode?C.red:'rgba(255,255,255,0.1)',transition:'background 0.2s',position:'relative',flexShrink:0}}>
            <motion.div animate={{x:roastMode?21:2}} transition={SP}
              style={{position:'absolute',top:2.5,width:18,height:18,borderRadius:'50%',background:'#fff'}}/>
          </div>
        </motion.button>
      </Reveal>

      <Reveal delay={0.20}>
        <motion.button onClick={()=>canSubmit&&onAnalyze(inputMode==='screenshot'?file:null,inputMode==='text'?chatText:null,language,roastMode)}
          whileHover={canSubmit?{scale:1.02}:{}} whileTap={canSubmit?{scale:0.98}:{}}
          style={{width:'100%',padding:'15px 24px',borderRadius:13,border:'none',
            background:canSubmit?C.text:'rgba(255,255,255,0.06)',color:canSubmit?C.bg:C.muted,
            fontSize:14,fontWeight:700,cursor:canSubmit?'pointer':'not-allowed',
            fontFamily:"'DM Sans',sans-serif",transition:'all 0.25s',
            display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          Run Deep Analysis
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 7.5h11M8.5 3l4.5 4.5-4.5 4.5" stroke={canSubmit?C.bg:C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </Reveal>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// LIVE COACH WIDGET
// ──────────────────────────────────────────────────────────────────────────────
function LiveCoach({extractedText,context}:{extractedText:string;context:string}){
  const [draft,setDraft]=useState('');
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<CoachResult|null>(null);
  const [error,setError]=useState<string|null>(null);

  const runCoach=async()=>{
    if(!draft.trim()||loading)return;
    setLoading(true); setResult(null); setError(null);
    try{
      const res=await fetch('/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({draftMessage:draft,conversationHistory:extractedText,context})});
      const data=await res.json();
      if(!data.success)throw new Error(data.error||'Coach failed');
      setResult(data);
    }catch(e:any){setError(e.message);}
    finally{setLoading(false);}
  };

  const verdictConfig:Record<string,{color:string;bg:string;label:string}> = {
    send_it:    {color:C.green,  bg:C.greenLo,  label:'Send it'},
    needs_work: {color:C.gold,   bg:C.goldLo,   label:'Needs work'},
    dont_send:  {color:C.red,    bg:C.redLo,    label:"Don't send"},
  };
  const vc = result ? (verdictConfig[result.verdict]??verdictConfig.needs_work) : null;

  return(
    <div style={{background:C.surface,border:`1px solid ${C.violetHi}`,borderRadius:20,overflow:'hidden',marginTop:12}}>
      {/* Header */}
      <div style={{padding:'16px 20px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:10}}>
        <motion.div animate={{opacity:[1,0.4,1]}} transition={{duration:2,repeat:Infinity}}
          style={{width:7,height:7,borderRadius:'50%',background:C.violetBr,flexShrink:0}}/>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>AI Live Coach</div>
          <div style={{fontSize:10,color:C.muted,marginTop:1}}>Paste what you're about to send</div>
        </div>
      </div>

      <div style={{padding:'16px 18px'}}>
        <div style={{position:'relative',marginBottom:10}}>
          <textarea value={draft} onChange={e=>setDraft(e.target.value)}
            placeholder='Type what you want to send…'
            onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))runCoach();}}
            style={{width:'100%',minHeight:80,background:'rgba(255,255,255,0.03)',
              border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 14px',
              color:C.text,fontSize:13,lineHeight:1.6,fontFamily:"'DM Sans',sans-serif",
              resize:'none',outline:'none',boxSizing:'border-box',transition:'border-color 0.2s'}}
            onFocus={e=>e.currentTarget.style.borderColor=C.violetHi}
            onBlur={e=>e.currentTarget.style.borderColor=C.border}/>
        </div>
        <motion.button onClick={runCoach}
          disabled={!draft.trim()||loading}
          whileHover={draft.trim()&&!loading?{scale:1.02}:{}}
          whileTap={draft.trim()&&!loading?{scale:0.98}:{}}
          style={{width:'100%',padding:'11px',borderRadius:10,border:'none',
            background:draft.trim()&&!loading?C.violetLo:'rgba(255,255,255,0.04)',
            border:`1px solid ${draft.trim()&&!loading?C.violetHi:C.border}`,
            color:draft.trim()&&!loading?C.violetBr:C.muted,
            fontSize:12,fontWeight:600,cursor:draft.trim()&&!loading?'pointer':'not-allowed',
            fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {loading?(
            <><motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:0.8,ease:'linear'}}
              style={{width:13,height:13,borderRadius:'50%',border:`1.5px solid ${C.violetBr}`,borderTopColor:'transparent'}}/>
            Coaching…</>
          ):<>Coach this message <span style={{fontSize:10,opacity:0.6}}>⌘↵</span></>}
        </motion.button>

        {error&&<div style={{fontSize:12,color:C.red,marginTop:10,padding:'8px 12px',background:C.redLo,borderRadius:8}}>{error}</div>}

        <AnimatePresence>
          {result&&vc&&(
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={EO}
              style={{marginTop:14,display:'flex',flexDirection:'column',gap:10}}>

              {/* Verdict */}
              <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                <span style={{fontSize:13,fontWeight:700,padding:'5px 13px',borderRadius:8,background:vc.bg,color:vc.color,fontFamily:"'DM Sans',sans-serif"}}>{vc.label}</span>
                <span style={{fontSize:12,color:C.muted2,fontStyle:'italic',fontFamily:"'Instrument Serif',serif"}}>{result.verdictLabel}</span>
              </div>

              {/* Analysis */}
              <p style={{fontSize:13,color:C.muted2,lineHeight:1.7,margin:0}}>{result.analysis}</p>

              {/* Improved version */}
              <div style={{background:'rgba(91,79,233,0.08)',border:`1px solid ${C.violetHi}`,borderRadius:12,padding:'12px 14px'}}>
                <div style={{fontSize:9,color:C.violetBr,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:6}}>Send this instead</div>
                <p style={{fontSize:14,color:C.text,lineHeight:1.65,margin:'0 0 8px',fontFamily:"'Instrument Serif',serif",fontStyle:'italic'}}>"{result.improvedVersion}"</p>
                <p style={{fontSize:11,color:C.muted,margin:0,lineHeight:1.5}}>{result.whyItsBetter}</p>
              </div>

              {/* Flags */}
              {result.flags?.length>0&&(
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {result.flags.map((f,i)=>(
                    <span key={i} style={{fontSize:9,fontWeight:600,padding:'3px 8px',borderRadius:5,
                      background:f.startsWith('good')||f==='confident'||f==='builds_tension'?C.greenLo:C.redLo,
                      color:f.startsWith('good')||f==='confident'||f==='builds_tension'?C.green:C.red,
                      textTransform:'uppercase',letterSpacing:'0.06em',fontFamily:"'DM Sans',sans-serif"}}>
                      {f.replace(/_/g,' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick tips */}
              {result.quickTips?.length>0&&(
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {result.quickTips.map((tip,i)=>(
                    <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                      <div style={{width:4,height:4,borderRadius:'50%',background:C.violetBr,marginTop:6,flexShrink:0}}/>
                      <span style={{fontSize:12,color:C.muted2,lineHeight:1.5}}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────
// LOADING STATE
// ──────────────────────────────────────────────────────────────────────────────
const LOADING_LINES = [
  'Reading your conversation…',
  'Identifying message patterns…',
  'Analyzing power dynamics…',
  'Detecting psychological signals…',
  'Measuring attraction signals…',
  'Checking what was missed…',
  'Crafting your 10-layer report…',
];

function Loading() {
  const [idx,setIdx]=useState(0);
  const [pct,setPct]=useState(0);
  useEffect(()=>{
    const t1=setInterval(()=>setIdx(i=>Math.min(i+1,LOADING_LINES.length-1)),1900);
    const t2=setInterval(()=>setPct(p=>Math.min(p+Math.random()*6+2,93)),350);
    return()=>{clearInterval(t1);clearInterval(t2);};
  },[]);
  return(
    <div style={{textAlign:'center',padding:'70px 0'}}>
      <div style={{position:'relative',width:72,height:72,margin:'0 auto 24px'}}>
        <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:2.8,ease:'linear'}}
          style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid transparent',borderTopColor:C.violetBr,borderRightColor:`${C.violetBr}35`}}/>
        <motion.div animate={{rotate:-360}} transition={{repeat:Infinity,duration:1.9,ease:'linear'}}
          style={{position:'absolute',inset:10,borderRadius:'50%',border:'1.5px solid transparent',borderTopColor:C.pink,borderRightColor:`${C.pink}30`}}/>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <motion.div style={{width:10,height:10,borderRadius:'50%',background:C.violetBr}}
            animate={{opacity:[1,0.3,1],scale:[1,0.75,1]}} transition={{duration:1.4,repeat:Infinity}}/>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
          transition={{duration:0.3}} style={{fontSize:13,color:C.muted2,marginBottom:24,fontFamily:"'DM Sans',sans-serif",height:18}}>
          {LOADING_LINES[idx]}
        </motion.p>
      </AnimatePresence>
      <div style={{maxWidth:240,margin:'0 auto',height:2,background:'rgba(255,255,255,0.07)',borderRadius:99,overflow:'hidden'}}>
        <motion.div style={{height:'100%',background:`linear-gradient(90deg,${C.violet},${C.violetBr})`,borderRadius:99}}
          animate={{width:`${pct}%`}} transition={{duration:0.45,ease:'easeOut'}}/>
      </div>
      <p style={{fontSize:11,color:C.muted,marginTop:16}}>Deep analysis takes 15–30 seconds</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// RESULTS — full 10-layer display
// ──────────────────────────────────────────────────────────────────────────────
function StepResults({result,context,onReset}:{result:AnalysisResult;context:string;onReset:()=>void}){
  const [activeTab,setActiveTab]=useState<'analysis'|'rewrites'|'coach'>('analysis');
  const ctxObj=CONTEXTS.find(c=>c.id===context)!;
  const sc=result.overallScore;
  const scColor=sc>=7?C.green:sc>=5?C.gold:C.red;
  const stageCfg=STAGE_CFG[result.layer1_diagnosis.stage]??STAGE_CFG.neutral;
  const mom=MOM[result.conversationMomentum]??MOM.neutral;
  const langName=LANG_NAMES[result.detectedLanguage]??result.detectedLanguage;

  return(
    <div>
      {/* Back + meta row */}
      <Reveal>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
          <button onClick={onReset} style={{display:'inline-flex',alignItems:'center',gap:6,background:'none',border:'none',color:C.muted,fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",padding:0}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H2M5.5 3L2 7l3.5 4" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            New analysis
          </button>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <Tag label={ctxObj.label} color={ctxObj.color} bg={`${ctxObj.color}15`}/>
            <Tag label={langName} color={C.muted2} bg="rgba(255,255,255,0.06)"/>
            <Tag label={result.inputMode==='screenshot'?'Screenshot':'Text'} color={C.muted2} bg="rgba(255,255,255,0.06)"/>
          </div>
        </div>
      </Reveal>

      {/* Hero — score + verdict */}
      <Reveal delay={0.04}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:22,padding:'24px 22px',marginBottom:10,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-10,top:-12,fontSize:130,fontWeight:800,color:scColor,opacity:0.03,lineHeight:1,pointerEvents:'none',userSelect:'none',fontFamily:"'Instrument Serif',serif",fontStyle:'italic'}}>{Math.round(sc)}</div>
          <div style={{display:'flex',alignItems:'flex-start',gap:18,flexWrap:'wrap',position:'relative',zIndex:1}}>
            <div style={{flex:'1 1 180px'}}>
              <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:600,marginBottom:6}}>Overall Score</div>
              <div style={{display:'flex',alignItems:'baseline',gap:5,marginBottom:10}}>
                <span style={{fontSize:48,fontWeight:700,color:scColor,lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>{sc.toFixed(1)}</span>
                <span style={{fontSize:18,color:C.muted}}>/10</span>
              </div>
              <p style={{fontSize:13,fontFamily:"'Instrument Serif',serif",fontStyle:'italic',color:C.muted2,lineHeight:1.65,margin:'0 0 14px'}}>{result.layer1_diagnosis.verdict}</p>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <Tag label={stageCfg.label} color={stageCfg.color} bg={`${stageCfg.color}15`}/>
                <Tag label={mom.label}      color={mom.color}      bg={`${mom.color}15`}/>
                {result.replyEnergyMatch==='low'&&<Tag label="Low energy" color={C.red} bg={C.redLo}/>}
                {result.replyEnergyMatch==='high'&&<Tag label="Over-investing" color={C.gold} bg={C.goldLo}/>}
              </div>
            </div>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',alignItems:'flex-start'}}>
              {[{val:result.interestLevel,max:100,color:C.pink,label:'Their interest',size:70},
                {val:result.attractionProbability,max:100,color:C.gold,label:'Attraction',size:70}].map(r=>{
                const rad=r.size/2-7,circ=2*Math.PI*rad;
                return(
                  <div key={r.label} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
                    <div style={{position:'relative',width:r.size,height:r.size}}>
                      <svg width={r.size} height={r.size} style={{transform:'rotate(-90deg)'}}>
                        <circle cx={r.size/2} cy={r.size/2} r={rad} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4}/>
                        <motion.circle cx={r.size/2} cy={r.size/2} r={rad} fill="none" stroke={r.color} strokeWidth={4} strokeLinecap="round"
                          initial={{strokeDasharray:`0 ${circ}`}} animate={{strokeDasharray:`${(r.val/r.max)*circ} ${circ}`}}
                          transition={{duration:1.4,ease:[0.16,1,0.3,1],delay:0.2}}/>
                      </svg>
                      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <span style={{fontSize:13,fontWeight:700,color:r.color,fontFamily:"'DM Sans',sans-serif"}}>{r.val}</span>
                      </div>
                    </div>
                    <span style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.09em',fontFamily:"'DM Sans',sans-serif",textAlign:'center'}}>{r.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Diagnosis */}
      <Reveal delay={0.08}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
          <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:10}}>Diagnosis</div>
          <p style={{fontSize:14,color:C.text,lineHeight:1.75,margin:'0 0 12px'}}>{result.layer1_diagnosis.summary}</p>
          {result.tags.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:6}}>{result.tags.map((t,i)=><Tag key={i} label={t.replace(/-/g,' ')} color={C.violetBr} bg={C.violetLo}/>)}</div>}
        </div>
      </Reveal>

      {/* Roast */}
      {result.roastMode&&result.roastText&&(
        <Reveal delay={0.10}>
          <div style={{background:C.redLo,border:`1px solid ${C.red}30`,borderRadius:18,padding:'18px 20px',marginBottom:10,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-10,right:14,fontSize:72,opacity:0.06,lineHeight:1,pointerEvents:'none',userSelect:'none',fontFamily:"'Instrument Serif',serif"}}>"</div>
            <div style={{fontSize:9,color:C.red,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:8}}>Roast</div>
            <p style={{fontSize:14,color:C.text,lineHeight:1.75,fontFamily:"'Instrument Serif',serif",fontStyle:'italic',margin:0}}>{result.roastText}</p>
          </div>
        </Reveal>
      )}

      {/* Tab bar */}
      <Reveal delay={0.12}>
        <div style={{display:'flex',background:C.surface,borderRadius:12,padding:3,marginBottom:12,border:`1px solid ${C.border}`,gap:3}}>
          {([['analysis','Analysis'],['rewrites','Rewrites & Moves'],['coach','Live Coach']] as const).map(([t,label])=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{flex:1,padding:'9px 8px',borderRadius:9,border:'none',cursor:'pointer',
                background:activeTab===t?C.surfaceHi:'transparent',
                color:activeTab===t?C.text:C.muted,
                fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",
                textTransform:'uppercase',letterSpacing:'0.08em',transition:'all 0.2s',
                borderBottom:activeTab===t?`2px solid ${C.violetBr}`:'2px solid transparent'}}>
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      <AnimatePresence mode="wait">
        {/* ── ANALYSIS TAB ── */}
        {activeTab==='analysis'&&(
          <motion.div key="analysis" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={EO}>

            {/* Layer 2 — Scores */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
              <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:16}}>Score Breakdown</div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {SCORE_META.map((sm,i)=>{
                  const s=result.layer2_scores[sm.key];
                  if(!s)return null;
                  return(
                    <div key={sm.key}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
                        <span style={{fontSize:12,fontWeight:600,color:C.text}}>{sm.label}</span>
                        <span style={{fontSize:16,fontWeight:700,color:sm.color,fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{s.score.toFixed(1)}</span>
                      </div>
                      <ScoreBar val={s.score} color={sm.color} delay={0.05+i*0.06}/>
                      {s.explanation&&<p style={{fontSize:12,color:C.muted,lineHeight:1.6,margin:'7px 0 0'}}>{s.explanation}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Layer 4 — Power dynamics */}
            {result.layer4_powerDynamics?.analysis&&(
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
                <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:12}}>Power Dynamics</div>
                <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
                  {[{label:'Power',val:result.layer4_powerDynamics.whoHoldsPower},
                    {label:'Chasing',val:result.layer4_powerDynamics.whoIsChasing},
                    {label:'Leading',val:result.layer4_powerDynamics.whoIsLeading}].map(item=>(
                    <div key={item.label} style={{flex:'1 1 80px',background:C.surfaceHi,borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
                      <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>{item.label}</div>
                      <div style={{fontSize:13,fontWeight:700,color:item.val==='user'?C.violetBr:item.val==='them'?C.gold:C.green,fontFamily:"'DM Sans',sans-serif",textTransform:'capitalize'}}>{item.val||'—'}</div>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:13,color:C.muted2,lineHeight:1.7,margin:'0 0 10px'}}>{result.layer4_powerDynamics.analysis}</p>
                {result.layer4_powerDynamics.rebalanceTip&&(
                  <div style={{background:C.violetLo,borderRadius:10,padding:'10px 12px',borderLeft:`2px solid ${C.violetBr}`}}>
                    <span style={{fontSize:12,color:C.violetBr}}>{result.layer4_powerDynamics.rebalanceTip}</span>
                  </div>
                )}
              </div>
            )}

            {/* Layer 3 — Psych signals */}
            {result.layer3_psychSignals?.length>0&&(
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
                <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:14}}>Psychological Signals</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {result.layer3_psychSignals.filter(s=>s.detected).map((s,i)=>(
                    <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.05+i*0.06,...SP}}
                      style={{borderLeft:`2px solid ${C.violetBr}`,paddingLeft:14}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:3}}>{s.signal}</div>
                      {s.evidence&&<div style={{fontSize:11,color:C.muted,fontStyle:'italic',marginBottom:4}}>"{s.evidence}"</div>}
                      <div style={{fontSize:12,color:C.muted2,lineHeight:1.6}}>{s.meaning}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Layer 8 — Attraction signals */}
            {result.layer8_attractionSignals?.length>0&&(
              <div style={{background:C.pinkLo,border:`1px solid ${C.pink}25`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
                <div style={{fontSize:9,color:C.pink,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:14}}>Attraction Signals</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {result.layer8_attractionSignals.map((sig,i)=>(
                    <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:SIG[sig.type]??C.muted2,marginTop:4,flexShrink:0}}/>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:SIG[sig.type]??C.muted2,marginBottom:2}}>{sig.signal}</div>
                        {sig.evidence&&<div style={{fontSize:11,color:C.muted,fontStyle:'italic',marginBottom:3}}>"{sig.evidence}"</div>}
                        <div style={{fontSize:12,color:C.muted2,lineHeight:1.6}}>{sig.interpretation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Layer 5 — Mistakes */}
            {result.layer5_mistakes?.length>0&&(
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
                <div style={{fontSize:9,color:C.red,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:14}}>Mistakes Made</div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {result.layer5_mistakes.map((m,i)=>(
                    <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.05+i*0.06,...SP}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                        <span style={{fontSize:12,fontWeight:700,color:SEV[m.severity]??C.red}}>{m.mistake}</span>
                        <Tag label={m.severity} color={SEV[m.severity]??C.red} bg={`${SEV[m.severity]??C.red}15`}/>
                      </div>
                      {m.whatHappened&&<div style={{fontSize:11,color:C.muted,fontStyle:'italic',marginBottom:5}}>What happened: "{m.whatHappened}"</div>}
                      <div style={{fontSize:12,color:C.muted2,lineHeight:1.65}}>{m.whyItHurts}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Layer 6 — Missed opportunities */}
            {result.layer6_missedOpportunities?.length>0&&(
              <div style={{background:C.goldLo,border:`1px solid ${C.gold}25`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
                <div style={{fontSize:9,color:C.gold,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:14}}>Missed Opportunities</div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  {result.layer6_missedOpportunities.map((mo,i)=>(
                    <div key={i} style={{borderLeft:`2px solid ${C.gold}50`,paddingLeft:14}}>
                      <div style={{fontSize:11,color:C.muted,fontStyle:'italic',marginBottom:4}}>You said: "{mo.moment}"</div>
                      <div style={{fontSize:12,color:C.muted2,marginBottom:6,lineHeight:1.5}}>{mo.whatWasMissed}</div>
                      <div style={{background:'rgba(252,211,77,0.08)',borderRadius:8,padding:'8px 12px'}}>
                        <div style={{fontSize:9,color:C.gold,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:3}}>Better response</div>
                        <div style={{fontSize:13,color:C.text,fontFamily:"'Instrument Serif',serif",fontStyle:'italic'}}>"{mo.betterResponse}"</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Layer 10 — Strategy */}
            {result.layer10_strategy?.primaryAdvice&&(
              <div style={{background:C.violetLo,border:`1px solid ${C.violetHi}`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
                <div style={{fontSize:9,color:C.violetBr,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:12}}>Strategy</div>
                <p style={{fontSize:14,color:C.text,lineHeight:1.75,margin:'0 0 14px'}}>{result.layer10_strategy.primaryAdvice}</p>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {result.layer10_strategy.doThis&&(
                    <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <Tag label="Do" color={C.green} bg={C.greenLo}/>
                      <span style={{fontSize:13,color:C.muted2,lineHeight:1.6,paddingTop:2}}>{result.layer10_strategy.doThis}</span>
                    </div>
                  )}
                  {result.layer10_strategy.avoidThis&&(
                    <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <Tag label="Avoid" color={C.red} bg={C.redLo}/>
                      <span style={{fontSize:13,color:C.muted2,lineHeight:1.6,paddingTop:2}}>{result.layer10_strategy.avoidThis}</span>
                    </div>
                  )}
                </div>
                {result.layer10_strategy.longTermRead&&(
                  <p style={{fontSize:12,color:C.muted,lineHeight:1.6,margin:'12px 0 0',fontStyle:'italic'}}>{result.layer10_strategy.longTermRead}</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── REWRITES TAB ── */}
        {activeTab==='rewrites'&&(
          <motion.div key="rewrites" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={EO}>
            {/* Layer 7 — Rewrites */}
            {result.layer7_rewrites?.originalMessage&&(
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
                <div style={{fontSize:9,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:10}}>Message Rewrites</div>
                <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:'10px 13px',marginBottom:14,borderLeft:`2px solid ${C.red}40`}}>
                  <div style={{fontSize:9,color:C.red,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:4}}>Original</div>
                  <div style={{fontSize:13,color:C.muted2,fontStyle:'italic',fontFamily:"'Instrument Serif',serif"}}>"{result.layer7_rewrites.originalMessage}"</div>
                </div>
                {[
                  {key:'playful',  label:'Playful',   color:C.pink,    bg:C.pinkLo},
                  {key:'confident',label:'Confident', color:C.violetBr,bg:C.violetLo},
                  {key:'curious',  label:'Curious',   color:C.cyan,    bg:C.cyanLo},
                ].map(v=>{
                  const ver=(result.layer7_rewrites as any)[v.key];
                  if(!ver)return null;
                  return(
                    <motion.div key={v.key} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:0.1,...SP}}
                      style={{background:v.bg,border:`1px solid ${v.color}25`,borderRadius:13,padding:'14px 16px',marginBottom:8}}>
                      <Tag label={v.label} color={v.color} bg={`${v.color}20`}/>
                      <p style={{fontSize:14,color:C.text,fontFamily:"'Instrument Serif',serif",fontStyle:'italic',lineHeight:1.65,margin:'10px 0 8px'}}>"{ver.message}"</p>
                      <p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.5}}>{ver.why}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Layer 9 — Next moves */}
            {result.layer9_nextMoves?.playful&&(
              <div style={{background:C.violetLo,border:`1px solid ${C.violetHi}`,borderRadius:18,padding:'18px 20px',marginBottom:10}}>
                <div style={{fontSize:9,color:C.violetBr,textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:700,marginBottom:14}}>What to send next</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {[
                    {key:'playful',  label:'Playful',   color:C.pink},
                    {key:'curious',  label:'Curious',   color:C.cyan},
                    {key:'confident',label:'Confident', color:C.violetBr},
                  ].map(nm=>{
                    const move=(result.layer9_nextMoves as any)[nm.key];
                    if(!move)return null;
                    return(
                      <div key={nm.key} style={{background:'rgba(255,255,255,0.04)',borderRadius:12,padding:'13px 15px'}}>
                        <Tag label={nm.label} color={nm.color} bg={`${nm.color}15`}/>
                        <p style={{fontSize:14,color:C.text,fontFamily:"'Instrument Serif',serif",fontStyle:'italic',lineHeight:1.65,margin:'9px 0 6px'}}>"{move.message}"</p>
                        <p style={{fontSize:11,color:C.muted,margin:0}}>{move.intent}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── COACH TAB ── */}
        {activeTab==='coach'&&(
          <motion.div key="coach" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={EO}>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:13,color:C.muted2,lineHeight:1.7,marginBottom:4}}>
                Type what you're about to send. The AI will give you an instant verdict and a better version.
              </div>
            </div>
            <LiveCoach extractedText={result.extractedText} context={context}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      <Reveal delay={0.3}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',paddingTop:12}}>
          <Link href="/practice" style={{flex:'1 1 130px',textDecoration:'none'}}>
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
              style={{width:'100%',background:C.violetLo,border:`1px solid ${C.violetHi}`,borderRadius:12,padding:'12px 18px',color:C.violetBr,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
              Practice this
            </motion.button>
          </Link>
          <motion.button onClick={onReset} whileHover={{scale:1.02}} whileTap={{scale:0.98}}
            style={{flex:'1 1 130px',background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 18px',color:C.muted2,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
            Analyze another
          </motion.button>
        </div>
      </Reveal>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────────────────────────────────────
type Step='context'|'upload'|'loading'|'result'|'error';

export default function UploadPage(){
  const [step,setStep]=useState<Step>('context');
  const [context,setContext]=useState('dating');
  const [result,setResult]=useState<AnalysisResult|null>(null);
  const [error,setError]=useState<string|null>(null);

  const handleAnalyze=async(file:File|null,text:string|null,language:string,roastMode:boolean)=>{
    setStep('loading'); setError(null);
    try{
      const fd=new FormData();
      if(file)fd.append('image',file);
      if(text)fd.append('text',text);
      fd.append('context',context);
      fd.append('language',language);
      fd.append('roastMode',String(roastMode));

      const res=await fetch('/api/analyze',{method:'POST',body:fd});
      const data=await res.json();
      if(!res.ok||!data.success){setError(data.error||'Analysis failed.');setStep('error');return;}
      setResult(data);
      setStep('result');
    }catch(e:any){setError(e.message||'Something went wrong.');setStep('error');}
  };

  const reset=()=>{setStep('context');setResult(null);setError(null);};

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::selection{background:rgba(91,79,233,0.3);}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(91,79,233,0.35);border-radius:2px;}
        select option{background:#111;color:#F2F0EB;}
        textarea{transition:border-color 0.2s;}
      `}</style>

      <div style={{background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif",minHeight:'100svh',overflowX:'hidden',paddingBottom:80}}>
        <div style={{position:'fixed',top:0,left:'50%',transform:'translateX(-50%)',width:600,height:360,background:'radial-gradient(circle,rgba(91,79,233,0.06) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'fixed',inset:0,zIndex:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'}}/>

        <div style={{maxWidth:600,margin:'0 auto',padding:'52px 18px 40px',position:'relative',zIndex:1}}>
          {step==='context'&&(
            <Reveal>
              <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:6,color:C.muted,fontSize:12,textDecoration:'none',fontFamily:"'DM Sans',sans-serif",marginBottom:28}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H2M5.5 3L2 7l3.5 4" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Home
              </Link>
            </Reveal>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={EO}>
              {step==='context'&&<StepContext onNext={ctx=>{setContext(ctx);setStep('upload');}}/>}
              {step==='upload'&&<StepUpload context={context} onBack={()=>setStep('context')} onAnalyze={handleAnalyze}/>}
              {step==='loading'&&<Loading/>}
              {step==='result'&&result&&<StepResults result={result} context={context} onReset={reset}/>}
              {step==='error'&&(
                <div style={{textAlign:'center',padding:'60px 0'}}>
                  <div style={{fontSize:13,color:C.red,marginBottom:8}}>Analysis failed</div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:24,maxWidth:320,margin:'0 auto 24px',lineHeight:1.6}}>{error}</div>
                  <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={()=>setStep('upload')}
                      style={{background:C.surface,border:`1px solid ${C.border}`,color:C.text,borderRadius:12,padding:'11px 20px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                      Try again
                    </motion.button>
                    <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={reset}
                      style={{background:'none',border:'none',color:C.muted,fontSize:13,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                      Start over
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}