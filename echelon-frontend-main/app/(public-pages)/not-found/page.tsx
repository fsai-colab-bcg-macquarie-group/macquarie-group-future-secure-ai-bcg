import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-full min-w-screen flex-col items-center justify-center gap-2 shadow-primary">
      <AlertTriangle className="stroke-1" size={35} />
      <h2 className="text-lg">Not Found</h2>
      <p className="text-sm">Could not find requested resource</p>
    </div>
  )
}
