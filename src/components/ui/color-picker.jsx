'use client';

import React, { forwardRef, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import { useForwardedRef } from '@/lib/use-forwarded-ref';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

const ColorPicker = forwardRef(({
  disabled, value, onChange, onBlur, name, className, ...props
}, forwardedRef) => {
  const ref = useForwardedRef(forwardedRef);
  const [open, setOpen] = useState(false);

  const parsedValue = useMemo(() => {
    return value || '#FFFFFF';
  }, [value]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
        <Button
          {...props}
          className={cn('block', className)}
          name={name}
          onClick={() => setOpen(true)}
          size="icon"
          style={{ backgroundColor: parsedValue }}
          variant="outline"
        >
          <div />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full" style={{ pointerEvents: "auto" }}>
        <HexColorPicker color={parsedValue} onChange={onChange} />
        <Input
          maxLength={7}
          onChange={(e) => onChange(e.currentTarget.value)}
          ref={ref}
          value={parsedValue}
        />
      </PopoverContent>
    </Popover>
  );
});

ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };
