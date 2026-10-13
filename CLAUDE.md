# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is the GitHub profile repository for `blowmuffin` (Ayush Kasare). The `README.md` renders directly on the GitHub profile page at github.com/blowmuffin. There is no build system, test suite, or application code.

## Structure

- `README.md` — the profile page content (HTML/Markdown mix rendered by GitHub)
- `.github/workflows/snake.yml` — GitHub Actions workflow that generates the contribution snake animation
- `gif/github_profile.gif` — source copy of the profile banner; the README shows an uploaded `github.com/user-attachments/...` copy instead, so editing this file alone does not change the profile (keep it for re-uploads)
- `output` branch (remote only) — where the snake SVGs/GIF are deployed by CI; not checked out locally

## Snake Animation Workflow

The workflow (`snake.yml`) runs daily at midnight UTC, on every push to `main`, and on manual dispatch. It:
1. Uses `Platane/snk@v3` to generate three animation variants into `dist/`
2. Force-pushes `dist/` to the `output` branch via `peaceiris/actions-gh-pages@v4` (`force_orphan: true`, so the `output` branch keeps no history)

The README uses only the dark SVG, directly from the `output` branch:
```
https://raw.githubusercontent.com/blowmuffin/blowmuffin/output/github-snake-dark.svg
```
Dark-only is deliberate (a `<picture>` light/dark switch was reverted in 09669a2). Keep generating `github-snake.svg` and `ocean.gif`; links outside this repo may use their raw URLs.

To trigger a fresh animation manually: `gh workflow run snake.yml` (follow with `gh run watch`), or Actions → "GitHub Snake Game" → Run workflow.

## Notes

- Every push to `main` goes live on the profile and reruns the snake workflow, so preview README changes first with GitHub's real renderer: `gh api markdown -f mode=gfm -f context=blowmuffin/blowmuffin -F text=@README.md` (or the web editor's Preview tab). The sanitizer drops `<style>`/`<script>` but keeps attributes like `align`, `width`, `height`, and `<picture>`/`<source media srcset>`.
- LinkedIn returns HTTP 999 to requests from CI/datacenter IPs, so rendering LinkedIn's official badge in a GitHub Action failed and was removed (d46b74c). A static `img.shields.io` LinkedIn link badge never contacts LinkedIn and works fine.
