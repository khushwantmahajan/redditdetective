import {
  ArrowBigUp,
  Award,
  FileText,
  ImageIcon,
  Link2,
  MessageSquare,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RedditActivityItem } from "@/lib/reddit";
import { cn, formatAbsoluteDateTime, formatRelativeTime, formatScore } from "@/lib/utils";

const POST_TYPE_ICON = {
  text: null,
  link: Link2,
  image: ImageIcon,
  video: Video,
} as const;

/**
 * One entry in the activity timeline: a connecting vertical line, a
 * type-colored marker dot with an icon, and the post/comment content. Both a
 * relative ("3d ago") and absolute ("Aug 13, 2026, 2:15 PM") timestamp are
 * shown so the exact time is never hidden behind a relative label alone.
 */
export function TimelineItem({
  item,
  isLast,
}: {
  item: RedditActivityItem;
  isLast: boolean;
}) {
  const isPost = item.kind === "post";
  const TypeIcon = isPost ? FileText : MessageSquare;
  const PostTypeIcon = isPost ? POST_TYPE_ICON[item.postType] : null;

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
            isPost
              ? "border-accent-violet/30 bg-accent-violet/10 text-accent-violet"
              : "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
          )}
        >
          <TypeIcon className="h-3.5 w-3.5" aria-hidden />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-white/10" />}
      </div>

      <a
        href={`https://www.reddit.com${item.permalink}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 block flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Badge variant={isPost ? "violet" : "cyan"} className="py-0.5">
            {isPost ? "Post" : "Comment"}
          </Badge>
          <span className="font-medium text-accent-cyan">r/{item.subreddit}</span>
          <span aria-hidden>·</span>
          <time dateTime={item.createdAt} title={formatAbsoluteDateTime(item.createdAt)}>
            {formatRelativeTime(item.createdAt)}
          </time>
          <span className="text-muted-foreground/60">({formatAbsoluteDateTime(item.createdAt)})</span>
        </div>

        {isPost ? (
          <>
            <div className="mt-2 flex items-start gap-2">
              {PostTypeIcon && (
                <PostTypeIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <h3 className="text-sm font-medium leading-snug text-foreground">{item.title}</h3>
            </div>
            {item.body && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{item.body}</p>
            )}
          </>
        ) : (
          <>
            <p className="mt-2 text-xs text-muted-foreground">
              Commented on <span className="text-muted">{item.postTitle}</span>
            </p>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-foreground">{item.body}</p>
          </>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowBigUp className="h-3.5 w-3.5" aria-hidden />
            {formatScore(item.score)}
          </span>
          {isPost && (
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
          {isPost && item.flair && <Badge variant="neutral">{item.flair}</Badge>}
          {isPost && item.isNsfw && (
            <span className="rounded border border-accent-rose/30 bg-accent-rose/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent-rose">
              NSFW
            </span>
          )}
        </div>
      </a>
    </div>
  );
}
