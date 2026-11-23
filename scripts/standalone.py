"""Bundle an archived playtest into one offline HTML file."""
import argparse
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent


def build(version, output, page_name="index.html"):
    if not re.fullmatch(r"v\d{2,}", version):
        raise ValueError("Use a version name such as v07.")
    source = ROOT / "versions" / version / "dist"
    if page_name not in ("index.html", "story.html"):
        raise ValueError("Choose index.html or story.html.")
    page = (source / page_name).read_text(encoding="utf-8")
    entry = re.search(r'<script type="module" src="\./([^?"\s]+)', page).group(1)
    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm:
        raise RuntimeError("npm is required to bundle the archived JavaScript.")
    result = subprocess.run(
        [npm, "exec", "--yes", "--package=esbuild@0.28.1", "--", "esbuild", entry,
         "--bundle", "--format=iife", "--legal-comments=inline"],
        cwd=source, capture_output=True, check=True,
    )
    javascript = result.stdout.decode("utf-8")
    if re.search(r"</script", javascript, re.IGNORECASE):
        raise ValueError("The bundle contains an inline script terminator.")
    page = re.sub(
        r'<link rel="stylesheet" href="\./([^?"\s]+)(?:\?[^"]*)?">',
        lambda match: "<style>\n" + (source / match[1]).read_text(encoding="utf-8") + "\n</style>",
        page,
    )
    page = re.sub(r'<script type="module" src="[^"]+"></script>',
                  lambda match: "<script>\n" + javascript + "\n</script>", page)
    page = re.sub(r'<a class="legacy-link" href="/versions/[^\"]+">[^<]+</a>', '', page)
    main_file = f"Dengxia-Ouxi-{version}.html"
    story_file = f"Dengxia-Ouxi-{version}-story.html"
    page = page.replace('href="./story.html"', f'href="./{story_file}"')
    page = page.replace('href="./"', f'href="./{main_file}"')
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("x", encoding="utf-8", newline="\n") as destination:
        destination.write(page)
    print(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("version")
    parser.add_argument("output", type=Path)
    parser.add_argument("--page", choices=("index.html", "story.html"), default="index.html")
    args = parser.parse_args()
    build(args.version, args.output, args.page)
