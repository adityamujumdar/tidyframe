# Changelog

All notable changes to TidyFrame will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2025-10-16

### Fixed - CRITICAL
- **Client IP Detection**: Fixed critical bug where backend used nginx container IP (172.x.x.x) instead of real client IP
  - All anonymous users were sharing the same IP quota (first user exhausted 5 parses, blocking everyone else)
  - Security breach: users could potentially access each other's jobs via IP matching
  - Created centralized `get_client_ip()` utility that reads X-Forwarded-For headers from nginx reverse proxy
  - Updated 9 backend files to use the new utility (files/router.py, dependencies.py, all middleware, auth routers)
  - Added extensive IP detection logging for production debugging

### Fixed - Anonymous Processing
- **ProcessingStatus Race Condition**: Fixed Refresh button calling wrong fetch function for anonymous users
  - Now correctly calls `fetchSingleJob()` for anonymous users vs `fetchJobs()` for authenticated
  - Prevents 403 errors and improves stability for anonymous processing flow

### Added - Anonymous User UX
- **Column Selector Hidden**: Anonymous users no longer see custom column name selector
  - Enforces default column detection ('name' or 'parse_string') for simplicity
  - Reduces confusion for trial users
- **Download Tier Notice**: Added clear notice for anonymous users explaining parsed-only downloads
  - Shows 8 essential fields included (entity type, name components, company, trust, confidence)
  - Links to registration for full data access
- **Download Button Clarity**: Button text now reads "Download Parsed Results" for anonymous users vs "Download Results" for authenticated

### Technical Improvements
- **IP Utility**: New `/backend/app/utils/client_ip.py` provides centralized IP extraction with proper fallbacks
  - Priority order: X-Forwarded-For → X-Real-IP → direct connection (dev fallback)
  - Comprehensive logging for debugging production IP detection
- **Code Deduplication**: Removed duplicate `_get_client_ip()` methods from middleware files
- **Anonymous Flow Hardening**: Better error handling and navigation guards for anonymous processing

### Impact
- **Anonymous Processing Restored**: Each anonymous user now gets their own 5-parse quota
- **Security Hardened**: Users can no longer access each other's jobs via shared IP
- **Better UX**: Clear communication about free tier limitations and upgrade path

## [1.2.1] - 2025-10-16

### Fixed
- CI/CD pipeline workflows to work with actual infrastructure
- Removed non-existent test scripts from CI workflow (test:unit, test:integration, test:e2e)
- Deployment environment variable handling (FRONTEND_URL, ENABLE_SITE_PASSWORD)
- .env file line ending issues causing variable parsing failures
- Site password protection disabled for public production access

### Added
- Placeholder npm scripts for future test implementation
- SSH-based CD workflow with health checks and rollback capability
- Security audit step in CI workflow (npm audit)
- TypeScript type checking in CI workflow

### Changed
- Simplified CI workflow to focus on TypeScript, linting, and builds
- CD workflow now uses pragmatic single-server SSH deployment
- Frontend npm scripts reorganized with proper test placeholders

### Infrastructure
- **Production Deployment**: v1.2.0 responsive design live at tidyframe.com
- Fixed FRONTEND_URL configuration for Stripe redirect handling
- Optimized docker-compose restart process for zero-downtime updates

## [1.2.0] - 2025-10-16

### Added
- **Ultrawide Display Support**: Added 3xl breakpoint (2560px) for 27"+ monitors and ultrawide displays
- **Responsive Touch Targets**: Mobile buttons now meet Apple HIG 44px minimum touch target
- **Progressive Typography Scaling**: Hero text scales from 36px (mobile) → 120px (ultrawide)
- **Enhanced Card System**: Cards now have semantic shadow tokens (card → dropdown on hover)
- **Theme-Aware Hover States**: All interactive elements have proper light/dark mode hover visibility
- **Responsive Utilities**: Global CSS utilities for touch-friendly interfaces and ultrawide constraints

### Changed
- **Landing Page Hero**: Progressive text scaling across 7 breakpoints (text-4xl → text-[7.5rem])
- **Stats Section**: Responsive padding (p-6 → p-8 → p-10 → p-12) and mobile-centered layout
- **Pricing Toggle**: Theme-aware hover states with better visibility in dark mode
- **Features Grid**: Progressive column layout (1 → 2 → 3 → 4 → 5) instead of jumping from 2 to 5
- **File Upload**: Responsive dropzone padding and icon sizing for mobile devices
- **Navbar**: Mobile-first responsive layout with condensed text on small screens
- **Business Count**: Updated from "1000+ businesses" to "multiple businesses"
- **Card Borders**: Theme-aware border highlights on hover (primary/20 in light, primary/30 in dark)

### Fixed
- **Dark Mode Dropdown**: Increased hover background opacity for better visibility
- **Touch Target Accessibility**: All buttons meet 44px minimum on mobile devices
- **Ultrawide Content**: Constrained max-width to 1920px to prevent over-stretching
- **Dropdown Menu**: Lighter hover backgrounds in dark mode (muted-foreground/20)
- **Pricing Cards**: Progressive responsive breakpoints prevent cramping on tablets
- **Mobile Navigation**: Proper responsive spacing and button sizing

### Technical Improvements
- **Tailwind Config**: Added ultrawide (1920px) and comfortable (1440px) max-width utilities
- **Breakpoint System**: Consistent responsive patterns across all components
- **CSS Architecture**: Mobile-first approach with progressive enhancement
- **Shadow System**: Semantic shadow tokens using Tailwind's design system
- **Retina Optimization**: Font smoothing for high-DPI displays
- **Tablet Optimizations**: Specific breakpoint handling for 768px-1024px range

### Performance
- Production build size optimized with proper code splitting
- All responsive utilities use Tailwind's JIT compiler for minimal CSS
- No additional bundle size increase from responsive improvements

## [1.1.0] - 2025-10-13

### Added
- Two-tier download system for anonymous users
- Anonymous upload navigation improvements

### Changed
- Updated hero text messaging

### Fixed
- Stripe production redirect URLs
- Sidebar opacity for brand consistency
- Static file serving for catch-all routes

---

## Version History

- **1.2.0** (2025-10-16): Responsive design overhaul - mobile to ultrawide
- **1.1.0** (2025-10-13): Anonymous user improvements
- **1.0.0** (Initial Release): Core TidyFrame functionality
