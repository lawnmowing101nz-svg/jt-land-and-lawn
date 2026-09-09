// Send every *.pages.dev hostname (the project subdomain and any preview
// deployment) to the live custom domain with a 301, so search engines only
// ever index jtlandandlawn.com and link equity lands on the real site.
const CANONICAL_HOST = "jtlandandlawn.com";

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname.endsWith(".pages.dev")) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
