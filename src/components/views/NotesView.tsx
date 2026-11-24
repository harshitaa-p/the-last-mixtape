import { useState } from 'react'
import { ScrollText } from 'lucide-react'
import { NoteComposer } from '../NoteComposer'
import { NoteCard } from '../PostCard'
import { Empty, ViewHeader } from './ViewHeader'
import { cardProps, type ViewProps } from './types'

export function NotesView(v: ViewProps) {
  const [adding, setAdding] = useState(false)
  const notes = v.posts.filter((p) => p.kind === 'note')

  return (
    <div className="flex flex-col gap-5">
      <ViewHeader
        title="notes"
        subtitle={`${notes.length} written`}
        addLabel="write a note"
        canAdd={v.canAdd}
        open={adding}
        onToggle={() => setAdding(!adding)}
        primary
      />
      {adding && (
        <div className="max-w-xl">
          <NoteComposer
            roomId={v.roomId}
            onClose={() => setAdding(false)}
            onDone={() => {
              setAdding(false)
              v.refresh()
            }}
          />
        </div>
      )}
      {notes.length === 0 && !v.loading ? (
        <Empty icon={<ScrollText size={20} aria-hidden="true" />} text="No notes yet." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {notes.map((p) => (
            <NoteCard key={p.id} {...cardProps(p, v)} />
          ))}
        </ul>
      )}
    </div>
  )
}
