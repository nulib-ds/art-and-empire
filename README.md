# Art & Empire

This repository holds the course companion site for **Art & Empire**, an art history digital humanities project by Dr. Yuthika Sharma in partnership with Academic Innovation at Northwestern University Libraries.

## Project Focus

- Curates high-resolution works from Northwestern's Special Collections (mica paintings, engravings, and bound documents) so students can analyze material culture beyond the physical classroom.
- Provides space for rotating exhibits authored by seminar cohorts plus references to past student projects such as _Painting the Orient_ and the _Daniells Map Project_.
- Connects class discussion to external research through related collections, links to partner institutions, and a course-wide bibliography.

## Technical Overview

- Built with the [Canopy IIIF](https://github.com/canopy-iiif/app) static site generator (`@canopy-iiif/app` v1.9.x) and React 19. Content and layouts live under `content/` as MDX files, while reusable UI pieces (timelines, hero blocks, etc.) are composed from Canopy's component library.
- IIIF collections, search defaults, and site metadata are configured in `canopy.yml`. Update manifests or branding there when introducing new exhibits.
- Assets such as custom CSS, fonts, and imagery sit in `assets/`. Build artifacts are emitted to `site/` for publication.

## Working Locally

1. Install dependencies once: `npm install`.
2. Run `npm run dev` to start the Canopy build script with hot reloading.
3. Edit MDX under `content/` or tweak IIIF sources in `canopy.yml`. Saved changes appear immediately in the development server.
4. Visit http://localhost:5001 in your browser.
