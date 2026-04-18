import { DashboardCopy, GalleryResponse } from "@/lib/types";

interface PatternGalleryProps {
  copy: DashboardCopy;
  gallery: GalleryResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function PatternGallery({ copy, gallery, isLoading, error }: PatternGalleryProps) {
  return (
    <details className="group" open={false}>
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 sm:px-10"
        style={{ borderBottom: "1px solid rgb(var(--border-subtle))" }}>
        <p className="section-label">{copy.storedPatterns}</p>
        <span className="text-xs text-[rgb(var(--text-muted))] transition-colors group-open:text-[rgb(var(--accent))]">
          <span className="group-open:hidden">show ↓</span>
          <span className="hidden group-open:inline">hide ↑</span>
        </span>
      </summary>

      <div className="px-6 py-6 sm:px-10">
        {isLoading && (
          <div className="space-y-3">
            <p className="field-hint">{copy.galleryLoading}</p>
            <div className="skeleton h-72 w-full" />
          </div>
        )}
        {error && <div className="alert-card" data-variant="error">{error}</div>}
        {gallery && !isLoading && (
          <div className="space-y-3">
            <p className="text-sm leading-6 text-[rgb(var(--text-secondary))]">
              {gallery.galleryCaption}
            </p>
            <img
              alt={copy.storedPatterns}
              src={gallery.galleryImage}
              className="w-full border"
              style={{ borderColor: "rgb(var(--border))" }}
            />
          </div>
        )}
      </div>
    </details>
  );
}
