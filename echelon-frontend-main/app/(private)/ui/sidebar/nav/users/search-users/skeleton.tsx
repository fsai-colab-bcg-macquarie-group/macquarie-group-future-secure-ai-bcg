export default function SearchUsersSkeleton() {
  return (
    <section className="max-w-[272px] animate-pulse flex flex-col gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="inline-flex w-full items-center gap-3">
          <div className="aspect-square min-w-[48px] bg-neutral-200" />
          <div className="flex h-[40px] w-full max-w-full flex-col gap-1.5">
            <div className="h-full w-[65%] bg-neutral-200" />
            <div className="h-[80%] w-[90%] bg-neutral-200" />
          </div>
        </div>
      ))}
    </section>
  )
}
