# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is the GitHub profile repository for `blowmuffin` (Ayush Kasare). The `README.md` renders directly on the GitHub profile page at github.com/blowmuffin.

## Structure

- `README.md` — the profile page content (HTML/Markdown mix rendered by GitHub)
- `.github/workflows/snake.yml` — GitHub Actions workflow that generates the contribution snake animation
- `gif/` — static assets used in the profile
- `output` branch (remote only) — where the snake SVGs are deployed by CI; not present locally

## Snake Animation Workflow

The workflow (`snake.yml`) runs daily at midnight UTC, on every push to `main`, and on manual dispatch. It:
1. Uses `Platane/snk@v3` to generate three animation variants into `dist/`
2. Force-pushes `dist/` to the `output` branch via `peaceiris/actions-gh-pages@v4`

The README references the dark SVG directly from the `output` branch:
```
https://raw.githubusercontent.com/blowmuffin/blowmuffin/output/github-snake-dark.svg
```

To trigger a fresh animation manually: go to Actions → "GitHub Snake Game" → Run workflow.
