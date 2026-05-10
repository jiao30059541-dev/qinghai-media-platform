// components/ui/Select.tsx
'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  success?: boolean
  className?: string
  onChange?: (value: string) => void
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      placeholder = '请选择',
      disabled = false,
      error = false,
      success = false,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '')
    const selectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedOption = options.find(opt => opt.value === selectedValue)
    const displayValue = selectedOption ? selectedOption.label : placeholder

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return
      
      setSelectedValue(option.value)
      onChange?.(option.value)
      setIsOpen(false)
    }

    const baseStyles = 'w-full px-4 py-2.5 text-left border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const statusStyles = error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : success 
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
      : 'border-gray-300 focus:border-primary focus:ring-primary'

    return (
      <div ref={selectRef} className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          className={cn(
            baseStyles,
            statusStyles,
            'flex items-center justify-between',
            !selectedOption && 'text-gray-500',
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
          {...props}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between',
                  option.value === selectedValue && 'bg-primary/5 text-primary',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => handleSelect(option)}
              >
                <span>{option.label}</span>
                {option.value === selectedValue && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }