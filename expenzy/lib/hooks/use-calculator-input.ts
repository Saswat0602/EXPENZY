import { useState, useMemo } from 'react';

interface CalculatorResult {
    displayValue: string;
    calculatedValue: number | null;
    isExpression: boolean;
}

export function useCalculatorInput(initialValue: string = ''): {
    value: string;
    result: CalculatorResult;
    setValue: (value: string) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} {
    const [value, setValue] = useState(initialValue);

    // Calculate result using useMemo to avoid setState in effect
    const result = useMemo<CalculatorResult>(() => {
        if (!value || value.trim() === '') {
            return {
                displayValue: '',
                calculatedValue: null,
                isExpression: false,
            };
        }

        // Check if the input contains operators
        const hasOperators = /[+\-*/()]/.test(value);

        if (!hasOperators) {
            // Simple number, no calculation needed
            const numValue = parseFloat(value);
            return {
                displayValue: value,
                calculatedValue: isNaN(numValue) ? null : numValue,
                isExpression: false,
            };
        }

        // Try to evaluate the expression
        try {
            const func = new Function('return ' + value);
            const calculated = func();

            if (typeof calculated === 'number' && !isNaN(calculated)) {
                return {
                    displayValue: value,
                    calculatedValue: calculated,
                    isExpression: true,
                };
            } else {
                return {
                    displayValue: value,
                    calculatedValue: null,
                    isExpression: false,
                };
            }
        } catch {
            // Invalid expression
            return {
                displayValue: value,
                calculatedValue: null,
                isExpression: false,
            };
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    return {
        value,
        result,
        setValue,
        handleChange,
    };
}
