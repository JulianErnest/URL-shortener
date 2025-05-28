import { useFieldArray, useFormContext } from "react-hook-form";
import { SimpleInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface UtmParam {
  key: string;
  value: string;
}

interface FormValues {
  utmParams: UtmParam[];
}

const STANDARD_UTM_PARAMS = [
  {
    key: "utm_source",
    label: "Source",
    placeholder: "e.g., facebook, twitter",
  },
  { key: "utm_medium", label: "Medium", placeholder: "e.g., social, email" },
  { key: "utm_campaign", label: "Campaign", placeholder: "e.g., summer_sale" },
  { key: "utm_term", label: "Term", placeholder: "e.g., summer_discount" },
  { key: "utm_content", label: "Content", placeholder: "e.g., banner_1" },
];

export default function UtmParametersForm() {
  const { control, register, formState } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray<FormValues>({
    control,
    name: "utmParams",
  });

  const addNewUtmParam = () => {
    append({
      key: "",
      value: "",
    });
  };

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && fields.length === 0) {
      STANDARD_UTM_PARAMS.forEach((param) => {
        if (!fields.find((f) => f.key === param.key)) {
          append({
            key: param.key,
            value: "",
          });
        }
      });
      initialized.current = true;
    }
  }, [fields, append]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white/80">UTM Parameters</h3>
        <Button
          type="button"
          onClick={addNewUtmParam}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Parameter
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {fields.map((field, index) => {
          const isStandard = STANDARD_UTM_PARAMS.find(
            (p) => p.key === field.key
          );
          const param = isStandard || {
            label: "Custom Parameter",
            placeholder: "Parameter value",
          };

          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4"
            >
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-white/80">
                  {param.label}
                </label>
                <div className="flex gap-4 items-start">
                  <div className="flex flex-col w-1/3 min-w-[120px]">
                    <SimpleInput
                      {...register(`utmParams.${index}.key`)}
                      placeholder="Parameter name"
                      className="m-1 text-white bg-zinc-800/50 border-zinc-700 h-12 px-4 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    {formState.errors.utmParams?.[index]?.key && (
                      <span className="text-red-500 text-xs mt-1">
                        {formState.errors.utmParams[index]?.key?.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <SimpleInput
                      {...register(`utmParams.${index}.value`)}
                      placeholder={param.placeholder}
                      className="m-1 text-white bg-zinc-800/50 border-zinc-700 h-12 px-4 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                    {formState.errors.utmParams?.[index]?.value && (
                      <span className="text-red-500 text-xs mt-1">
                        {formState.errors.utmParams[index]?.value?.message}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                    className="self-end mb-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-white/60">
          No parameters added yet. Click "Add Parameter" to get started.
        </div>
      )}
    </div>
  );
}
