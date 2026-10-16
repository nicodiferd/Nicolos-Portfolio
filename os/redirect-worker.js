// Takedown Worker for os.nicolod.org (NicoOS is archived).
// Every request, whatever its path, method or query, gets a 301 to the main site root.
// Deploy with: cd os && npx --yes wrangler@4.115.0 deploy -c wrangler.redirect.jsonc
// Roll back to NicoOS with: cd os && npm run build && npx --yes wrangler@4.115.0 deploy

const TARGET = "https://nicolod.org/";

export default {
  async fetch() {
    return new Response(null, {
      status: 301,
      headers: {
        Location: TARGET,
        "Cache-Control": "public, max-age=86400",
        "X-Robots-Tag": "noindex",
      },
    });
  },
};
