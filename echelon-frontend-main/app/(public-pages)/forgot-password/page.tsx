'use server'

import FsaiLogoRow from '@assets/icons/fsai-logo-row'
import PartnerLogo from '@assets/icons/partner-logo'
import ForgotPasswordForm from './forgot-form'

enum FSAILogoType {
  ROW = 'row',
  COLUMN = 'column',
}

export default async function ForgotPasswordPage() {
  return (
    <>
      <main className="flex w-full">
        <aside className="mx-auto flex min-h-screen w-full flex-col items-center justify-center lg:w-3/5">
          <div className="flex h-full w-full flex-col justify-center rounded-none shadow-primary bg-[var(--wall)] p-8 md:h-fit md:max-w-[500px] lg:h-fit lg:w-4/5">
            <main className="mx-auto w-full max-w-96 overflow-scroll p-px sm:overflow-visible md:max-w-none">
              <FsaiLogoRow
                logoType={FSAILogoType.ROW}
                className={'login-col-logo w-full'}
              />
              <PartnerLogo className={'my-5 flex w-full justify-center'} />
              <h1 className="txt_semibold_sm text-center">
                Can&lsquo;t login?
              </h1>
              <ForgotPasswordForm />
            </main>
          </div>
        </aside>
      </main>
    </>
  )
}
