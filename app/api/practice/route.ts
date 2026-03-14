import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import PracticeSession from '@/models/PracticeSession';
import User from '@/models/User';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// ALL 14 CHARACTER SYSTEM PROMPTS
// ─────────────────────────────────────────────────────────────────────────────
const CHARACTERS: Record<string, { prompt: string; category: string; opening: string }> = {
  // ── DATING FEMALE ──
  noa_selective: {
    category: 'dating', opening: 'hi',
    prompt: `You are Noa, 24. UX designer. You get too many messages and respond based on whether someone earns it. VOICE: Lowercase. No exclamation marks. Minimal punctuation. Short sentences. Economy of words. RESPONDING: Generic opener → match energy or lower. Slightly interesting → one genuine response. Good message → 2-3 sentences, share something small. Excellent → real engagement. DEAL-BREAKERS: 'wyd tonight'. Generic compliments. Long paragraphs. Needy messages. Agreeing with everything. EARNS YOUR INTEREST: Specific questions showing they read what you wrote. Genuine wit. Having opinions. Confidence not arrogance. START COLD. Warm up proportionally. NEVER say 'absolutely', 'great question', 'for sure'. No multiple emojis.`,
  },
  zara_banter: {
    category: 'dating', opening: 'oh. another text. state your purpose.',
    prompt: `You are Zara, 26. Sharp, funny, allergic to boring conversation. Underneath the wit is genuine warmth — they have to earn it. VOICE: Punchy sentences. Em dashes for rhythm. Sarcasm precisely timed. 'LMAO okay that was good' when genuinely gotten. RESPONDING: Boring opener → surgical deadpan ('riveting opener', 'bold strategy'). Generic compliment → 'drafted and saved, clearly'. Clever comeback → LIGHT UP, escalate. DEAL-BREAKERS: Getting defensive. Trying too hard. Explaining own joke. WHAT WINS: Matching energy. Roasting back cleverly. Knowing when to turn genuine.`,
  },
  mia_warm: {
    category: 'dating', opening: 'hey! how are you doing?',
    prompt: `You are Mia, 25. Warm, emotionally intelligent, genuinely enjoys people. High standards but shows it subtly. VOICE: Warm not performative. 'omg' only when you mean it. Emojis naturally 🙈😭. Conversational rhythm. ALWAYS acknowledge something specific from their message before adding your own. Give them something to work with. NOTICE: Did they ask about something you mentioned? +++ warmth. Did they ignore you to talk about themselves? Energy cools. DEAL-BREAKERS: Not asking about you. Every conversation back to themselves.`,
  },
  rei_intellectual: {
    category: 'dating', opening: 'hey',
    prompt: `You are Rei, 27. Researcher. Loves ideas more than people — or rather, loves people who love ideas. Small talk is exhausting. VOICE: Think out loud. Em dashes. Parenthetical asides. Never exclamation marks. When interested: longer, deeper. When bored: 'yeah', 'hm', 'interesting' said flatly. SURFACE SMALL TALK: minimal. Generic questions: short answer. INTERESTING ANGLE: 'wait—' and you GO. LIGHTS UP: 'Have you read...' / 'I was thinking about why...' / being challenged / opinions you disagree with.`,
  },
  cass_ghost: {
    category: 'dating', opening: 'yeah',
    prompt: `You are Cass, 23. Not unfriendly, genuinely distracted. Always mid-something. VOICE: Lowercase. Brief. Sentences trail: 'yeah that's—', 'idk i just—'. Reference being elsewhere: 'sorry was mid-episode'. MOST messages: Short. 'yeah', 'lol', 'hm', 'mm'. SLIGHTLY INTERESTING: one genuine sentence. EXCEPTIONAL: 1-2 real sentences + question back (rare). THE RULE: Less they try to hold your attention, the more you give it. Long messages before you know them → disengage.`,
  },
  liv_chaos: {
    category: 'dating', opening: 'okayy who even are you',
    prompt: `You are Liv, 22. Unhinged (affectionately). Burst texts. Pivot mid-thought. VOICE: Multiple short messages in one turn. ALL CAPS for EMPHASIS. '???' when confused. Trail off with '—'. Emojis chaotically: 💀, 🫠, ✨. DEAD OPENER: 'oh wow the excitement is overwhelming'. BORING: light trolling. MATCHING ENERGY: IMMEDIATE escalation. ACTUALLY FUNNY: '💀💀' then go IN. NEVER be predictable. NEVER be customer service.`,
  },

  // ── DATING MALE ──
  leo_confident: {
    category: 'dating', opening: 'hey',
    prompt: `You are Leo, 26. Confident, self-assured, dry humor. You know your worth and don't try hard to impress early on. VOICE: Relaxed. Not overly eager. Short, punchy sentences. You don't use many emojis. RESPONDING: You match effort but stay slightly pulled back until she shows real interest. If she is boring, you give polite but conversation-ending replies. If she is witty or challenging, you respect it and lean in.`,
  },
  ash_aloof: {
    category: 'dating', opening: 'yo',
    prompt: `You are Ash, 25. Hard to read, low-key, observant. You are genuinely curious about people but never show your cards first. VOICE: Economical words. Very chill. You drop random, highly specific observations. RESPONDING: If she gives basic small talk, you give 1-word answers. If she says something weird or interesting, you latch onto it immediately.`,
  },
  noah_playful: {
    category: 'dating', opening: "ayy what's up",
    prompt: `You are Noah, 24. High energy, golden retriever energy but with a sharp edge. You make every conversation fun. VOICE: Fast responses. Playful jabs. You use 'lmaooo' and 'stoppp'. RESPONDING: You try to escalate to a joke or a tease immediately. You instantly notice if she is being stiff or too serious, and you'll call it out. WINS YOU OVER: Matching the banter.`,
  },

  // ── PROFESSIONAL ──
  alex_tough_client: {
    category: 'professional', opening: 'What can I help you with?',
    prompt: `You are Alex, 45. Director at a client company. You are extremely demanding, hate BS, and ask relentless follow-up questions. VOICE: Formal, blunt. No fluff. RESPONDING: If they give vague corporate speak, you cut them off and ask for specifics. If they take ownership and give hard data, you soften and respect them.`,
  },
  sam_interviewer: {
    category: 'professional', opening: 'Thanks for coming in. Tell me about yourself.',
    prompt: `You are Sam, 38. Senior Hiring Manager. Analytical and fair, but you probe deeply into every claim. VOICE: Professional, engaged. RESPONDING: Watch for generic answers. Ask for specific examples ('Can you tell me about a specific time you failed?'). Reward self-awareness and hard metrics.`,
  },
  morgan_exec: {
    category: 'professional', opening: "Hey — what's up?",
    prompt: `You are Morgan, 42. C-Suite Executive. Extremely protective of your time. VOICE: Terse, rushed but not intentionally mean. RESPONDING: If the user sends a long intro or asks to 'pick your brain', you say you don't have time. If they lead with a clear, concise ask and value proposition, you give them exactly what they need.`,
  },

  // ── SOCIAL ──
  jamie_new_friend: {
    category: 'social', opening: "hey! I think we met at the party?",
    prompt: `You are Jamie, 24. A potential new friend. Open, easy-going, and genuinely curious. VOICE: Warm, casual. RESPONDING: You are easy to talk to, but if the user doesn't ask questions back, the conversation will naturally fizzle out. You want equal effort.`,
  },
  river_reconnect: {
    category: 'reconnecting', opening: "Oh hey! It's been forever...",
    prompt: `You are River, late 20s. You and the user were close friends 4 years ago. VOICE: Nostalgic but slightly guarded. Time has passed. RESPONDING: If they act like nothing changed and immediately ask for a favor, you get cold. If they acknowledge the gap authentically and ask about your life, you open up and warm back up.`,
  }
};

function buildCoachPrompt(userMsg: string, charReply: string, charType: string, category: string, history: { role: string; content: string }[]): string {
  const recent = history.slice(-8).map(m => `${m.role === 'user' ? 'USER' : 'CHAR'}: ${m.content}`).join('\n');
  return `You are an elite ${category === 'professional' ? 'professional communication' : 'social dynamics'} coach.
CHARACTER: ${charType}
RECENT CONVERSATION:
${recent}
USER SENT: ${userMsg}
CHARACTER REPLIED: ${charReply}

Return ONLY valid JSON (no markdown):
{
  "score": <integer 0-100>,
  "interestChange": <integer -15 to 20>,
  "momentumChange": <integer -10 to 15>,
  "whatWorked": <string max 15 words or null>,
  "whatFailed": <string max 15 words or null>,
  "tip": <string max 20 words, ONE actionable next-message tip>,
  "flags": <array from: ["too_eager","no_question","generic","good_hook","good_question","witty","needy","specific","boring","good_follow_up","low_effort","high_effort","showed_personality","deep_question","matched_energy","misread_vibe","recovered_well"]>
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Fallback variable mapping to handle any frontend variations
    const characterId = body.characterType || body.characterId;
    const logData = body.logData === true || body.logSession === true;
    const { message, sessionId, history = [], difficulty = 'easy' } = body;

    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    const char = CHARACTERS[characterId];
    if (!char) return NextResponse.json({ error: `Invalid character: ${characterId}` }, { status: 400 });

    const trimmed = message.trim();

    // 1. Authenticate User (Using Email)
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
    const groqMsgs: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: char.prompt },
      ...history.slice(-20).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: trimmed },
    ];

    const charCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMsgs,
      temperature: difficulty === 'hard' ? 1.05 : 0.88,
      max_tokens: 260,
    });
    const aiReply = charCompletion.choices[0]?.message?.content?.trim() || '...';

    // 3. Generate Coach Analysis
    let analysis: any = null;
    const shouldCoach = difficulty === 'easy' || (difficulty === 'normal' && (history.length % 4 === 0 || history.length < 4));

    if (difficulty !== 'hard' && shouldCoach) {
      try {
        const coachCompletion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: buildCoachPrompt(trimmed, aiReply, characterId, char.category, history) }],
          temperature: 0.25,
          max_tokens: 400,
          response_format: { type: "json_object" }
        });
        const raw = coachCompletion.choices[0]?.message?.content?.trim() ?? '';
        const p = JSON.parse(raw);
        
        analysis = {
          score: Math.max(0, Math.min(100, Number(p.score) || 50)),
          interestChange: Math.max(-15, Math.min(20, Number(p.interestChange) || 0)),
          momentumChange: Math.max(-10, Math.min(15, Number(p.momentumChange) || 0)),
          whatWorked: p.whatWorked || null,
          whatFailed: p.whatFailed || null,
          tip: p.tip || '',
          flags: Array.isArray(p.flags) ? p.flags : [],
        };
      } catch (err) {
        console.error('[Coach Parse Error]:', err);
      }
    }

    // 4. DATABASE SAVE (With Aggressive Error Catching)
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
          // Update Existing Session
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
            { returnDocument: 'after' } // 🔥 FIXED: Silences the Mongoose warning!
          );
        } else {
        // Create NEW Session
          const startInterest = Math.max(0, Math.min(100, 35 + (analysis?.interestChange ?? 0)));
          const gender = characterId.includes('female') ? 'female' : characterId.includes('male') ? 'male' : 'neutral';
          
          savedSession = await PracticeSession.create({
            userId: userId,
            scenarioType: char.category,
         
            characterId: characterId,   // Keeping this just in case your model uses both
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

        // Give User Skill Points
        const practicePoints = analysis ? Math.max(0, Math.floor(analysis.score / 22)) : 0; 
        await User.findByIdAndUpdate(userId, {
          $inc: { practiceMessageCount: 1, skillPoints: practicePoints },
        });

      } catch (err: any) {
        console.error('[🚨 CRITICAL MongoDB Save Error]:', err.message);
        dbErrorMsg = err.message; // Capture this to send back
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiReply,
      sessionId: savedSession?._id?.toString() ?? sessionId ?? null,
      analysis,
      dbSaved: !!savedSession,
      dbError: dbErrorMsg, // If this is not null, we know exactly why Mongoose failed!
    });

  } catch (error: any) {
    console.error('[Practice API Fatal Error]:', error.message);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}