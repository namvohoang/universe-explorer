---
paths:
  - "public/media/**"
  - "CREDITS.md"
---

# Media Guidelines (images and textures)

Rules for every picture, texture map and video frame the app shows.

## Trusted sources

| Source | Where |
|---|---|
| NASA | images.nasa.gov, science.nasa.gov, jpl.nasa.gov, svs.gsfc.nasa.gov |
| Hubble, Webb | hubblesite.org, webbtelescope.org, esahubble.org, esawebb.org |
| ESA | esa.int |
| ESO | eso.org |
| NOIRLab | noirlab.edu |
| USGS Astrogeology (surface maps) | astrogeology.usgs.gov |

Anything else needs the user's approval first. Never use stock sites, wallpaper sites, social
media, search-engine thumbnails or AI-generated images.

## Licence (check per image, on its own page)

- NASA material is generally free to use, but a page can carry a third-party copyright. Read the
  credit line on the image's own page, do not assume.
- ESA, ESO, ESA/Hubble, ESA/Webb and NOIRLab publish under Creative Commons licences that require
  the credit line exactly as given (and sometimes share-alike). Record the licence stated on the page.
- Never use the NASA insignia or any agency logo, and never imply an agency endorses the app.
- Guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/

## `CREDITS.md` row (same commit as the file)

| Field | Content |
|---|---|
| File | Path under `public/media/` |
| Object | Catalogue id it shows |
| Kind | `photo`, `composite`, `false-colour`, `artist-concept`, `simulation`, `diagram` |
| Credit | Exactly as the source page gives it |
| Licence | As stated on the source page |
| Source | URL of the image's page (not the bare file URL) |
| Retrieved | Date |
| Changes | Crop, resize, format conversion, or "none" |

Do not add a row for an image whose page you have not opened and read.

## Honesty about what a picture is

- `Kind` is shown to the kid for anything that is not a plain photo: "Artist's drawing",
  "Colours added by scientists", "Computer simulation".
- No real photo exists of most exoplanets or of a black hole's surroundings up close: use the
  agency's artist's concept and label it. Never pass it off as a photo.
- Texture maps wrapped on a 3D body come from real mission maps. If part of a map is filled in or
  interpolated (unimaged regions), say so in `Changes`.
- Do not recolour, composite or retouch an image so that it shows something that is not there.

## Files

- Stored in the repo and served by the app; never hotlinked from an agency site.
- Web-sized (AVIF or WebP with a fallback), with the original source recorded.
- Every image has alt text that describes what is shown in words a child understands.
