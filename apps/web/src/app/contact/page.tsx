"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Users2,
} from "lucide-react";

import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    state: "FCT - Abuja",
    role: "Farmer / Cooperative",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased transition-colors flex flex-col justify-between">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-stone-200 dark:border-stone-900 bg-stone-50/60 dark:bg-black/60 py-16 px-5 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-5">
              <Sparkles className="size-3.5" />
              <span>Get in Touch with CCSA</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl text-stone-900 dark:text-white leading-[1.1]">
              Partner with Zora & Cosmopolitan University Abuja
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Whether you represent a farming cooperative, state agricultural ministry, donor agency, or research
              institution, our team is ready to assist your regional deployment.
            </p>
          </div>
        </section>

        {/* Contact Form & Campus Information Grid */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Contact Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-6 sm:p-10 shadow-xs">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                      Message Sent to CCSA Team
                    </h3>
                    <p className="max-w-md mx-auto text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      Thank you for contacting the Centre for Climate-Smart Agriculture. Our project team and
                      extension specialists will review your inquiry and follow up within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          organization: "",
                          state: "FCT - Abuja",
                          role: "Farmer / Cooperative",
                          subject: "",
                          message: "",
                        });
                      }}
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white transition"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-stone-900 dark:text-white">
                        Send a Message
                      </h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        Fill in your details below and a member of our agricultural intelligence team will reach out.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Full Name <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ibrahim Danladi"
                          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Work / Personal Email <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ibrahim@example.com"
                          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Phone / WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+234 800 000 0000"
                          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Organization / Cooperative
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="e.g. Kano Farmers Cooperative"
                          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          State in Nigeria
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                        >
                          {NIGERIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          Your Role / Interest
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                        >
                          <option value="Farmer / Cooperative">Farmer / Cooperative Leader</option>
                          <option value="Extension Agent">Agricultural Extension Officer</option>
                          <option value="Researcher / Academic">Academic / Student Researcher</option>
                          <option value="Government / Ministry">Ministry of Agriculture</option>
                          <option value="Donor / NGO">Development Partner / NGO</option>
                          <option value="Other">Other Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Subject <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Deploying Zora Voice Assistant for 500 Maize Farmers"
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Message Details <span className="text-emerald-600">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your farm, cooperative size, dialects required, or specific partnership objectives..."
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 py-3 text-sm font-bold text-white shadow-xs transition active:scale-98 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Sending message...</span>
                      ) : (
                        <>
                          <Send className="size-4" />
                          <span>Submit Inquiry to CCSA</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Campus & Institutional Details (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Institution Card */}
              <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  <Building2 className="size-4" />
                  <span>Physical Presence</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    Centre for Climate-Smart Agriculture (CCSA)
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Cosmopolitan University Abuja
                  </p>
                </div>

                <div className="space-y-4 pt-2 text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-200">Campus Address</p>
                      <p className="mt-0.5 leading-relaxed">
                        Cosmopolitan University Abuja Campus,
                        <br />
                        Federal Capital Territory (FCT), Abuja, Nigeria.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-200">Email Inquiries</p>
                      <a
                        href="mailto:ccsa@cosmopolitan.edu.ng"
                        className="mt-0.5 block text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        ccsa@cosmopolitan.edu.ng
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-200">Working Hours</p>
                      <p className="mt-0.5">
                        Monday – Friday: 8:00 AM – 5:00 PM (WAT)
                        <br />
                        AI Voice Services: 24/7 Online
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cooperative Partnership Callout */}
              <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  <Users2 className="size-4" />
                  <span>Farmer Cooperatives</span>
                </div>
                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  Field Deployments & Community Hubs
                </h4>
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                  Are you managing a community of 50+ farmers? We configure dedicated localized knowledge bases,
                  cooperative dashboards, and solar-powered voice access nodes for off-grid communities.
                </p>
                <div className="pt-2">
                  <Link
                    href="/request-access"
                    className="inline-flex items-center text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
                  >
                    <span>Request cooperative access token →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
