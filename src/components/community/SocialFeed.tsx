import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink, Heart, MessageCircle } from "lucide-react";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

interface SocialPost {
  id: string;
  platform: "instagram" | "tiktok";
  imageUrl: string;
  username: string;
  likes: number;
  comments: number;
  caption: string;
  postUrl: string;
}

// Placeholder social posts
const placeholderPosts: SocialPost[] = [
  {
    id: "1",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "faithfulwarrior",
    likes: 234,
    comments: 18,
    caption: "Wearing my faith boldly 🦁 #LineOfJudah",
    postUrl: "#",
  },
  {
    id: "2",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "praisevibes",
    likes: 456,
    comments: 32,
    caption: "This hoodie is everything 🙌",
    postUrl: "#",
  },
  {
    id: "3",
    platform: "tiktok",
    imageUrl: "/founders.png",
    username: "crowned.king",
    likes: 1200,
    comments: 89,
    caption: "POV: Someone asks about your shirt",
    postUrl: "#",
  },
  {
    id: "4",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "jesusfreak",
    likes: 189,
    comments: 14,
    caption: "Campus ministry fit check ✨",
    postUrl: "#",
  },
  {
    id: "5",
    platform: "tiktok",
    imageUrl: "/founders.png",
    username: "streetfaith",
    likes: 2300,
    comments: 156,
    caption: "When the lion speaks 🔥",
    postUrl: "#",
  },
  {
    id: "6",
    platform: "instagram",
    imageUrl: "/founders.png",
    username: "anointed.apparel",
    likes: 567,
    comments: 45,
    caption: "Tribe worldwide 🌍 #LineOfJudah",
    postUrl: "#",
  },
];

export default function SocialFeed() {
  const [activePlatform, setActivePlatform] = useState<"instagram" | "tiktok">("instagram");

  const filteredPosts = placeholderPosts.filter(
    (post) => activePlatform === "instagram" || post.platform === activePlatform
  );

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-600 mb-3">
            Join The Movement
          </p>
          <h2 className="text-3xl lg:text-4xl font-light mb-4">
            #LineOfJudah Worldwide
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Tag us in your photos to be featured. Join thousands wearing their faith boldly.
          </p>
        </div>

        {/* Platform Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <Button
            variant={activePlatform === "instagram" ? "default" : "outline"}
            onClick={() => setActivePlatform("instagram")}
            className={
              activePlatform === "instagram"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 border-0"
                : ""
            }
          >
            <Instagram className="w-4 h-4 mr-2" />
            Instagram
          </Button>
          <Button
            variant={activePlatform === "tiktok" ? "default" : "outline"}
            onClick={() => setActivePlatform("tiktok")}
            className={
              activePlatform === "tiktok"
                ? "bg-foreground text-background"
                : ""
            }
          >
            <TikTokIcon className="w-4 h-4 mr-2" />
            TikTok
          </Button>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {filteredPosts.map((post, index) => (
            <a
              key={post.id}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-sm overflow-hidden animate-in fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={post.imageUrl}
                alt={`Post by @${post.username}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-stone-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-4 text-white text-sm">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </span>
                </div>
                <p className="text-white/80 text-xs">@{post.username}</p>
              </div>

              {/* Platform Badge */}
              <div className="absolute top-2 right-2">
                {post.platform === "instagram" ? (
                  <Instagram className="w-4 h-4 text-white drop-shadow-md" />
                ) : (
                  <TikTokIcon className="w-4 h-4 text-white drop-shadow-md" />
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Follow CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Button variant="outline" asChild>
            <a
              href="https://instagram.com/lineofjudah"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Follow on Instagram
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://tiktok.com/@lineofjudah"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TikTokIcon className="w-4 h-4 mr-2" />
              Follow on TikTok
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
