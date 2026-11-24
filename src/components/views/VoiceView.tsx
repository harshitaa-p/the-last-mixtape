import { useState } from 'react'
import { Mic } from 'lucide-react'
import { VoiceComposer } from '../VoiceComposer'
import { VoiceRow } from '../PostCard'
import { Empty, ViewHeader } from './ViewHeader'
import { cardProps, type ViewProps } from './types'

export function VoiceView(v: ViewProps) {
  const [adding, setAdding] = useState(false)
  const voices = v.posts.filter((p) => p.kind === 'voice')

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <ViewHeader
        title="voice notes"
        subtitle={`${voices.length} recorded`}
        addLabel="record one"
        canAdd={v.canAdd}
        open={adding}
        onToggle={() => setAdding(!adding)}
        primary
      />
      {adding && (
        <VoiceComposer
          roomId={v.roomId}
          userId={v.userId}
          onClose={() => setAdding(false)}
          onDone={() => {
            setAdding(false)
            v.refresh()
          }}
        />
      )}
      {voices.length === 0 && !v.loading ? (
        <Empty icon={<Mic size={20} aria-hidden="true" />} text="No voice notes yet." />
      ) : (
        <ul className="flex flex-col gap-4">
          {voices.map((p) => (
            <VoiceRow key={p.id} {...cardProps(p, v)} />
          ))}
        </ul>
      )}
    </div>
  )
}
