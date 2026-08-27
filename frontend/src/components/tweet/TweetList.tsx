import Tweet from "./Tweet";
import type { Tweet as TweetType } from "@/lib/types";

export default function TweetList({ tweets }: { tweets: TweetType[] }) {
  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
        <p className="text-xl font-extrabold">Nothing here yet</p>
        <p className="text-text-secondary">When there&apos;s activity, it&apos;ll show up here.</p>
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}
