# Design Guidelines: Custom ROM Device Tree Manager

## Design Approach

**Selected System**: Linear + GitHub Primer hybrid approach  
**Justification**: Developer-focused productivity tool requiring clarity, information density, and technical precision. Linear's clean aesthetic combined with GitHub's code-centric patterns provides the optimal foundation for managing device trees and build configurations.

**Core Principles**:
- Code-first clarity: All technical information easily scannable
- Efficient workflows: Minimal clicks to complete tasks
- Developer familiarity: UI patterns developers already understand

---

## Typography

**Font Families**:
- Primary: `Inter` (UI elements, headings, labels)
- Code: `JetBrains Mono` (code blocks, terminal output, file paths)

**Hierarchy**:
- Page Titles: text-2xl font-semibold
- Section Headers: text-lg font-medium  
- Body Text: text-sm font-normal
- Labels: text-xs font-medium uppercase tracking-wide
- Code Snippets: text-sm font-mono
- Inline Code/Paths: text-xs font-mono

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, and 8**
- Component padding: p-4, p-6
- Section spacing: space-y-6, gap-8
- Card padding: p-6
- Tight spacing: space-y-2, gap-4

**Grid Structure**:
- Main layout: Sidebar (280px fixed) + Content area (flex-1)
- Content max-width: max-w-7xl mx-auto
- Code editor panels: Full width within content area
- Repository cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

---

## Component Library

### Navigation
**Sidebar Navigation** (Left, fixed):
- Logo/brand at top (h-16)
- Navigation items: Clean list with icons + labels
- Active state: Subtle indicator on left edge
- Grouping: Section headers for organizing tools
- Bottom: User profile/GitHub connection status

**Top Bar**:
- Breadcrumb navigation showing current context (Device > daisy > Build Config)
- Action buttons aligned right
- Repository selector dropdown

### Core Components

**Code Editor Panel**:
- Monaco-style editor appearance
- Line numbers, syntax highlighting for shell scripts
- Toolbar: File name, Copy, Download, Format buttons
- Tabs for multiple open files
- Footer: Line/column count, file encoding

**Repository Card**:
- Repository name (font-medium, text-base)
- Description (text-sm, truncate after 2 lines)
- Metadata row: Branch tag, Last updated timestamp, Clone depth
- Action buttons: View, Edit, Clone command
- Status indicator: Synced/Modified/Error states

**Dependency Tree Visualization**:
- Hierarchical tree view with expandable nodes
- Visual connectors between dependencies
- Each node shows: Repo name, Branch, Status icon
- Color-coded by category (device, vendor, kernel, hardware)

**Build Script Generator**:
- Multi-step form with clear progress indicator
- Input fields grouped by section (Device Config, Repositories, Kernel, Recovery)
- Live preview panel showing generated script
- Validation warnings inline with inputs
- Generate & Copy to Clipboard action

**Git Command Generator**:
- Template selector dropdown
- Repository URL inputs with validation
- Branch/depth selectors
- Generated command display in code block
- One-click copy functionality

**Device Tree Validator**:
- Checklist-style results display
- Success/Warning/Error icons with messages
- Expandable sections for detailed findings
- Quick-fix suggestions where applicable
- Re-validate button

### Forms
**Input Fields**:
- Labels: text-sm font-medium mb-2
- Inputs: Clean borders, focus ring, rounded-md
- Helper text: text-xs below input
- Validation states: Border change + inline message
- File path inputs: Monospace font

**Buttons**:
- Primary: Filled with rounded-lg
- Secondary: Bordered outline
- Icon buttons: Square with icon only
- Sizes: text-sm px-4 py-2 for standard

### Data Display

**Status Badges**:
- Small rounded pills (px-2 py-1, text-xs)
- States: Success, Warning, Error, Pending
- Icon + text combination

**Tables** (for repository lists):
- Compact row height
- Alternating row backgrounds for readability
- Sticky header on scroll
- Sortable columns with indicators
- Row actions on hover

**Terminal Output**:
- Monospace font in panel
- Scrollable with max height
- Command input line distinct from output
- Color coding for errors/success

### Modals
**Dialog Pattern**:
- Centered overlay with backdrop
- Max width: max-w-2xl for forms, max-w-4xl for code preview
- Header with title + close button
- Content padding: p-6
- Footer with action buttons right-aligned

---

## Animations

**Minimal Motion**:
- Sidebar collapse/expand: 200ms ease
- Modal open/close: 150ms fade
- Hover states: Instant (no transition)
- Loading states: Subtle pulse on skeletons
- Tree expand/collapse: 200ms ease

---

## Images

**No hero image required** - This is a developer tool focused on functionality.

**Icon Usage**:
- Repository/folder icons from Heroicons
- Status indicators (check, warning, error)
- Navigation icons (settings, build, tree, code)
- File type icons in tree views

---

## Page-Specific Layouts

**Dashboard**:
- Quick stats row (Active devices, Total repos, Last sync)
- Recent activity feed
- Quick actions grid (3 columns)

**Device Tree Editor**:
- Split view: File tree (left sidebar 240px) + Editor (main)
- Tabs for open files across top of editor
- Properties panel (right, collapsible 320px)

**Repository Manager**:
- Filter/search bar at top
- Grid of repository cards below
- Bulk actions toolbar when items selected

**Build Configuration**:
- Two-column layout: Configuration form (left) + Preview (right)
- Sticky preview panel on scroll