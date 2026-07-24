import MediaCard from "./MediaCard";
import type { GalleryItem } from "@/lib/mock-data";

export default function GalleryGrid({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: GalleryItem[];
  onView: (i: GalleryItem) => void;
  onEdit?: (i: GalleryItem) => void;
  onDelete?: (i: GalleryItem) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-green-50/80 bg-white p-12 text-center shadow-sm">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
        <p className="mt-4 text-sm text-gray-500">No media found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {data.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
