import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ACADEMY_EMAIL = "riseupprepsofficial@gmail.com";
export const ACADEMY_PHONE = "+923158934941";
export const ACADEMY_PHONE_DISPLAY = "+92 315 893 4941";
export const ACADEMY_WHATSAPP_URL = "https://wa.me/923158934941";
export const ACADEMY_INSTAGRAM_URL = "https://instagram.com/riseupprepsofficial/";
export const ACADEMY_FACEBOOK_URL = "https://www.facebook.com/RiseUpPrepsAcademy/";

export const ACADEMY_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56640.42047147098!2d68.82!3d27.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3935f5ff7c6e7b41%3A0xb45e8f2d4a93c7a!2sSukkur%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1";

export const contactChannels: {
  id: string;
  icon: LucideIcon;
  title: string;
  value: string;
  href?: string;
  external?: boolean;
  accent: string;
}[] = [
  {
    id: "location",
    icon: MapPin,
    title: "Campus",
    value: "Sukkur / Rohri, Sindh, Pakistan",
    accent: "#F78C1F",
  },
  {
    id: "phone",
    icon: Phone,
    title: "Phone",
    value: ACADEMY_PHONE_DISPLAY,
    href: `tel:${ACADEMY_PHONE}`,
    accent: "#4A9EE8",
  },
  {
    id: "email",
    icon: Mail,
    title: "Email",
    value: ACADEMY_EMAIL,
    href: `mailto:${ACADEMY_EMAIL}`,
    accent: "#4A9EE8",
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with our team",
    href: ACADEMY_WHATSAPP_URL,
    external: true,
    accent: "#0ABFBC",
  },
  {
    id: "instagram",
    icon: Instagram,
    title: "Instagram",
    value: "@riseupprepsofficial",
    href: ACADEMY_INSTAGRAM_URL,
    external: true,
    accent: "#F78C1F",
  },
  {
    id: "facebook",
    icon: Facebook,
    title: "Facebook",
    value: "RiseUp Preps Academy",
    href: ACADEMY_FACEBOOK_URL,
    external: true,
    accent: "#4A9EE8",
  },
  {
    id: "hours",
    icon: Clock,
    title: "Office hours",
    value: "Mon – Sat · 8:00 AM – 2:00 PM",
    accent: "#F78C1F",
  },
];

export const academySocialLinks = [
  {
    id: "instagram",
    label: "Instagram",
    href: ACADEMY_INSTAGRAM_URL,
    icon: Instagram,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: ACADEMY_FACEBOOK_URL,
    icon: Facebook,
  },
] as const;

export const contactSubjects = [
  { value: "", label: "Select a topic" },
  { value: "General inquiry", label: "General inquiry" },
  { value: "Admissions", label: "Admissions & enrollment" },
  { value: "Campus visit", label: "Schedule a campus visit" },
  { value: "Donations", label: "Donations & sponsorship" },
  { value: "Partnership", label: "Partnership or collaboration" },
  { value: "Other", label: "Something else" },
] as const;

export const contactSubjectValues = contactSubjects
  .map((s) => s.value)
  .filter((v) => v.length > 0);
