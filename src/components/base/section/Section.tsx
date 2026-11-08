import React, { FC } from 'react';
import Link from 'next/link';
import { Icon } from '@/icons';
import { ISectionProps } from './interface';

/**
 * Page section: a heading row (with an optional "see all" link) and content,
 * exposed as a labelled region.
 *
 * @example
 * <Section id="upcoming" title="رویدادهای پیش رو" action={{ label: `مشاهده همه`, href: `/events` }}>…</Section>
 */
export const Section: FC<ISectionProps> = ({ id, title, children, action }) => {
  const headingId = `${id}-title`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 id={headingId} className="typo-h3 text-fg-primary">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-0.5 rounded-12 px-2 py-1 typo-s2 text-accent-fg outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {action.label}
            <Icon name="chevron-right" size={16} className="rtl:-scale-x-100" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
};

Section.displayName = `Section`;

export default Section;
