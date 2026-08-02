"""Local preview server for the JT Land and Lawn static site.

Serves public/ the way Cloudflare Pages does, so the nav links work:
  /about   ->  public/about.html
  anything missing  ->  public/404.html with a real 404 status

Usage:  python serve.py [port]
"""

import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5310


class PagesHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.path = self._clean_url(self.path)
        return super().send_head()

    def _clean_url(self, path):
        parts = urlsplit(path)
        # Directories and real filenames (.css, .webp, …) are already fine.
        if parts.path.endswith("/") or os.path.splitext(parts.path)[1]:
            return path
        if not os.path.isfile(os.path.join(ROOT, parts.path.lstrip("/") + ".html")):
            return path
        tail = ("?" + parts.query if parts.query else "")
        return parts.path + ".html" + tail

    def send_error(self, code, message=None, explain=None):
        page = os.path.join(ROOT, "404.html")
        if code != 404 or not os.path.isfile(page):
            return super().send_error(code, message, explain)
        with open(page, "rb") as fh:
            body = fh.read()
        self.send_response(404, message)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Connection", "close")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)


if __name__ == "__main__":
    print("Serving %s at http://localhost:%d" % (ROOT, PORT), flush=True)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), partial(PagesHandler, directory=ROOT))
    server.serve_forever()
