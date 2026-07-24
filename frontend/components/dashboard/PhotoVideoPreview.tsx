export function PhotoPreview({ photos }: { photos: string[] }) {
  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-gray-900">Photos</h3>
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-8">
          <p className="text-sm text-gray-400">No photos uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-gray-900">Photos ({photos.length})</h3>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div
            key={p}
            className="aspect-square rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          >
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VideoPreview({ videos }: { videos: string[] }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-gray-900">Videos</h3>
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-8">
          <p className="text-sm text-gray-400">No videos uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-50/80 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-gray-900">Videos ({videos.length})</h3>
      <div className="grid grid-cols-2 gap-2">
        {videos.map((v) => (
          <div
            key={v}
            className="aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
