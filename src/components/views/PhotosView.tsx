import { useState } from 'react'
import { Camera } from 'lucide-react'
import { PhotoComposer } from '../PhotoComposer'
import { PhotoTile } from '../PostCard'
import { Empty, ViewHeader } from './ViewHeader'
import { cardProps, type ViewProps } from './types'

export function PhotosView(v: ViewProps) {
  const [adding, setAdding] = useState(false)
  const photos = v.posts.filter((p) => p.kind === 'photo')

  return (
    <div className="flex flex-col gap-5">
      <ViewHeader
        title="photos"
        subtitle={`${photos.length} shared`}
        addLabel="add a photo"
        canAdd={v.canAdd}
        open={adding}
        onToggle={() => setAdding(!adding)}
        primary
      />
      {adding && (
        <div className="max-w-xl">
          <PhotoComposer
            roomId={v.roomId}
            userId={v.userId}
            onClose={() => setAdding(false)}
            onDone={() => {
              setAdding(false)
              v.refresh()
            }}
          />
        </div>
      )}
      {photos.length === 0 && !v.loading ? (
        <Empty icon={<Camera size={20} aria-hidden="true" />} text="No photos yet." />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {photos.map((p) => (
            <PhotoTile key={p.id} {...cardProps(p, v)} />
          ))}
        </ul>
      )}
    </div>
  )
}
