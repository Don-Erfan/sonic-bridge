'use client';
import React, {
  ComponentProps,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Calendar,
  DateField,
  DatePicker,
  Description,
  FieldError,
  I18nProvider,
  Label,
  TimeField,
  type TimeValue,
} from '@heroui/react';
import { uiText } from '@/config';
import {
  formatJalaliDateTime,
  fromJalaliDateTime,
  JALALI_LOCALE,
  toJalaliDateTime,
  toLocalTime,
  withLocalTime,
} from '@/lib/jalali';
import { IDateTimePickerProps } from './interface';
import {
  dateTimePickerDescriptionStyles,
  dateTimePickerErrorStyles,
  dateTimePickerGroupStyles,
  dateTimePickerInputStyles,
  dateTimePickerLabelStyles,
  dateTimePickerNavButtonStyles,
  dateTimePickerPopoverStyles,
  dateTimePickerRootStyles,
  dateTimePickerSegmentStyles,
  dateTimePickerSuffixStyles,
  dateTimePickerTimeLabelStyles,
  dateTimePickerTimeRowStyles,
} from './classes';

type TTrackSegment = (type: string, isPlaceholder: boolean) => void;

type TDateSegment = ComponentProps<typeof DateField.Segment>[`segment`];

/**
 * A date segment that reports whether it is empty. React Aria keeps the last
 * complete value while a segment is cleared (it waits for the field to be
 * complete), so emptiness is the only sign that the field no longer shows a
 * whole date.
 */
const TrackedSegment: FC<{
  segment: TDateSegment;
  onTrack: TTrackSegment;
  className: string;
}> = ({ segment, onTrack, className }) => {
  const { type, isPlaceholder, isEditable } = segment;
  useEffect(() => {
    if (!isEditable) return undefined;
    onTrack(type, isPlaceholder);
    return () => onTrack(type, false);
  }, [type, isPlaceholder, isEditable, onTrack]);
  // ICU's Persian pattern separates date and time with a Latin comma.
  const shown =
    type === `literal`
      ? { ...segment, text: segment.text.replace(`,`, `،`) }
      : segment;
  return <DateField.Segment segment={shown} className={className} />;
};

/**
 * Date-and-time picker on the Jalali calendar — HeroUI `DatePicker` (typed
 * segments plus a calendar popover with a time field), in the soft-UI well.
 *
 * Values are Unix milliseconds in local (office) time; `jalali-moment`
 * converts them to and from the picker's Jalali dates (`@/lib/jalali`).
 * Minute precision, 24-hour clock, Persian digits.
 *
 * @example
 * <DateTimePicker label="شروع" value={startsAt} onChange={setStartsAt} />
 */
export const DateTimePicker: FC<IDateTimePickerProps> = ({
  label,
  value,
  onChange,
  description,
  errorMessage,
  isInvalid,
  isRequired,
  isDisabled,
  onIncompleteChange,
}) => {
  // Editable segments now showing a placeholder (cleared or not yet typed).
  const [emptySegments, setEmptySegments] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const trackSegment = useCallback<TTrackSegment>((type, isPlaceholder) => {
    setEmptySegments((current) => {
      if (current.has(type) === isPlaceholder) return current;
      const next = new Set(current);
      if (isPlaceholder) next.add(type);
      else next.delete(type);
      return next;
    });
  }, []);
  const isIncomplete = emptySegments.size > 0;
  useEffect(() => {
    onIncompleteChange?.(isIncomplete);
  }, [isIncomplete, onIncompleteChange]);

  // Rebuilt only when the instant changes, so React Aria keeps its state.
  const pickerValue = useMemo(
    () => (value === null ? null : toJalaliDateTime(value)),
    [value],
  );
  // The popover's time field is controlled from the same instant (stable per
  // value). Bound to the picker's own `state.timeValue` instead — a new object
  // on every render — it re-renders forever on the Persian calendar.
  const timeValue = useMemo(
    () => (value === null ? null : toLocalTime(value)),
    [value],
  );
  const handleTimeChange = (time: TimeValue | null) => {
    if (time && value !== null) {
      onChange(withLocalTime(value, time.hour, time.minute));
    }
  };
  // The summary follows the value, so it is hidden while the field shows an
  // unfinished date (the value is then the last complete one).
  const helper =
    description ??
    (value === null || isIncomplete ? undefined : formatJalaliDateTime(value));

  return (
    <I18nProvider locale={JALALI_LOCALE}>
      <DatePicker
        className={dateTimePickerRootStyles}
        value={pickerValue}
        onChange={(next) => onChange(fromJalaliDateTime(next))}
        granularity="minute"
        hourCycle={24}
        hideTimeZone
        shouldForceLeadingZeros
        isInvalid={isInvalid}
        isRequired={isRequired}
        isDisabled={isDisabled}
      >
        <>
          <Label className={dateTimePickerLabelStyles}>{label}</Label>
          <DateField.Group fullWidth className={dateTimePickerGroupStyles}>
            <DateField.Input className={dateTimePickerInputStyles}>
              {(segment) => (
                <TrackedSegment
                  segment={segment}
                  onTrack={trackSegment}
                  className={dateTimePickerSegmentStyles}
                />
              )}
            </DateField.Input>
            <DateField.Suffix className={dateTimePickerSuffixStyles}>
              <DatePicker.Trigger aria-label={uiText.dateTimePicker.open}>
                <DatePicker.TriggerIndicator />
              </DatePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          {helper && !isInvalid && (
            <Description className={dateTimePickerDescriptionStyles}>
              {helper}
            </Description>
          )}
          <FieldError className={dateTimePickerErrorStyles}>
            {errorMessage}
          </FieldError>
          <DatePicker.Popover className={dateTimePickerPopoverStyles}>
            <Calendar aria-label={label}>
              <Calendar.Header>
                <Calendar.YearPickerTrigger>
                  <Calendar.YearPickerTriggerHeading />
                  <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton
                  slot="previous"
                  aria-label={uiText.dateTimePicker.previousMonth}
                  className={dateTimePickerNavButtonStyles}
                />
                <Calendar.NavButton
                  slot="next"
                  aria-label={uiText.dateTimePicker.nextMonth}
                  className={dateTimePickerNavButtonStyles}
                />
              </Calendar.Header>
              <Calendar.Grid weekdayStyle="narrow">
                <Calendar.GridHeader>
                  {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>
                  {(date) => <Calendar.Cell date={date} />}
                </Calendar.GridBody>
              </Calendar.Grid>
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </Calendar>
            <div className={dateTimePickerTimeRowStyles}>
              <span className={dateTimePickerTimeLabelStyles}>
                {uiText.dateTimePicker.time}
              </span>
              <TimeField
                aria-label={uiText.dateTimePicker.time}
                granularity="minute"
                hourCycle={24}
                hideTimeZone
                shouldForceLeadingZeros
                value={timeValue}
                onChange={handleTimeChange}
                isDisabled={isDisabled || value === null}
              >
                <TimeField.Group variant="secondary">
                  <TimeField.Input className={dateTimePickerInputStyles}>
                    {(segment) => (
                      <TimeField.Segment
                        segment={segment}
                        className={dateTimePickerSegmentStyles}
                      />
                    )}
                  </TimeField.Input>
                </TimeField.Group>
              </TimeField>
            </div>
          </DatePicker.Popover>
        </>
      </DatePicker>
    </I18nProvider>
  );
};

DateTimePicker.displayName = `DateTimePicker`;

export default DateTimePicker;
