"use client"
import { motion } from "framer-motion";
import { ArrowRight } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Package, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useEffect, useState } from 'react'
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animations";



export default function Home() {

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className={`bg-white py-4 px-4 md:px-6 lg:px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : ''}`}>
        <nav className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/box3-diag.png" alt="BOX3 Logo" width={50} height={50} />
            <span className="text-2xl font-bold">SupraTag</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button className="bg-primary text-background hover:bg-primarydark">Get Started</Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-4">
                  <a href="#features" className="hover:text-primary transition-colors">Features</a>
                  <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
                  <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-black text-white min-h-screen flex items-center">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Secure, Smart,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
                Decentralized
              </span>{" "}
              Deliveries
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
            SupraTag revolutionizes package delivery with blockchain technology, smart contracts, and AI-powered
              verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button className="bg-red-600 text-white hover:bg-red-700 text-lg px-8 py-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105">
                  Start Secure Deliveries
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 ease-in-out"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-red-700 rounded-3xl transform rotate-3"></div>
            <Image
              src="/box3.webp"
              alt="SupraTag Smart Delivery"
              width={600}
              height={600}
              className="rounded-3xl shadow-2xl relative z-10 transform -rotate-3 transition-all duration-300 hover:rotate-0"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 md:px-6 lg:px-8 bg-black text-white">
        <div className="container mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Shield className="h-12 w-12 text-red-500" />,
                title: "Blockchain Security",
                description: "Leverage the power of blockchain for tamper-proof package tracking and secure payments.",
              },
              {
                icon: <Zap className="h-12 w-12 text-red-500" />,
                title: "AI-Powered Verification",
                description: "Our SmartBox uses machine learning to verify package dimensions and authenticity.",
              },
              {
                icon: <Package className="h-12 w-12 text-red-500" />,
                title: "Decentralized Delivery",
                description: "Cut out intermediaries and enjoy a truly peer-to-peer delivery experience.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-900 p-8 rounded-2xl shadow-2xl hover:shadow-red-500/20 transition-all duration-300 ease-in-out"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section
        id="how-it-works"
        className="py-24 px-4 md:px-6 lg:px-8 bg-white"
      >
        <div className="container mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            How SupraTag Works
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <ol className="space-y-8">
                {[
                  {
                    title: "Place Your Order",
                    description:
                      "Buy products through our platform using cryptocurrency. Payments are held securely in smart contracts.",
                  },
                  {
                    title: "Package Preparation",
                    description: "Retailers prepare your package, uploading metadata to the blockchain.",
                  },
                  {
                    title: "Smart Delivery",
                    description:
                      "Our AI-powered SmartBox verifies the package, records the delivery, and securely stores your item.",
                  },
                  {
                    title: "Secure Retrieval",
                    description:
                      "Use your RFID key to unlock the SmartBox and retrieve your package, automatically confirming delivery on the blockchain.",
                  },
                ].map((step, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 text-lg font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-900">{step.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl shadow-red-500/50"
            >
              <Image
                src="/arch-diag.jpeg"
                alt="SupraTag SmartBox Illustration"
                width={800}
                height={600}
                objectFit="cover"
                className="rounded-2xl p-2"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 md:px-6 lg:px-8 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="opacity-10"
          />
        </div>
        <motion.div
          className="container mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
            Ready to Revolutionize Your Deliveries?
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-gray-400">
            Join the SupraTag network and experience the future of secure, decentralized package delivery.
          </p>
          <Link href="/login">
            <Button className="bg-red-600 text-white hover:bg-red-700 text-lg px-8 py-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <motion.p
            className="font-semibold text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            &copy; 2025 SupraTag. All rights reserved.
          </motion.p>
          <motion.div
            className="flex space-x-6 mt-6 md:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {[
              {
                href: "#",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                ),
              },
              {
                href: "#",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                ),
              },
              {
                href: "#",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                ),
              },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="text-gray-400 hover:text-red-500 transition-colors duration-300"
              >
                {social.icon}
              </a>
            ))}
          </motion.div>
        </div>
      </footer>
    </main>
  );
}

