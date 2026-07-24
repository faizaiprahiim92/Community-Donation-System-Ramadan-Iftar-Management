import type { GalleryItem } from "@/lib/mock-data";

const dayColors: Record<number, string> = {
  1: "from-green-200 to-green-300",
  2: "from-amber-200 to-amber-300",
  3: "from-blue-200 to-blue-300",
  4: "from-purple-200 to-purple-300",
  5: "from-rose-200 to-rose-300",
};

export default function AlbumCard({
  day,
  items,
  onClick,
}: {
  day: number;
  items: GalleryItem[];
  onClick: () => void;
}) {
  const photos = items.filter((i) => i.type === "Photo").length;
  const videos = items.filter((i) => i.type === "Video").length;
  const gradient = dayColors[day] || "from-gray-200 to-gray-300";
  const location = items[0]?.location || "Various";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-green-50/80 bg-white shadow-sm transition-all hover:shadow-lg hover:shadow-green-100/30 hover:-translate-y-0.5 cursor-pointer"
    >
      <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-3xl font-bold text-white/80">Day {day}</p>
          <p className="text-xs text-white/60">{items.length} items</p>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {photos > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-white/30 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              {photos}
            </span>
          )}
          {videos > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-white/30 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              {videos}
            </span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-bold text-gray-800">Campaign Day {day}</h4>
        <p className="mt-0.5 text-xs text-gray-500 truncate">{location}</p>
      </div>
    </button>
  );
}
