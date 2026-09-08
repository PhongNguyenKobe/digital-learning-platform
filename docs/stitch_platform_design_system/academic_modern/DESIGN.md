---
name: Academic Modern
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#444653'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#003d27'
  on-tertiary: '#ffffff'
  tertiary-container: '#00563a'
  on-tertiary-container: '#3fd298'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4.5rem
  gutter-desktop: 1.5rem
  gutter-mobile: 1rem
  container-max: 80rem
---

## Brand & Style
The design system embodies academic rigor, structural order, and high-efficiency utility. Tailored for higher education students, researchers, and educators navigating dense collections of study notes, exam banks, and lecture slides, the interface prioritizes immediate findability, legibility, and institutional credibility.

Visual philosophy adheres to **Corporate Modern / Academic Utilitarianism**:
- **Clarity over ornament**: Chrome and decorative elements recede; documents, classifications, and institutional metadata remain focal.
- **Visual stability**: Strong baseline alignments, consistent card geometries, and calm, rhythmic surfaces establish deep institutional trust.
- **Multilingual resilience**: Crafted specifically with wide diacritic clearance and vertical pacing optimized for dense Vietnamese academic text strings alongside standard Latin terminology.

## Colors

The color architecture is built upon an institutional royal blue foundation, projecting academic authority and focused study environments.

### Core Functional Swatches
- **Primary (`#1E40AF`)**: Deep Royal Blue. Anchors primary navigation, active state indicators, dominant button fills, and institutional endorsements.
- **Secondary (`#3B82F6`)**: Cobalt Accent. Drives interactive focus states, text links, progress indicators, and active filter selections.
- **Tertiary / Success (`#10B981`)**: Emerald. Applied to verified study guides, approved submissions, peer confirmations, and positive grading metrics.
- **Warning / Alert (`#F59E0B`)**: Amber. Highlights document update notices, exam deadlines, and subscription tier indicators.
- **Surface Canvas (`#F9FAFB`)**: Cool slate white. Eliminates glare during long study sessions and provides subtle contrast against white container cards.
- **Card Surface (`#FFFFFF`)**: Pure white base for modular content sheets, search overlays, and dropdown menus.
- **Neutral Dark (`#111827`)**: Slate 900. High-contrast typography base compliant with WCAG AAA standards against white.
- **Neutral Gray (`#6B7280`)**: Secondary metadata, author attribution, download counts, and inactive tab labels.
- **Borders & Dividers (`#E5E7EB`)**: Structural hairpins maintaining separation across tightly packed document indices.

## Typography

Inter serves as the primary typographic engine, chosen for its tall x-height, neutral aperture, and robust unicode coverage accommodating tone-marked Vietnamese glyph clusters (such as `ề`, `ệ`, `ở`, `ỹ`) without clipping.

### Usage Standards
- **Line Pacing**: Set to standard-loose values (`1.5`–`1.6` ratio on body texts) to ensure zero diacritic collision across multi-line Vietnamese abstracts.
- **Headings (`headline-xl`, `headline-lg`)**: Strictly configured with subtle negative letter-spacing for compact headline locks in catalogs and document headers.
- **Labels & Tags (`label-md`, `label-sm`)**: Used for course codes (e.g., `MAT101`), file extensions (e.g., `PDF`, `DOCX`), and verification badges. Configured with slight positive tracking to ensure fast scanning.

## Layout & Spacing

The layout is grounded in an explicit 8pt baseline rhythm, scaling to a fluid 12-column fixed-max system (`1280px` maximum viewport constraint).

### Layout Specifications
- **Desktop (1024px and up)**: 12-column grid, `24px` (`1.5rem`) gutters, and dynamic margins capping the inner canvas at `1280px` (`80rem`). Two primary column archetypes dominate:
  - *Browse & Search Viewports*: 3-column sticky sidebar (facets/filters) + 9-column document feed.
  - *Document Detail Viewports*: 8-column reading pane + 4-column metadata/related index.
- **Tablet (768px - 1023px)**: 8-column layout, `16px` gutters. Facet sidebars collapse into a horizontal scrolling chip row or off-canvas bottom drawer.
- **Mobile (below 768px)**: 4-column layout, `16px` gutter, edge padding fixed at `16px`. Dense document cards span all 4 columns in single-stack orientation.

## Elevation & Depth

Visual hierarchy leverages crisp outline discipline paired with shallow, neutral-tinted drop shadows, avoiding heavy contrast distractions.

### Elevation Levels
- **Level 0 (Flat Canvas)**: Used on `#F9FAFB` base background.
- **Level 1 (Card & Content Surface)**: Default state for academic cards, filter panels, and inputs. Defined by a structural border `1px solid #E5E7EB` combined with a soft resting shadow: `box-shadow: 0 1px 3px 0 rgba(17, 24, 39, 0.05), 0 1px 2px 0 rgba(17, 24, 39, 0.03)`.
- **Level 2 (Interactive Hover & Flyout)**: Triggered on card focus/hover and secondary tooltips. `box-shadow: 0 4px 6px -1px rgba(17, 24, 39, 0.08), 0 2px 4px -1px rgba(17, 24, 39, 0.04); border-color: #D1D5DB;`.
- **Level 3 (Header Sticky & Mega-Menu Drawers)**: For floating universal search dropdowns, active university selection menus, and the fixed top app bar. `box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.08), 0 4px 6px -2px rgba(17, 24, 39, 0.03)`.
- **Level 4 (Modal & Document Fullscreen Previews)**: Overlay sheets and confirmation dialogues. `box-shadow: 0 20px 25px -5px rgba(17, 24, 39, 0.12), 0 10px 10px -5px rgba(17, 24, 39, 0.04)`.

## Shapes

The geometric framework is categorized as **Level 2 (Rounded)**:
- **Card and Modal Containers**: Fixed at `12px` (`0.75rem`), introducing an approachable, modern feel while keeping corners tight enough to maintain efficient grid packing.
- **Buttons and Inputs**: Standardized at `8px` (`0.5rem`) for compact UI control density.
- **Badges, Status Flags & Category Chips**: Completely pill-shaped (`9999px`) to create clear semantic differentiation from rectangular document thumbnails and interactive input boxes.

## Components

### 1. Universal Academic Header
- **Layout**: Fixed top bar (`height: 72px`), background `#FFFFFF`, bottom border `1px solid #E5E7EB`.
- **Left**: Brand lockup paired with an institutional Mega-Menu trigger button ("Trường đại học & Môn học") styled with subtle borders and chevron indicators.
- **Center**: High-efficiency global search bar spanning flexible `440px` to `640px`. Features quick filter tokens (e.g., "Tất cả", "Đề thi", "Giáo trình") pinned inside the leading edge of the input, with shortcut keys (`Cmd + K`) right-aligned.
- **Right Action Suite**:
  - Secondary utility links (e.g., "Thư viện của tôi").
  - Primary CTA button: "Tải lên tài liệu" featuring an explicit cloud-upload icon.
  - User profile menu trigger: Circular avatar (`36px`) with emerald activity indicator.

### 2. Academic Document Cards
- **Dimensions & Geometry**: White background, `12px` border radius, `1px solid #E5E7EB`, internal padding `16px`.
- **Thumbnail Section**: Aspect ratio 4:3 document snapshot at top or leading side, rendered with subtle inner border, page-count pill bottom-right (e.g., "24 trang").
- **Header & Tags**: University tag (`label-sm`, e.g., "ĐH Bách Khoa TP.HCM") in `#1E40AF` soft background pill (`#EFF6FF`). Verified emerald badge icon for curated materials.
- **Title**: 2-line clamped `headline-sm` (`#111827`), transitioning to `#3B82F6` on card hover.
- **Footer**: Metadata row featuring subject code, academic year, rating score (`#F59E0B` star icon), and download counters.

### 3. Buttons
- **Primary**: Solid `#1E40AF`, text `#FFFFFF`, hover `#1D4ED8`, height `40px` (desktop), padding `0 16px`, `8px` radius.
- **Secondary**: Surface `#EFF6FF`, text `#1E40AF`, hover `#DBEAFE`, border `1px solid transparent`.
- **Outline**: Background transparent, border `1px solid #E5E7EB`, text `#111827`, hover background `#F9FAFB`.

### 4. Input Fields & Search
- **Default State**: Height `42px`, border `1px solid #E5E7EB`, text `#111827`, placeholder `#6B7280`.
- **Focus State**: Border color `#3B82F6`, dual-ring focus outline `0 0 0 3px rgba(59, 130, 246, 0.15)`.

### 5. Chips & Category Filters
- **Filter Chip**: Height `32px`, pill radius (`9999px`), padding `0 12px`. Inactive: `#F3F4F6` with `#4B5563` text. Active: `#1E40AF` background with `#FFFFFF` text.

### 6. Verification & Notification Badges
- **Verified Document Badge**: Emerald fill `#ECFDF5`, text `#065F46`, stroke `#A7F3D0`, containing a miniature shield checkmark icon.
- **Exam Alert Badge**: Amber fill `#FFFBEB`, text `#92400E`, stroke `#FDE68A`.