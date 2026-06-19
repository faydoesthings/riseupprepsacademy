import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    value: "+92 300 123 4567",
    href: "tel:+923001234567",
    accent: "#4A9EE8",
  },
  {
    id: "email",
    icon: Mail,
    title: "Email",
    value: "info@riseuppreps.com",
    href: "mailto:info@riseuppreps.com",
    accent: "#4A9EE8",
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with our team",
    href: "https://wa.me/923001234567",
    external: true,
    accent: "#0ABFBC",
  },
  {
    id: "hours",
    icon: Clock,
    title: "Office hours",
    value: "Mon – Sat · 8:00 AM – 2:00 PM",
    accent: "#F78C1F",
  },
];

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
