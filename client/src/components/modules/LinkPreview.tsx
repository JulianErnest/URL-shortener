import { useState, useEffect } from "react";

export default function LinkPreview({ url }: { url: string }) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    // Try to fetch OG image via microlink.io (free tier available)
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data.image?.url) {
          setImage(data.data.image.url);
        } else {
          // fallback to favicon
          setImage(`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`);
        }
      })
      .catch(() => {
        setImage(null);
      });
  }, [url]);

  if (!url || !image) {
    // Placeholder
    return (
      <div className="flex flex-1 w-full rounded-lg mt-4 bg-zinc-800 items-center justify-center h-40">
        <span className="text-zinc-400 text-4xl">🌐</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 w-full rounded-lg mt-4 bg-zinc-800 items-center justify-center h-40">
      <img src={image} alt="Preview" className="object-contain h-full max-h-40 rounded-lg" />
    </div>
  );
}