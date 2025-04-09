import './globals.css'
import SpeechRecognitionProvider from '../components/speech-recognition-provider'

export const metadata = {
  title: 'SoundsPro',
  description: 'An interactive language learning and pronunciation practice tool',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SpeechRecognitionProvider>
          {children}
        </SpeechRecognitionProvider>
      </body>
    </html>
  )
}