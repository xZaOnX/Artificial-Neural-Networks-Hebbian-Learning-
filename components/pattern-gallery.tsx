import { DashboardCopy, GalleryResponse } from "@/lib/types";

interface PatternGalleryProps {
  copy: DashboardCopy;
  gallery: GalleryResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function PatternGallery({
  copy,
  gallery,
  isLoading,
  error,
}: PatternGalleryProps) {
  return (
    <details className="panel" open={false}>
      <summary className="cursor-pointer px-4 py-4 sm:px-7 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-label">{copy.storedPatterns}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
              {copy.storedPatterns}
            </h3>
          </div>
          <span className="text-sm text-[rgb(var(--text-secondary))]">+</span>
        </div>
      </summary>

      <div className="panel-body pt-0">
        {isLoading ? (
          <div className="space-y-4">
            <p className="field-hint">{copy.galleryLoading}</p>
            <div className="skeleton h-[320px] w-full" />
          </div>
        ) : null}

        {error ? (
          <div className="alert-card" data-variant="error">
            {error}
          </div>
        ) : null}

        {gallery && !isLoading ? (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-[rgb(var(--text-secondary))]">
              {gallery.galleryCaption}
            </p>
            <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/15 p-2 sm:rounded-[24px] sm:p-3">
              <img
                alt={copy.storedPatterns}
                src={gallery.galleryImage}
                className="w-full rounded-[14px] border border-white/5 bg-black/15 sm:rounded-[18px]"
              />
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
}
