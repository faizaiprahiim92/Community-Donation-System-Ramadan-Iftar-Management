interface GalleryImage {
  id: number;
  alt: string;
  color: string;
  url?: string;
  type?: string;
}

interface GalleryPreviewProps {
  images: GalleryImage[];
}

export default function GalleryPreview({ images }: GalleryPreviewProps) {
  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Recent Gallery</h3>
          <p className="text-xs text-gray-400">Latest uploaded media</p>
        </div>
        <a
          href="/dashboard/gallery"
          className="text-xs font-semibold text-green-600 transition-colors hover:text-green-700"
        >
          View All
        </a>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img) => (
          <div
            key={img.id}
            className={`group relative aspect-square overflow-hidden rounded-xl cursor-pointer transition-all hover:ring-2 hover:ring-green-400`}
          >
            {img.url ? (
              <>
                {img.type === "Video" ? (
                  <video
                    src={img.url}
                    preload="metadata"
                    muted
                    className="absolute inset-0 h-full w-full object-cover"
                    onLoadedData={(e) => {
                      const v = e.currentTarget;
                      v.currentTime = 1;
                    }}
                  />
                ) : (
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                {img.type === "Video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform group-hover:scale-110">
                      <svg className="h-3.5 w-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`absolute inset-0 ${img.color} flex items-center justify-center`}>
                <svg className="h-8 w-8 text-gray-600/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
