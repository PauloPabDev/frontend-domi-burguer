import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

// Foto secundaria (pequeña) del producto: siempre completa, centrada y sin superposiciones.
export const ProductImage = ({ src, alt, className = "w-24 h-24", sizes = "96px" }: ProductImageProps) => (
  <div className={`relative shrink-0 bg-accent-yellow-40 rounded-[7.66px] overflow-hidden ${className}`}>
    <Image src={src} alt={alt} fill sizes={sizes} className="object-contain p-1" />
  </div>
);
