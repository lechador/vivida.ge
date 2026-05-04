import type { MetadataRoute } from "next";

/**
 * Web App Manifest. Renders at /manifest.webmanifest. Tells mobile
 * browsers (Chrome / Safari / Edge) what to use when "Add to Home
 * Screen" — name, icon, theme color, etc. Also a small SEO signal:
 * crawlers use it to confirm we're a real branded site.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vivida — შენი კოსმიური რუკა",
    short_name: "Vivida",
    description:
      "პერსონალური ასტროლოგია, ყოველდღიური ჰოროსკოპი და ნატალური რუკა.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0814",
    theme_color: "#0b0814",
    lang: "ka-GE",
    dir: "ltr",
    categories: ["lifestyle", "entertainment", "personalization"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
