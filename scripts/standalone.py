"""Bundle an archived playtest into one offline HTML file."""
import argparse
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent


def build(version, output):
    if not re.fullmatch(r"v\d{2,}", version):
        raise ValueError("Use a version name such as v07.")
    source = ROOT / "versions" / version / "dist"
    page = (source / "index.html").read_text(encoding="utf-8")
    npm = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm:
        raise RuntimeError("npm is required to bundle the archived JavaScript.")
    result = subprocess.run(
        [npm, "exec", "--yes", "--package=esbuild@0.28.1", "--", "esbuild", "game.js",
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
    page = re.sub(r'href="/versions/(v\d+)/"', r'href="./Dengxia-Ouxi-\1.html"', page)
    page = page.replace('class="brand" href="./"', 'class="brand" href=""')
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("x", encoding="utf-8", newline="\n") as destination:
        destination.write(page)
    print(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("version")
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    build(args.version, args.output)
