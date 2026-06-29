import { useState, useRef, useCallback } from 'react'

export function useVoice(onTranscript) {
  const [recording, setRecording] = useState(false)
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recognitionRef = useRef(null)

  const start = useCallback(() => {
    if (!supported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setRecording(true)
    recognition.onend = () => setRecording(false)
    recognition.onerror = () => setRecording(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (transcript) onTranscript(transcript)
    }

    recognition.start()
    recognitionRef.current = recognition
  }, [supported, onTranscript])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return { recording, supported, start, stop }
}
