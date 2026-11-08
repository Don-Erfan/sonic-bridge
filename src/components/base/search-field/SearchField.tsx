'use client';
import React, { FC } from 'react';
import { uiText } from '@/config';
import { IconButton } from '../icon-button';
import { TextField } from '../text-field';
import { ISearchFieldProps } from './interface';

/**
 * Search input with a clear button (Escape also clears, via the native
 * `type="search"` behaviour of React Aria's field).
 *
 * @example
 * <SearchField aria-label="جست‌وجو" value={query} onChange={setQuery} />
 */
export const SearchField: FC<ISearchFieldProps> = ({
  value,
  onChange,
  'aria-label': ariaLabel,
  placeholder,
}) => (
  <TextField
    aria-label={ariaLabel}
    type="search"
    inputMode="search"
    enterKeyHint="search"
    startIcon="search"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyDown={(event) => {
      if (event.key === `Escape` && value) onChange(``);
    }}
    endContent={
      value ? (
        <IconButton
          icon="close"
          size="sm"
          variant="ghost"
          aria-label={uiText.clearSearch}
          onPress={() => onChange(``)}
        />
      ) : undefined
    }
  />
);

SearchField.displayName = `SearchField`;

export default SearchField;
