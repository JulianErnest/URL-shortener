import { FocusCards } from "@/components/ui/focus-cards";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

interface UrlData {
  shortCode: string;
  original_url: string;
  preview?: {
    preview?: {
      title?: string;
      description?: string;
      imageUrl?: string;
    };
  };
  analytics?: {
    expiresAt: string;
    originalUrl: string;
    recentClicks: {
      id: string;
      url_id: string;
      ip_address: string;
    }[];
    shortCode: string;
    totalClicks: number;
  };
}

export default function AllLinksGrid() {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('urls', urls);

  useEffect(() => {
    const fetchUrlData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userUrls = JSON.parse(localStorage.getItem("userUrls") || "[]");

        if (!userUrls.length) {
          setUrls([]);
          return;
        }

        const urlPromises = userUrls.map(async (url: string) => {
          const shortCode = url.split("/").pop() || "";

          try {
            const [previewData, analyticsData] = await Promise.all([
              api.shortUrls.getPreview(shortCode),
              api.shortUrls.getAnalytics(shortCode),
            ]);
            
            return {
              shortCode,
              original_url: previewData.originalUrl,
              preview: previewData,
              analytics: analyticsData,
            };
          } catch  {
            // If URL not found, return null to filter it out
            return null;
          }
        });

        const urlData = await Promise.all(urlPromises);
        // Filter out null values (not found URLs)
        const validUrls = urlData.filter((url): url is UrlData => url !== null);
        setUrls(validUrls);
      } catch (error) {
        console.error("Error fetching URL data:", error);
        setError("Failed to load your links. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrlData();
  }, []); // Empty dependency array since we're reading from localStorage inside the effect

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-white text-lg">Loading your links...</div>
      </div>
    );
  }

  console.log('urls', urls);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-white text-lg text-center">
          <p className="mb-4">{error}</p>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Create New Link
          </Link>
        </div>
      </div>
    );
  }

  if (!urls.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-white text-lg text-center">
          <p className="mb-4">No links found. Create your first short link!</p>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Create New Link
          </Link>
        </div>
      </div>
    );
  }

  const cards = urls.map((url) => ({
    title: url.preview?.title || url.original_url,
    src: url.preview?.preview?.imageUrl || "https://placehold.co/600x400?text=No+Image",
    cardContent: (
      <div className="text-white p-4">
        <div className="space-y-3">
          <div>
            <div className="font-bold text-base mb-1 break-words">
              {url.original_url}
            </div>
            <div className="text-xs text-white/60 line-clamp-2">
              {url.preview?.description || "No description available"}
            </div>
          </div>
          <div className="flex mb-2 items-center justify-between pt-2 border-t border-white/10 mt-2">
            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 bg-white/10 rounded text-xs">
                /{url.shortCode}
              </div>
              <div className="flex items-center space-x-1 text-xs text-white/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>{url.analytics?.totalClicks || 0} clicks</span>
              </div>
              {url.analytics?.expiresAt && (
                <div className="flex items-center space-x-1 text-xs text-white/60">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Expires:{" "}
                    {new Date(url.analytics.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      <div className="absolute top-4 right-4 z-20">
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Create New Link
        </Link>
      </div>
      <div className="w-full max-w-4xl z-10">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          My Links
        </h1>
        <div className="overflow-x-auto w-full">
          <div
            className="min-w-[600px] max-h-[540px] overflow-y-auto pr-2 custom-scrollbar"
            style={{ maxHeight: "540px" }}
          >
            <FocusCards cards={cards} />
          </div>
        </div>
      </div>
    </div>
  );
}
