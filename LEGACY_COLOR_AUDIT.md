# Legacy Color Usage Audit & Replacement Mapping

## Current Legacy Colors in tailwind.config.ts
```typescript
// Legacy colors for backward compatibility (will be removed gradually)
lamaSky: "#C3EBFA",
lamaSkyLight: "#EDF9FD", 
lamaPurple: "#CFCEFF",
lamaPurpleLight: "#F1F0FF",
lamaYellow: "#FAE27C",
lamaYellowLight: "#FEFCE8",
```

## Comprehensive Usage Audit

### Files Using Legacy Colors:

#### 1. Authentication Pages
- **src/app/(auth)/sign-in/page.tsx**
  - `bg-lamaSkyLight` (background)
  - `focus:ring-lamaPurple` (focus rings)
  - `text-lamaPurple` (text color)
  - `bg-lamaPurple` (button background)
  - `hover:text-lamaPurpleLight` (hover states)

#### 2. Dashboard Pages
- **src/app/(dashboard)/list/attendance/page.tsx**
  - `bg-lamaYellow` (icon backgrounds, buttons)
  
- **src/app/(dashboard)/list/students/[id]/page.tsx**
  - `bg-lamaSky` (main info card background)
  - `bg-lamaSkyLight` (info cards)
  - `bg-lamaPurpleLight` (info cards)
  - `bg-lamaYellowLight` (info cards)

- **src/app/(dashboard)/list/teachers/[id]/page.tsx**
  - `bg-lamaSky` (main info card background)
  - `bg-lamaSkyLight` (info cards)
  - `bg-lamaPurpleLight` (info cards)
  - `bg-lamaYellowLight` (info cards)

#### 3. System Pages
- **src/app/logout/page.tsx**
  - `bg-lamaSkyLight` (background)
  
- **src/app/loading.tsx**
  - `bg-lamaSkyLight` (background)
  
- **src/app/not-found.tsx**
  - `bg-lamaSkyLight` (background)

#### 4. Components
- **src/components/ErrorBoundary.tsx**
  - `bg-lamaSkyLight` (error page background)

- **src/components/AuditLogViewer.tsx**
  - `border-lamaPurple` (loading spinner)
  - `focus:ring-lamaPurple` (form inputs)
  - `text-lamaPurple` (expandable details)
  - `hover:text-lamaPurpleLight` (hover states)

- **src/components/CountChartContainer.tsx**
  - `bg-lamaSky` (boys chart indicator)
  - `bg-lamaYellow` (girls chart indicator)

- **src/components/EventList.tsx**
  - `border-t-lamaSky` (odd event borders)
  - `border-t-lamaPurple` (even event borders)

- **src/components/MessagingSystem.tsx**
  - `hover:bg-lamaPurpleLight` (message row hover)

## Replacement Mapping Strategy

### Color Mapping Based on Context and Semantics:

#### Background Colors (Light variants for page/card backgrounds):
- `lamaSkyLight` → `primary-50` (very light blue background)
- `lamaPurpleLight` → `secondary-100` (light neutral background)
- `lamaYellowLight` → `warning-50` (very light yellow background)

#### Accent/Border Colors (Medium variants for visual elements):
- `lamaSky` → `primary-200` (light blue accent)
- `lamaPurple` → `primary-300` (medium blue accent) 
- `lamaYellow` → `warning-300` (yellow accent)

#### Interactive States:
- Focus rings: `focus:ring-lamaPurple` → `focus:ring-primary-500`
- Hover states: `hover:bg-lamaPurpleLight` → `hover:bg-primary-100`
- Button backgrounds: `bg-lamaPurple` → `bg-primary-500`

#### Semantic Context Considerations:
- **Chart indicators**: Keep distinct colors but use design system
  - Boys (lamaSky) → `primary-400` 
  - Girls (lamaYellow) → `accent-400`
- **Status indicators**: Use semantic colors
  - Warning/attention → `warning-*` scale
  - Information → `primary-*` scale
  - Neutral → `secondary-*` scale

## Implementation Priority:

### Phase 1: Critical UI Elements
1. Authentication pages (sign-in)
2. Error boundaries and system pages
3. Main dashboard components

### Phase 2: Detail Pages
1. Student detail pages
2. Teacher detail pages
3. Attendance pages

### Phase 3: Secondary Components
1. Messaging system
2. Event lists
3. Chart components

## Next Steps:
1. ✅ **COMPLETED**: Audit legacy color usage
2. 🔄 **IN PROGRESS**: Update component color props
3. ⏳ **PENDING**: Update CSS classes
4. ⏳ **PENDING**: Remove legacy color definitions
