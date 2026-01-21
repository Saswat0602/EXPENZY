# Frontend Integration Guide - Keyword Matcher with Icons

## ✅ What's Been Added

### 1. Category Icons (`lib/categorization/category-icons.tsx`)

Lucide React icon mappings for all 14 categories:

```typescript
import { CategoryIcon, CategoryBadge } from '@/lib/categorization/category-icons';

// Render icon
<CategoryIcon category="food" className="h-5 w-5" />

// Render badge with icon and label
<CategoryBadge category="food" />
```

**Available Icons:**
- 🍴 `food` → UtensilsCrossed (orange)
- 🛒 `groceries` → ShoppingCart (green)
- 🚗 `travel` → Car (blue)
- 🛍️ `shopping` → ShoppingBag (purple)
- 💊 `medicine` → Pill (red)
- ⚡ `bills` → Zap (yellow)
- 📺 `entertainment` → Tv (pink)
- 🏠 `housing` → Home (indigo)
- 🎓 `education` → GraduationCap (cyan)
- 💪 `fitness` → Dumbbell (emerald)
- 🛡️ `insurance` → Shield (slate)
- 📈 `investment` → TrendingUp (teal)
- 🐾 `pets` → PawPrint (amber)
- ❓ `other` → HelpCircle (gray)

### 2. Category Utils (`lib/categorization/category-utils.ts`)

Helper functions:

```typescript
import { getCategoryOptions, formatCategory } from '@/lib/categorization/category-utils';

// Get all categories for select dropdown
const options = getCategoryOptions();

// Format category name
formatCategory('food'); // "Food & Dining"
```

### 3. Keyword Matcher (`lib/categorization/keyword-matcher.ts`)

Already created - instant keyword matching:

```typescript
import { useKeywordMatcher } from '@/lib/categorization/keyword-matcher';

const { match, isReady } = useKeywordMatcher();
const category = match('paid rent'); // 'housing'
```

### 4. Complete Example (`components/examples/expense-modal-with-keywords.tsx`)

Full working example showing:
- Keyword matching as user types
- Icon-based category suggestions
- Auto-selection of suggested category
- Category select with icons and descriptions

## 🚀 How to Integrate

### Step 1: Update Your Expense Modal

```typescript
// In your existing expense modal component
import { useKeywordMatcher } from '@/lib/categorization/keyword-matcher';
import { CategoryIcon, getCategoryLabel } from '@/lib/categorization/category-icons';
import { getCategoryOptions } from '@/lib/categorization/category-utils';
import { Sparkles } from 'lucide-react';

export function AddExpenseModal() {
  const { match, isReady } = useKeywordMatcher();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

  // Match keywords as user types
  useEffect(() => {
    if (isReady && description) {
      const matched = match(description);
      setSuggestedCategory(matched);
    }
  }, [description, isReady, match]);

  return (
    <div>
      {/* Description input */}
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Paid rent, Bought groceries"
      />
      
      {/* Instant suggestion */}
      {suggestedCategory && (
        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-secondary/30">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">Suggested:</span>
          <Badge onClick={() => setCategory(suggestedCategory)}>
            <CategoryIcon category={suggestedCategory as any} className="h-3 w-3 mr-1" />
            {getCategoryLabel(suggestedCategory as any)}
          </Badge>
        </div>
      )}
      
      {/* Category select with icons */}
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger>
          <SelectValue>
            {category && (
              <div className="flex items-center gap-2">
                <CategoryIcon category={category as any} />
                {getCategoryLabel(category as any)}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {getCategoryOptions().map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                <CategoryIcon category={opt.value} />
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

### Step 2: Load Keywords on App Start

```typescript
// In app/layout.tsx or _app.tsx
import { getKeywordMatcher } from '@/lib/categorization/keyword-matcher';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Load keywords once on app start
    getKeywordMatcher().loadKeywords();
  }, []);
  
  return <html>{children}</html>;
}
```

### Step 3: Use Icons Everywhere

```typescript
// In transaction list
import { CategoryIcon } from '@/lib/categorization/category-icons';

<div className="flex items-center gap-2">
  <CategoryIcon category={expense.category} />
  <span>{expense.description}</span>
</div>

// In dashboard cards
import { CategoryBadge } from '@/lib/categorization/category-icons';

<CategoryBadge category="food" />
```

## 📊 User Experience Flow

### Before (No Suggestions)
```
User: Types "paid rent"
System: No feedback
User: Manually selects "housing" from dropdown
```

### After (With Keyword Matcher + Icons)
```
User: Types "paid"
System: No suggestion yet

User: Types "paid rent"
System: ✨ Shows "Suggested: 🏠 Housing"
User: Clicks suggestion or continues typing
System: Auto-selects "housing" category
```

## 🎨 Visual Examples

### Suggestion Badge
```tsx
<div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
  <Sparkles className="h-4 w-4 text-yellow-500" />
  <span className="text-sm text-muted-foreground">Suggested:</span>
  <Badge variant="secondary" className="cursor-pointer">
    <Home className="h-3 w-3 mr-1 text-indigo-500" />
    Housing
  </Badge>
</div>
```

### Category Select Item
```tsx
<SelectItem value="food">
  <div className="flex items-center gap-2">
    <UtensilsCrossed className="h-4 w-4 text-orange-500" />
    <div>
      <div className="font-medium">Food & Dining</div>
      <div className="text-xs text-muted-foreground">
        Restaurants, food delivery, dining out
      </div>
    </div>
  </div>
</SelectItem>
```

## 🔄 Dynamic Updates

Users can add custom keywords:

```typescript
// Add custom keyword via API
await fetch('/api/categorization/keywords', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'food',
    keyword: 'my favorite restaurant'
  })
});

// Reload keywords in frontend
const matcher = getKeywordMatcher();
await matcher.reload();

// Now matches
matcher.match('my favorite restaurant'); // 'food'
```

## ✅ Checklist

- [x] Category icons created (Lucide React)
- [x] Category utils created
- [x] Keyword matcher created
- [x] Example component created
- [ ] Update expense modal
- [ ] Update income modal
- [ ] Load keywords on app start
- [ ] Test instant suggestions
- [ ] Update transaction list to show icons
- [ ] Update dashboard to show icons

## 🎯 Next Steps

1. **Integrate into modals**: Update your existing expense/income modals
2. **App initialization**: Load keywords on app start
3. **Replace emojis**: Use `CategoryIcon` component everywhere
4. **Test UX**: Verify instant suggestions work
5. **Train ML model**: Complete the backend ML training

See `components/examples/expense-modal-with-keywords.tsx` for complete working example!
