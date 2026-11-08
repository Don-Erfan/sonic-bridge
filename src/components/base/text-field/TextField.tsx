'use client';
import React, { FC } from 'react';
import clsx from 'clsx';
import {
  Description,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField as HeroUITextField,
} from '@heroui/react';
import { Icon } from '@/icons';
import { ITextFieldProps } from './interface';
import {
  textFieldControlStyles,
  textFieldDescriptionStyles,
  textFieldEndContentStyles,
  textFieldErrorStyles,
  textFieldInputHeightStyles,
  textFieldLabelStyles,
  textFieldRootStyles,
  textFieldStartIconStyles,
  textFieldTextAreaStyles,
  textFieldWithEndContentStyles,
  textFieldWithStartIconStyles,
  textFieldWrapperStyles,
} from './classes';

/**
 * Text input — HeroUI `TextField` (label, description and error wired for
 * accessibility) as a neumorphic inset well; single- or multi-line.
 *
 * @example
 * <TextField label="موضوع جلسه" value={title} onChange={setTitle} />
 * <TextField aria-label="جست‌وجو" type="search" startIcon="search" />
 */
export const TextField: FC<ITextFieldProps> = ({
  label,
  placeholder,
  description,
  errorMessage,
  startIcon,
  endContent,
  isMultiline = false,
  rows = 3,
  autoComplete,
  autoCapitalize,
  ...rest
}) => {
  const controlClassName = clsx(
    textFieldControlStyles,
    isMultiline ? textFieldTextAreaStyles : textFieldInputHeightStyles,
    startIcon && textFieldWithStartIconStyles,
    endContent && textFieldWithEndContentStyles,
  );

  return (
    <HeroUITextField className={textFieldRootStyles} {...rest}>
      {label && <Label className={textFieldLabelStyles}>{label}</Label>}
      <div className={textFieldWrapperStyles}>
        {startIcon && (
          <Icon
            name={startIcon}
            size={20}
            className={textFieldStartIconStyles}
          />
        )}
        {isMultiline ? (
          <TextArea
            rows={rows}
            placeholder={placeholder}
            autoCapitalize={autoCapitalize}
            className={controlClassName}
          />
        ) : (
          <Input
            placeholder={placeholder}
            autoComplete={autoComplete}
            autoCapitalize={autoCapitalize}
            className={controlClassName}
          />
        )}
        {endContent && (
          <span className={textFieldEndContentStyles}>{endContent}</span>
        )}
      </div>
      {description && (
        <Description className={textFieldDescriptionStyles}>
          {description}
        </Description>
      )}
      <FieldError className={textFieldErrorStyles}>{errorMessage}</FieldError>
    </HeroUITextField>
  );
};

TextField.displayName = `TextField`;

export default TextField;
