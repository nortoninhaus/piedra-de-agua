#!/usr/bin/env python3
"""
Build script for Piedra de Agua – produces fully self-contained HTML files
for GoHighLevel (GHL) embedding.

Output:
  dist/
    ├── *.html          (CSS + JS inlined, image paths → media/filename)
    └── media/          (flat folder of all referenced images, ready to upload to GHL)
"""
import os
import re
import shutil
from urllib.parse import unquote

SOURCE_DIR = "/Users/nicolasnorton/Documents/Piedra de Agua"
DIST_DIR = os.path.join(SOURCE_DIR, "dist")
MEDIA_DIR = os.path.join(DIST_DIR, "media")

# Once you upload the media/ folder to GHL, set this to the GHL media base URL.
# Example: "https://storage.googleapis.com/msgsndr/XXXXXX/media/"
# Leave empty to use relative "media/" paths (works for local testing).
GHL_MEDIA_BASE_URL = ""


def ensure_dirs():
    """Create dist/ and dist/media/ directories."""
    for d in [DIST_DIR, MEDIA_DIR]:
        if not os.path.exists(d):
            os.makedirs(d)


def resolve_local_path(src_attr, html_dir):
    """Resolve a relative src attribute to an absolute filesystem path."""
    decoded = unquote(src_attr)
    if decoded.startswith(("http://", "https://", "data:", "//", "#", "mailto:")):
        return None
    abs_path = os.path.normpath(os.path.join(html_dir, decoded))
    if os.path.isfile(abs_path):
        return abs_path
    return None


def copy_to_media(abs_path, seen_files):
    """
    Copy a file to the media/ folder with a clean filename.
    Returns the new filename. Handles duplicates by appending a counter.
    """
    basename = os.path.basename(abs_path)
    # Clean up the filename (remove duplicate suffixes like " (1)")
    basename = re.sub(r'\s*\(\d+\)\s*', '', basename)
    # Replace spaces with hyphens for cleaner URLs
    basename = basename.replace(' ', '-')

    if abs_path in seen_files:
        return seen_files[abs_path]

    # Handle name collisions
    final_name = basename
    counter = 1
    while os.path.exists(os.path.join(MEDIA_DIR, final_name)):
        # Check if it's the same file
        existing = os.path.join(MEDIA_DIR, final_name)
        if os.path.getsize(existing) == os.path.getsize(abs_path):
            seen_files[abs_path] = final_name
            return final_name
        name, ext = os.path.splitext(basename)
        final_name = f"{name}-{counter}{ext}"
        counter += 1

    shutil.copy2(abs_path, os.path.join(MEDIA_DIR, final_name))
    seen_files[abs_path] = final_name
    return final_name


def rewrite_image_paths(content, html_dir, seen_files):
    """Rewrite all local src= paths to media/ folder paths."""
    img_extensions = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico")

    def replace_src(match):
        prefix = match.group(1)
        src_val = match.group(2)
        suffix = match.group(3)

        abs_path = resolve_local_path(src_val, html_dir)
        if abs_path and os.path.splitext(abs_path)[1].lower() in img_extensions:
            media_name = copy_to_media(abs_path, seen_files)
            base_url = GHL_MEDIA_BASE_URL if GHL_MEDIA_BASE_URL else "media/"
            new_src = f"{base_url}{media_name}"
            print(f"  ✓ {os.path.basename(abs_path)} → media/{media_name}")
            return f"{prefix}{new_src}{suffix}"
        return match.group(0)

    pattern = r'''(src\s*=\s*["'])((?:(?!["']).)+)(["'])'''
    return re.sub(pattern, replace_src, content)


def build_project():
    ensure_dirs()

    # Read core assets
    css_path = os.path.join(SOURCE_DIR, "index.css")
    js_path = os.path.join(SOURCE_DIR, "main.js")

    if not os.path.exists(css_path):
        print(f"Error: index.css not found at {css_path}")
        return
    if not os.path.exists(js_path):
        print(f"Error: main.js not found at {js_path}")
        return

    with open(css_path, "r", encoding="utf-8") as f:
        core_css = f.read()
    with open(js_path, "r", encoding="utf-8") as f:
        core_js = f.read()

    style_block = f"<style>\n/* CORE DESIGN SYSTEM STYLES */\n{core_css}\n</style>"
    script_block = f"<script>\n/* CORE UTILITY SCRIPTS */\n{core_js}\n</script>"

    html_files = [f for f in os.listdir(SOURCE_DIR)
                  if f.endswith(".html") and f != "template.html"]

    print(f"Found {len(html_files)} HTML pages to compile...")
    if GHL_MEDIA_BASE_URL:
        print(f"GHL Media Base URL: {GHL_MEDIA_BASE_URL}")
    else:
        print("Using relative media/ paths (set GHL_MEDIA_BASE_URL for production)")
    print()

    # Track files already copied to avoid duplicates
    seen_files = {}

    for filename in html_files:
        print(f"── {filename}")
        filepath = os.path.join(SOURCE_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Inline CSS
        content = re.sub(
            r'<link\s+rel=["\']stylesheet["\']\s+href=["\']index\.css["\']\s*/?>',
            lambda m: style_block, content
        )

        # 2. Inline JS
        content = re.sub(
            r'<script\s+src=["\']main\.js["\']\s*></script>',
            lambda m: script_block, content
        )

        # 3. Rewrite image src paths to media/ folder
        content = rewrite_image_paths(content, SOURCE_DIR, seen_files)

        # Write compiled HTML
        dist_path = os.path.join(DIST_DIR, filename)
        with open(dist_path, "w", encoding="utf-8") as f:
            f.write(content)

        size_kb = os.path.getsize(dist_path) / 1024
        print(f"   → dist/{filename} ({size_kb:.0f} KB)\n")

    # Summary
    media_count = len(os.listdir(MEDIA_DIR))
    media_size = sum(os.path.getsize(os.path.join(MEDIA_DIR, f))
                     for f in os.listdir(MEDIA_DIR)) / (1024 * 1024)
    print(f"✅ Build complete!")
    print(f"   {len(html_files)} HTML files → dist/")
    print(f"   {media_count} media files → dist/media/ ({media_size:.1f} MB total)")
    print(f"\n📁 Upload dist/media/ to GHL Media Library,")
    print(f"   then set GHL_MEDIA_BASE_URL in build.py and rebuild.")


if __name__ == "__main__":
    build_project()
