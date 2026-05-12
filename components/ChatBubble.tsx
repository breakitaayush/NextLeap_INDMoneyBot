import type { ChatMessage } from "@/types";

type ChatBubbleProps = {
  message: Pick<ChatMessage, "role" | "content" | "riskLevel">;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 ${
          isUser ? "bg-ayuva-green text-white" : "bg-white/90 shadow-sm dark:bg-white/10 dark:text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.riskLevel === "high" ? (
          <p className="mt-3 text-xs font-bold text-ayuva-rose">Emergency: 112 in India. Reach a trusted person immediately.</p>
        ) : null}
      </div>
    </article>
  );
}
