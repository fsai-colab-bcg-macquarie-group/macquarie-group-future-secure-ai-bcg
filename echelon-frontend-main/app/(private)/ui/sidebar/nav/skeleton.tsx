export default function NavigationSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-6">
      <section className="flex flex-col items-center gap-1.5">
        <div className="aspect-square w-[40px] animate-pulse items-center justify-center bg-neutral-200" />
        <div className="h-3 w-[50px] animate-pulse items-center justify-center bg-neutral-200" />
      </section>

      <section className="flex flex-col items-center gap-1.5">
        <div className="aspect-square w-[40px] animate-pulse items-center justify-center bg-neutral-200" />
        <div className="h-3 w-[50px] animate-pulse items-center justify-center bg-neutral-200" />
      </section>

      <section className="flex flex-col items-center gap-1.5">
        <div className="aspect-square w-[40px] animate-pulse items-center justify-center bg-neutral-200" />
        <div className="h-3 w-[50px] animate-pulse items-center justify-center bg-neutral-200" />
      </section>

      <section className="flex flex-col items-center gap-1.5">
        <div className="aspect-square w-[40px] animate-pulse items-center justify-center bg-neutral-200" />
        <div className="h-3 w-[50px] animate-pulse items-center justify-center bg-neutral-200" />
      </section>
    </div>
  )
}
