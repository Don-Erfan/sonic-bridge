import { useState } from 'react';

/**
 * State of a sheet that edits one record: which record (`null` = new), open
 * or not, and a key that changes on every opening so the form inside starts
 * from the record again. The record stays set while the sheet animates
 * closed, so its content does not vanish mid-animation.
 */
export const useSheetSession = <TItem>() => {
  const [item, setItem] = useState<TItem | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const open = (next: TItem | null) => {
    setItem(next);
    setSessionKey((key) => key + 1);
    setOpen(true);
  };

  return { item, isOpen, sessionKey, open, onOpenChange: setOpen };
};
