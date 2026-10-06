interface LoaderProps {
  label?: string
}

export default function Loader({ label }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-white">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      {label ? <p className="text-sm font-medium tracking-wide text-white/70">{label}</p> : null}
    </div>
  )
}
