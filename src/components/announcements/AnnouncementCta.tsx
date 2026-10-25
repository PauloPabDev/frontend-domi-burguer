"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnouncementCta as Cta } from "@/types/announcements";

/** Los enlaces que empiezan con "/" son de la propia app; el resto se abre en otra pestaña. */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

interface AnnouncementCtaProps {
  cta: Cta;
  onClick?: () => void;
  className?: string;
}

export function AnnouncementCtaButton({ cta, onClick, className }: AnnouncementCtaProps) {
  if (isInternalHref(cta.href)) {
    return (
      <Link href={cta.href} onClick={onClick} className="inline-block">
        <Button size="sm" className={className}>
          {cta.label}
        </Button>
      </Link>
    );
  }

  return (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" onClick={onClick} className="inline-block">
      <Button size="sm" className={className} rightIcon={<ExternalLink />}>
        {cta.label}
      </Button>
    </a>
  );
}
