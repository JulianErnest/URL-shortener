import { useState } from "react";
import { UrlInput } from "@/components/modules/UrlInput";
import { UrlResult } from "@/components/modules/UrlResult";
import UrlShortenerForm from "@/components/modules/UrlShortenerForm";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlData, setUrlData] = useState('');

  const handleUrlSubmit = (url: string) => {
    if (!url) {
      setError("Yo, please enter a valid URL");
      return;
    }
    setError(null);
    setUrlData(url);
    setCurrentStep(1);
  };

  const handleShortenSuccess = (shortUrl: string) => {
    setUrlData(shortUrl);
    setCurrentStep(2);
  };

  const handleGoBack = () => {
    setCurrentStep(0);
    setError(null);
    setUrlData('');
  };

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
          to="/my-links" 
          className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          My Links
        </Link>
      </div>
      <div className="w-full max-w-4xl z-10">
        {currentStep === 0 && (
          <UrlInput onSubmit={handleUrlSubmit} error={error || ""} />
        )}

        {currentStep === 1 && (
          <UrlShortenerForm onSuccess={handleShortenSuccess} enteredUrl={urlData} />
        )}

        {currentStep === 2 && urlData && (
          <UrlResult
            originalUrl={urlData}
            shortenedUrl={urlData}
            onGoBack={handleGoBack}
          />
        )}
      </div>
    </div>
  );
}
