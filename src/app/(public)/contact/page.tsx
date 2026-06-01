"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Send, CheckCircle2, Clock } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main>
        <section className="relative pt-32 pb-20 min-h-screen">
          <div className="absolute inset-0 gradient-hero" />
          <div className="container-main relative z-10 flex items-center justify-center py-20">
            <div className="glass-card max-w-lg mx-auto p-8 sm:p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Message Sent!</h2>
              <p className="text-gray-600">
                Thank you for reaching out. Our team will get back to you within 24 hours.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container-main relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Get in Touch</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Have a question, want to visit our campus, or interested in partnering with us? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#0A0E1A]">
        <div className="container-main">
          <div className="grid md:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="card-elevated p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F78C1F]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#F78C1F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Our Location</h3>
                    <p className="text-sm text-gray-500 mt-1">Sukkur / Rohri, Sindh, Pakistan</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#05335C]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Phone</h3>
                    <p className="text-sm text-gray-500 mt-1">+92 300 123 4567</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">WhatsApp</h3>
                    <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer" className="text-sm text-[#F78C1F] font-medium mt-1 block hover:underline">
                      Chat with us on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Email</h3>
                    <p className="text-sm text-gray-500 mt-1">info@riseuppreps.com</p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Office Hours</h3>
                    <p className="text-sm text-gray-500 mt-1">Monday – Saturday<br />8:00 AM – 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3">
              <div className="card-elevated p-8">
                <h2 className="text-xl font-bold text-white mb-6">Send us a Message</h2>
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Your Name *</label>
                      <input type="text" required className="form-input" placeholder="Full name" />
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input type="email" required className="form-input" placeholder="email@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-input" placeholder="+92 300 1234567" />
                  </div>
                  <div>
                    <label className="form-label">Subject *</label>
                    <input type="text" required className="form-input" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea required rows={5} className="form-input resize-none" placeholder="Write your message here..." />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-full">
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-12 card-elevated overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56640.42047147098!2d68.82!3d27.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3935f5ff7c6e7b41%3A0xb45e8f2d4a93c7a!2sSukkur%2C%20Sindh%2C%20Pakistan!5e0!3m2!1sen!2s!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="RiseUp Academy Location"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
