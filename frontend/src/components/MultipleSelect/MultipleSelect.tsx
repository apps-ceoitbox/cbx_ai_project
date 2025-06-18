import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

// Types and Interfaces
export interface Option {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: string;
  showSearch?: boolean;
  showSelectedCount?: boolean;
  allowClear?: boolean;
  showSelectAll?: boolean;
  maxBadges?: number;
  hideBadges?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options...", 
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
  maxHeight = "200px",
  showSearch = true,
  showSelectedCount = true,
  allowClear = true,
  showSelectAll = true,
  maxBadges = 3,
  hideBadges = false
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleSelect = (optionValue: string): void => {
    if (disabled) return;
    
    const newValue = value.includes(optionValue)
      ? value.filter(item => item !== optionValue)
      : [...value, optionValue];
    
    onChange(newValue);
  };

  const handleRemove = (optionValue: string): void => {
    if (disabled) return;
    const newValue = value.filter(item => item !== optionValue);
    onChange(newValue);
  };

  const clearAll = (): void => {
    if (disabled) return;
    onChange([]);
  };

  const selectAll = (): void => {
    if (disabled) return;
    const allValues = filteredOptions.map(option => option.value);
    const newValue = [...new Set([...value, ...allValues])];
    onChange(newValue);
  };

  const isAllSelected = (): boolean => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every(option => value.includes(option.value));
  };

  const isSomeSelected = (): boolean => {
    return filteredOptions.some(option => value.includes(option.value));
  };

  // Filter options based on search term
  const filteredOptions: Option[] = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabels: string[] = value.map(val => 
    options.find(option => option.value === val)?.label
  ).filter((label): label is string => Boolean(label));

  const displayText = (): string => {
    if (value.length === 0) return placeholder;
    if (showSelectedCount) return `${value.length} selected`;
    return selectedLabels.join(', ');
  };

  const handleButtonClick = (): void => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  const handleClearClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    clearAll();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = (e: React.MouseEvent<HTMLInputElement>): void => {
    e.stopPropagation();
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        onClick={handleButtonClick}
        disabled={disabled}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        <span className={value.length === 0 ? "text-muted-foreground" : ""}>
          {displayText()}
        </span>
        <div className="flex items-center gap-1">
          {allowClear && value.length > 0 && !disabled && (
            <button
              onClick={handleClearClick}
              type="button"
              className="rounded-full p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${
            open ? 'rotate-180' : ''
          }`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground shadow-md rounded-md border">
          {showSearch && (
            <div className="p-1">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={handleSearchClick}
                className="flex h-9 w-full rounded-md border-0 bg-transparent py-3 px-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="p-1" style={{ maxHeight, overflowY: 'auto' }}>
            {showSelectAll && filteredOptions.length > 0 && (
              <>
                <div
                  onClick={selectAll}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground font-medium border-b border-border"
                  role="option"
                  aria-selected={isAllSelected()}
                >
                  <div className="mr-2 h-4 w-4 flex items-center justify-center">
                    {isAllSelected() ? (
                      <Check className="h-4 w-4 opacity-100" />
                    ) : isSomeSelected() ? (
                      <div className="h-2 w-2 bg-current rounded-sm opacity-50" />
                    ) : (
                      <div className="h-4 w-4 opacity-0" />
                    )}
                  </div>
                  Select All
                </div>
              </>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filteredOptions.map((option: Option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  role="option"
                  aria-selected={value.includes(option.value)}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value.includes(option.value) 
                        ? "opacity-100" 
                        : "opacity-0"
                    }`}
                  />
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {value.length > 0 && !hideBadges && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedLabels.slice(0, maxBadges).map((label: string, index: number) => {
            const optionValue = value[index];
            return (
              <div
                key={optionValue}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {label}
                {!disabled && (
                  <button
                    onClick={() => handleRemove(optionValue)}
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/60"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
          {selectedLabels.length > maxBadges && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-muted text-muted-foreground">
              +{selectedLabels.length - maxBadges} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect