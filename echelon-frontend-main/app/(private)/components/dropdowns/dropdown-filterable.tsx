'use client'

import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useDebounce } from 'use-debounce'

////
////
////
////   NÃO IMPORTE CONTEXTOS, OS COMPONENTES DEFAULT SÃO USADOS TAMBÉM EM PARTES PÚBLICAS, RECEBA TUDO COMO PROP
////   NÃO IMPORTE CONTEXTOS, OS COMPONENTES DEFAULT SÃO USADOS TAMBÉM EM PARTES PÚBLICAS, RECEBA TUDO COMO PROP
////   NÃO IMPORTE CONTEXTOS, OS COMPONENTES DEFAULT SÃO USADOS TAMBÉM EM PARTES PÚBLICAS, RECEBA TUDO COMO PROP
////   NÃO IMPORTE CONTEXTOS, OS COMPONENTES DEFAULT SÃO USADOS TAMBÉM EM PARTES PÚBLICAS, RECEBA TUDO COMO PROP
////
////
////
////

type Option = {
  id?: string
  title: string
  description?: string
}

export default function FilterableDropdown({
  placeholder,
  options,
  callback,
  disabled,
  value,
}: {
  placeholder: string
  options: Option[]
  callback: (value: string) => void
  disabled?: boolean
  value?: string
}) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    value ? options.find((option) => option.title === value) || null : null,
  )
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([])
  const [prefetchedOptions, setPrefetchedOptions] = useState<Option[]>([])
  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState(value ? value.toLowerCase() : '')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showClear, setShowClear] = useState(false)

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)

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
    callback(selectedOption?.id || selectedOption?.title || '')
  }, [selectedOption])
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.readOnly = true
      inputRef.current.style.caretColor = 'transparent'
    }
  }, [])

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
      if (selectedOption && searchTerm?.length < 6) setDropdownIsOpen(false)
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
      setSelectedOption(
        options.find((option) => option.title === value) || null,
      )
    }
  }, [value])

  const handleDropdownToggle = () => {
    setDropdownIsOpen((prev) => !prev)
    setIsInputFocused((prev) => !prev)
  }

  const filterOptions = (term: string) => {
    const filtered = prefetchedOptions.filter((option) =>
      option?.title?.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredOptions(filtered)
  }

  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option)
    setSearchTerm(option.title)
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
    return isInputFocused || searchTerm?.length > 0 || dropdownIsOpen
  }

  const getSortedOptions = (options: Option[]) => {
    if (!selectedOption) return options

    return [
      selectedOption,
      ...options.filter((opt) => opt.title !== selectedOption.title),
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

    if (selectedOption && newValue !== selectedOption.title) {
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
          } absolute top-0 left-0 text-text_Less_Soft transition-all duration-160`}
        >
          {placeholder}
        </label>
      </div>
      <div
        className={`${
          isInputFocused ? 'border-text_Less_Soft' : 'border-text_Less_Soft'
        } relative min-w-[432px] border-b-[1.4px] py-2.5`}
        onMouseEnter={() => setShowClear(true)}
        onMouseLeave={() => setShowClear(false)}
      >
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            className={`${handleFocusedOrTerm() ? 'fdms_input_focused' : ''} fdms_input w-full text-fsai_Foreground ${disabled ? 'cursor-default' : ''}`}
            onChange={handleInputChange}
            value={searchTerm
              ?.split(' ')
              ?.map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1),
              )
              ?.join(' ')}
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
              className="h-4 w-4 cursor-pointer stroke-3 text-fsai_Foreground"
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
        <div className="drop-area border-lines top-full -mt-1 max-h-[200px] w-full overflow-y-auto bg-wallMiddle">
          {filteredOptions?.length === 0 && !selectedOption && (
            <div className="flex items-start justify-center p-6 text-[14.5px] text-fsai_Foreground">
              No results found
            </div>
          )}
          {getSortedOptions(filteredOptions).map((option, idx) => (
            <div
              key={idx}
              className={`relative flex cursor-pointer items-center gap-2 p-2 px-3 hover:bg-light600`}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="absolute top-2 right-2 flex h-[18px] w-[18px] items-center justify-center">
                {selectedOption?.title === option?.title && (
                  <Check className="h-5 w-5 text-fsai_Foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[16px] ${
                    option?.description ? 'font-[600]' : 'py-1 font-[400]'
                  } text-fsai_Foreground`}
                >
                  {option?.title}
                </span>
                <span className="line-clamp-1 text-[14px] text-fsai_Foreground">
                  {option?.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {dropdownIsOpen && (
        <div className="pointer-events-none absolute top-[85%] h-10 w-full bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  )
}
