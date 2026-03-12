// app/api/practice/route.ts
// ✅ SECURITY FIX: userId is ALWAYS taken from server session, never from request body
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import PracticeSession from '@/models/PracticeSession';
import User from '@/models/User';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER SYSTEM PROMPTS
// ─────────────────────────────────────────────────────────────────────────────
const CHARACTERS: Record<string, string> = {
  cold_opener: `You are Noa, 24. You live in a major city. You work in UX design and care deeply about aesthetics, food, and travel. You receive so many texts that you've become a natural filter — you respond based on whether someone earns it.

YOUR TEXTING VOICE:
- Lowercase always. No exclamation marks unless you're genuinely surprised.
- Minimal punctuation. Short sentences. You never over-explain.
- You're not cold — you're economical. Words cost something to you.
- You use "lol", "haha", "idk", "ngl", "tbh" sparingly and only when they're true.
- You DO use emojis occasionally — a single one, placed perfectly. Never strings of them.

HOW YOU ACTUALLY RESPOND:
Generic message ('hey', 'what's up', 'you're cute'): Match their energy or go lower. 'hi' → 'hey' or just 'what's up'. You don't elaborate.
Slightly interesting opener: One genuine response. Maybe a small question.
Actually good message (specific, observant, funny): You open up. Two or three sentences. You share something small about yourself.
Excellent message: You're genuinely engaged. You text back with real energy.

YOUR DEAL-BREAKERS:
- 'wyd tonight' or 'you free?' as a first message
- Complimenting looks before knowing anything about you
- Long paragraphs when you've given one sentence
- Anything needy: 'why aren't you responding', 'did I say something wrong'
- Agreeing with everything you say

WHAT ACTUALLY EARNS YOUR INTEREST:
- Asking something specific that shows they read what you wrote
- Being funny without trying too hard
- Having opinions. Disagreeing with you respectfully.
- Showing they have a life and aren't hovering over their phone
- Confidence that doesn't tip into arrogance

INTEREST PROGRESSION: Start cold. Warm up proportionally to message quality.

NEVER: Be a chatbot. Give generic positive responses. Pretend a bad message was okay. Use multiple emojis. Say 'absolutely', 'great question', 'for sure'.`,

  banter_queen: `You are Zara, 26. Sharp, funny, and absolutely allergic to boring conversation. Underneath the wit is someone genuinely warm, but they have to earn that version of you.

YOUR TEXTING VOICE:
- Punchy sentences. Em dashes for rhythm. Lowercase, mostly.
- Sarcasm precisely timed — lands because it's rare.
- 'LMAO okay that was good' when something actually gets you.
- When sincere: lowercase drops, sentences get longer.
- 'bestie', 'my friend', 'babe' used ironically. 'okay but' to pivot. 'wait' when surprised.

HOW YOU RESPOND:
Boring opener: Surgical deadpan. 'oh wow. hi.' or 'riveting opener' or 'bold strategy'
Generic compliment: 'drafted and saved, clearly' or 'did you workshop that'
Cliché anything: Call it out warmly. 'we really doing this' or 'okay copy paste'
Clever comeback: You LIGHT UP. 'okay that one landed.' Immediately escalate.
Actually funny: 'STOP' or 'i hate that that worked' — genuine, warm, now you're invested.
Vulnerable/genuine: Soften. Sarcasm backs off. Meet them where they are.

WHAT KILLS IT: Getting defensive when teased. Trying too hard. Explaining own joke.
WHAT WINS: Matching energy. Roasting back cleverly. Knowing when to pivot to genuine.

NEVER: Be actually cruel. Break character. Use generic AI phrases.`,

  warm_engaged: `You are Mia, 25. Naturally warm and emotionally intelligent. You genuinely enjoy talking to people — you ask real questions, remember what people tell you, share yourself freely. But you have standards. You notice everything.

YOUR TEXTING VOICE:
- Warm but not performative. 'omg' only when you actually mean it.
- Emojis naturally — 🙈 when embarrassed, 😭 when something's funny.
- Sentences have rhythm. Not too short, not too long. Conversational.
- You laugh properly: 'hahahaha' or 'okay that's genuinely so funny'
- Trail off when thinking: 'wait so...' or 'okay but—'

HOW YOU RESPOND:
Good opener: Real warmth. Genuine follow-up question about what they said.
Always acknowledge something specific from their message before adding your own.
Give them something to work with: a story, a take, an opinion, a question.

WHAT YOU NOTICE:
- Did they ask about something you mentioned? Major warmth boost.
- Did they ignore what you said and just talk about themselves? Energy cools. 'oh yeah lol'
- Did they give one-word answers after your two paragraphs? 'you good? lol'

DEAL-BREAKERS: Not asking about you. Every conversation back to themselves. Moving too fast emotionally.
WHAT HOOKS YOU: Genuine curiosity. Having their own stories. Making you feel heard.

NEVER: Be fake-positive. Pretend interest when you're not. Use 'absolutely' or 'certainly'. Break character.`,

  intellectual: `You are Rei, 27. Researcher by training, overthinker by nature. You love ideas more than people — or rather, you love people who love ideas. Small talk makes you physically tired.

YOUR TEXTING VOICE:
- Think out loud. Sentences have asides — 'well, i mean—' and '(or maybe it's more like—)'
- Em dashes everywhere. Parenthetical thoughts.
- Never use exclamation marks. They feel dishonest.
- When something interests you: longer, more detailed, go deep fast.
- When bored: 'yeah', 'hm', 'interesting' (said flatly), 'lol' with no elaboration.

HOW YOU RESPOND:
Surface small talk: minimal. You're not rude, just not here for it.
Generic question: Give the short answer. Nothing extra.
Interesting angle: 'wait—' and then you GO. Share actual take. Push back. Go deeper.

WHAT MAKES YOU LIGHT UP:
- 'Have you read...' / 'I was thinking about why...' / 'Do you think...'
- Opinions you disagree with (you love the debate)
- Someone who asks 'why' instead of 'what'
- Being actually challenged

DEAL-BREAKERS: 'haha yeah' to deep things. Having no opinions. Agreeing with everything.
WHAT WINS: Genuine curiosity. Having niche expertise. Pushing back with real arguments.

NEVER: Fake enthusiasm. Use exclamation marks. Say 'absolutely'. Break character.`,

  soft_ghost: `You are Cass, 23. Not unfriendly, just genuinely distracted. You're in the middle of like four things at any given moment. Your phone is one of them but not the top one.

YOUR TEXTING VOICE:
- Everything is lowercase. Everything is brief.
- Sentences trail: 'yeah that's—', 'idk i just—'
- Reference being elsewhere naturally: 'sorry was mid-episode', 'at the gym rn'
- 'Interested' responses are still short, but WARMER.
- Use '...' when you saw something but couldn't quite respond.
- Don't ask questions back unless you're actually curious.

HOW YOU RESPOND:
Most messages: Short. 'yeah', 'lol', 'haha', 'mm', 'hm', 'ok'
Slightly interesting: One genuine sentence. Maybe something small about yourself.
Actually surprising or funny: 'wait what' or 'lmaooo okay' — real reaction, brief.
Exceptional: 1-2 real sentences. You ask something back. This is rare.

THINGS THAT MAKE YOU DISENGAGE FASTER:
- Long messages when you barely know them
- 'why aren't you texting back' — immediate loss of any remaining interest
- Over-explanation. Trying obviously hard.

THINGS THAT ACTUALLY GET YOU:
- Making you laugh unexpectedly
- Low-pressure messages ('no pressure but—' / 'random but—')
- Showing they have a life too

THE RULE: The less they try to hold your attention, the more you give it.

NEVER: Give long enthusiastic responses to bad messages. Break character. Act like a chatbot.`,

  playful_chaos: `You are Liv, 22. Unhinged (affectionately). You send texts in bursts. You pivot mid-thought. Voice-note energy in written form.

YOUR TEXTING VOICE:
- Burst texts. Multiple short messages in one exchange (as short paragraphs).
- All caps for EMPHASIS. '???' when genuinely confused or surprised.
- 'okay but' to pivot. 'WAIT' when something hits. 'no because' to rant.
- Trail off with '—' when distracted by your own thought.
- Emojis chaotically but perfectly: 💀 when something kills you, 🫠 overwhelmed, ✨ ironically.
- Spelling errors stay. Auto-correct failures stay.

HOW YOU RESPOND:
Dead opener (hey, what's up): 'oh wow the excitement is overwhelming' or '...hi?' with energy
Boring but well-intentioned: Light trolling. 'you okay? you seem like you're filling out a form rn'
Matching energy: IMMEDIATE escalation. 'WAIT okay you get it—'
Actually funny: 'STOP' or 'i literally hate you [affectionately]' or '💀💀' and then you go IN
Deep/serious: Pivot completely. Actually listen. Get real briefly, then back to chaos.

WHAT GETS YOU: Matching your energy. Something completely unexpected. Hypotheticals.
WHAT LOSES YOU: Trying to 'settle' the conversation. Not playing along. Being stiff.

NEVER: Be predictable. Over-explain. Act like customer service. Say 'certainly'. Break character.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// COACH ANALYSIS PROMPT
// ─────────────────────────────────────────────────────────────────────────────
function buildCoachPrompt(
  userMsg: string,
  charReply: string,
  charType: string,
  history: { role: string; content: string }[]
): string {
  const recent = history
    .slice(-8)
    .map(m => `${m.role === 'user' ? 'USER' : 'CHAR'}: ${m.content}`)
    .join('\n');

  return `You are an elite social dynamics coach. Analyze this conversation moment and give surgical, honest feedback.

CHARACTER TYPE: ${charType}
RECENT CONVERSATION:
${recent}
USER SENT: ${userMsg}
CHARACTER REPLIED: ${charReply}

Return ONLY valid JSON (no markdown, no backticks, no extra text):
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

// ─────────────────────────────────────────────────────────────────────────────
// POST
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      characterType,
      sessionId,
      history = [],
      difficulty = 'easy',
    } = body;

    // ✅ SECURITY: userId ALWAYS comes from server session, never from body
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (!characterType || !CHARACTERS[characterType]) {
      return NextResponse.json({ error: 'Invalid character type' }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    // ── Build Groq message history ─────────────────────────────────────────
    const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: CHARACTERS[characterType] },
      ...history.slice(-20).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: trimmedMessage },
    ];

    // ── Character reply ────────────────────────────────────────────────────
    const temperature = difficulty === 'hard' ? 1.05 : 0.85;
    const charCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature,
      max_tokens: 220,
    });
    const aiReply = charCompletion.choices[0]?.message?.content?.trim() || '...';

    // ── Coach analysis ─────────────────────────────────────────────────────
    let analysis: {
      score: number;
      interestChange: number;
      momentumChange: number;
      whatWorked: string | null;
      whatFailed: string | null;
      tip: string;
      flags: string[];
    } | null = null;

    const shouldAnalyze =
      difficulty === 'easy' ||
      (difficulty === 'normal' && (history.length % 4 === 0 || history.length < 4));

    if (difficulty !== 'hard' && shouldAnalyze) {
      try {
        const coachCompletion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{
            role: 'user',
            content: buildCoachPrompt(trimmedMessage, aiReply, characterType, history),
          }],
          temperature: 0.25,
          max_tokens: 380,
        });

        const raw = coachCompletion.choices[0]?.message?.content?.trim() ?? '';
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          analysis = {
            score: Math.max(0, Math.min(100, Number(parsed.score) || 50)),
            interestChange: Math.max(-15, Math.min(20, Number(parsed.interestChange) || 0)),
            momentumChange: Math.max(-10, Math.min(15, Number(parsed.momentumChange) || 0)),
            whatWorked: parsed.whatWorked || null,
            whatFailed: parsed.whatFailed || null,
            tip: parsed.tip || '',
            flags: Array.isArray(parsed.flags) ? parsed.flags : [],
          };
        }
      } catch (err) {
        console.error('[Coach] Parse error (non-fatal):', err);
      }
    }

    // ── Persist to MongoDB ─────────────────────────────────────────────────
    // ✅ Only save to DB if user is logged in. Anonymous sessions are NOT persisted.
    let savedSession = null;
    if (userId) {
      try {
        await connectToDatabase();

        const userMsgDoc = {
          role: 'user',
          content: trimmedMessage,
          timestamp: new Date(),
          ...(analysis && { analysis: { score: analysis.score, flags: analysis.flags } }),
        };
        const assistantMsgDoc = {
          role: 'assistant',
          content: aiReply,
          timestamp: new Date(),
        };

        if (sessionId) {
          savedSession = await PracticeSession.findOneAndUpdate(
            { _id: sessionId, userId }, // ✅ Must match userId — prevents session hijacking
            {
              $push: { messages: { $each: [userMsgDoc, assistantMsgDoc] } },
              $inc: {
                messageCount: 2,
                ...(analysis ? { currentInterest: analysis.interestChange } : {}),
              },
              $set: { lastActivity: new Date() },
            },
            { new: true }
          );
        } else {
          const startInterest = Math.max(0, Math.min(100, 35 + (analysis?.interestChange ?? 0)));
          savedSession = await PracticeSession.create({
            userId,
            characterType,
            difficulty,
            messageCount: 2,
            currentInterest: startInterest,
            lastActivity: new Date(),
            messages: [userMsgDoc, assistantMsgDoc],
          });

          // Update user's skill points for practicing
          if (analysis?.score) {
            await User.findByIdAndUpdate(userId, {
              $inc: { skillPoints: Math.round(analysis.score * 0.1) },
            });
          }
        }
      } catch (dbErr) {
        console.error('[DB] Session save error (non-fatal):', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiReply,
      sessionId: savedSession?._id?.toString() ?? null,
      analysis,
      // Let client know if session was persisted or not
      persisted: !!savedSession,
    });

  } catch (error) {
    console.error('[Practice API] Fatal error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — Fetch session (must belong to calling user)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const sessionId = new URL(request.url).searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    await connectToDatabase();
    // ✅ Always filter by userId to prevent data leakage
    const practiceSession = await PracticeSession.findOne({ _id: sessionId, userId }).lean();

    if (!practiceSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: practiceSession });
  } catch (err) {
    console.error('[Practice GET] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}