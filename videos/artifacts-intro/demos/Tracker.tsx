import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function App() {
  const [cups, setCups] = useState([6, 7, 5, 8, 6, 4, 0])
  const today = 6
  const data = days.map((d, i) => ({ day: d, cups: cups[i] }))
  const add = (n: number) => setCups(cups.map((c, i) => (i === today ? Math.max(0, c + n) : c)))
  return (
    <div className="min-h-screen bg-white text-zinc-900 p-8 font-sans">
      <div className="max-w-xl mx-auto">
        <p className="text-sm text-zinc-500">Sample tracker</p>
        <h1 className="text-4xl font-medium tracking-tight mt-1">Water this week</h1>
        <p className="text-zinc-500 mt-2">Tap to log a cup for today.</p>
        <div className="mt-8 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis hide />
              <Bar dataKey="cups" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={i === today ? "#c2410c" : "#18181b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button className="rounded-full bg-zinc-900 text-white px-5 py-2" onClick={() => add(1)}>+ 1 cup</button>
          <button className="rounded-full bg-zinc-100 px-5 py-2" onClick={() => add(-1)}>Undo</button>
          <span className="ml-auto text-2xl font-medium tabular-nums">{cups[today]} cups today</span>
        </div>
      </div>
    </div>
  )
}
