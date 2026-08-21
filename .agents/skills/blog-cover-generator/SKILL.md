---
name: blog-cover-generator
description: Analyze VibeTechBlogs Markdown articles, generate content-specific blog cover images, convert them to WebP, and configure the article frontmatter. Use when an article needs a new or replacement cover image.
---

# Blog Cover Generator

Create a cover that communicates the article's actual subject and distinguishing idea. Content fit takes priority over matching other covers; do not impose a shared visual style across articles.

## Project contract

- Articles live only in `src/content/blog/*.md` or `.mdx`.
- Final covers live in `public/images/blog/` and use `.webp`.
- Final dimensions are exactly 860×480 pixels.
- The article frontmatter uses a public-root path such as:

  ```yaml
  image: "/images/blog/blogs_litert_performance_cover.webp"
  ```

- Do not edit `dist/`, `.astro/`, or generated theme files.
- Do not overwrite an existing image unless the user explicitly requests replacement. Choose a new descriptive filename when needed.

## Workflow

1. Resolve the target article. If the request says “latest,” compare parsed `pubDate` values in frontmatter rather than relying on filename sorting. Preserve unrelated working-tree changes.
2. Read the complete article, including frontmatter, headings, examples, conclusions, and references. Identify:
   - the central subject;
   - the article's distinctive thesis or workflow;
   - two to four concrete visual elements supported by the text;
   - concepts that should not appear because the article does not discuss them.
3. Inspect a few existing covers only to understand crop safety and site placement. Do not copy their style or force visual consistency.
4. Use the available image-generation capability to generate a raster cover. Give it a structured prompt that states the article use case, subject, scene, composition, medium, lighting, palette, and negative constraints.
5. Choose style and composition solely for content clarity. A technical pipeline may suit a schematic editorial illustration; a personal retrospective may suit a narrative scene; a product or hardware article may suit a realistic or semi-3D render.
6. Apply these text rules to every generation prompt:
   - no Chinese characters anywhere in the image;
   - prefer no text;
   - allow only a small amount of short English when it materially improves comprehension;
   - no pseudo-text, long labels, title blocks, watermarks, signatures, or logos.
7. Keep the subject legible at card-thumbnail size. Put important content inside the central 90% crop-safe area and avoid crowded infographic layouts.
8. Inspect the generated image visually. Reject or regenerate if it contains Chinese, garbled text, unsupported concepts, prominent branding, confusing anatomy or geometry, or a weak connection to the article.
9. Convert the selected source with:

   ```bash
   node .agents/skills/blog-cover-generator/scripts/convert-to-webp.mjs \
     <generated-source> \
     public/images/blog/<descriptive-name>.webp
   ```

   Add `--force` only when replacement was explicitly requested.
10. Inspect the converted WebP again and confirm it remains sharp and well framed at 860×480.
11. Add or update only the frontmatter `image` field with the `/images/blog/...` public path. Do not rewrite the article's title, description, date, category, or body unless the user also requested those changes.
12. Run `npm run build`. Report the article path, final image path, final generation prompt, generation method, and validation result.

## Prompt priorities

Use this order when tradeoffs arise:

1. Faithfulness to the full article
2. Clear visual hierarchy at thumbnail size
3. Correct absence or minimal use of text
4. Technical and semantic accuracy
5. Aesthetic polish

Do not add generic robots, glowing brains, circuit boards, Android mascots, laptops, or speed streaks merely because the article concerns software or AI. Include them only when they express a concrete idea in the article.
