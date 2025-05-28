import { TextGenerateEffect } from "@/components/ui/text-generate";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter";
import { Input } from "@/components/ui/input";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  error: string;
}

export const UrlInput = ({ onSubmit, error }: UrlInputProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input');
    if (input) {
      try {
        new URL(input.value);
        onSubmit(input.value);
      } catch {
        onSubmit(""); // This will trigger error handling in the parent
      }
    }
  };

  return (
    <div className="dark:bg-zinc-900/60 z-10 rounded-3xl shadow-2xl px-4 sm:px-10 py-8 sm:py-12 flex flex-col items-center gap-8 max-w-xl md:max-w-4xl">
      <TypewriterEffectSmooth
        words={[
          {
            text: "URLs",
            className: "md:text-6xl text-xl font-bold !text-[#009bfa]",
          },
          {
            text: "too",
            className: "md:text-6xl text-xl font-bold text-purple-500",
          },
          {
            text: "long?",
            className: "md:text-6xl text-xl font-bold text-pink-500",
          },
          {
            text: "Let's",
            className: "md:text-6xl text-xl font-bold text-blue-500",
          },
          {
            text: "fix",
            className: "md:text-6xl text-xl font-bold text-purple-500",
          },
          {
            text: "that!",
            className: "md:text-6xl text-xl font-bold text-pink-500",
          },
        ]}
      />
      <Input
        placeholders={[
          "Enter your URL",
          "https://iamawebsitewithaverylongname.com",
          "Pls give me a chance symph?",
        ]}
        onChange={() => {}}
        onSubmit={handleSubmit}
      />
      {error && (
        <TextGenerateEffect
          textColor="!text-red-500"
          words={error}
          filter={false}
        />
      )}
    </div>
  );
}; 