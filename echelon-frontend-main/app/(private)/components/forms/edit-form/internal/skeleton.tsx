export default function ManageUserSkeleton() {
  return (
    <div className="pointer-events-none top-0 left-0 z-10 flex h-full min-w-fit flex-col bg-white pt-px pr-8 pl-px">
      <div className="animate-pulse">
        <section className="flex w-full items-start py-[15px] pl-[31px]">
          <div className="inline-flex w-full items-center gap-3">
            <div className="aspect-square min-w-[48px] bg-neutral-200" />
            <div className="flex h-[40px] w-full max-w-full flex-col gap-1.5">
              <div className="h-full w-[40%] bg-neutral-200" />
              <div className="h-[80%] w-[20%] bg-neutral-200" />
            </div>
          </div>
        </section>
        <hr className="mx-[23px] w-[calc(100%-46px)] border-neutral-200" />
        <section className="flex flex-col pt-10">
          <div className="ml-7.5 flex flex-col gap-2">
            <div className="h-[20px] w-[253.33px] bg-neutral-200" />
            <div className="h-[32px] w-[434px] bg-neutral-200" />
          </div>

          <div className="ml-7.5 flex flex-col gap-2 pt-7">
            <div className="h-[20px] w-[253.33px] bg-neutral-200" />
            <div className="h-[32px] w-[434px] bg-neutral-200" />
          </div>

          <div className="ml-7.5 flex flex-col gap-2 pt-6.5">
            <div className="h-[20px] w-[253.33px] bg-neutral-200" />
            <div className="h-[32px] w-[434px] bg-neutral-200" />
          </div>

          <div className="ml-7.5 flex flex-col gap-2 pt-10">
            <div className="h-[20px] w-[253.33px] bg-neutral-200" />
            <div className="h-[40px] w-[434px] bg-neutral-200" />
          </div>

          <div className="ml-7.5 flex flex-col gap-2 pt-7.5">
            <div className="h-[20px] w-[253.33px] bg-neutral-200" />
            <div className="h-[40px] w-[434px] bg-neutral-200" />
          </div>

          <div className="flex w-full flex-col items-end pt-16">
            <div className="h-[47px] w-[190px] bg-neutral-200" />
          </div>
        </section>
      </div>
    </div>
  )
}
