import { ArrowLeft } from 'lucide-react'
import { useNavigationContext } from '@contexts/context-navigation'

import AddUserForm from '@components/forms/add-form/main'

export default function AddUsers() {
  const { contextUsersActions } = useNavigationContext()

  return (
    <div className="shadow-primary anim_open_to_right absolute top-[max(0px,calc(50vh-392px))] left-4 mt-3 flex h-[784px] max-h-[93.5vh] cursor-default bg-white">
      <section className="flex h-full min-w-[80px] flex-col items-center border-r border-r-light600">
        <button
          type="button"
          className="my-3 px-2 py-2"
          onClick={() => contextUsersActions.cToggleAddingUsers()}
        >
          <ArrowLeft className="text-dark200 hover:text-dark600" size={35} />
        </button>

        <hr className="mt-1 w-2/5 place-self-center border-neutral-200" />
      </section>

      <AddUserForm />
    </div>
  )
}
