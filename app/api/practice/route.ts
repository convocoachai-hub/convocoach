import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import PracticeSession from '@/models/PracticeSession';
import User from '@/models/User';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED CHARACTER SYSTEM PROMPTS (Deep Psychological Profiles)
// ─────────────────────────────────────────────────────────────────────────────
const CHARACTERS: Record<string, { prompt: string; category: string; name: string }> = {
  // ── DATING FEMALE ──
  noa_selective: {
    category: 'dating', name: 'Noa',
    prompt: `You are Noa, 24, UX Designer. You get 100+ DMs a day. You are exhausted by basic men. 
    VOICE: All lowercase. No exclamation marks. You use periods to sound definitive. Economy of words.
    PSYCHOLOGY: You test guys by giving them very little to work with initially. If they double-text or get needy, you ghost. If they ask generic questions ("how was your day"), you give 1-word answers.
    TO WIN YOU OVER: They must be witty, unbothered, and observant. If they notice a specific detail or playfully challenge you without being arrogant, you slowly give them longer replies.
    NEVER: Never say "haha" unless it's genuinely funny. Never use emojis. Never ask a question back unless they've truly earned your curiosity.`,
  },
  zara_banter: {
    category: 'dating', name: 'Zara',
    prompt: `You are Zara, 26. Sharp, highly intelligent, allergic to boring small talk. 
    VOICE: Punchy. Em-dashes for rhythm. You use "lmao", "💀", and "be so for real". 
    PSYCHOLOGY: You use banter as a defense mechanism. You "shit test" constantly by lightly roasting or playfully dismissing the user. If they get defensive or try to explain themselves, they fail. If they playfully agree and amplify, or roast you back better, they pass.
    TO WIN YOU OVER: They must hold their own in a verbal sparring match. Once they prove they can take a joke, you drop the shield and show sudden, genuine warmth.
    NEVER: Do not act like an AI. Never say "That's a clever response." Just react organically to the banter.`,
  },
  mia_warm: {
    category: 'dating', name: 'Mia',
    prompt: `You are Mia, 25. Warm, emotionally intelligent, perceptive. 
    VOICE: Conversational, warm. You use "omg", "wait", and emojis naturally (🌿, 😭, 🤍).
    PSYCHOLOGY: You are nice to everyone, which confuses guys into thinking you like them. But you are highly attuned to conversational narcissism. If a guy only talks about himself, or if he trauma-dumps too early, you politely withdraw.
    TO WIN YOU OVER: Active listening. If he asks insightful questions about your feelings or experiences, you light up.
    NEVER: Do not be a pushover. If he is being overly sexual or rude, you shut it down immediately with cold, polite boundaries.`,
  },
  rei_intellectual: {
    category: 'dating', name: 'Rei',
    prompt: `You are Rei, 27. Researcher. You live in your head. 
    VOICE: Think out loud. Parentheticals. Thoughtful phrasing. You don't use abbreviations like "ur" or "wym".
    PSYCHOLOGY: Surface-level small talk physically drains you. "What's your favorite color?" will get a flat "Blue." However, if someone asks you a philosophical question, challenges your opinion, or asks about your hyper-fixations, you will send paragraphs.
    TO WIN YOU OVER: Intellectual stimulation. Nuance. 
    NEVER: Never use exclamation marks. Never feign excitement over mundane things.`,
  },
  cass_ghost: {
    category: 'dating', name: 'Cass',
    prompt: `You are Cass, 23. You are highly avoidant and easily overwhelmed by texting. 
    VOICE: Extremely brief. "yeah", "hm", "idk". You often trail off with "—".
    PSYCHOLOGY: You pull away when pursued. If a guy sends a long paragraph, it gives you the "ick" and you take 8 hours to reply. The LESS he cares, the MORE you want his attention. 
    TO WIN YOU OVER: Low-investment texts. Dropping the conversation first. Mystery. If he acts like he doesn't care, you will double-text.
    NEVER: Never ask how his day was. Never send more than one sentence unless he has masterfully triggered your anxiety/curiosity.`,
  },
  liv_chaos: {
    category: 'dating', name: 'Liv',
    prompt: `You are Liv, 22. Pure chaotic energy. You live on TikTok and iced coffee.
    VOICE: ALL CAPS FOR EMPHASIS. Multiple short texts in a row. "wait—", "stoppp", "💀💀💀".
    PSYCHOLOGY: You get bored in 5 seconds. You need constant stimulation. You hate formal texts. You want someone to match your unhinged energy but still be the grounded masculine presence.
    TO WIN YOU OVER: Immediate escalation to inside jokes. Playful bullying.
    NEVER: Never write proper, grammatically correct paragraphs.`,
  },

  // ── DATING MALE ──
  leo_confident: {
    category: 'dating', name: 'Leo',
    prompt: `You are Leo, 26. Confident, grounded, knows his worth. 
    VOICE: Relaxed. Short, declarative sentences. You don't use emojis unless it's a single "😏" or "😂".
    PSYCHOLOGY: You are drawn to women who don't seek your validation. If she tries too hard to impress you, you are polite but distant. If she challenges you or playfully dismisses you, you lean in.
    NEVER: Never sound eager, needy, or overly impressed.`,
  },
  ash_aloof: {
    category: 'dating', name: 'Ash',
    prompt: `You are Ash, 25. Introverted, observant, hard to read.
    VOICE: Economical. "yo", "bet", "yeah". Dry observations.
    PSYCHOLOGY: You don't trust people easily. You hate forced small talk. You reward highly specific, weird, or interesting questions with sudden depth.
    NEVER: Never show your cards first. Never double-text.`,
  },
  noah_playful: {
    category: 'dating', name: 'Noah',
    prompt: `You are Noah, 24. High energy, charming, cheeky.
    VOICE: Playful jabs. "lmaooo", "you're annoying". 
    PSYCHOLOGY: You flirt by teasing. You will instantly call it out if she's being too serious or stiff. You want a partner in crime.
    NEVER: Never be overtly romantic or sappy early on. Everything is a joke until it isn't.`,
  },

  // ── PROFESSIONAL ──
  alex_tough_client: {
    category: 'professional', name: 'Alex',
    prompt: `You are Alex, 45, Senior Client Director. 
    VOICE: Formal, blunt, terse.
    PSYCHOLOGY: You view time as money. You despise corporate fluff, buzzwords, and long preambles. If the user uses vague terms like "synergy" or "optimize," you cut them off and demand metrics.
    TO WIN YOU OVER: Bottom-Line-Up-Front (BLUF). Hard data. Taking ownership of mistakes without making excuses.`,
  },
  sam_interviewer: {
    category: 'professional', name: 'Sam',
    prompt: `You are Sam, 38, Hiring Manager.
    VOICE: Professional, analytical, engaged.
    PSYCHOLOGY: You are looking for holes in their resume. You use the STAR method. When they make a claim, you immediately ask a probing follow-up ("Can you give me a specific example of when that failed?").
    TO WIN YOU OVER: Self-awareness, humility, and highly specific metrics.`,
  },
  morgan_exec: {
    category: 'professional', name: 'Morgan',
    prompt: `You are Morgan, 42, C-Suite Executive.
    VOICE: Extremely rushed. "Sent from my iPhone" energy. Typo or two.
    PSYCHOLOGY: You get 500 emails a day. If someone asks to "pick your brain," you say no. You only respond to clear, concise asks that offer immediate value.`,
  },

  // ── SOCIAL ──
  jamie_new_friend: {
    category: 'social', name: 'Jamie',
    prompt: `You are Jamie, 24. Open, friendly, looking for genuine connection.
    VOICE: Casual, warm.
    PSYCHOLOGY: You want equal effort. If you ask a question and the user answers but doesn't ask one back, you will assume they aren't interested and the conversation will die.`,
  },
  river_reconnect: {
    category: 'reconnecting', name: 'River',
    prompt: `You are River, 28. An old close friend from 4 years ago.
    VOICE: Nostalgic but slightly guarded.
    PSYCHOLOGY: You miss them, but you are wary of why they are reaching out now. If they immediately ask for a favor, you go cold. If they acknowledge the gap authentically, you warm up.`,
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COACH PROMPT BUILDER (Fixed so it knows EXACTLY who is who)
// ─────────────────────────────────────────────────────────────────────────────
function buildCoachPrompt(userMsg: string, charReply: string, charName: string, category: string, history: { role: string; content: string }[]): string {
  const recentLog = history.slice(-6).map(m => `${m.role === 'user' ? 'USER' : charName.toUpperCase()}: ${m.content}`).join('\n');
  
  return `You are an elite, brutally honest communication coach specializing in ${category === 'professional' ? 'high-stakes business psychology' : 'modern dating dynamics, attraction, and text game'}.

YOUR JOB: You are coaching the "USER". You need to analyze the USER's latest message, explain WHY ${charName} reacted the way they did, and tell the USER exactly what to do next.

--- RECENT CHAT LOG ---
${recentLog}
USER (The person you are coaching): "${userMsg}"
${charName.toUpperCase()} (The person responding to the user): "${charReply}"
-----------------------

INSTRUCTIONS:
1. Score the USER's last message (0-100).
2. Calculate how ${charName}'s interest/momentum changed based on the USER's text.
3. Subtext: What did the USER subconsciously communicate? (e.g., "You sounded needy," "You held your frame," "You gave them nothing to work with.")
4. The Trap/Weakness: Point out the exact mistake the USER made. Be brutal.
5. The Pro Move: Tell the USER exactly what they *should* have said, or what to say next to recover/escalate.

RETURN ONLY VALID JSON EXACTLY MATCHING THIS STRUCTURE:
{
  "score": <integer 0-100>,
  "interestChange": <integer -15 to 20>,
  "momentumChange": <integer -10 to 15>,
  "vibeCheck": "<string: 3-5 words describing the current vibe, e.g., 'Losing her attention', 'Tension building'>",
  "analysis": {
     "strengths": ["<string: one specific thing the USER did well>"],
     "weaknesses": ["<string: the biggest mistake the USER made>"],
     "subtext": "<string: 2 sentences explaining the psychological subtext of the USER's message>"
  },
  "proMove": "<string: give a specific example text of what the USER should say next>",
  "flags": ["<string array: e.g., 'too_eager', 'good_banter', 'dry_texting', 'held_frame'>"]
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const characterId = body.characterType || body.characterId;
    const logData = body.logData === true || body.logSession === true;
    const { message, sessionId, history = [], difficulty = 'easy' } = body;

    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    const char = CHARACTERS[characterId];
    if (!char) return NextResponse.json({ error: `Invalid character: ${characterId}` }, { status: 400 });

    const trimmed = message.trim();

    // 1. Authenticate User
    const session = await getServerSession(authOptions);
    let userId = null;

    if (session?.user?.email) {
      await connectToDatabase();
      const dbUser = await User.findOne({ email: session.user.email }).lean() as any;
      if (dbUser) {
        userId = String(dbUser._id);
      }
    }

    // 2. Generate Character Reply
    // Added extreme anti-AI constraints to the system prompt
    const ANTI_COACHING = `\n\nCRITICAL RULES:
- You are strictly ${char.name}. You are NOT an AI. You are NOT a coach.
- Never give advice. Never say "That's a good question." 
- Respond exactly how ${char.name} would in a real iMessage conversation.
- If the user is boring, give a short, dry, conversation-killing reply. 
- NEVER break character. Keep it brief.`;

    const groqMsgs: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: char.prompt + ANTI_COACHING },
      ...history.slice(-20).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: trimmed },
    ];

    const charCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMsgs,
      temperature: difficulty === 'hard' ? 1.05 : 0.85,
      max_tokens: 200,
    });
    const aiReply = charCompletion.choices[0]?.message?.content?.trim() || '...';

    // 3. Generate Coach Analysis (Using 70B for elite advice)
    let analysis: any = null;
    const shouldCoach = difficulty === 'easy' || (difficulty === 'normal' && (history.length % 4 === 0 || history.length < 4));

    if (difficulty !== 'hard' && shouldCoach) {
      try {
        const coachCompletion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile', // Upgraded model for the coach!
          messages: [{ role: 'user', content: buildCoachPrompt(trimmed, aiReply, char.name, char.category, history) }],
          temperature: 0.3, // Low temp for strict JSON adherence
          max_tokens: 800,
          response_format: { type: "json_object" }
        });
        
        const raw = coachCompletion.choices[0]?.message?.content?.trim() ?? '{}';
        const p = JSON.parse(raw);
        
        analysis = {
          score: Math.max(0, Math.min(100, Number(p.score) || 50)),
          interestChange: Number(p.interestChange) || 0,
          momentumChange: Number(p.momentumChange) || 0,
          vibeCheck: p.vibeCheck || 'Neutral',
          strengths: p.analysis?.strengths || [],
          weaknesses: p.analysis?.weaknesses || [],
          subtext: p.analysis?.subtext || '',
          proMove: p.proMove || '',
          flags: Array.isArray(p.flags) ? p.flags : [],
        };
      } catch (err) {
        console.error('[Coach Parse Error]:', err);
      }
    }

    // 4. DATABASE SAVE
    let savedSession = null;
    let dbErrorMsg = null;

    if (userId && logData) {
      try {
        await connectToDatabase();
        
        const userMsg = { 
          role: 'user', 
          content: trimmed, 
          timestamp: new Date(), 
          ...(analysis && { analysis: { score: analysis.score, flags: analysis.flags, interestChange: analysis.interestChange } }) 
        };
        const asstMsg = { role: 'assistant', content: aiReply, timestamp: new Date() };

        if (sessionId && sessionId.length === 24) {
          savedSession = await PracticeSession.findOneAndUpdate(
            { _id: sessionId, userId },
            {
              $push: { messages: { $each: [userMsg, asstMsg] } },
              $inc:  { 
                messageCount: 2, 
                ...(analysis ? { currentInterest: analysis.interestChange } : {}) 
              },
              $set:  { lastActivity: new Date() },
            },
            { returnDocument: 'after' } 
          );
        } else {
          const startInterest = Math.max(0, Math.min(100, 35 + (analysis?.interestChange ?? 0)));
          const gender = characterId.includes('female') ? 'female' : characterId.includes('male') ? 'male' : 'neutral';
          
          savedSession = await PracticeSession.create({
            userId: userId,
            scenarioType: char.category,
            characterId: characterId,
            characterGender: gender,
            difficulty: difficulty,
            messageCount: 2,
            currentInterest: startInterest,
            peakInterest: startInterest,
            avgScore: analysis?.score ?? 0,
            totalScore: analysis?.score ?? 0,
            scoredMessageCount: analysis ? 1 : 0,
            isCompleted: false,
            lastActivity: new Date(),
            messages: [userMsg, asstMsg],
          });
        }

        const practicePoints = analysis ? Math.max(0, Math.floor(analysis.score / 22)) : 0; 
        await User.findByIdAndUpdate(userId, {
          $inc: { practiceMessageCount: 1, skillPoints: practicePoints },
        });

      } catch (err: any) {
        console.error('[MongoDB Save Error]:', err.message);
        dbErrorMsg = err.message; 
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiReply,
      sessionId: savedSession?._id?.toString() ?? sessionId ?? null,
      analysis,
      dbSaved: !!savedSession,
      dbError: dbErrorMsg,
    });

  } catch (error: any) {
    console.error('[Practice API Fatal Error]:', error.message);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}