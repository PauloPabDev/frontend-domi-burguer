import Link from 'next/link';
import { LogoDesktop, LogoMobile } from '@/components/ui/icons';

interface NavPillLogoProps {
  href: string;
}

export const NavPillLogo: React.FC<NavPillLogoProps> = ({ href }) => (
  <div className="flex flex-col w-[72px] md:w-[130px] h-14 items-center justify-center shrink-0">
    <div className="hidden md:block w-[106px] h-14">
      <Link href={href} className="focus:outline-0! focus:ring-0!">
        <LogoDesktop height={58} width={106} />
      </Link>
    </div>
    <div className="block md:hidden">
      <Link href={href}>
        <LogoMobile width={28} height={40} />
      </Link>
    </div>
  </div>
);
