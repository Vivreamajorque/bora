import { useState, useEffect } from 'react'
import ChatScreen from './components/ChatScreen.jsx'
import SetupScreen from './components/SetupScreen.jsx'

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('bora_api_key') || '')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(!!apiKey)
  }, [apiKey])

  if (!ready) {
    return <SetupScreen onSave={(key) => {
      localStorage.setItem('bora_api_key', key)
      setApiKey(key)
    }} />
  }

  return <ChatScreen apiKey={apiKey} onReset={() => {
    localStorage.removeItem('bora_api_key')
    setApiKey('')
  }} />
}
