import type { ReactNode } from "react";

type Block =
  | { type: "h2" | "h3"; text: string; id: string }
  | { type: "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "paragraph"; text: string };

export type ArticleHeading = { id: string; text: string; level: 2 | 3 };

function headingId(text: string, seen: Map<string, number>): string {
  const base = text
    .toLocaleLowerCase()
    .replace(/[*_`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "") || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const seen = new Map<string, number>();
  let index = 0;

  while (index < lines.length) {
    const raw = lines[index].trim();
    if (!raw) {
      index += 1;
      continue;
    }
    if (raw.startsWith("## ") || raw.startsWith("### ")) {
      const type = raw.startsWith("### ") ? "h3" : "h2";
      const text = raw.replace(/^###?\s+/, "");
      blocks.push({ type, text, id: headingId(text, seen) });
      index += 1;
      continue;
    }
    if (raw.startsWith("> ")) {
      blocks.push({ type: "quote", text: raw.slice(2).trim() });
      index += 1;
      continue;
    }
    if (/^[-*]\s+/.test(raw)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\.\s+/.test(raw)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph = [raw];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (/^(#{2,3}\s|>\s|[-*]\s|\d+\.\s)/.test(next)) break;
      paragraph.push(next);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\))/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)$/);
    if (link) {
      const external = link[2].startsWith("http");
      return (
        <a
          key={index}
          href={link[2]}
          {...(external ? { rel: "noopener noreferrer" } : {})}
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

export function articleHeadings(markdown: string): ArticleHeading[] {
  return parseBlocks(markdown)
    .filter((block): block is Extract<Block, { type: "h2" | "h3" }> =>
      block.type === "h2" || block.type === "h3",
    )
    .map((block) => ({
      id: block.id,
      text: block.text,
      level: block.type === "h2" ? 2 : 3,
    }));
}

export function ArticleMarkdown({ content }: { content: string }) {
  return (
    <div className="article-prose">
      {parseBlocks(content).map((block, index) => {
        if (block.type === "h2") {
          return <h2 id={block.id} key={block.id}>{inline(block.text)}</h2>;
        }
        if (block.type === "h3") {
          return <h3 id={block.id} key={block.id}>{inline(block.text)}</h3>;
        }
        if (block.type === "quote") {
          return <blockquote key={index}>{inline(block.text)}</blockquote>;
        }
        if (block.type === "ul") {
          return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}</ul>;
        }
        if (block.type === "ol") {
          return <ol key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}</ol>;
        }
        if (block.type === "paragraph") {
          return <p key={index}>{inline(block.text)}</p>;
        }
        return null;
      })}
    </div>
  );
}
