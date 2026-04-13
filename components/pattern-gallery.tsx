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
    <details className="panel group" open={false}>
      <summary className="px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-label">{copy.storedPatterns}</p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-[rgb(var(--text-primary))]">
              {copy.storedPatterns}
            </h3>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--border-subtle))] bg-white text-lg font-semibold text-[rgb(var(--text-secondary))] transition duration-150 group-open:rotate-45 group-open:text-[rgb(var(--primary))]">
            +
          </span>
        </div>
      </summary>

      <div className="panel-body pt-0">
        {isLoading ? (
          <div className="space-y-4 border-t border-[rgb(var(--border-subtle))] pt-5">
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
          <div className="space-y-4 border-t border-[rgb(var(--border-subtle))] pt-5">
            <p className="text-sm leading-7 text-[rgb(var(--text-secondary))]">
              {gallery.galleryCaption}
            </p>
            <div className="image-frame">
              <img
                alt={copy.storedPatterns}
                src={gallery.galleryImage}
                className="w-full rounded-[16px] border border-[rgb(var(--border-subtle))] bg-[rgb(var(--surface-secondary))] sm:rounded-[20px]"
              />
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
}
