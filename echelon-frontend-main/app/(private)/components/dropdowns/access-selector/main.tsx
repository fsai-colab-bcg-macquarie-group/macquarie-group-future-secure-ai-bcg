'use client'

import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

import { Access } from '@definitions/user-definitions'
import { useDebounce } from 'use-debounce'

export default function AccessSelector({
  placeholder,
  options,
  callback,
  disabled,
  value,
}: {
  placeholder: string
  options: Access[]
  callback: {
    setFormAccess?: (value: Access) => void
  }
  disabled?: boolean
  value?: string
}) {
  const [selectedOption, setSelectedOption] = useState<Access | null>(
    value ? options.find((option) => option.name === value) || null : null,
  )
  const [filteredOptions, setFilteredOptions] = useState<Access[]>([])
  const [prefetchedOptions, setPrefetchedOptions] = useState<Access[]>([])

  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)

  const [searchTerm, setSearchTerm] = useState(value ? value.toLowerCase() : '')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showClear, setShowClear] = useState(false)

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.cursor = disabled ? 'default' : 'text'
      if (disabled) {
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
  }, [disabled])

  useEffect(() => {
    if (disabled) {
      setDropdownIsOpen(false)
      setFilteredOptions([])
      setIsInputFocused(false)
    }
  }, [disabled])

  useEffect(() => {
    // Callback to set access in the form
    if (!callback.setFormAccess) return

    if (selectedOption) {
      callback.setFormAccess({
        id: selectedOption.id,
        name: selectedOption.name,
      })
      // } else {
      //   callback.setFormAccess({ id: '', name: '' })
      // }
    }
  }, [selectedOption])

  // Prevent typing in the input when focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputRef.current === document.activeElement) {
        e.preventDefault()
      }
    }
    if (inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])
  // ====================================================================

  useEffect(() => {
    setPrefetchedOptions(options)
  }, [options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownIsOpen(false)
        setIsInputFocused(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (debouncedSearchTerm) {
      filterOptions(debouncedSearchTerm)
      if (selectedOption && searchTerm.length < 6) setDropdownIsOpen(false)
    } else {
      setFilteredOptions(prefetchedOptions)
    }
  }, [debouncedSearchTerm, prefetchedOptions])

  useEffect(() => {
    if (dropdownIsOpen) {
      setFilteredOptions(prefetchedOptions)
    }
  }, [dropdownIsOpen, prefetchedOptions])

  useEffect(() => {
    if (value) {
      setSearchTerm(value)
    }
  }, [value])

  const handleDropdownToggle = () => {
    setDropdownIsOpen((prev) => !prev)
    setIsInputFocused((prev) => !prev)
  }

  const filterOptions = (term: string) => {
    const filtered = prefetchedOptions.filter((option) =>
      option.name.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredOptions(filtered)
  }

  const handleOptionSelect = (option: Access) => {
    setSelectedOption(option)
    setSearchTerm(option.name)
    setIsInputFocused(false)
    inputRef.current?.blur()
    setDropdownIsOpen(false)
    setFilteredOptions([])
  }

  const handleClear = () => {
    setSelectedOption(null)
    setSearchTerm('')
    setIsInputFocused(true)
    inputRef.current?.focus()
  }

  const handleFocusedOrTerm = () => {
    return isInputFocused || searchTerm.length > 0 || dropdownIsOpen
  }

  const getSortedOptions = (options: Access[]) => {
    if (!selectedOption) return options

    return [
      selectedOption,
      ...options.filter((opt) => opt.name !== selectedOption.name),
    ]
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
    setFilteredOptions(prefetchedOptions)
    setDropdownIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)

    if (selectedOption && newValue !== selectedOption.name) {
      setSelectedOption(null)
      setDropdownIsOpen(true)
      setFilteredOptions(prefetchedOptions)
    }
  }

  return (
    <div className="fdms relative" ref={dropdownRef}>
      <div className="relative h-[10px]">
        <label
          className={`${
            handleFocusedOrTerm()
              ? 'visible text-[14px]'
              : 'invisible translate-y-[28px] text-[16px]'
          } text-gray1100 absolute top-0 left-0 transition-all duration-160`}
        >
          {placeholder}
        </label>
      </div>
      <div
        className={`${
          isInputFocused ? 'border-gray1100' : 'border-gray500'
        } ${disabled && 'border-gray500'} relative min-w-[432px] border-b-[1.4px] py-2.5`}
        onMouseEnter={() => setShowClear(true)}
        onMouseLeave={() => setShowClear(false)}
      >
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            className={`${handleFocusedOrTerm() ? 'fdms_input_focused' : ''} fdms_input fdms_access! w-full ${disabled ? 'cursor-default' : ''}`}
            onChange={handleInputChange}
            value={searchTerm
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
            onFocus={handleInputFocus}
            onBlur={() => {
              setTimeout(() => {
                if (!dropdownRef.current?.contains(document.activeElement)) {
                  setIsInputFocused(false)
                }
              }, 200)
            }}
            placeholder={placeholder}
            disabled={disabled}
          />
          {showClear && searchTerm && !disabled && (
            <X
              className="text-gray1400 h-4 w-4 cursor-pointer stroke-3"
              onClick={handleClear}
            />
          )}
          <div className={`right-side relative flex ${disabled && 'h-8'}`}>
            {!disabled && (
              <button
                onClick={handleDropdownToggle}
                type="button"
                className="cursor-pointer p-1"
              >
                <ChevronDown
                  className={`text-dark600 stroke-1 ${dropdownIsOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {dropdownIsOpen && (
        <div className="drop-area bg-light300 border-lines top-full -mt-1 max-h-[200px] w-full overflow-x-hidden overflow-y-auto">
          {filteredOptions.length === 0 && !selectedOption && (
            <div className="text-dark600 flex items-start justify-center p-6 text-[14.5px]">
              No results found
            </div>
          )}
          {getSortedOptions(filteredOptions).map((option) => (
            <div
              key={option.name}
              className={`hover:bg-gray400 relative flex cursor-pointer items-center gap-2 p-2 px-3`}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="absolute top-2 right-2 flex h-[18px] w-[18px] items-center justify-center">
                {selectedOption?.name === option.name && (
                  <Check className="text-dark600 h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[16px] ${
                    option.description
                      ? 'font-sans font-medium'
                      : 'py-1 font-[400]'
                  } text-dark600`}
                >
                  {option.name}
                </span>
                <span className="text-dark600 line-clamp-1 text-[14px]">
                  {option.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {dropdownIsOpen && (
        <div className="pointer-events-none absolute top-[86%] h-10 w-full bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  )
}
