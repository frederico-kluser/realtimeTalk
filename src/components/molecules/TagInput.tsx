import { useState, type KeyboardEvent } from 'react';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import type { InputHTMLAttributes } from 'react';

type BadgeColor = 'indigo' | 'green' | 'red';

interface TagInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  badgeColor?: BadgeColor;
  borderColor?: 'default' | 'green' | 'red';
}

export function TagInput({
  tags,
  onTagsChange,
  badgeColor = 'indigo',
  borderColor = 'default',
  ...inputProps
}: TagInputProps) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onTagsChange([...tags, value.trim()]);
      setValue('');
    }
  };

  const handleRemove = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        borderColor={borderColor}
        {...inputProps}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <Badge key={i} label={tag} color={badgeColor} onRemove={() => handleRemove(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
