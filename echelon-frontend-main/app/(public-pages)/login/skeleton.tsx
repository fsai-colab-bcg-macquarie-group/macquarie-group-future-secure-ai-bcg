export default function LoginSkeleton() {
  return (
    <main className="mx-auto w-full max-w-96 animate-pulse overflow-scroll p-px sm:overflow-visible md:max-w-none">
      <div className="h-10 w-36 bg-neutral-200" />
      <div className="mt-9 h-10 w-48 place-self-center bg-neutral-200" />

      <h1 className="my-8 max-w-fit place-self-center bg-neutral-200 text-center text-[18px] font-semibold text-neutral-200">
        Log In to FSAI
      </h1>

      <div className="my-6 flex flex-col items-center gap-7">
        <div className="h-12 w-full bg-neutral-200" />
        <div className="h-12 w-[45%] bg-neutral-200" />
      </div>

      <div className="flex items-center justify-center gap-4 py-3">
        <div className="h-px w-full bg-neutral-200" />
        <div className="h-4 w-10 bg-neutral-200" />
        <div className="h-px w-full bg-neutral-200" />
      </div>
      <div className="mt-6 h-13 w-full bg-neutral-200" />
    </main>
  )
}
