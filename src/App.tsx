/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  ChevronRight, 
  Check, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Star, 
  Mail, 
  X, 
  Menu, 
  Twitter, 
  Instagram, 
  Youtube, 
  Send,
  Loader2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { getPredictions } from './services/aiPredictor';
import ReactMarkdown from 'react-markdown';

// --- Shared Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  pulse = false,
  ...props 
}: any) => {
  const variants = {
    primary: 'bg-green-accent text-navy-dark hover:bg-white',
    secondary: 'bg-transparent border border-white/20 text-white hover:bg-white/10',
    outline: 'border border-green-accent/50 text-green-accent hover:bg-green-accent/10'
  };

  return (
    <button 
      className={cn(
        'px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2',
        variants[variant as keyof typeof variants],
        pulse && 'animate-pulse-slow',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-12 text-center">
    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4 tracking-tight uppercase">
      {title}
    </h2>
    {subtitle && <p className="text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
    <div className="w-20 h-1 bg-green-accent mx-auto mt-6 rounded-full" />
  </div>
);

// --- Sections ---

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(86399); // 23:59:59 in seconds
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [currentSocialProof, setCurrentSocialProof] = useState(0);

  const socialProofs = [
    { name: "Ahmed from Dubai", plan: "Pro Plan", time: "2 mins ago" },
    { name: "Sarah from London", plan: "Elite Plan", time: "5 mins ago" },
    { name: "Marco from Milan", plan: "Free Tips", time: "12 mins ago" },
    { name: "John from New York", plan: "Pro Plan", time: "1 min ago" }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 86399));
    }, 1000);

    // Social proof cycle
    const socialTimer = setInterval(() => {
      setShowSocialProof(true);
      setTimeout(() => setShowSocialProof(false), 5000);
      setCurrentSocialProof(prev => (prev + 1) % socialProofs.length);
    }, 15000);

    // Exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) setShowExitPopup(true);
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
      clearInterval(socialTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleAnalysis = async () => {
    setShowAnalysisModal(true);
    setAnalysisLoading(true);
    const result = await getPredictions("I want analysis for today's upcoming football matches.");
    setAnalysisResult(result);
    setAnalysisLoading(false);
  };

  const [activePage, setActivePage] = useState('home');
  const [prevActivePage, setPrevActivePage] = useState('home');
  const [comments, setComments] = useState<{name: string, text: string, time: string}[]>([]);
  const [newComment, setNewComment] = useState({ name: '', text: '' });

  useEffect(() => {
    // Initial history state
    window.history.replaceState({ page: 'home' }, '', '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setActivePage(event.state.page);
      } else {
        setActivePage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Load existing comments from localStorage if any
    const savedComments = localStorage.getItem('wogan_comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string) => {
    if (page !== activePage) {
      setPrevActivePage(activePage);
      setActivePage(page);
      window.history.pushState({ page }, '', `#${page}`);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.name || !newComment.text) return;
    
    const comment = {
      ...newComment,
      time: 'Just now'
    };
    
    const updatedComments = [comment, ...comments].slice(0, 10); // Keep last 10
    setComments(updatedComments);
    localStorage.setItem('wogan_comments', JSON.stringify(updatedComments));
    setNewComment({ name: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-navy-dark overflow-x-hidden selection:bg-green-accent selection:text-navy-dark">
      
      {/* 1. NAVIGATION BAR */}
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500 py-4 px-6 md:px-12 flex items-center justify-between",
        scrolled ? "bg-navy-dark/95 backdrop-blur-md shadow-lg border-b border-white/5 py-3" : "bg-transparent h-20"
      )}>
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="w-10 h-10 bg-green-accent rounded-lg flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform">
            <Trophy className="text-navy-dark w-6 h-6" />
          </div>
          <span className="font-display text-2xl tracking-tighter text-white">WOGAN<span className="text-green-accent">PREDICTS</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {activePage !== 'home' && (
            <button 
              onClick={goBack} 
              className="text-gray-500 hover:text-green-accent transition-colors uppercase tracking-widest text-[10px] font-black italic flex items-center gap-1"
            >
              ← Back
            </button>
          )}
          {['Home', 'Predictions', 'VIP', 'Blog', 'Contact'].map(item => (
            <button 
              key={item} 
              onClick={() => {
                if (item === 'Predictions') {
                  handleAnalysis();
                } else if (item === 'VIP' || item === 'Home') {
                  navigateTo(item === 'VIP' ? 'pricing' : 'home');
                } else {
                  navigateTo(item.toLowerCase());
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className={cn(
                "hover:text-green-accent transition-colors uppercase tracking-widest text-[10px] font-black italic",
                (activePage === item.toLowerCase() || (item === 'VIP' && activePage === 'pricing')) ? "text-green-accent" : "text-gray-400"
              )}
            >
              {item}
            </button>
          ))}
          <Button variant="primary" className="py-2 text-[10px]" onClick={handleAnalysis}>GET FREE PICKS →</Button>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-navy-dark pt-24 px-8 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
               {activePage !== 'home' && (
                 <button onClick={goBack} className="text-gray-500 font-display text-2xl uppercase tracking-tighter italic">← PREVIOUS</button>
               )}
               {['Home', 'Predictions', 'VIP', 'Blog', 'Contact'].map(item => (
                <button 
                  key={item} 
                  onClick={() => {
                    if (item === 'Predictions') {
                      handleAnalysis();
                    } else if (item === 'VIP' || item === 'Home') {
                      navigateTo(item === 'VIP' ? 'pricing' : 'home');
                    } else {
                      navigateTo(item.toLowerCase());
                    }
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className={cn(
                    "font-display text-4xl uppercase tracking-tighter italic transition-all",
                    (activePage === item.toLowerCase() || (item === 'VIP' && activePage === 'pricing')) ? "text-green-accent" : "text-white"
                  )}
                >
                  {item}
                </button>
              ))}
              <Button onClick={() => { setIsMenuOpen(false); handleAnalysis(); }}>GET FREE PICKS →</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Page Router Content */}
      <div className="pt-20">
        {activePage === 'home' && (
          <>
            {/* 2. HERO SECTION */}
            <section id="home" className="relative pt-20 pb-20 px-6 md:px-12 lg:px-24 flex flex-col items-center justify-center gap-12 border-b border-white/5 overflow-hidden min-h-[70vh]">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-green-accent/10 to-transparent blur-3xl -z-10" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-accent/5 rounded-full blur-3xl -z-10" />

              <div className="max-w-3xl text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-green-accent/10 border border-green-accent/20 px-4 py-1 rounded-full text-green-accent text-xs font-bold mb-6"
                >
                  <Zap size={14} fill="currentColor" />
                  <span>SMART SPORTS ANALYSIS</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-6xl md:text-8xl lg:text-9xl text-white leading-[0.9] mb-6 uppercase"
                >
                  Win More. <br /> <span className="text-green-accent drop-shadow-[0_0_15px_rgba(0,255,135,0.4)]">Predict Smarter.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg mx-auto"
                >
                  Expert football predictions backed by data, high-power algorithms, and 10+ years of deep match analysis.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-6 mb-12"
                >
                  <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                    <Button className="px-10 py-5 text-lg" pulse onClick={handleAnalysis}>GET SMART ANALYSIS →</Button>
                    <Button variant="secondary" className="px-10 py-5 text-lg" onClick={() => navigateTo('pricing')}>VIEW VIP PLANS</Button>
                  </div>
                  
                  {/* Payment Selection Badges */}
                  <div className="flex items-center gap-4 py-2 px-6 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mr-2">Secure Payments:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-white/40 italic">PayPal</span>
                      <div className="w-px h-3 bg-white/10" />
                      <span className="text-[10px] font-bold text-white/40 italic">Visa</span>
                      <div className="w-px h-3 bg-white/10" />
                      <span className="text-[10px] font-bold text-white/40 italic">Mastercard</span>
                    </div>
                  </div>
                </motion.div>

                <div className="flex flex-wrap items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">95% Satisfaction</span>
                  <span className="w-1 h-1 bg-white/30 rounded-full" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">3,200+ Members</span>
                  <span className="w-1 h-1 bg-white/30 rounded-full" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Updated Daily</span>
                </div>
              </div>
            </section>

            {/* 3. LIVE STATS TICKER */}
            <div className="bg-navy-light py-4 border-y border-white/5 overflow-hidden">
              <motion.div 
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex whitespace-nowrap gap-12"
              >
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-20 items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Win Rate:</span>
                      <span className="text-green-accent font-display text-2xl italic tracking-tighter whitespace-nowrap">72% Verified</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">This Month:</span>
                      <span className="text-green-accent font-display text-2xl italic tracking-tighter whitespace-nowrap">48W - 18L</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Current Streak:</span>
                      <span className="text-green-accent font-display text-2xl italic tracking-tighter whitespace-nowrap">7 Wins Straight</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Avg ROI:</span>
                      <span className="text-green-accent font-display text-2xl italic tracking-tighter whitespace-nowrap">+31.4% Monthly</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Total Members:</span>
                      <span className="text-green-accent font-display text-2xl italic tracking-tighter whitespace-nowrap">3,200+ Members</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* 5. HOW IT WORKS */}
            <section id="features" className="py-24 px-6 md:px-12 lg:px-24 bg-navy-light/30 border-y border-white/5">
              <SectionTitle 
                title="The Winning Process" 
                subtitle="Our algorithm combined with human expertise ensures the highest quality predictions in the market."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { icon: <BarChart3 className="text-green-accent" size={40} />, title: "Data Analysis", desc: "We analyze 50+ real-time stats including player form, injuries, and weather conditions." },
                  { icon: <Zap className="text-green-accent" size={40} />, title: "Predictive Analytics", desc: "Our proprietary smart models process thousands of historical data points to identify value." },
                  { icon: <ShieldCheck className="text-green-accent" size={40} />, title: "Expert Review", desc: "Our professional tipsters manually review every pick before it reaches your dashboard." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                    className="text-center group"
                  >
                    <div className="w-20 h-20 bg-green-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-accent/20 group-hover:bg-green-accent/20 transition-all group-hover:-rotate-3">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 italic tracking-tight">{idx + 1}. {item.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 8. PRICING / MEMBERSHIP PLANS */}
            <section id="pricing-home" className="py-24 px-6 md:px-12 lg:px-24">
              <SectionTitle 
                title="Choose Your Winning Path" 
                subtitle="Unlock the full potential of our smart analysis with a plan that fits your betting style."
              />

              {/* Payment Methods Badge Area */}
              <div className="flex justify-center -mt-12 mb-16">
                <div className="flex items-center gap-8 py-3 px-10 bg-navy-light/50 border border-white/5 rounded-full shadow-xl">
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1 underline decoration-green-accent/20">Verified Merchant</span>
                    <span className="text-[10px] font-black text-white italic tracking-tighter">PAYPAL</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1 underline decoration-green-accent/20">Credit / Debit</span>
                    <span className="text-[10px] font-black text-white italic tracking-tighter uppercase whitespace-nowrap">VISA & MASTERCARD</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1 underline decoration-green-accent/20">Encrypted</span>
                    <span className="text-[10px] font-black text-white italic tracking-tighter">SECURE SSL</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-16">
                <span className={cn("text-xs font-bold transition-all", !isAnnual ? "text-green-accent" : "text-gray-500")}>MONTHLY</span>
                <button 
                  className="w-14 h-7 bg-navy-light border border-white/10 rounded-full p-1 relative flex items-center transition-all cursor-pointer"
                  onClick={() => setIsAnnual(!isAnnual)}
                >
                  <motion.div 
                    animate={{ x: isAnnual ? 28 : 0 }}
                    className="w-5 h-5 bg-green-accent rounded-full shadow-lg"
                  />
                </button>
                <span className={cn("text-xs font-bold transition-all", isAnnual ? "text-green-accent" : "text-gray-500")}>ANNUAL (SAVE 20%)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
                {[
                  { name: "FREE", price: 0, desc: "Perfect for casual fans.", features: ["1 Free Prediction / Day", "Basic Match Stats", "Email Newsletter", "Market Odds Comparison"], cta: "GET FREE TIPS" },
                  { name: "PRO", price: isAnnual ? 15 : 19, desc: "Our most popular choice.", popular: true, features: ["All Daily Predictions", "Confidence Ratings", "Full Stats Dashboard", "History Archive", "Discord Access"], cta: "JOIN PRO NOW" },
                  { name: "ELITE", price: isAnnual ? 39 : 49, desc: "The ultimate edge.", features: ["All PRO Features", "VIP Only Tips", "WhatsApp Alerts", "Personal Account Advisor", "Live Betting Tools"], cta: "GET ELITE ACCESS" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                      "relative bg-navy-light/30 border border-white/5 rounded-3xl p-8 transition-all hover:-translate-y-2",
                      item.popular && "bg-navy-light/60 border-green-accent/50 scale-105 shadow-2xl z-10"
                    )}
                  >
                    {item.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-accent text-navy-dark text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">MOST POPULAR</div>
                    )}
                    
                    <div className="text-center mb-8">
                      <h3 className="font-display text-4xl mb-2 text-white italic">{item.name}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-6 tracking-widest">{item.desc}</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl font-bold text-white tracking-tighter">€</span>
                        <span className="text-6xl font-display text-white italic tracking-tighter">{item.price}</span>
                        <span className="text-gray-500 text-sm font-bold uppercase tracking-tighter">/mo</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-10">
                      {item.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="text-green-accent shrink-0 mt-1" size={14} />
                          <span className="text-xs text-gray-300 font-medium">{f}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant={item.popular ? 'primary' : 'secondary'} 
                      className="w-full py-4 text-xs tracking-widest mb-4"
                      onClick={() => {
                        const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=datas2342@gmail.com&item_name=WoganPredicts%20${item.name}%20Membership&amount=${item.price}&currency_code=EUR`;
                        window.open(paypalUrl, '_blank');
                      }}
                    >
                      {item.cta}
                    </Button>

                    <div className="flex justify-center items-center gap-2 opacity-30 grayscale mb-4">
                      <div className="text-[8px] font-bold border border-white/40 px-1 rounded">PAYPAL</div>
                      <div className="text-[8px] font-bold border border-white/40 px-1 rounded">VISA</div>
                      <div className="text-[8px] font-bold border border-white/40 px-1 rounded">MC</div>
                    </div>
                    
                    <div className="mt-2 text-center text-[8px] text-gray-500 font-bold uppercase tracking-widest">NO COMMITMENT. CANCEL ANYTIME.</div>
                  </motion.div>
                ))}
              </div>

              {/* Payment Methods Banner */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="flex flex-wrap items-center justify-center gap-8 mt-16 py-6 px-10 bg-white/2 border border-white/5 rounded-[2rem] max-w-3xl mx-auto"
              >
                <div className="flex flex-col items-center">
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">Primary Hub</div>
                  <div className="flex items-center gap-2 text-green-accent italic font-black text-[10px] border border-green-accent/20 px-4 py-2 rounded-xl bg-navy-dark shadow-[0_0_15px_rgba(0,255,135,0.05)] uppercase">
                    PayPal Secure Express
                  </div>
                </div>
                <div className="w-px h-8 bg-white/5 hidden md:block" />
                <div className="flex flex-col items-center">
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">Cards Accepted</div>
                  <div className="flex items-center gap-3 text-white/40 italic font-black text-[10px] border border-white/10 px-4 py-2 rounded-xl bg-navy-dark uppercase">
                    Visa / Mastercard / Amex
                  </div>
                </div>
                <div className="w-px h-8 bg-white/5 hidden md:block" />
                <div className="flex flex-col items-center">
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">Encrypted</div>
                  <div className="flex items-center gap-2 text-white/40 italic font-black text-[10px] border border-white/10 px-4 py-2 rounded-xl bg-navy-dark uppercase">
                    256-Bit SSL Security
                  </div>
                </div>
              </motion.div>
              
              <p className="text-center text-gray-500 max-w-lg mx-auto mt-16 text-xs italic tracking-tighter">
                * Prices are billed monthly or annually depending on selection. Scarcity Alert: <span className="text-green-accent font-bold">Only 12 spots left for Elite members this month.</span>
              </p>
            </section>

            {/* 9. FAQ SECTION */}
            <section id="faq-home" className="py-24 px-6 md:px-12 lg:px-24 bg-navy-light/10">
              <div className="max-w-4xl mx-auto">
                <SectionTitle 
                  title="Common Questions" 
                  subtitle="Everything you need to know about our service and how we help you win more."
                />

                <div className="space-y-4">
                  {[
                    { q: "How accurate are your predictions?", a: "We maintain a verified 72-74% monthly win rate. While no prediction is 100% guaranteed, our data-led approach consistently identifies high-value opportunities." },
                    { q: "How do I receive my tips?", a: "Tips are available instantly on your dashboard upon login. Pro and Elite members also receive real-time notifications via email or WhatsApp." },
                    { q: "Can I cancel my subscription anytime?", a: "Yes, you have full control. You can cancel at any time through your account settings with no hidden fees or exit penalties." },
                    { q: "Do you guarantee winnings?", a: "In sports betting, there are no certainties. We provide the highest-probability analysis using smart technology and expertise, but responsible gambling rules always apply." },
                    { q: "How many tips per day?", a: "Free users get 1 tip daily. Pro and Elite members receive 8-15 high-value predictions across multiple global leagues every single day." },
                    { q: "Is there a free trial?", a: "We offer a daily free prediction so you can verify our quality before committing to a paid plan." }
                  ].map((faq, idx) => (
                    <motion.details 
                      key={idx}
                      className="group border border-white/5 rounded-2xl bg-navy-light/30 transition-all overflow-hidden"
                    >
                      <summary className="p-6 text-sm font-bold flex justify-between items-center cursor-pointer list-none hover:bg-white/5 group-open:bg-green-accent group-open:text-navy-dark transition-all italic tracking-tighter">
                         {faq.q}
                         <motion.div animate={{ rotate: 180 }} className="group-open:rotate-0 transition-transform">
                            <ChevronRight size={18} />
                         </motion.div>
                      </summary>
                      <div className="p-6 text-xs text-gray-400 leading-relaxed bg-navy-dark/40">
                        {faq.a}
                      </div>
                    </motion.details>
                  ))}
                </div>
              </div>
            </section>

            {/* 10. EMAIL CAPTURE */}
            <section className="py-24 px-6 md:px-12 lg:px-24">
              <div className="max-w-5xl mx-auto bg-green-accent rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <Send className="text-navy-dark/10 -rotate-12 group-hover:scale-110 transition-transform" size={140} />
                </div>
                
                <div className="relative z-10 font-display flex flex-col items-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-navy-dark text-6xl md:text-8xl italic uppercase mb-6 leading-none"
                  >
                    Get Tomorrow's <br /> Top Pick — <span className="underline decoration-navy-dark/20 text-navy-dark/80 italic">Free</span>
                  </motion.h2>
                  <p className="text-navy-dark/70 text-lg font-bold uppercase tracking-widest max-w-md mb-12 italic">
                     Join 3,200+ members getting our #1 daily tip straight to their inbox.
                  </p>
                  
                  <form className="flex flex-col sm:flex-row gap-4 w-full max-w-md" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
                    <input 
                      type="email" 
                      placeholder="ENTER YOUR BEST EMAIL..." 
                      required
                      className="flex-1 bg-white/20 border border-navy-dark/10 rounded-full px-8 py-5 text-navy-dark placeholder:text-navy-dark/40 font-bold focus:outline-none focus:bg-white/30 transition-all font-mono italic"
                    />
                    <Button variant="primary" className="bg-navy-dark text-green-accent hover:bg-navy-dark/90 px-8 py-5 group">
                      SEND ME AN EMAIL FOR DAILY UPDATES <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                  <p className="mt-8 text-navy-dark/40 text-[10px] font-black tracking-widest uppercase italic">
                    NO SPAM. NO BS. UNSUBSCRIBE ANYTIME.
                  </p>
                </div>
              </div>
            </section>
            {/* 11. COMMUNITY COMMENTS */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-navy-light/5">
              <div className="max-w-4xl mx-auto">
                <SectionTitle 
                  title="Community Feedback" 
                  subtitle="Hear from our winners and share your own success stories with the Wogan community."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Comment Form */}
                  <div className="bg-navy-light/30 border border-white/5 rounded-[2rem] p-8">
                    <h3 className="text-xl font-bold mb-6 italic uppercase tracking-tighter">Leave a Comment</h3>
                    <form onSubmit={handleAddComment} className="space-y-4">
                      <div>
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Display Name</label>
                        <input 
                          type="text" 
                          value={newComment.name}
                          onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                          placeholder="EX: LUCKY STRIKER" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 focus:border-green-accent transition-all italic font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Your Message</label>
                        <textarea 
                          rows={3}
                          value={newComment.text}
                          onChange={(e) => setNewComment({...newComment, text: e.target.value})}
                          placeholder="SHARE YOUR WINNING EXPERIENCE..." 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 focus:border-green-accent transition-all italic font-bold text-sm"
                        />
                      </div>
                      <Button className="w-full py-4 text-xs tracking-widest">PUBLISH COMMENT</Button>
                    </form>
                  </div>

                  {/* Comment List */}
                  <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-[2rem]">
                        <p className="text-gray-500 italic text-sm">No comments yet. Be the first to shout out!</p>
                      </div>
                    ) : (
                      comments.map((comment, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/2 border border-white/5 rounded-2xl p-6"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-green-accent font-black text-[10px] uppercase tracking-widest">{comment.name}</span>
                            <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{comment.time}</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed italic">"{comment.text}"</p>
                        </motion.div>
                      ))
                    )}
                    
                    {/* Placeholder Sample Comments if list is short */}
                    {comments.length < 3 && [
                      { name: "PUNTER_X", text: "Third win this week already! The AI analysis is spot on for UCL matches.", time: "2 hours ago" },
                      { name: "GOLAZO_GUIDO", text: "Elite plan is worth every penny. The WhatsApp alerts saved me today.", time: "5 hours ago" }
                    ].map((c, i) => (
                      <div key={`sample-${i}`} className="bg-white/2 border border-white/5 rounded-2xl p-6 opacity-40">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-green-accent font-black text-[10px] uppercase tracking-widest">{c.name}</span>
                          <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{c.time}</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed italic">"{c.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* --- BLOG PAGE --- */}
        {activePage === 'blog' && (
          <section id="blog-page" className="py-24 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto min-h-[60vh]">
            <button 
              onClick={goBack} 
              className="mb-8 text-gray-500 hover:text-green-accent transition-all uppercase tracking-widest text-sm font-black italic flex items-center gap-2"
            >
              ← BACK TO PREVIOUS PAGE
            </button>
            <SectionTitle title="The Wogan Journal" subtitle="Expert betting strategies, bankroll management tips, and tactical match analysis." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { title: "The 1/X/2 Strategy: How to Find Real Value", date: "May 10, 2024", tag: "STRATEGY" },
                { title: "Bankroll Management: Why You're Losing Money", date: "May 08, 2024", tag: "TIPS" },
                { title: "Premier League Title Race: Analytical Review", date: "May 05, 2024", tag: "ANALYSIS" },
                { title: "Asian Handicap vs European: Which is Better?", date: "May 01, 2024", tag: "GUIDE" },
                { title: "Leveraging Live Data for In-Play Success", date: "Apr 28, 2024", tag: "STRATEGY" },
                { title: "The 'Wogan Method': 10 Years of Insights", date: "Apr 25, 2024", tag: "STORY" }
              ].map((post, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[16/10] bg-navy-light rounded-3xl mb-6 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent p-6 flex flex-col items-end justify-end">
                      <div className="bg-green-accent text-navy-dark text-[10px] font-black px-3 py-1 rounded-full">{post.tag}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-green-accent transition-colors leading-tight mb-4 italic tracking-tighter uppercase">{post.title}</h3>
                  <div className="flex items-center gap-4 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>5 MIN READ</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* --- CONTACT PAGE --- */}
        {activePage === 'contact' && (
          <section id="contact-page" className="py-24 px-6 md:px-12 lg:px-24 min-h-[60vh]">
            <button 
              onClick={goBack} 
              className="mb-8 text-gray-500 hover:text-green-accent transition-all uppercase tracking-widest text-sm font-black italic flex items-center gap-2"
            >
              ← BACK TO PREVIOUS PAGE
            </button>
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">
              <div className="flex-1">
                 <SectionTitle title="Get In Touch" />
                 <p className="text-gray-400 mb-12 text-lg italic tracking-tight">
                   Have a question about your membership or need custom VIP alerts? Our team of sports analysts is ready to assist you.
                 </p>
                 <div className="space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-green-accent rounded-2xl flex items-center justify-center">
                        <Mail className="text-navy-dark" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Email Support</div>
                        <div className="text-xl font-bold italic tracking-tighter uppercase">komwogan@gmail.com</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-green-accent rounded-2xl flex items-center justify-center">
                        <Send className="text-navy-dark" />
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Telegram VIP Channel</div>
                        <div className="text-xl font-bold italic tracking-tighter uppercase">@WoganPredicts_VIP</div>
                      </div>
                   </div>
                 </div>
              </div>
              
              <div className="flex-1 bg-navy-light/40 border border-white/5 rounded-[3rem] p-12">
                 <form className="space-y-6" onSubmit={(e) => { 
                   e.preventDefault(); 
                   const form = e.target as HTMLFormElement;
                   const name = (form.elements[0] as HTMLInputElement).value;
                   const subject = (form.elements[2] as HTMLSelectElement).value;
                   const message = (form.elements[3] as HTMLTextAreaElement).value;
                   const mailtoUrl = `mailto:komwogan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\n\n${message}`)}`;
                   window.location.href = mailtoUrl;
                 }}>
                   <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Full Name</label>
                       <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-green-accent transition-all italic font-bold" placeholder="JOHN DOE" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">User ID</label>
                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-green-accent transition-all italic font-bold" placeholder="#WP-9921" />
                     </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Inquiry Type</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-green-accent transition-all italic font-bold appearance-none">
                        <option>GENERAL INQUIRY</option>
                        <option>BILLING / SUBSCRIPTION</option>
                        <option>VIP ACCESS ISSUE</option>
                        <option>AFFILIATE PARTNERSHIP</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Message</label>
                      <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-green-accent transition-all italic font-bold" placeholder="HOW CAN WE HELP YOU?" />
                   </div>
                   <Button className="w-full py-5">SEND MESSAGE →</Button>
                 </form>
              </div>
            </div>
          </section>
        )}

        {/* Fallback sections for Pricing if click individually */}
        {activePage === 'pricing' && (
          <div className="py-12 min-h-[60vh]">
            <section id="pricing-page" className="py-24 px-6 md:px-12 lg:px-24 text-center">
              <button 
                onClick={goBack} 
                className="mb-8 text-gray-500 hover:text-green-accent transition-all uppercase tracking-widest text-sm font-black italic flex items-center gap-2 mx-auto"
              >
                ← BACK TO PREVIOUS PAGE
              </button>
              <SectionTitle title="Choose Your Winning Path" subtitle="Unlock the full potential of our smart analysis." />
              
              {/* Payment Methods Badge Area */}
              <div className="flex justify-center -mt-12 mb-16">
                <div className="flex items-center gap-8 py-3 px-10 bg-navy-light/50 border border-white/5 rounded-full shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-accent rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-white italic tracking-tighter">PAYPAL SECURE</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-[10px] font-black text-white italic tracking-tighter uppercase">VISA / MASTERCARD / AMEX</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-16">
                <span className={cn("text-xs font-bold transition-all", !isAnnual ? "text-green-accent" : "text-gray-500")}>MONTHLY</span>
                <button className="w-14 h-7 bg-navy-light border border-white/10 rounded-full p-1 relative flex items-center transition-all cursor-pointer" onClick={() => setIsAnnual(!isAnnual)}>
                  <motion.div animate={{ x: isAnnual ? 28 : 0 }} className="w-5 h-5 bg-green-accent rounded-full shadow-lg" />
                </button>
                <span className={cn("text-xs font-bold transition-all", isAnnual ? "text-green-accent" : "text-gray-500")}>ANNUAL (SAVE 20%)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end mb-16 text-left">
                {[
                  { name: "FREE", price: 0, desc: "Perfect for casual fans.", features: ["1 Free Prediction / Day", "Basic Match Stats"], cta: "GET FREE TIPS" },
                  { name: "PRO", price: isAnnual ? 15 : 19, desc: "Our most popular choice.", popular: true, features: ["All Daily Predictions", "Confidence Ratings", "Discord Access"], cta: "JOIN PRO NOW" },
                  { name: "ELITE", price: isAnnual ? 39 : 49, desc: "The ultimate edge.", features: ["All PRO Features", "VIP Only Tips", "WhatsApp Alerts"], cta: "GET ELITE ACCESS" }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "bg-navy-light/30 border border-white/5 rounded-3xl p-8 transition-all",
                      item.popular && "bg-navy-light/60 border-green-accent/50 scale-105 shadow-2xl z-10"
                    )}
                  >
                     <h3 className="font-display text-4xl mb-4 text-white italic">{item.name}</h3>
                     <div className="flex items-baseline mb-8">
                        <span className="text-xl font-bold text-white mr-1">€</span>
                        <span className="text-5xl font-display text-white italic">{item.price}</span>
                        <span className="text-gray-500 text-sm ml-2">/mo</span>
                     </div>
                     <Button 
                      variant={item.popular ? 'primary' : 'secondary'} 
                      className="w-full py-4 text-xs tracking-widest mb-8"
                      onClick={() => {
                        const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=datas2342@gmail.com&item_name=WoganPredicts%20${item.name}%20Membership&amount=${item.price}&currency_code=EUR`;
                        window.open(paypalUrl, '_blank');
                      }}
                    >
                      {item.cta}
                    </Button>
                    <div className="space-y-3">
                       {item.features.map((f, i) => (
                         <div key={i} className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <Check size={12} className="text-green-accent" /> {f}
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Methods Section */}
              <div className="flex flex-wrap items-center justify-center gap-8 mb-16 py-6 px-10 bg-white/2 border border-white/5 rounded-[2rem] max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">Secure Method 01</div>
                  <div className="flex items-center gap-2 text-green-accent italic font-black text-[10px] border border-green-accent/20 px-4 py-2 rounded-xl bg-navy-dark uppercase">
                    PayPal Express
                  </div>
                </div>
                <div className="w-px h-8 bg-white/5 hidden md:block" />
                <div className="flex flex-col items-center">
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">Secure Method 02</div>
                  <div className="flex items-center gap-3 text-white/40 italic font-black text-[10px] border border-white/10 px-4 py-2 rounded-xl bg-navy-dark uppercase">
                    Visa / Mastercard
                  </div>
                </div>
                <div className="w-px h-8 bg-white/5 hidden md:block" />
                <div className="flex flex-col items-center">
                  <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2">Secure Method 03</div>
                  <div className="flex items-center gap-2 text-white/40 italic font-black text-[10px] border border-white/10 px-4 py-2 rounded-xl bg-navy-dark uppercase">
                    Fast Checkout
                  </div>
                </div>
              </div>

              <Button variant="primary" className="px-12 py-5" onClick={() => navigateTo('home')}>BACK TO DASHBOARD</Button>
            </section>
          </div>
        )}
      </div>

      <footer className="relative py-20 px-6 md:px-12 lg:px-24 border-t border-white/5 bg-navy-dark mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-green-accent rounded flex items-center justify-center -rotate-6">
                <Trophy className="text-navy-dark w-4 h-4" />
              </div>
              <span className="font-display text-xl tracking-tighter text-white uppercase">WoganPredicts</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm font-medium italic">
              Empowering sports bettors with high-level data analysis and advanced match predictions. We don't believe in luck, we believe in probabilities.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6 italic">Quick Links</h4>
            <div className="flex flex-col gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-[2px]">
              <a href="#" className="hover:text-green-accent transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-green-accent transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-green-accent transition-colors">Affiliate Program</a>
              <a href="mailto:komwogan@gmail.com" className="hover:text-green-accent transition-colors">Contact Support</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6 italic">Stay Connected</h4>
            <div className="flex gap-4">
              {[Twitter, Instagram, Youtube, Send].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center text-gray-400 hover:bg-green-accent hover:text-navy-dark transition-all group">
                   <Icon size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5 opacity-40">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            © 2024 WoganPredicts. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <AlertCircle size={12} />
            ADULTS ONLY 18+. GAMBLE RESPONSIBLY.
          </div>
        </div>
      </footer>

      {/* --- CONVERSION OVERLAYS --- */}

      {/* Social Proof Toast */}
      <AnimatePresence>
        {showSocialProof && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed bottom-6 left-6 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl max-w-xs md:max-w-sm group cursor-pointer"
            onClick={() => document.getElementById('pricing-home')?.scrollIntoView({ behavior: 'smooth' })}
          >
             <div className="bg-green-accent/20 rounded-full p-2 text-green-accent group-hover:scale-110 transition-transform">
               <TrendingUp size={24} />
             </div>
             <div>
               <p className="text-[10px] font-bold text-white uppercase italic tracking-tighter">
                <span className="text-green-accent">{socialProofs[currentSocialProof].name}</span> just joined <span className="text-green-accent">{socialProofs[currentSocialProof].plan}</span>
               </p>
               <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{socialProofs[currentSocialProof].time}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMART ANALYSIS MODAL */}
      <AnimatePresence>
        {showAnalysisModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-navy-dark/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-navy-light border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-accent/20 rounded-lg flex items-center justify-center">
                    <Zap className="text-green-accent" size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-4xl text-white italic tracking-tighter uppercase">Wogan's Live Smart Analysis</h3>
                    <p className="text-[10px] text-green-accent/60 font-bold uppercase tracking-widest">Scanning Global Match Markets...</p>
                  </div>
                </div>
                <button onClick={() => { setShowAnalysisModal(false); setAnalysisResult(null); }} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-navy-dark/20 custom-scrollbar">
                {analysisLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="text-green-accent animate-spin mb-6" size={48} />
                    <h4 className="text-2xl font-bold mb-2 uppercase italic italic tracking-tighter">Analyzing Pitches...</h4>
                    <p className="text-gray-400 text-sm max-w-xs uppercase font-bold tracking-widest leading-loose">Wogan's Engine is processing team line-ups, xG data, and injury reports across all major leagues.</p>
                  </div>
                ) : analysisResult ? (
                  <div className="max-w-none">
                    <div className="bg-green-accent/5 p-6 rounded-2xl border border-green-accent/20 mb-8 flex items-start gap-4">
                      <AlertCircle className="text-green-accent shrink-0 mt-1" />
                      <p className="text-xs text-green-accent font-bold italic tracking-tighter leading-tight m-0">
                        EXPERT NOTICE: These predictions are generated by our high-frequency analysis. Odds may shift rapidly due to market volume.
                      </p>
                    </div>
                    
                    <div className="markdown-content">
                      <ReactMarkdown>{analysisResult}</ReactMarkdown>
                    </div>

                    <div className="mt-12 p-8 border border-green-accent/20 bg-navy-light/40 rounded-3xl text-center flex flex-col items-center">
                         <div className="w-16 h-16 bg-green-accent rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,255,135,0.3)]">
                            <ShieldCheck className="text-navy-dark" size={32} />
                         </div>
                         <h4 className="font-display text-4xl mb-4 text-white italic italic tracking-tighter uppercase">Want the Full 12+ Match Slate?</h4>
                         <p className="text-gray-400 text-sm mb-8 italic">Unlock our Pro Dashboard for real-time edge, market alerts, and 85%+ high-confidence picks.</p>
                         <Button className="w-full sm:w-auto px-12" onClick={() => { setShowAnalysisModal(false); document.getElementById('pricing-home')?.scrollIntoView({ behavior: 'smooth' }); }}>
                           UPGRADE TO PRO ACCESS
                         </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
