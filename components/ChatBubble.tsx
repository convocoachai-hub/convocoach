// components/ChatBubble.tsx
// A single chat message bubble in the Practice Mode.

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  characterEmoji: string;
}

export default function ChatBubble({ role, content, characterEmoji }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      {!isUser && (
        <div className="text-2xl flex-shrink-0">{characterEmoji}</div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm'
            : 'bg-[#1a1a2e] text-gray-200 border border-gray-800 rounded-bl-sm'
        }`}
      >
        {content}
      </div>
    </div>
  );
}