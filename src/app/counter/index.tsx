import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <h1>Counter from React</h1>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 border rounded-md bg-blue-200"
        >
          Decrement
        </button>
        <p className="text-2xl font-bold inline-block w-10 text-center">
          {count}
        </p>
        <button
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 border rounded-md bg-red-200"
        >
          Increment
        </button>
      </div>
    </div>
  )
}
