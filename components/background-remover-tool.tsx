"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Check,
  Download,
  ImagePlus,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Upload,
  Wand2,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type BackgroundMode = "transparent" | "white" | "custom";
type ToolStatus = "idle" | "ready" | "processing" | "done" | "error";

type AnalyticsEvent =
  | "upload_started"
  | "upload_rejected_file_type"
  | "upload_rejected_file_size"
  | "remove_background_started"
  | "remove_background_success"
  | "remove_background_failed"
  | "download_transparent_png"
  | "download_white_background"
  | "download_custom_background";

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

function track(eventName: AnalyticsEvent, props?: Record<string, string | number>) {
  if (typeof window === "undefined") {
    return;
  }

  window.plausible?.(eventName, { props });
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileBaseName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "") || "image";
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = src;
  });
}

function createDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function BackgroundRemoverTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [backgroundMode, setBackgroundMode] =
    useState<BackgroundMode>("transparent");
  const [customColor, setCustomColor] = useState("#14b8a6");
  const [compare, setCompare] = useState(50);

  const canProcess = file && status !== "processing";
  const fileMeta = useMemo(() => {
    if (!file) {
      return null;
    }

    return `${file.type.replace("image/", "").toUpperCase()} · ${formatFileSize(
      file.size,
    )}`;
  }, [file]);

  useEffect(() => {
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [originalUrl, resultUrl]);

  function setPreviewFile(nextFile: File) {
    if (!SUPPORTED_TYPES.includes(nextFile.type)) {
      setStatus("error");
      setError("Supported formats are JPG, PNG, and WebP.");
      track("upload_rejected_file_type", { type: nextFile.type || "unknown" });
      return;
    }

    if (nextFile.size > MAX_UPLOAD_BYTES) {
      setStatus("error");
      setError("Image is too large. Please upload a file under 10 MB.");
      track("upload_rejected_file_size", { size: nextFile.size });
      return;
    }

    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }

    setFile(nextFile);
    setOriginalUrl(URL.createObjectURL(nextFile));
    setResultUrl(null);
    setResultBlob(null);
    setError(null);
    setStatus("ready");
    setCompare(50);
    track("upload_started", {
      type: nextFile.type,
      sizeBucket: nextFile.size > 2 * 1024 * 1024 ? "large" : "small",
    });
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (nextFile) {
      setPreviewFile(nextFile);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0];

    if (nextFile) {
      setPreviewFile(nextFile);
    }
  }

  async function removeBackground() {
    if (!file) {
      return;
    }

    setStatus("processing");
    setError(null);
    track("remove_background_started", {
      type: file.type,
      size: file.size,
    });
    const startedAt = performance.now();

    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");
    formData.append("format", "png");

    try {
      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error || "Background removal failed.");
      }

      const blob = await response.blob();
      const nextResultUrl = URL.createObjectURL(blob);

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      setResultBlob(blob);
      setResultUrl(nextResultUrl);
      setStatus("done");
      track("remove_background_success", {
        durationMs: Math.round(performance.now() - startedAt),
      });
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Background removal failed. Please try another image.",
      );
      track("remove_background_failed", {
        durationMs: Math.round(performance.now() - startedAt),
      });
    }
  }

  async function downloadResult() {
    if (!file || !resultUrl || !resultBlob) {
      return;
    }

    const baseName = getFileBaseName(file.name);

    if (backgroundMode === "transparent") {
      createDownload(resultBlob, `${baseName}-background-removed.png`);
      track("download_transparent_png");
      return;
    }

    const image = await loadImage(resultUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Could not prepare the download.");
      return;
    }

    context.fillStyle = backgroundMode === "white" ? "#ffffff" : customColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Could not prepare the download.");
        return;
      }

      createDownload(blob, `${baseName}-${backgroundMode}-background.png`);
      track(
        backgroundMode === "white"
          ? "download_white_background"
          : "download_custom_background",
      );
    }, "image/png");
  }

  function resetTool() {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }

    setFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setStatus("idle");
    setError(null);
    setBackgroundMode("transparent");
    setCompare(50);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-tool sm:p-5">
      <input
        accept={SUPPORTED_TYPES.join(",")}
        className="sr-only"
        onChange={onFileChange}
        ref={inputRef}
        type="file"
      />

      <div
        className="flex min-h-[420px] flex-col rounded-md border border-dashed border-slate-300 bg-cloud"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        {!originalUrl ? (
          <button
            className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-14 text-center transition hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-mint"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
              <Upload aria-hidden="true" size={24} />
            </span>
            <span className="text-xl font-semibold text-ink">Upload Image</span>
            <span className="text-sm text-slate-600">
              JPG, PNG, WebP · Max 10 MB
            </span>
          </button>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col gap-3 border-b border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {file?.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">{fileMeta}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-slate-700 transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-mint"
                  onClick={resetTool}
                  title="Upload another image"
                  type="button"
                >
                  <RotateCcw aria-hidden="true" size={18} />
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-mint"
                  disabled={!canProcess}
                  onClick={removeBackground}
                  type="button"
                >
                  {status === "processing" ? (
                    <Loader2 aria-hidden="true" className="animate-spin" size={18} />
                  ) : (
                    <Wand2 aria-hidden="true" size={18} />
                  )}
                  <span>
                    {status === "processing"
                      ? "Processing"
                      : resultUrl
                        ? "Run Again"
                        : "Remove Background"}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[1fr_220px]">
              <div className="flex min-h-[300px] flex-col gap-3">
                <div className="relative flex flex-1 overflow-hidden rounded-md border border-line checkerboard">
                  {originalUrl && (
                    <img
                      alt="Original upload"
                      className="h-full w-full object-contain"
                      src={originalUrl}
                    />
                  )}
                  {resultUrl && (
                    <div
                      className="absolute inset-0 overflow-hidden checkerboard"
                      style={{ width: `${compare}%` }}
                    >
                      <img
                        alt="Background removed result"
                        className="h-full w-[calc(100vw-2rem)] max-w-none object-contain lg:w-[604px]"
                        src={resultUrl}
                      />
                    </div>
                  )}
                  {status === "processing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <div className="flex items-center gap-3 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-ink">
                        <Loader2 aria-hidden="true" className="animate-spin" size={18} />
                        Processing
                      </div>
                    </div>
                  )}
                </div>

                {resultUrl && (
                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    <span>Original</span>
                    <input
                      aria-label="Before and after comparison"
                      className="h-2 flex-1 accent-mint"
                      max="100"
                      min="0"
                      onChange={(event) => setCompare(Number(event.target.value))}
                      type="range"
                      value={compare}
                    />
                    <span>Result</span>
                  </label>
                )}

                {error && (
                  <p className="rounded-md border border-coral/40 bg-coral/10 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
              </div>

              <aside className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">Background</p>
                  <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                    <BackgroundButton
                      active={backgroundMode === "transparent"}
                      label="Transparent"
                      onClick={() => setBackgroundMode("transparent")}
                      swatchClassName="checkerboard"
                    />
                    <BackgroundButton
                      active={backgroundMode === "white"}
                      label="White"
                      onClick={() => setBackgroundMode("white")}
                      swatchClassName="bg-white"
                    />
                    <BackgroundButton
                      active={backgroundMode === "custom"}
                      label="Custom"
                      onClick={() => setBackgroundMode("custom")}
                      swatchStyle={{ backgroundColor: customColor }}
                    />
                  </div>
                </div>

                {backgroundMode === "custom" && (
                  <label className="flex items-center justify-between gap-3 rounded-md border border-line bg-white p-3 text-sm font-medium text-ink">
                    <span>Color</span>
                    <input
                      aria-label="Custom background color"
                      className="h-9 w-12 cursor-pointer rounded border border-line bg-transparent"
                      onChange={(event) => setCustomColor(event.target.value)}
                      type="color"
                      value={customColor}
                    />
                  </label>
                )}

                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ink"
                  disabled={!resultUrl}
                  onClick={downloadResult}
                  type="button"
                >
                  <Download aria-hidden="true" size={18} />
                  <span>Download PNG</span>
                </button>

                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-mint"
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  <ImagePlus aria-hidden="true" size={18} />
                  <span>Upload New</span>
                </button>

                <p className="flex gap-2 rounded-md bg-teal-50 p-3 text-xs leading-5 text-teal-800">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                  <span>Your images are processed instantly and are not stored by us.</span>
                </p>

                {status === "done" && (
                  <p className="flex gap-2 rounded-md bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                    <Check aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                    <span>Ready to download.</span>
                  </p>
                )}
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BackgroundButton({
  active,
  label,
  onClick,
  swatchClassName,
  swatchStyle,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  swatchClassName?: string;
  swatchStyle?: React.CSSProperties;
}) {
  return (
    <button
      className={`flex h-12 items-center gap-2 rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-mint ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-ink hover:border-slate-400"
      }`}
      onClick={onClick}
      type="button"
    >
      <span
        className={`h-5 w-5 shrink-0 rounded border border-line ${swatchClassName || ""}`}
        style={swatchStyle}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}
