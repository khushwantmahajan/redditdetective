import {
  ArrowBigUp,
  Award,
  ImageIcon,
  Link2,
  MessageSquare,
  Pin,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RedditActivityItem } from "@/lib/reddit";
import { formatRelativeTime, formatScore } from "@/lib/utils";

const POST_TYPE_ICON = {
  text: null,
  link: Link2,
  image: ImageIcon,
  video: Video,
} as const;

function MetaRow({ item }: { item: RedditActivityItem }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <a
        href={`https://www.reddit.com${item.permalink}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-accent-cyan hover:underline"
      >
        r/{item.subreddit}
      </a>
      <span className="flex items-center gap-1">
        <ArrowBigUp className="h-3.5 w-3.5" aria-hidden />
        {formatScore(item.score)}
      </span>
      {item.kind === "post" && (
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden />
          {item.numComments}
        </span>
      )}
      {item.awards > 0 && (
        <span className="flex items-center gap-1">
          <Award className="h-3.5 w-3.5 text-accent-amber" aria-hidden />
          {item.awards}
        </span>
      )}
      <span>{formatRelativeTime(item.createdAt)}</span>
      {item.kind === "post" && item.isStickied && (
        <span className="flex items-center gap-1 text-accent-amber">
          <Pin className="h-3.5 w-3.5" aria-hidden />
          Pinned
        </span>
      )}
    </div>
  );
}

export function ActivityItemCard({ item }: { item: RedditActivityItem }) {
  if (item.kind === "post") {
    const TypeIcon = POST_TYPE_ICON[item.postType];
    return (
      <a
        href={`https://www.reddit.com${item.permalink}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
      >
        <div className="flex items-start gap-2">
          {TypeIcon && (
            <TypeIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <h3 className="text-sm font-medium leading-snug text-foreground">{item.title}</h3>
        </div>
        {item.body && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{item.body}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.flair && <Badge variant="neutral">{item.flair}</Badge>}
          {item.isNsfw && (
            <span className="rounded border border-accent-rose/30 bg-accent-rose/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent-rose">
              NSFW
            </span>
          )}
        </div>
        <MetaRow item={item} />
      </a>
    );
  }

  return (
    <a
      href={`https://www.reddit.com${item.permalink}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
    >
      <p className="text-xs text-muted-foreground">
        Commented on <span className="text-muted">{item.postTitle}</span>
      </p>
      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-foreground">{item.body}</p>
      <MetaRow item={item} />
    </a>
  );
}
