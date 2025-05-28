import { GlowingEffect } from "@/components/ui/glowing-effect";
import { QRCode } from "@/components/modules/QRCode";

interface UrlResultProps {
  originalUrl: string;
  shortenedUrl: string;
  onGoBack: () => void;
}

export const UrlResult = ({ originalUrl, shortenedUrl, onGoBack }: UrlResultProps) => {
  const handleDownloadQR = () => {
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'qr-code.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="flex items-center justify-center max-w-5xl">
      <GlowingEffect className="w-full">
        <div className="flex flex-col md:flex-row gap-8 p-8">
          {/* Left Column - URLs */}
          <div className="flex-1 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-white text-center md:text-left">Your Link is Ready! 🎉</h2>
            <div className="flex flex-col gap-4">
              <div className="bg-black/50 p-4 rounded-lg">
                <p className="text-white/80 text-sm mb-2">Original URL:</p>
                <p className="text-white break-all">{originalUrl}</p>
              </div>
              <div className="bg-black/50 p-4 rounded-lg">
                <p className="text-white/80 text-sm mb-2">Shortened URL:</p>
                <p className="text-white break-all">{shortenedUrl}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shortenedUrl);
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors w-full"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={onGoBack}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors w-full"
              >
                Go Back Home
              </button>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="flex-1 flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-white">Scan QR Code 📱</h2>
            <div className="bg-black/50 p-8 rounded-lg flex items-center justify-center">
              <QRCode url={shortenedUrl} size={250} />
            </div>
            <button
              onClick={handleDownloadQR}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors w-full"
            >
              Download QR Code
            </button>
          </div>
        </div>
      </GlowingEffect>
    </div>
  );
}; 