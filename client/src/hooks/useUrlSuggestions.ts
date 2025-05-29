import { useState, useEffect } from 'react';

interface UseUrlSuggestionsProps {
  input: string;
  debounceMs?: number;
  maxSuggestions?: number;
}

interface UseUrlSuggestionsReturn {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
}

export function useUrlSuggestions({
  input,
  debounceMs = 500,
  maxSuggestions = 3,
}: UseUrlSuggestionsProps): UseUrlSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!input) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://api-inference.huggingface.co/models/gpt2",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: `URL slug for "${input}":`,
              parameters: {
                max_length: 30,
                num_return_sequences: maxSuggestions,
                do_sample: true,
                temperature: 0.7,
                top_p: 0.9,
                return_full_text: false,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions - you will have to manually enter a custom alias');
        }

        const data = await response.json();
        console.log('Raw response:', data);

        if (Array.isArray(data)) {
          // Process the suggestions to make them URL-friendly
          const processedSuggestions = data.map(suggestion => {
            // Clean and format the generated text
            return suggestion.generated_text
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
              .slice(0, 30); // Ensure we don't exceed reasonable URL length
          });
          setSuggestions(processedSuggestions);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(generateSuggestions, debounceMs);
    return () => clearTimeout(debounceTimer);
  }, [input, debounceMs, maxSuggestions]);

  return { suggestions, isLoading, error };
} 