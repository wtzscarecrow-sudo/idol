"""Serve the current build and immutable local playtest snapshots."""
import argparse
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
import shutil
import tempfile
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
VERSION = re.compile(r"v\d{2,}")


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT / "dist", **kwargs)

    def translate_path(self, path):
        parts = unquote(urlsplit(path).path).strip("/").split("/")
        if parts[0] != "versions":
            return super().translate_path(path)
        invalid = str(ROOT / "dist" / "_invalid_version_")
        if len(parts) < 2 or not VERSION.fullmatch(parts[1]):
            return invalid
        base = (ROOT / "versions" / parts[1] / "dist").resolve()
        asset = base.joinpath(*parts[2:]).resolve()
        if not asset.is_relative_to(base):
            return invalid
        return str(asset) + ("/" if urlsplit(path).path.endswith("/") else "")

    def list_directory(self, path):
        self.send_error(404)
        return None


def backup(version):
    if not VERSION.fullmatch(version):
        raise ValueError("Use version names such as v04.")
    versions = ROOT / "versions"
    versions.mkdir(exist_ok=True)
    target = versions / version
    if target.exists():
        raise FileExistsError(f"Snapshot already exists: {target}")
    with tempfile.TemporaryDirectory(prefix=".snapshot-", dir=versions) as temporary:
        folder = Path(temporary) / version
        shutil.copytree(ROOT / "dist", folder / "dist")
        for document in ("DESIGN.md", "VERSIONS.md"):
            if (ROOT / document).is_file():
                shutil.copy2(ROOT / document, folder / document)
        files = sorted(part for part in folder.rglob("*") if part.is_file())
        hashes = []
        for path in files:
            relative = path.relative_to(folder)
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest != hashlib.sha256((ROOT / relative).read_bytes()).hexdigest():
                raise OSError(f"Snapshot verification failed: {relative}")
            hashes.append(f"{digest}  {relative.as_posix()}")
        (folder / "SHA256SUMS.txt").write_text("\n".join(hashes) + "\n", encoding="utf-8")
        folder.rename(target)
    print(f"{version}: {len(files)} files verified at {target}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=43181)
    parser.add_argument("--backup", metavar="VERSION")
    args = parser.parse_args()
    if args.backup:
        backup(args.backup)
    else:
        with ThreadingHTTPServer(("127.0.0.1", args.port), SiteHandler) as server:
            print(f"Serving at http://127.0.0.1:{args.port}/", flush=True)
            server.serve_forever()
