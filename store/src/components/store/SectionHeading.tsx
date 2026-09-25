import Link from "next/link";
import { Reveal } from "./Reveal";

export function SectionHeading({ eyebrow, title, link }: { eyebrow: string; title: string; link?: { href: string; label: string } }) {
  return (
    <Reveal className="mb-10 flex items-end justify-between gap-6 md:mb-14">
      <div>
        <p className="eyebrow text-brass-soft">{eyebrow}</p>
        <h2 className="display mt-3 text-[clamp(2.4rem,5.5vw,4.5rem)]">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="eyebrow shrink-0 border-b border-paper/30 pb-1 text-paper/80 transition hover:border-paper hover:text-paper">
          {link.label}
        </Link>
      )}
    </Reveal>
  );
}
