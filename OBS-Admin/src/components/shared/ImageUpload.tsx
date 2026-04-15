import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  className,
  disabled,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        setPreview(URL.createObjectURL(file)); // preview only
        onChange(file); // ✅ pass File
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />

      {preview ? (
        <div className="relative w-full h-full min-h-[120px] flex justify-center">
          <img
            src={preview}
            alt="Preview"
            className="w-fit h-full object-cover rounded-lg"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            {isDragActive ? (
              <ImageIcon className="h-6 w-6 text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? "Drop image here" : "Click or drag to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}
