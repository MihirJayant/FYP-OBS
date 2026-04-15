import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ImageGalleryUpload({
  value = [],
  onChange,
  onRemove,
  className,
  disabled = false,
  maxFiles = 4,
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  /* --------------------------------------------
   Sync previews when edit data changes
  --------------------------------------------- */
  useEffect(() => {
    setPreviews(value);
  }, [value]);

  /* --------------------------------------------
   Helpers
  --------------------------------------------- */
  const getFileNameFromUrl = (url: string) => {
    try {
      return url.split("/").pop() || "";
    } catch {
      return "";
    }
  };

  /* --------------------------------------------
   Drop handler
  --------------------------------------------- */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      const availableSlots = maxFiles - previews.length;
      const newFiles = acceptedFiles.slice(0, availableSlots);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setPreviews((prev) => [...prev, ...newPreviews]);

      setFiles((prev) => {
        const updated = [...prev, ...newFiles];
        onChange(updated);
        return updated;
      });
    },
    [onChange, previews.length, maxFiles]
  );

  /* --------------------------------------------
   Remove image
  --------------------------------------------- */
  const handleRemove = (index: number) => {
    const removedPreview = previews[index];

    // If removing an existing image (edit mode)
    if (value.includes(removedPreview)) {
      const fileName = getFileNameFromUrl(removedPreview);

      setRemovedImages((prev) => {
        const updated = [...prev, fileName];
        onRemove?.(updated);
        return updated;
      });
    }

    setPreviews((prev) => prev.filter((_, i) => i !== index));

    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onChange(updated);
      return updated;
    });
  };

  /* --------------------------------------------
   Dropzone config
  --------------------------------------------- */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: maxFiles - previews.length,
    disabled: disabled || previews.length >= maxFiles,
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* ---------------- Image Grid ---------------- */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={preview}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border"
              />

              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---------------- Upload Area ---------------- */}
      {previews.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
            {isDragActive ? (
              <Images className="h-5 w-5 text-primary" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <p className="text-sm font-medium">
            {isDragActive ? "Drop images here" : "Add images"}
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            {previews.length}/{maxFiles} images
          </p>
        </div>
      )}
    </div>
  );
}
