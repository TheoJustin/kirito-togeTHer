'use client';

import Image from 'next/image';
import {
  Globe,
  MessageCircle,
  Users,
  Zap,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const mockupRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const featuresInView = useInView(featuresRef, {
    once: true,
    margin: '-100px',
  });
  const mockupInView = useInView(mockupRef, { once: true, margin: '-200px' });

  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const messages = [
    {
      name: 'Sarah Chen',
      time: '2:30 PM',
      msg: 'Piye kabare',
      trans: '🇮🇩 Bagaimana kabarmu?',
      color: 'blue',
    },
    {
      name: 'Sari Dewi',
      time: '2:31 PM',
      msg: 'Apik, mas.',
      trans: '🇮🇩 Baik, mas.',
      color: 'green',
    },
    {
      name: 'Sarah Chen',
      time: '2:32 PM',
      msg: 'Wis mangan durung?',
      trans: '🇮🇩 Sudah makan belum?',
      color: 'blue',
    },
    {
      name: 'Sari Dewi',
      time: '2:33 PM',
      msg: 'Durung, lagi sibuk kerja.',
      trans: '🇮🇩 Belum, lagi sibuk kerja.',
      color: 'green',
    },
    {
      name: 'Sarah Chen',
      time: '2:34 PM',
      msg: 'Aku ngerti, semangat ya!',
      trans: '🇮🇩 Aku tahu, semangat ya!',
      color: 'blue',
    },
  ];

  useEffect(() => {
    if (mockupInView) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [mockupInView, messages.length]);

  const features = [
    {
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      title: '50+ Languages',
      desc: 'Support for over 50 languages with accurate real-time translation powered by advanced AI',
      bg: 'bg-blue-100',
      delay: 0,
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-green-600" />,
      title: 'Live Chat Translation',
      desc: 'See both original and translated messages in real-time during your video calls',
      bg: 'bg-green-100',
      delay: 0.1,
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: 'Team Collaboration',
      desc: 'Perfect for global teams, international meetings, and cross-cultural communication',
      bg: 'bg-purple-100',
      delay: 0.2,
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      title: 'Learn Languages Fast',
      desc: 'Makes you comfortable for speaking with other languages',
      bg: 'bg-orange-100',
      delay: 0.3,
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: 'Secure & Private',
      desc: 'End-to-end encryption ensures your conversations remain private and secure',
      bg: 'bg-red-100',
      delay: 0.4,
    },
    {
      icon: <Clock className="w-8 h-8 text-indigo-600" />,
      title: '24/7 Availability',
      desc: 'Connect with your global team anytime, anywhere, without language constraints',
      bg: 'bg-indigo-100',
      delay: 0.5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full"
        />
      </div>

      <div className="container mx-auto px-4 py-24 space-y-40 relative z-10">
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          style={{ y: y1 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 mb-8 font-medium"
          >
            Introducing togeTHer
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 leading-tight"
          >
            Video chatting without any language barriers
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            togeTHer gives you an AI auto translation between any local
            languages for people to connect.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  className="cursor-pointer bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  Sign up for free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-8 py-4 rounded-xl text-lg font-medium bg-white/80 shadow-md hover:shadow-lg transition-all duration-300"
              >
                Contact us
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Video Interface Mockup */}
        <motion.div
          ref={mockupRef}
          style={{ y: y2 }}
          className="relative max-w-6xl mx-auto min-h-[600px]"
        >
          {/* Left Participant */}
          <motion.div
            initial={{ opacity: 0, x: -100, rotate: -5 }}
            animate={mockupInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute left-0 top-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
              className="w-80 h-48 bg-white rounded-2xl overflow-hidden relative shadow-2xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300"
            >
              <Image
                src="https://images.unsplash.com/photo-1706007964508-557b9d46ba88?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Sarah Chen"
                width={320}
                height={192}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
                Sarah Chen
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
              >
                ID → JV
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={mockupInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto w-96 bg-white/95 rounded-3xl shadow-2xl border border-gray-200/50 p-8 relative z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }}
                  className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center"
                >
                  <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center"
                >
                  <div className="w-4 h-4 bg-gray-500 rounded-sm"></div>
                </motion.div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-lg"
              >
                togeTHer
              </motion.div>
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <span className="text-sm text-gray-500 font-mono">14:32</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Call With Others
            </h2>

            {/* Animated Chat Messages */}
            <div className="space-y-4 h-64 overflow-hidden">
              {messages.slice(0, currentMessageIndex + 1).map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-8 h-8 bg-gradient-to-r ${
                      m.color === 'blue'
                        ? 'from-blue-500 to-blue-600'
                        : 'from-green-500 to-green-600'
                    } rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md`}
                  >
                    S
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {m.name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {m.time}
                      </span>
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg px-3 py-2"
                    >
                      {m.msg}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="text-gray-400 text-xs mt-1 italic"
                    >
                      {m.trans}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Participant */}
          <motion.div
            initial={{ opacity: 0, x: 100, rotate: 5 }}
            animate={mockupInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute right-0 top-20"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: 2,
              }}
              className="w-80 h-48 bg-white rounded-2xl overflow-hidden relative shadow-2xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300"
            >
              <Image
                src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Raj Patel"
                width={320}
                height={192}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
                Raj Patel
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 1,
                }}
                className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
              >
                ID → JV
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div ref={featuresRef} className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Break Language Barriers Instantly
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with anyone, anywhere, in any language with our AI-powered
              real-time translation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: feature.delay }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="text-center p-8 bg-white/80 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 ${feature.bg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
