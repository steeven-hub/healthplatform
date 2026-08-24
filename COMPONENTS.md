# AfriHealth Component Library Documentation

## Overview
This document provides a comprehensive guide to the AfriHealth UI Component Library built from the Figma design system.

**Figma Design**: [AfriHealth - Digital Health Platform](https://figma.com/make/ffoVyI5hwM087ET2kgUjk8/AfriHealth-Digital-Health-Platform?fullscreen=1&t=nQ7UfAI1KAi5Ct21-1&code-node-id=0-9)

---

## Components

### Button
A flexible button component with multiple variants and sizes.

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`  
**Sizes**: `sm`, `md`, `lg`

```typescript
import { Button } from '@/components';

// Basic usage
<Button>Click me</Button>

// With variant and size
<Button variant="secondary" size="lg">
  Action
</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

---

### Card
A flexible container component for grouping related content.

**Subcomponents**:
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components';

<Card>
  <CardHeader>
    <CardTitle>Patient Information</CardTitle>
    <CardDescription>View and manage patient details</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content goes here */}
  </CardContent>
</Card>
```

---

### Input
An accessible form input component with built-in focus states.

```typescript
import { Input } from '@/components';

<Input 
  type="email" 
  placeholder="Enter your email"
  required
/>
```

---

### Label
A form label component with support for required field indicators.

```typescript
import { Label, Input } from '@/components';

<div>
  <Label htmlFor="email" required>
    Email Address
  </Label>
  <Input id="email" type="email" />
</div>
```

---

### Badge
A small label component for displaying status or tags.

**Variants**: `default`, `success`, `warning`, `error`, `info`  
**Sizes**: `sm`, `md`

```typescript
import { Badge } from '@/components';

// Status badge
<Badge variant="success">Confirmed</Badge>

// Custom size
<Badge variant="warning" size="sm">Pending</Badge>
```

---

### Alert
A notification component for displaying messages or alerts.

**Variants**: `default`, `success`, `warning`, `error`, `info`

```typescript
import { Alert } from '@/components';

<Alert 
  variant="info"
  title="Information"
  description="This is an informational message"
  onClose={() => console.log('closed')}
/>
```

---

### Progress
A progress bar component for showing completion status.

**Variants**: `default`, `success`, `warning`, `error`

```typescript
import { Progress } from '@/components';

<Progress 
  value={65} 
  max={100}
  variant="success"
  showLabel
/>
```

---

### Avatar
An avatar component for displaying user profile images or initials.

**Sizes**: `sm`, `md`, `lg`

```typescript
import { Avatar } from '@/components';

// With image
<Avatar src="/avatar.jpg" alt="User" size="md" />

// With fallback
<Avatar fallback="JD" size="lg" />
```

---

## Design Tokens

Access design tokens from `src/styles/designTokens.ts`:

```typescript
import { 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  zIndex, 
  transitions, 
  breakpoints 
} from '@/styles/designTokens';

// Use in components
const theme = {
  primary: colors.primary[500],
  spacing: spacing[4],
};
```

### Token Categories

- **Colors**: Primary, Secondary, Neutral, Semantic (success, warning, error, info)
- **Typography**: Font families, sizes, weights, line heights, presets
- **Spacing**: 8px-based scale (4px to 96px)
- **Border Radius**: sm to full (0 to 9999px)
- **Shadows**: xs to 2xl (elevation levels)
- **Z-Index**: Scale for layering (hide to notification)
- **Transitions**: Durations and easing functions
- **Breakpoints**: Responsive design breakpoints (xs to 2xl)

---

## Utility Functions

### `cn()` - Merge Classes

Merge and deduplicate Tailwind CSS classes:

```typescript
import { cn } from '@/lib/utils';

const className = cn(
  'px-2 py-1 text-sm',
  isActive && 'bg-blue-600 text-white',
  'rounded-md'
);
```

---

## Usage Examples

### Form Component
```typescript
import { Card, CardContent, CardHeader, CardTitle, Label, Input, Button } from '@/components';

export function PatientForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" required>Name</Label>
            <Input id="name" placeholder="Full name" />
          </div>
          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input id="email" type="email" placeholder="Email address" />
          </div>
          <Button>Save Patient</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Status Display
```typescript
import { Card, CardContent, Badge, Progress } from '@/components';

export function AppointmentStatus() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3>Appointment Status</h3>
          <Badge variant="success">Confirmed</Badge>
        </div>
        <Progress value={75} max={100} showLabel />
      </CardContent>
    </Card>
  );
}
```

---

## Accessibility

All components are built with accessibility in mind:
- Semantic HTML elements
- ARIA labels and attributes
- Keyboard navigation support
- Focus management
- Color contrast compliance

---

## Next Steps

1. ✅ Review and test all components
2. ✅ Validate against Figma designs
3. 🔄 Create additional complex components (Navigation, Forms, Modals, Dashboard)
4. 📖 Set up Storybook for component documentation
5. 🧪 Add unit and integration tests
6. 📝 Create usage guidelines for developers

---

## Related Files

- Design Tokens: `src/styles/designTokens.ts`
- Components: `src/components/`
- Utilities: `src/lib/utils.ts`
- Figma Design: [AfriHealth Digital Health Platform](https://figma.com/make/ffoVyI5hwM087ET2kgUjk8/AfriHealth-Digital-Health-Platform)
