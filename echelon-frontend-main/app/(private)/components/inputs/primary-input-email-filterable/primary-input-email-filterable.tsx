'use client'

import { useEffect, useState, useRef } from 'react'
import { useDebounce } from 'use-debounce'
import { Loader, X } from 'lucide-react'
import { AdUser } from './types'
import { processTerm, verifyEmailExists } from './functions'
import { isAdSearchEnabled } from '@/app/(private)/services/user-query-service'
//
//
// ❌ DO NOT IMPORT CONTEXTS, COMPONENTS CAN ALSO BE USED IN PUBLIC PAGES, RECEIVE EVERYTHING AS PROPS
// -------------------------------------------------------------------------------------------------------------
// ⚠️ THIS COMPONENT IS EXCLUSIVE FOR THE ADD USERS FORM
//
//

export default function PrimaryInputEmailFilterable({
  placeholder,
  maxLength,
  options,
  value,
  readOnly,
  disabled,
  callbacks,
}: {
  placeholder: string
  maxLength?: number
  options: AdUser[]
  value?: string
  readOnly?: boolean
  onInput?: (value: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  callbacks?: {
    setSsoBlockEvents?: (value: boolean) => void
    verifyUserExists?: (email: string) => Promise<boolean>
    setFormEmail?: (value: string) => void
    setFormFirstName?: (value: string) => void
    setFormLastName?: (value: string) => void
    setFormIsSSO?: (isSSO: boolean | null) => void
    setIsSSO?: (isSSO: boolean) => void
    openManageUserAccount?: (email: string) => void
  }
}) {
  const [selectedOption, setSelectedOption] = useState<{
    name: string
    email: string
  } | null>(null)
  const [filteredOptions, setFilteredOptions] = useState<typeof options>([])
  const [prefetchedOptions, setPrefetchedOptions] = useState<typeof options>([])
  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showClear, setShowClear] = useState(false)
  const [errorEmailExist, setErrorEmailExist] = useState(false)
  const [errorDomain, setErrorDomain] = useState(false)
  const [pendingEmailVerification, setPendingEmailVerification] =
    useState(false)
  const [blockEvents, setBlockEvents] = useState(false)
  const [emailFromAD, setEmailFromAD] = useState(false)
  const [errorTermType, setErrorTermType] = useState(false)
  const [debouncedSearchTerm] = useDebounce(searchTerm.toLowerCase(), 1200)
  const [previousSearchTerm, setPreviousSearchTerm] = useState('')
  const [isADSearchEnabled, setIsADSearchEnabled] = useState(false)

  const anyError = errorEmailExist || errorDomain || errorTermType

  // ----------- Initialize the input value from the value prop only on component mount -----------
  useEffect(() => {
    if (value && !searchTerm) {
      setSearchTerm(value)
    }

    const verifyAdSearchEnabled = async () => {
      const isADSearchEnabled = await isAdSearchEnabled()
      setIsADSearchEnabled(isADSearchEnabled)
    }
    verifyAdSearchEnabled()
  }, [])
  // -----------------------------------------------------

  // ----------- Disable interactions if disabled or readOnly -----------
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.cursor = disabled || readOnly ? 'default' : 'text'
      if (disabled || readOnly || blockEvents) {
        inputRef.current.blur()
        const style = document.createElement('style')
        style.textContent = `
          *::selection {
            background-color: transparent;
            color: inherit;
            user-drag: none;
          }
        `
        document.head.appendChild(style)
        return () => {
          document.head.removeChild(style)
        }
      }
    }
  }, [disabled, readOnly, blockEvents])
  // -----------------------------------------------------

  // ----------- Manage the dropdown closing when clicking outside --------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownIsOpen(false)
        setFilteredOptions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  // --------------------------------------------------------------------------

  // ----------- Select an option from the dropdown --------------------------------
  const handleOptionSelect = async (option: (typeof options)[0]) => {
    if (errorEmailExist) return
    const emailExists = await verifyEmailExists(option.mail)
    if (emailExists) {
      setErrorEmailExist(true)
      setDropdownIsOpen(false)
      setSearchTerm(option.mail)
      setFilteredOptions([])
      return
    }

    if (isADSearchEnabled) {
      setPreviousSearchTerm(option.mail)
      setSelectedOption({
        name: option.givenName + ' ' + option.surname || '',
        email: option.mail || '',
      })
      setIsInputFocused(false)
      setSearchTerm(option.mail)
      inputRef.current?.blur()
      setDropdownIsOpen(false)
      setFilteredOptions([])
      setEmailFromAD(true)
      callbacks?.setIsSSO?.(true)
      callbacks?.setFormEmail?.(option.mail)
      callbacks?.setFormIsSSO?.(true)
      callbacks?.setFormFirstName?.(option.givenName)
      callbacks?.setFormLastName?.(option.surname)
    }
  }
  // --------------------------------------------------------------------------

  // ----------- Manage the input -------------------------------------------
  // Executions that occur when the input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (anyError) clearErrors()

    if (emailFromAD) {
      handleClear()
      clearErrors()
      setEmailFromAD(false)
    }

    const newValue = e.target.value
    setSearchTerm(newValue)
    if (isADSearchEnabled) {
      callbacks?.setFormIsSSO?.(null)
      callbacks?.setIsSSO?.(false)
    }
  }
  // Check if the input is focused or has text
  const handleFocusedOrTerm = () => {
    return isInputFocused || searchTerm.length > 0 || readOnly || disabled
  }
  // Reset the Input
  const handleClear = () => {
    setSearchTerm('')
    setPreviousSearchTerm('')
    clearErrors()
    setBlockEvents(false)
    setSelectedOption(null)
    setIsInputFocused(true)
    inputRef.current?.focus()
    setDropdownIsOpen(false)
    setEmailFromAD(false)
    callbacks?.setFormIsSSO?.(null)
    callbacks?.setFormEmail?.('')
    if (isADSearchEnabled) {
      callbacks?.setIsSSO?.(false)
      callbacks?.setFormFirstName?.('')
      callbacks?.setFormLastName?.('')
    }
  }
  // Manage the input block
  useEffect(() => {
    readOnly = blockEvents ? true : readOnly
  }, [blockEvents])
  useEffect(() => {
    setBlockEvents(pendingEmailVerification)
  }, [pendingEmailVerification])

  // Clear the errors
  const clearErrors = () => {
    setErrorDomain(false)
    setErrorEmailExist(false)
    setErrorTermType(false)
  }

  // Check if there is any error, and if there is, clear the email in the form and the previousSearchTerm
  useEffect(() => {
    if (anyError) {
      setPreviousSearchTerm('')
      callbacks?.setFormEmail?.('')
    }
  }, [anyError])

  // Watch if the SearchTerm is different from the previousSearchTerm, if so, clear the email in the form
  useEffect(() => {
    if (searchTerm !== previousSearchTerm) {
      callbacks?.setFormEmail?.('')
    }
  }, [searchTerm])

  // --------------------------------------------------------------------------

  // ----------- Set the options and open the dropdown -----------
  const setOptionsAndOpenDropdown = (options: AdUser[]) => {
    setPrefetchedOptions(options)
    setFilteredOptions(options)
    setPendingEmailVerification(false)
    setDropdownIsOpen(true)
  }
  // -----------------------------------------------------

  // ----------- Process the debouncedSearchTerm ----------------------------
  const handleProcessTerm = async () => {
    if (anyError) return
    if (debouncedSearchTerm === previousSearchTerm && previousSearchTerm !== '')
      return

    setPendingEmailVerification(true)
    clearErrors()

    const termProcessed = await processTerm(
      debouncedSearchTerm,
      setErrorEmailExist,
      setErrorDomain,
      setOptionsAndOpenDropdown,
      setErrorTermType,
    )
    callbacks?.setSsoBlockEvents?.(false)
    if (termProcessed) {
      setPreviousSearchTerm(termProcessed)
      callbacks?.setFormEmail?.(termProcessed)
    }
    setPendingEmailVerification(false)
    inputRef.current?.focus()
  }
  useEffect(() => {
    handleProcessTerm()
  }, [debouncedSearchTerm])
  // --------------------------------------------------------------------------

  // ----------- Remove the keeper for always --------------------------------
  useEffect(() => {
    const removeKeeperLock = () => {
      const keeperLock = document.querySelector('keeper-lock')
      if (keeperLock) {
        keeperLock.remove()
      }
    }
    removeKeeperLock()
    const observer = new MutationObserver(() => {
      removeKeeperLock()
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    return () => observer.disconnect()
  }, [])
  // --------------------------------------------------------------------------

  return (
    <div className="fdms relative" ref={dropdownRef}>
      <div className="relative h-[10px]">
        <label
          className={`${
            handleFocusedOrTerm()
              ? 'visible text-[14px]'
              : 'invisible translate-y-[23.5px] text-[16px]'
          } text-gray1100 absolute top-0 left-0 transition-all duration-160`}
        >
          {placeholder}
        </label>
      </div>
      <div
        className={`${
          isInputFocused ? 'border-gray1100' : 'border-gray500'
        } ${readOnly && 'border-dark600'} ${disabled && 'border-gray500'} ${errorEmailExist && 'border-red-500'} ${errorDomain && 'border-red-500'} ${errorTermType && 'border-red-500'} relative min-w-[432px] border-b-[1.4px] py-2.5`}
        onMouseEnter={() => setShowClear(true)}
        onMouseLeave={() =>
          !errorEmailExist &&
          !errorDomain &&
          !errorTermType &&
          setShowClear(false)
        }
      >
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            onInput={handleInputChange}
            className={`${handleFocusedOrTerm() ? 'fdms_input_focused' : ''} fdms_input w-full ${blockEvents && 'pointer-events-none opacity-50'}`}
            onChange={handleInputChange}
            value={searchTerm}
            maxLength={maxLength}
            onFocus={() => {
              setIsInputFocused(true)
            }}
            onBlur={() => {
              setTimeout(() => {
                if (!dropdownRef.current?.contains(document.activeElement)) {
                  setIsInputFocused(false)
                }
              }, 200)
            }}
            placeholder={placeholder}
            disabled={readOnly || disabled}
          />

          {showClear && searchTerm && !blockEvents && (
            <X
              className="text-gray1400 h-4 w-4 cursor-pointer stroke-3"
              onClick={handleClear}
            />
          )}

          {((errorEmailExist && searchTerm && !blockEvents) ||
            (errorDomain && searchTerm && !blockEvents) ||
            (errorTermType && searchTerm && !blockEvents)) && (
            <div className="bg-error_Text mr-[1.5px] ml-[9px] aspect-square max-w-3 min-w-3 rounded-full" />
          )}

          {pendingEmailVerification && searchTerm && (
            <Loader className="text-gray1400 ml-2 h-4 w-4 animate-spin" />
          )}
        </div>
      </div>

      {errorDomain && searchTerm && (
        <div className="text-gray1300 absolute top-full inline-flex w-full gap-1 py-1 text-[12px]">
          <p>Domain not allowed.</p>
        </div>
      )}

      {errorTermType && searchTerm && (
        <div className="text-gray1300 absolute top-full inline-flex w-full gap-1 py-1 text-[12px]">
          <p>Please enter a valid email address.</p>
        </div>
      )}

      {errorEmailExist && searchTerm && (
        <div className="text-gray1300 absolute top-full inline-flex w-full gap-1 py-1 text-[12px]">
          <p>User already exists.</p>
          <button
            type="button"
            className="underline"
            onClick={() => callbacks?.openManageUserAccount?.(searchTerm)}
          >
            View their profile here
          </button>
        </div>
      )}

      {dropdownIsOpen && !blockEvents && !anyError && (
        <div className="drop-area border-lines bg-wallMiddle top-full -mt-1 max-h-[200px] w-full overflow-y-auto">
          {filteredOptions && filteredOptions.length > 0 && filteredOptions.map((option, index) => (
            <div
              key={`${option.mail}-${index}`}
              className={`hover:bg-btn_Active_Hover flex cursor-pointer items-center gap-2 p-2 px-3 ${
                selectedOption?.email === option.mail ? 'bg-light600' : ''
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="flex flex-col">
                <span className="text-gray1300 text-[16px]">
                  {option.givenName + ' ' + option.surname}
                </span>
                <span className="text-gray1300 text-[14px]">{option.mail}</span>
              </div>
            </div>
          ))}
          <div className="pointer-events-none absolute top-[85%] h-10 w-full bg-gradient-to-t from-white to-transparent" />
        </div>
      )}
    </div>
  )
}
