# Interactive preview

`index.html` is the self-contained preview of the store published at
https://claude.ai/artifact/PLtvQAU1f73zfXy4s2AwyT (shop, product pages, cart,
checkout and a demo admin dashboard; data is kept in the viewer's browser only).

It loads its images from `img/`. To run it locally, copy the placeholder images next to it:

```bash
mkdir -p store/preview/img && cp store/public/placeholders/*.webp store/preview/img/
npx serve store/preview
```
