'use client'

import { X } from 'lucide-react'
import { useEffect, useState, useRef, FormEvent, use } from 'react'

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

export default function PrimaryInput({
  placeholder,
  value,
  readOnly,
  disabled,
  callback,
  type,
  error,
  maxLength,
  onClear,
  trim,
  focus,
  inputMode,
}: {
  placeholder: string
  value?: string
  readOnly?: boolean
  disabled?: boolean
  callback?: (value: string) => void
  type?: string
  error?: string
  maxLength?: number
  onClear?: () => void
  onInput?: (value: React.ChangeEvent<HTMLInputElement>) => void
  trim?: boolean
  focus?: boolean
  inputMode?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(value || '')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showClear, setShowClear] = useState(false)
  const [isCapsLock, setIsCapsLock] = useState(false)

  useEffect(() => {
    if (type === 'password') {
      const handleCapsLock = (e: any) => {
        if (e && typeof e.getModifierState === 'function') {
          setIsCapsLock(e.getModifierState('CapsLock'))
        }
      }

      document.addEventListener('keydown', handleCapsLock)
      return () => document.removeEventListener('keydown', handleCapsLock)
    }
  }, [type])

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // UseEffect to prevent the user from typing non-numeric characters
  useEffect(() => {
    if (inputMode === 'numeric') {
      const handleInput = (event: Event) => {
        const input = event.target as HTMLInputElement
        const cursorPosition = input.selectionStart || 0

        // Remove non-numeric characters
        const numericValue = input.value.replace(/[^\d]/g, '')

        // Update the value while keeping the cursor position
        if (input.value !== numericValue) {
          input.value = numericValue
          input.setSelectionRange(cursorPosition - 1, cursorPosition - 1)
        }

        setInputValue(numericValue)

        // Prevent entry of non-numeric characters
        if (!/^\d*$/.test(input.value)) {
          event.preventDefault()
        }
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        // Allows only numeric keys, backspace, delete and arrows
        if (
          !/^\d$/.test(event.key) &&
          !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
            event.key,
          )
        ) {
          event.preventDefault()
        }
      }

      const inputElement = inputRef.current
      if (inputElement) {
        inputElement.addEventListener('input', handleInput)
        inputElement.addEventListener('keydown', handleKeyDown)

        // Forces the type as tel to show the numeric keyboard on mobile
        inputElement.setAttribute('type', 'tel')
      }

      return () => {
        if (inputElement) {
          inputElement.removeEventListener('input', handleInput)
          inputElement.removeEventListener('keydown', handleKeyDown)
        }
      }
    }
  }, [inputMode])
  // ---------------------------------------------------------------------

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

  useEffect(() => {
    if (focus) {
      inputRef.current?.focus()
    }
  }, [focus])

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (callback) {
        callback(inputValue)
      }
    }, 100)

    return () => clearTimeout(debounceTimeout) // Clear the previous timeout when typing again
  }, [inputValue])

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

  const handleClear = () => {
    setInputValue('')
    setIsInputFocused(true)
    inputRef.current?.focus()
    onClear?.()
  }

  const handleFocusedOrTerm = () => {
    return isInputFocused || inputValue || readOnly || disabled
  }

  // Remove the keeper for always
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

  useEffect(() => {
    if (error) {
      setShowClear(true)
    }
  }, [error])

  return (
    <div className="fdms relative">
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
        } ${readOnly && 'border-dark600'} ${disabled && 'border-gray500'} ${error && 'border-red-500'} relative min-w-[432px] border-b-[1.4px] py-2.5`}
        onMouseEnter={() => {
          setShowClear(true)
        }}
        onMouseLeave={() => {
          if (type !== 'text' && error) {
            setShowClear(true)
          } else {
            setShowClear(false)
          }
        }}
      >
        <div className="flex items-center">
          <input
            ref={inputRef}
            type={type}
            className={`${handleFocusedOrTerm() ? 'fdms_input_focused' : ''} ${disabled ? 'fdms_input_disabled' : 'fdms_input'} w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
            onChange={(e) => {
              setInputValue(trim ? e.target.value.trim() : e.target.value)
              setIsInputFocused(true)
            }}
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInputValue(trim ? e.target.value.trim() : value || '')
            }}
            value={inputValue}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder={placeholder}
            disabled={readOnly || disabled}
            maxLength={maxLength}
          />

          {showClear &&
            inputValue &&
            !disabled &&
            !readOnly &&
            // type != 'text' &&
            error && (
              <X
                className="text-gray1400 h-4 w-4 cursor-pointer stroke-3"
                onClick={handleClear}
              />
            )}

          {error && (
            <div className="bg-error_Text mr-[1.5px] ml-[9px] aspect-square max-h-3 max-w-3 min-w-3 rounded-full" />
          )}

          {error && (
            <div className="text-gray1300 absolute top-full inline-flex w-full gap-1 py-1 text-[12px]">
              <p>{error}</p>
            </div>
          )}

          {isCapsLock && (
            <p className="steer_to_left text-gray1300 absolute -bottom-[20px] left-[calc(100%-90px)] text-[12px] whitespace-nowrap">
              CapsLock is on
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
