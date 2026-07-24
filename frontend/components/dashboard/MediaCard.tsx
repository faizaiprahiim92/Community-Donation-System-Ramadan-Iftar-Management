import type { GalleryItem } from "@/lib/mock-data";

export default function MediaCard({
  item,
  onView,
  onEdit,
  onDelete,
}: {
  item: GalleryItem;
  onView: (i: GalleryItem) => void;
  onEdit?: (i: GalleryItem) => void;
  onDelete?: (i: GalleryItem) => void;
}) {
  const hasVideo = item.type === "Video" && item.videoUrl;

  return (
    <div className="group rounded-2xl border border-green-50/80 bg-white shadow-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-green-100/30 hover:-translate-y-0.5">
      <div className={`relative aspect-square bg-gradient-to-br ${item.color} flex items-center justify-center`}>
        {hasVideo ? (
          <video
            src={item.videoUrl}
            preload="metadata"
            muted
            className="absolute inset-0 h-full w-full object-cover"
            onLoadedData={(e) => {
              const v = e.currentTarget;
              v.currentTime = 1;
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        {item.type === "Video" ? (
          <div
            className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-transform group-hover:scale-110 cursor-pointer"
            onClick={() => onView(item)}
          >
            <svg className="h-6 w-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        ) : (
          <svg className="relative z-10 h-12 w-12 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" onClick={() => onView(item)}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        )}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            item.type === "Photo" ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
          }`}>
            {item.type === "Photo" ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            )}
            {item.type}
          </span>
        </div>
        {item.type === "Video" && item.duration && (
          <div className="absolute bottom-2 right-2">
            <span className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {item.duration}
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button type="button" onClick={() => onView(item)} className="rounded-lg bg-white/80 p-1.5 text-gray-600 hover:bg-white hover:text-blue-600 cursor-pointer backdrop-blur-sm" title="View">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
          {onEdit && (
          <button type="button" onClick={() => onEdit(item)} className="rounded-lg bg-white/80 p-1.5 text-gray-600 hover:bg-white hover:text-gold-600 cursor-pointer backdrop-blur-sm" title="Edit">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
          </button>
          )}
          {onDelete && (
          <button type="button" onClick={() => onDelete(item)} className="rounded-lg bg-white/80 p-1.5 text-gray-600 hover:bg-white hover:text-red-600 cursor-pointer backdrop-blur-sm" title="Delete">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
          )}
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h4>
        <p className="mt-0.5 text-xs text-gray-500 truncate">{item.location}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{item.date}</span>
          <span className="text-[10px] text-gray-400">{item.uploadedBy}</span>
        </div>
      </div>
    </div>
  );
}
