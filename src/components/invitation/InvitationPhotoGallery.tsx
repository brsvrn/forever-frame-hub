import { Images } from "lucide-react";
import type { InvitationGalleryImage } from "@/lib/invitation-media";
import type { ThemeConfig } from "@/lib/theme-engine";

export function InvitationPhotoGallery({
  images,
  theme,
  lang,
}: {
  images: InvitationGalleryImage[];
  theme: ThemeConfig;
  lang: "tr" | "en";
}) {
  if (images.length === 0) return null;

  const gridStyle = theme.styles.gallery.gridStyle;

  return (
    <section className="relative px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center sm:mb-12">
          <span
            className="mx-auto grid size-11 place-items-center rounded-full border"
            style={{ borderColor: `${theme.primaryColor}55`, color: theme.primaryColor }}
          >
            <Images className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 text-xs uppercase tracking-[0.28em] opacity-65">
            {lang === "tr" ? "Bizden kareler" : "Moments from us"}
          </p>
          <h2 className={`mt-3 text-4xl sm:text-5xl ${theme.styles.typography.display}`}>
            {lang === "tr" ? "Hikâyemizden Fotoğraflar" : "Photos from Our Story"}
          </h2>
        </div>

        <div
          className={
            gridStyle === "portrait"
              ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5"
              : gridStyle === "square"
                ? "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
                : "columns-2 gap-3 sm:columns-3 sm:gap-5"
          }
        >
          {images.map((image, index) => (
            <figure
              key={image.id}
              className={
                gridStyle === "masonry"
                  ? "mb-3 break-inside-avoid overflow-hidden rounded-2xl sm:mb-5"
                  : "overflow-hidden rounded-2xl"
              }
            >
              <img
                src={image.url}
                alt={
                  image.alt ||
                  `${lang === "tr" ? "Galeri fotoğrafı" : "Gallery photo"} ${index + 1}`
                }
                loading="lazy"
                width={image.width}
                height={image.height}
                className={
                  gridStyle === "portrait"
                    ? "aspect-[3/4] size-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    : gridStyle === "square"
                      ? "aspect-square size-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      : "h-auto w-full transition-transform duration-700 hover:scale-[1.03]"
                }
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
