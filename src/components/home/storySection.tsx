import { ArrowIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function StorySection() {
  return (
    <section className="flex flex-col xl:flex-row w-full items-start gap-20 py-20 relative mx-auto px-4 sm:px-6 lg:px-8">
      {/* Texto */}
      <div className="flex flex-col gap-8 flex-1 self-stretch relative max-w-[360px]">
        <h1 className="relative self-stretch mt-[-1px] text-neutral-black-80 font-bold text-[24px] leading-[25px]">
          ESTA HAMBURGUESERÍA
          <br />
          NACIÓ EN FAMILIA.
        </h1>

        <p className="relative self-stretch text-[#313131] font-montserrat font-normal text-base leading-[18px]">
          Entre risas, recetas heredadas y muchas charlas sobre la hamburguesa
          perfecta, construimos lo que hoy es nuestro orgullo. Respetamos a los
          clásicos pero le pusimos nuestra corazón, nuestro ritmo y nuestra
          salsa secreta.
        </p>

        <Link
          href="https://www.instagram.com/domiburguer_"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="max-w-[230px] h-10 pl-5 text-[#FFF9E6] font-montserrat font-bold leading-[18px] rounded-[30px] gap-3 text-start justify-start text-[15px]">
            SÍGUENOS EN REDES
            <ArrowIcon className="w-[14px] h-[14px]" />
          </Button>
        </Link>
      </div>

      {/* Imágenes */}
      <div className="w-full overflow-x-auto flex gap-6 scrollbar-hide">
        <Image
          src="/images/gallery/instagram-1.webp"
          alt="Producto de Domiburguer en Instagram"
          width={265}
          height={400}
          className="w-[265px] h-[400px] flex-shrink-0"
          sizes="265px"
        />

        <Image
          src="/images/gallery/instagram-2.webp"
          alt="Experiencia Domiburguer en Instagram"
          width={271}
          height={400}
          className="w-[271px] h-[400px] flex-shrink-0 mt-20"
          sizes="271px"
        />

        <Image
          src="/images/gallery/instagram-3.webp"
          alt="Hamburguesa Domiburguer en Instagram"
          width={258}
          height={400}
          className="w-[258px] h-[400px] flex-shrink-0"
          sizes="258px"
        />
      </div>
    </section>
  );
}
