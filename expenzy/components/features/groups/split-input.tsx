import { Input } from '@/components/ui/input';

interface SplitInputProps {
    type: 'amount' | 'percentage' | 'shares';
    value: string;
    onChange: (value: string) => void;
    calculatedAmount?: string;
}

export function SplitInput({ type, value, onChange, calculatedAmount }: SplitInputProps) {
    return (
        <div className="flex items-center gap-2">
            {type === 'percentage' && (
                <div className="flex items-center gap-1">
                    <Input
                        type="number"
                        placeholder="0"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-20 text-right"
                        min="0"
                        max="100"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                </div>
            )}
            {type === 'amount' && (
                <Input
                    type="number"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-24 text-right"
                    min="0"
                    step="0.01"
                />
            )}
            {type === 'shares' && (
                <Input
                    type="number"
                    placeholder="1"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-20 text-right"
                    min="0"
                    step="0.1"
                />
            )}
            {calculatedAmount && (
                <span className="text-sm font-medium min-w-[60px] text-right">
                    ₹{calculatedAmount}
                </span>
            )}
        </div>
    );
}
