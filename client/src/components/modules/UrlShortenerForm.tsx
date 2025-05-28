import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SimpleInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UtmParametersForm from "./UtmParametersForm";
import { useCreateShortUrl } from "@/hooks/useShortUrls";
import { toast } from "sonner";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addWeeks } from "date-fns";
import { useEffect } from "react";

const formSchema = z.object({
  originalUrl: z.string(),
  customAlias: z.string().max(8, "Custom alias must be less than 9 characters").optional(),
  expiresAt: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  type: z.string().optional(),
  utmParams: z.array(
    z.object({
      key: z.string().min(1, "Key is required"),
      value: z.string().min(1, "Value is required for UTM parameters")
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface UrlShortenerFormProps {
  onSuccess?: (shortUrl: string) => void;
  enteredUrl?: string;
}

export default function UrlShortenerForm({
  onSuccess,
  enteredUrl,
}: UrlShortenerFormProps) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      utmParams: [],
      originalUrl: enteredUrl as string,
    },
  });

  const { mutate: createShortUrl, isPending } = useCreateShortUrl();

  useEffect(() => {
    methods.setValue("originalUrl", enteredUrl as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredUrl]);

  const {
    suggestions,
  } = useUrlSuggestions({
    input: enteredUrl as string,
    debounceMs: 500,
    maxSuggestions: 3,
  });

  const onSubmit = (data: FormValues) => {
    console.log('data', data);
    createShortUrl(
      {
        customCode: data.customAlias,
        expiresAt: data.expiresAt,
        preview:
          data.title || data.description || data.image
            ? {
                title: data.title,
                description: data.description,
                imageUrl: data.image,
              }
            : undefined,
        utmParams: data.utmParams,
        originalUrl: data.originalUrl,
      },
      {
        onSuccess: (response) => {
          toast.success("URL shortened successfully!");
          onSuccess?.(response.shortUrl);
          // Save to browser storage
          const userUrls = JSON.parse(localStorage.getItem("userUrls") || "[]");
          localStorage.setItem("userUrls", JSON.stringify([...userUrls, response.shortUrl]));
          methods.reset();
        },
        onError: (error: unknown) => {
          console.log('error', error);
          // Handle specific error cases
          if (error instanceof Error && error.message === "This custom short code is already taken. Please try a different one.") {
            toast.error("This custom short code is already taken. Please try a different one.");
          } else {
            toast.error(
              error instanceof Error ? error.message : "Failed to shorten URL"
            );
          }
        },
      }
    );
  };

  return (
    <GlowingEffect>
      <div className="p-8 py-12 min-h-[600px]">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="utm">UTM</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80">
                    Custom Alias (optional)
                  </label>
                  <SimpleInput
                    {...methods.register("customAlias")}
                    placeholder="my-custom-alias"
                    className="w-full text-white bg-zinc-800/50 border-zinc-700 h-12 px-4 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                  {methods.formState.errors.customAlias && (
                    <p className="text-red-500 text-sm">{methods.formState.errors.customAlias.message}</p>
                  )}
                  {suggestions && (
                    <div className="mt-2">
                      <p className="text-sm text-white/80">Suggestions:</p>
                      {suggestions.map((suggestion) => (
                        <div key={suggestion}>
                          <p className="text-sm text-white/80">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-white/80">
                    Expires At (optional)
                  </label>
                  <Controller
                    control={methods.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={date => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                        minDate={new Date()}
                        maxDate={addWeeks(new Date(), 7)}
                        dateFormat="yyyy-MM-dd"
                        className="w-full bg-zinc-800/50 border-zinc-700 h-12 px-4 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-white"
                        placeholderText="Select expiration date"
                      />
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-white/80">
                    Title
                  </label>
                  <SimpleInput
                    {...methods.register("title")}
                    placeholder="Link title"
                    className="w-full text-white  bg-zinc-800/50 border-zinc-700 h-12 px-4 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-white/80">
                    Description
                  </label>
                  <SimpleInput
                    {...methods.register("description")}
                    placeholder="Link description"
                    className="w-full text-white bg-zinc-800/50 border-zinc-700 h-12 px-4 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-white/80">
                    Image URL
                  </label>
                  <SimpleInput
                    {...methods.register("image")}
                    placeholder="https://example.com/image.jpg"
                    className="w-full text-white bg-zinc-800/50 border-zinc-700 h-12 px-4 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </TabsContent>

              <TabsContent value="utm">
                <UtmParametersForm />
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg transition-all duration-200"
              disabled={isPending}
            >
              {isPending ? "Shortening..." : "Shorten URL"}
            </Button>
          </form>
        </FormProvider>
      </div>
    </GlowingEffect>
  );
}
