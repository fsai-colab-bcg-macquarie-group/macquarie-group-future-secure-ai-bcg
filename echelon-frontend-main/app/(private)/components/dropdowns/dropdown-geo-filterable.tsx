'use client'

import { Check, ChevronDown, MapPin, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useDebounce } from 'use-debounce'

export default function GeoFilterableDropdown({
  maxLength,
  placeholder,
  options,
  callbacks,
  disabled,
  readOnly,
  value,
}: {
  maxLength?: number
  placeholder: string
  options?: {
    id: string
    name: string
  }[]
  callbacks: {
    fetchLocations?: (term: string) => Promise<void>
    setFormLocation?: (value: string) => void
  }
  disabled?: boolean
  readOnly?: boolean
  value?: {
    id: string | null
    name: string | null
  }
}) {
  const [selectedOption, setSelectedOption] = useState<{
    id: string
    name: string
  }>()
  const [filteredOptions, setFilteredOptions] = useState<
    {
      id: string
      name: string
    }[]
  >([])
  const [prefetchedOptions, setPrefetchedOptions] = useState<
    {
      id: string
      name: string
    }[]
  >([])
  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showClear, setShowClear] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (value) {
      setSearchTerm(value.name || '')
      setSelectedOption({
        id: value.id || '',
        name: value.name || '',
      })
    }
  }, [value])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.cursor = disabled || readOnly ? 'default' : 'text'
      if (disabled || readOnly) {
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
  }, [disabled, readOnly])

  useEffect(() => {
    if (callbacks.setFormLocation) {
      callbacks.setFormLocation(selectedOption?.id || '')
    }
  }, [selectedOption])

  useEffect(() => {
    const validOptions = (options || []).filter(
      (option) =>
        option && typeof option === 'object' && option.name && option.id,
    )
    setPrefetchedOptions(validOptions)
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
    const fetchData = async () => {
      if (
        debouncedSearchTerm &&
        debouncedSearchTerm.length >= 3 &&
        dropdownIsOpen &&
        !selectedOption
      ) {
        try {
          if (callbacks.fetchLocations) {
            setIsFetching(true)
            await callbacks.fetchLocations(debouncedSearchTerm)
            setIsFetching(false)
          }
        } catch (error) {
          console.error('Erro ao buscar localizações:', error)
        }
      }
    }

    fetchData()
  }, [debouncedSearchTerm, dropdownIsOpen, selectedOption])

  const handleDropdownToggle = () => {
    if (readOnly || disabled) return
    if (dropdownIsOpen) {
      inputRef.current?.focus()
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.value.length
        inputRef.current.selectionEnd = inputRef.current.value.length
      }
    }

    setDropdownIsOpen((prev) => !prev)
    setIsInputFocused((prev) => !prev)
  }

  const filterOptions = (term: string) => {
    const filtered = prefetchedOptions.filter((option) =>
      option?.name?.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredOptions(filtered)
  }

  const handleOptionSelect = (option: { id: string; name: string }) => {
    setSelectedOption(option)
    setSearchTerm(option.name)
    setIsInputFocused(false)
    inputRef.current?.blur()
    setDropdownIsOpen(false)
    setFilteredOptions([])
  }

  const handleClear = () => {
    setSelectedOption(undefined)
    setSearchTerm('')
    setIsInputFocused(true)
    inputRef.current?.focus()
  }

  const handleFocusedOrTerm = () => {
    return isInputFocused || searchTerm.length > 0 || dropdownIsOpen
  }

  const getSortedOptions = (
    options: {
      id: string
      name: string
    }[],
  ) => {
    if (!selectedOption) return options

    return [
      selectedOption,
      ...options.filter((opt) => opt.name !== selectedOption.name),
    ]
  }

  const handleInputFocus = () => {
    if (readOnly || disabled) return
    setIsInputFocused(true)
    setFilteredOptions(prefetchedOptions)
    setDropdownIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)

    if (selectedOption && newValue !== selectedOption.name) {
      setSelectedOption(undefined)
      setDropdownIsOpen(true)
      setFilteredOptions(prefetchedOptions)
    }
  }

  return (
    <div className="fdms relative" ref={dropdownRef}>
      <div className="relative h-[10px]">
        <label
          className={`${
            handleFocusedOrTerm() || searchTerm
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
        } ${readOnly && 'border-dark600'} ${disabled && 'border-gray500'} relative min-w-[432px] border-b-[1.4px] py-2.5`}
        onMouseEnter={() => setShowClear(true)}
        onMouseLeave={() => setShowClear(false)}
      >
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            className={`${handleFocusedOrTerm() ? 'fdms_input_focused' : ''} ${disabled ? 'fdms_input_disabled' : 'fdms_input'} text-dark600 w-full ${disabled && 'text-gray600'}`}
            onChange={handleInputChange}
            value={searchTerm}
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
            readOnly={readOnly}
            maxLength={maxLength}
          />
          {showClear && searchTerm && !readOnly && !disabled && (
            <X
              className="text-fsai_Foreground h-4 w-4 cursor-pointer stroke-3"
              onClick={handleClear}
            />
          )}
          <div className={`right-side relative flex ${disabled && 'h-8'}`}>
            {!disabled && (
              <button
                onClick={handleDropdownToggle}
                type="button"
                className="cursor-pointer p-1"
                disabled={disabled || readOnly}
              >
                <ChevronDown
                  className={`text-dark600 stroke-1 ${dropdownIsOpen ? 'rotate-180' : ''} ${readOnly && 'text-light600'} ${disabled && 'text-gray600'}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {dropdownIsOpen && !readOnly && (
        <div className="drop-area border-lines bg-light100 top-full -mt-1 max-h-[200px] w-full overflow-y-auto">
          {filteredOptions.length === 0 &&
            !selectedOption &&
            searchTerm.length > 2 && (
              <div className="text-dark600 flex items-start justify-center p-6 text-[14.5px]">
                {isFetching ? 'Loading...' : 'No results found'}
              </div>
            )}

          {getSortedOptions(filteredOptions).map((option) => (
            <div
              key={`${option.name}`}
              className={`hover:bg-light200 relative flex cursor-pointer items-center gap-2 p-2.5 px-3`}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="absolute top-2.5 right-2 flex h-[18px] w-[18px] items-center justify-center">
                {selectedOption?.name === option.name && (
                  <Check className="text-dark600 h-5 w-5" />
                )}
              </div>
              <div className="inline-flex gap-1">
                <MapPin className="text-dark600 mr-1.5 h-5 w-5 translate-y-0.5 stroke-1" />
                <span className="text-dark600 text-[16px]">{option.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {dropdownIsOpen && !readOnly && (
        <div className="pointer-events-none absolute top-[85%] h-10 w-full bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  )
}
