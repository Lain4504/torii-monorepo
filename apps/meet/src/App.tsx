import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from "@workspace/ui/components/button"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="flex justify-center gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="h-24 p-4 transition-all hover:drop-shadow-[0_0_2em_#646cffaa]" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="h-24 p-4 transition-all hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[logo-spin_20s_linear_infinite]" alt="React logo" />
        </a>
      </div>
      <h1 className="text-5xl font-bold mb-8">Vite + React</h1>
      <div className="p-8 bg-card rounded-xl border shadow-sm">
        <Button
          onClick={() => setCount((count) => count + 1)}
          className="mb-4"
        >
          count is {count}
        </Button>
        <p className="text-muted-foreground">
          Edit <code className="font-mono bg-muted p-1 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-8 text-muted-foreground">
        Click on the Vite and React logos to learn more
      </p>

      <style>{`
        @keyframes logo-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default App
