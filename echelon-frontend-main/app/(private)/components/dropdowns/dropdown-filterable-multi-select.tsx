'use client'

import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useDebounce } from 'use-debounce'

////
////
////
////   DO NOT IMPORT CONTEXTS, DEFAULT COMPONENTS ARE ALSO USED IN PUBLIC PARTS, RECEIVE EVERYTHING AS PROPS
////   DO NOT IMPORT CONTEXTS, DEFAULT COMPONENTS ARE ALSO USED IN PUBLIC PARTS, RECEIVE EVERYTHING AS PROPS
////   DO NOT IMPORT CONTEXTS, DEFAULT COMPONENTS ARE ALSO USED IN PUBLIC PARTS, RECEIVE EVERYTHING AS PROPS
////   DO NOT IMPORT CONTEXTS, DEFAULT COMPONENTS ARE ALSO USED IN PUBLIC PARTS, RECEIVE EVERYTHING AS PROPS
////
////
////
////

// Define the type for the options
type Option = {
  id: string
  name: string
  description?: string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
}

export default function FilterableMultiSelectDropdown({
  placeholder,
  maxTags,
  options,
  callback,
  disabled,
  value,
}: {
  placeholder: string
  maxTags: number
  options: Option[]
  callback: (value: Option[]) => void
  disabled?: boolean
  value?: string[] | Option[]
}) {
  // Convert value to Option[] if it's string[]
  const processedValue = Array.isArray(value)
    ? (value
        .map((item) => {
          if (typeof item === 'string') {
            // If it's string, find the corresponding object
            return options.find((option) => option.id === item) || null
          }
          // If it's already an Option object, return as is
          return item
        })
        .filter(Boolean) as Option[])
    : []

  const [selectedOptions, setSelectedOptions] =
    useState<Option[]>(processedValue)
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([])
  const [prefetchedOptions, setPrefetchedOptions] = useState<Option[]>([])
  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)

  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (value) {
      const newProcessedValue = Array.isArray(value)
        ? (value
            .map((item) => {
              if (typeof item === 'string') {
                return options.find((option) => option.id === item) || null
              }
              return item
            })
            .filter(Boolean) as Option[])
        : []

      if (
        JSON.stringify(newProcessedValue) !== JSON.stringify(selectedOptions)
      ) {
        setSelectedOptions(newProcessedValue)
      }
    }
  }, [value, options])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.cursor = disabled ? 'not-allowed' : 'text'
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
    if (selectedOptions !== value) {
      callback(selectedOptions)
    }
  }, [selectedOptions])

  useEffect(() => {
    setPrefetchedOptions(options)
  }, [options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownIsOpen
      ) {
        setDropdownIsOpen(false)
        setSearchTerm('')
        setFilteredOptions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownIsOpen])

  useEffect(() => {
    if (debouncedSearchTerm) {
      filterOptions(debouncedSearchTerm)
    } else {
      setFilteredOptions(
        prefetchedOptions.filter(
          (option) =>
            !selectedOptions.some((selected) => selected.id === option.id),
        ),
      )
    }
  }, [debouncedSearchTerm, prefetchedOptions, selectedOptions])

  const handleDropdownToggle = () => {
    setDropdownIsOpen((prev) => !prev)
  }

  const filterOptions = (searchTerm: string) => {
    const filtered = prefetchedOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedOptions.some((selected) => selected.id === option.id),
    )

    setFilteredOptions(filtered)
  }

  const handleOptionSelect = (option: Option) => {
    setSelectedOptions((prev) => {
      // Check if the option is already selected
      const isSelected = prev.some((item) => item.id === option.id)

      if (isSelected) {
        // Remove the option if it's already selected
        return prev.filter((item) => item.id !== option.id)
      }

      // Add the option if it's not selected and doesn't exceed the limit
      if (prev.length < maxTags) {
        return [option, ...prev]
      }

      return prev
    })
  }

  const handleFocusedOrTerm = () => {
    return isInputFocused || searchTerm.length > 0 || selectedOptions.length > 0
  }

  const OptionItem = ({
    option,
    isSelected,
  }: {
    option: Option
    isSelected?: boolean
  }) => (
    <div
      key={option.id}
      className={`bg-light100 flex cursor-pointer items-center gap-2 p-2 px-3 transition-all duration-300 hover:bg-neutral-200 ${
        isSelected ||
        selectedOptions.some((selected) => selected.id === option.id)
          ? 'bg-light300'
          : ''
      }`}
      onClick={() => handleOptionSelect(option)}
    >
      <div
        className={`flex h-[18px] w-[18px] items-center justify-center border text-white ${
          isSelected ||
          selectedOptions.some((selected) => selected.id === option.id)
            ? 'border-dark300 bg-dark300'
            : 'border-dark300 bg-transparent'
        }`}
      >
        {(isSelected ||
          selectedOptions.some((selected) => selected.id === option.id)) && (
          <Check className="stroke-[1.5px] text-white" />
        )}
      </div>
      <span className="text-[16px]">{option.name}</span>
    </div>
  )

  return (
    <div className={`fdms ${disabled ? 'opacity-70' : ''}`} ref={dropdownRef}>
      <div className="relative h-[10px]">
        <label
          className={`${
            handleFocusedOrTerm()
              ? 'visible text-[14px]'
              : 'invisible translate-y-[28.5px] text-[16px]'
          } text-gray1100 absolute top-0 left-0 transition-all duration-160`}
        >
          {placeholder}
        </label>
        {selectedOptions.length >= maxTags && (
          <span className="steer_to_left text-gray1300 absolute left-70 ml-2 text-[12px] whitespace-nowrap">
            Maximum limit reached
          </span>
        )}
      </div>
      <div
        className={`${
          handleFocusedOrTerm() ? 'border-gray1100' : 'border-gray500'
        } ${disabled && 'border-gray500'} relative min-w-[432px] border-b-[1.4px] py-2.5`}
      >
        <div className="flex flex-row">
          <div className="left-side flex max-w-[405px] min-w-[405px] flex-row gap-1.5 overflow-x-auto">
            <div className="fdms_input_area">
              {!disabled && (
                <input
                  ref={inputRef}
                  type="text"
                  className={`${
                    handleFocusedOrTerm() ? 'fdms_input_focused' : ''
                  } fdms_input text-fsai_Foreground ${
                    disabled ? 'cursor-not-allowed' : ''
                  } w-[20px] ${isInputFocused || selectedOptions.length > 0 ? 'min-w-[80px]' : 'min-w-[410px]'} ${disabled && selectedOptions.length > 0 && 'max-w-[0px]'} transition-all duration-200`}
                  style={{
                    width: `${Math.max(20, searchTerm.length * 9.5)}px`,
                  }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                  onFocus={() => {
                    if (!disabled) {
                      setIsInputFocused(true)
                      setDropdownIsOpen(true)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      if (
                        !dropdownRef.current?.contains(document.activeElement)
                      ) {
                        setIsInputFocused(false)
                      }
                    }, 200)
                  }}
                  placeholder={placeholder}
                  disabled={disabled}
                />
              )}
            </div>
            {disabled && selectedOptions.length < 1 && (
              <input
                ref={inputRef}
                type="text"
                className="fdms_input text-fsai_Foreground w-full"
                placeholder="No teams selected"
              />
            )}
            {selectedOptions.map((option, index) => (
              <div
                key={index}
                className={`bg-dark300 flex flex-row items-center gap-1 p-1 py-0 pr-px text-sm text-white ${disabled && 'cursor-default'}`}
              >
                <span className={`text-nowrap ${disabled && 'pr-1'}`}>
                  {option.name}
                </span>
                {!disabled && (
                  <button
                    onClick={() => handleOptionSelect(option)}
                    className="text-soft cursor-pointer"
                  >
                    <X className="aspect-square w-5 stroke-[1.5px] text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className={`right-side relative flex ${disabled && 'h-8'}`}>
            {!disabled && (
              <button
                onClick={handleDropdownToggle}
                type="button"
                className="cursor-pointer p-1"
                title="chepvron_down"
              >
                <ChevronDown
                  className={`text-dark600 stroke-1 ${dropdownIsOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}
            <div className="pointer-events-none absolute top-0 -left-full h-full w-8 bg-gradient-to-l from-white to-transparent" />
          </div>
        </div>
      </div>
      {(dropdownIsOpen || searchTerm) && (
        <div className="relative">
          <div className="drop-area border-lines bg-wallMiddle top-full left-0 -mt-1 max-h-[200px] w-full overflow-y-auto">
            {searchTerm ? (
              <>
                {filteredOptions.length === 0 && !selectedOptions.length ? (
                  <div className="text-fsai_Foreground flex items-start justify-center p-6 text-[14.5px]">
                    No results found
                  </div>
                ) : (
                  <>
                    {filteredOptions.map((option, index) => (
                      <OptionItem key={index} option={option} />
                    ))}
                  </>
                )}
              </>
            ) : (
              <>
                {selectedOptions.map((option, index) => (
                  <OptionItem key={index} option={option} isSelected />
                ))}
                {prefetchedOptions
                  .filter(
                    (option) =>
                      !selectedOptions.some(
                        (selected) => selected.id === option.id,
                      ),
                  )
                  .map((option, index) => (
                    <OptionItem key={index} option={option} />
                  ))}
              </>
            )}
          </div>
        </div>
      )}
      {dropdownIsOpen && (
        <div className="pointer-events-none absolute top-[85%] h-10 w-full bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  )
}
