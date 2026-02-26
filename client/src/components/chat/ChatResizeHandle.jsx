import { useEffect, useRef, useState } from 'react'

import '../../styles/components/chat/chatResizeHandle.css'

export default function ChatResizeHandle({ onDragStart, onDrag, onDragEnd }) {
  const draggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!draggingRef.current) return
      onDrag?.(e)
    }

    const onPointerUp = (e) => {
      if (!draggingRef.current) return
      draggingRef.current = false
      setIsDragging(false)
      onDragEnd?.(e)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onDrag, onDragEnd])

  return (
    <div
      className={`chat-resize ${isDragging ? 'chat-resize--dragging' : ''}`}
      role="separator"
      aria-orientation="vertical"
      tabIndex={0}
      onPointerDown={(e) => {
        // capture all subsequent pointer events even if the pointer leaves the handle
        draggingRef.current = true
        setIsDragging(true)
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // ignore (some browsers may throw in rare cases)
        }
        onDragStart?.(e)
      }}
    >
      <div className="chat-resize-gutter">
        <div className="chat-resize-handle" />
      </div>
    </div>
  )
}
