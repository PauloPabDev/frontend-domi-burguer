"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LogoDesktopWhite,
  WhatsAppIcon,
  InstagramIcon,
} from "./ui/icons";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  const clickCount = useRef(0);
  const yearClickCount = useRef(0);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [showDesignLink, setShowDesignLink] = useState(false);

  const handleYearClick = () => {
    yearClickCount.current += 1;
    if (yearClickCount.current >= 10) {
      yearClickCount.current = 0;
      setShowAdminLink(true);
    }
  };

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (clickCount.current >= 10) {
      clickCount.current = 0;
      setShowDesignLink(true);
    }
  };

  const navigationLinks = [
    { name: "COBERTURA", link: "/cobertura" },
    { name: "MENU", link: "/#products" },
    { name: "HORARIOS", link: "/horarios" },
    { name: "CÓDIGOS", link: "/codes" },
  ];

  const legalLinks = [
    { name: "TÉRMINOS DE SERVICIO", link: "/legal#terminos" },
    { name: "POLÍTICAS DE PRIVACIDAD", link: "/legal#politicas" },
  ];

  return (
    <footer className="flex flex-col w-full items-start relative text-accent-yellow-10">
      <Image
        className="relative self-stretch w-full hidden md:block"
        alt="Sec"
        src="/footerDesktop.png"
        width={1920}
        height={500}
        priority
      />
      <Image
        className="relative self-stretch w-full md:hidden"
        alt="Sec"
        src="/footerMobile.png"
        width={500}
        height={700}
        priority
      />
      <div className=" lg:items-start relative flex flex-col lg:flex-row justify-between px-6 py-16 lg:p-16 lg:px-10 lg:space-x-3 lg:20 self-stretch w-full bg-primary-red border-b border-solid border-[#fff9e6] h-[522px] lg:h-auto">
        <div
          className="relative lg:w-[170px] h-[90px] flex items-center justify-center w-full cursor-pointer"
          onClick={handleLogoClick}
        >
          <LogoDesktopWhite
            width={170}
            height={90}
            className="min-h-20 min-w-40"
          />
        </div>

        <nav className="inline-flex flex-col items-start gap-2 relative">
          {navigationLinks.map((link) => (
            <Link
              key={link.link}
              href={link.link}
              data-umami-event="footer_link_clicked"
              data-umami-event-link={link.name}
              className={`relative self-stretch font-semibold text-accentmikado-10 text-lg tracking-[0] leading-6 h-auto p-0 hover:bg-transparent`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href={`https://wa.me/573506186772?text=${encodeURIComponent("¡Hola! me gustaria contratar sus servicios para un evento😊")}`}
            target="_blank"
            rel="noopener noreferrer"
            data-umami-event="footer_events_whatsapp_clicked"
            className="relative self-stretch font-semibold text-accentmikado-10 text-lg tracking-[0] leading-6 h-auto p-0 hover:bg-transparent flex items-center gap-2"
          >
            PEDIDOS PARA EVENTOS
          </Link>
        </nav>

        <nav className="inline-flex flex-col items-end gap-2 relative">
          {legalLinks.map((legal) => (
            <Link
              key={legal.link}
              href={legal.link}
              data-umami-event="footer_legal_clicked"
              data-umami-event-link={legal.name}
              className={`relative self-stretch font-semibold text-accentmikado-10 text-lg tracking-[0] leading-6 h-auto p-0 hover:bg-transparent`}
            >
              {legal.name}
            </Link>
          ))}
        </nav>

        <div className="flex lg:w-[394px] w-full items-center gap-3 justify-center">
          <Link
            href="https://www.instagram.com/domiburguer_"
            target="_blank"
            rel="noopener noreferrer"
            data-umami-event="footer_instagram_clicked"
            className="focus:outline-0! focus:ring-0!"
          >
            <Button variant="yellow" size="icon-lg">
              <InstagramIcon />
            </Button>
          </Link>
          <Link
            href={`https://wa.me/573506186772?text=${encodeURIComponent("Hola, estaba en la pagina de Domi Burger y quiero más información")}`}
            target="_blank"
            rel="noopener noreferrer"
            data-umami-event="footer_whatsapp_clicked"
            className="focus:outline-0! focus:ring-0!"
          >
            <Button
              variant="yellow"
              size="lg"
              rightIcon={<WhatsAppIcon />}
              className="text-black"
            >
              CONTÁCTANOS
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row h-[90px] items-center justify-between px-20 py-4 relative self-stretch w-full bg-primary-red">
        <div className="items-start flex-1 grow flex justify-end gap-2 relative">
          <div
            className="relative w-fit mt-[-1.00px] font-semibold text-base tracking-[0] leading-5 whitespace-nowrap cursor-default select-none"
            onClick={handleYearClick}
          >
            2025, Todos los derechos reservados
          </div>
          {showAdminLink && (
            <Link
              href="/db-status"
              className="relative w-fit mt-[-1.00px] font-semibold text-base tracking-[0] leading-5 whitespace-nowrap opacity-40 hover:opacity-100 transition-opacity"
            >
              ⚙
            </Link>
          )}
          {showDesignLink && (
            <Link
              href="/design/buttons"
              className="relative w-fit mt-[-1.00px] font-semibold text-base tracking-[0] leading-5 whitespace-nowrap opacity-40 hover:opacity-100 transition-opacity"
            >
              🎨
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};
