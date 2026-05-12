/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  Megaphone, 
  Heart, 
  MapPin, 
  Send,
  Calendar,
  Clock,
  Navigation,
  Phone,
  Mail,
  Church,
  ChevronRight,
  Loader2,
  Trash2,
  CheckCircle2,
  Settings,
  Plus,
  Moon,
  Sun,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Tab = 'home' | 'notes' | 'news' | 'prayer' | 'contact' | 'admin';

interface PrayerRequest {
  id: string;
  name: string;
  details: string;
  date: string;
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  category: string;
  desc: string;
}

interface Scripture {
  id: string;
  text: string;
  reference: string;
}

interface ChurchSettings {
  name: string;
  pastor: string;
  phone: string;
  email: string;
  address: string;
  serviceTime: string;
  announcements: Announcement[];
  scriptures: Scripture[];
}

const DEFAULT_SETTINGS: ChurchSettings = {
  name: 'Grace Fellowship Church',
  pastor: 'Pastor John Doe',
  phone: '(555) 123-4567',
  email: 'hello@churchconnect.com',
  address: '123 Grace Way, Faith City',
  serviceTime: 'Sun @ 10:00 AM',
  announcements: [
    { id: '1', title: "Youth Summer Camp", date: "July 12-15", category: "Youth", desc: "Join us for an amazing 4-day experience in the mountains." },
    { id: '2', title: "Annual Food Drive", date: "This Sat @ 9AM", category: "Outreach", desc: "Helping local families in need. Volunteer today!" },
    { id: '3', title: "Community Breakfast", date: "May 20", category: "Social", desc: "Free breakfast for the neighborhood. All are welcome." },
    { id: '4', title: "Choir Auditions", date: "Wed @ 6PM", category: "Ministry", desc: "Passionate about singing? Come join our choir team." },
  ],
  scriptures: [
    { id: '1', text: "The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters.", reference: "Psalm 23:1-2" },
    { id: '2', text: "For I know the plans I have for you,\" declares the Lord, \"plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
    { id: '3', text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
    { id: '4', text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", reference: "Proverbs 3:5-6" },
    { id: '5', text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31" },
    { id: '6', text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
    { id: '7', text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16" },
  ]
};

// --- Components ---

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-blue-900 z-[100] flex flex-col items-center justify-center text-white"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
          <Church className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Church Connect</h1>
        <p className="text-blue-200">Grace Fellowship Church</p>
      </motion.div>
      
      <div className="absolute bottom-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-300" />
      </div>
    </motion.div>
  );
};

const Header = ({ 
  title, 
  churchName, 
  darkMode, 
  setDarkMode, 
  onAdminClick 
}: { 
  title: string, 
  churchName: string, 
  darkMode: boolean, 
  setDarkMode: (v: boolean) => void, 
  onAdminClick: () => void 
}) => (
  <header className="bg-slate-950 dark:bg-black text-white px-6 pt-10 pb-16 rounded-b-[2.5rem] shadow-2xl sticky top-0 z-30 transition-all duration-500 border-b border-white/5 overflow-hidden">
    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
      <Church className="w-32 h-32 rotate-12" />
    </div>
    <div className="max-w-md mx-auto flex items-center justify-between relative z-10">
      <motion.div
        key={title}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="text-2xl font-bold tracking-tight font-display">{title}</h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{churchName}</p>
      </motion.div>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAdminClick}
          className="h-10 w-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-500" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setDarkMode(!darkMode)}
          className="h-10 w-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
        </motion.button>
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 ml-1">
          <Church className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  </header>
);

const Navbar = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (tab: Tab) => void }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'notes', icon: BookOpen, label: 'Notes' },
    { id: 'news', icon: Megaphone, label: 'News' },
    { id: 'prayer', icon: Heart, label: 'Prayer' },
    { id: 'contact', icon: MapPin, label: 'Connect' },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 dark:bg-black/90 backdrop-blur-2xl px-3 py-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-40 border border-white/10 flex justify-between items-center w-[90%] max-w-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if ('vibrate' in navigator) navigator.vibrate(5);
              setActiveTab(tab.id as Tab);
            }}
            className={`flex flex-col items-center justify-center w-12 h-12 relative transition-all duration-300 ${
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div 
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/40"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
              )}
            </AnimatePresence>
            <motion.div
              animate={{ scale: isActive ? 1.1 : 1 }}
            >
              <Icon className={`w-5 h-5`} />
            </motion.div>
          </button>
        );
      })}
    </nav>
  );
};

// --- Pages ---

const DailyScriptureCard = ({ scriptures }: { scriptures: Scripture[] }) => {
  const scripture = React.useMemo(() => {
    if (!scriptures || scriptures.length === 0) return { text: "No scriptures available", reference: "" };
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return scriptures[dayOfYear % scriptures.length];
  }, [scriptures]);

  const handleShare = async () => {
    const shareText = `"${scripture.text}" - ${scripture.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Scripture',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 dark:bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-950/20 dark:shadow-indigo-600/30 group-hover:rotate-6 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white font-display text-lg">Daily Scripture</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">{scripture.reference}</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed mb-6 font-medium font-sans ring-0 italic border-l-2 border-indigo-500/30 pl-4">
        "{scripture.text}"
      </p>
      <button className="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
        Explore Bible Study <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

const HomePage = ({ settings }: { settings: ChurchSettings }) => (
  <div className="space-y-6">
    <motion.div 
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative h-60 w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/5"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
        <motion.p 
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1.5"
        >
          Welcome Home
        </motion.p>
        <motion.h2 
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white tracking-tight font-display"
        >
          {settings.name}
        </motion.h2>
      </div>
    </motion.div>

    <div className="grid grid-cols-2 gap-4">
      <motion.div 
        whileTap={{ scale: 0.97 }}
        className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/50 dark:border-white/5 flex flex-col items-center text-center group"
      >
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Service Time</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">{settings.serviceTime}</p>
      </motion.div>
      <motion.div 
        whileTap={{ scale: 0.97 }}
        className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/50 dark:border-white/5 flex flex-col items-center text-center group"
      >
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Our Pastor</h3>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 truncate w-full px-2">Ps. {settings.pastor}</p>
      </motion.div>
    </div>

    <DailyScriptureCard scriptures={settings.scriptures} />
  </div>
);

const NotesPage = () => {
  const [notes, setNotes] = useState(localStorage.getItem('church_notes') || '');

  useEffect(() => {
    localStorage.setItem('church_notes', notes);
  }, [notes]);

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-22rem)]">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Sermon Notes</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Capturing the word of God</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-3 py-1.5 rounded-full shadow-sm">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Auto-Saving</span>
        </div>
      </div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-grow bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden"
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Reflect on today's sermon..."
          className="w-full h-full p-6 focus:outline-none text-slate-700 dark:text-slate-200 leading-relaxed resize-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent"
        />
      </motion.div>
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          const blob = new Blob([notes], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Sermon-Notes-${new Date().toLocaleDateString()}.txt`;
          a.click();
        }}
        className="w-full bg-slate-950 dark:bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-indigo-700 transition-colors"
      >
        Export to Files <Send className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

const NewsPage = ({ announcements }: { announcements: Announcement[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Announcements</h2>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{announcements.length} Feed Items</span>
      </div>
      <div className="space-y-4">
        {announcements.map((item, i) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col gap-4 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                i % 4 === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 
                i % 4 === 1 ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 
                i % 4 === 2 ? 'bg-indigo-950 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {item.category}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> {item.date}
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-[0.03] p-2">
              <Megaphone className="w-16 h-16 -rotate-12" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PrayerPage = () => {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<PrayerRequest[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('prayer_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: PrayerRequest = {
      id: Date.now().toString(),
      name: name || 'Anonymous',
      details,
      date: new Date().toLocaleDateString()
    };
    
    const newHistory = [newRequest, ...history];
    setHistory(newHistory);
    localStorage.setItem('prayer_history', JSON.stringify(newHistory));
    
    setSubmitted(true);
    setName('');
    setDetails('');
    if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Prayer Wall</h2>
        <p className="text-xs text-slate-500 dark:text-slate-500">Your community stands with you</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20 p-8 rounded-3xl flex flex-col items-center text-center space-y-3"
          >
            <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-green-900 dark:text-green-400 font-display">Request Sent</h3>
            <p className="text-green-700 dark:text-green-500/70 text-xs max-w-[200px] leading-relaxed">We stand with you in faith. Your request has been recorded.</p>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit} 
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Your Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text" 
                placeholder="Name (Optional)" 
                className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">What can we pray for?</label>
              <textarea 
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                placeholder="Describe your request..." 
                className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm dark:text-white leading-relaxed resize-none"
              />
            </div>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              Send Request <Send className="w-4 h-4" />
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Community Prayers</h3>
          <div className="space-y-3 pb-8">
            {history.map((req) => (
              <motion.div 
                layout
                key={req.id} 
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-slate-400 dark:text-indigo-400">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{req.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{req.date}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        const newHistory = history.filter(r => r.id !== req.id);
                        setHistory(newHistory);
                        localStorage.setItem('prayer_history', JSON.stringify(newHistory));
                    }}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-10 border-l border-indigo-100 dark:border-indigo-900/50 ml-4 italic">
                  "{req.details}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ContactPage = ({ settings }: { settings: ChurchSettings }) => (
  <div className="space-y-6 pb-4">
    <div className="flex flex-col items-center justify-center text-center space-y-1 mb-4">
      <div className="w-20 h-20 bg-slate-950 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-4 shadow-2xl border-4 border-white dark:border-slate-800 relative group">
        <Church className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full border-4 border-white dark:border-slate-800" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">{settings.name}</h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 px-8 leading-relaxed">Where faith meets community. We are here to support you in your spiritual walk.</p>
    </div>
    
    <div className="space-y-3">
      {[
        { label: 'Phone', value: settings.phone, icon: Phone, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Email', value: settings.email, icon: Mail, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800' },
        { label: 'Location', value: settings.address, icon: Navigation, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
      ].map((item, i) => (
        <motion.div 
          key={i}
          whileTap={{ scale: 0.98 }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-white/5 flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
        >
          <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color} shadow-inner`}>
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest leading-none mb-1">{item.label}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-inner border border-slate-200 dark:border-white/5 relative">
      <iframe 
        title="Church Location Map"
        width="100%" 
        height="100%" 
        frameBorder="0" 
        scrolling="no" 
        marginHeight={0} 
        marginWidth={0} 
        src={`https://www.openstreetmap.org/export/embed.html?bbox=-74.015,40.705,-73.995,40.715&layer=mapnik&marker=40.71,-74.005`}
        className="grayscale contrast-125 opacity-60 dark:invert dark:opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 dark:from-slate-900/50 to-transparent pointer-events-none" />
    </div>
    
    <div className="text-center pt-8 opacity-40">
      <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-[0.3em]">{settings.name}</p>
    </div>
  </div>
);

const AdminPage = ({ settings, setSettings }: { settings: ChurchSettings, setSettings: (s: ChurchSettings) => void }) => {
  const [formData, setFormData] = useState<ChurchSettings>(settings);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'announcements' | 'scriptures'>('info');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSettings(formData);
      localStorage.setItem('church_settings', JSON.stringify(formData));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const addAnnouncement = () => {
    const newAnn: Announcement = {
      id: Date.now().toString(),
      title: "New Event",
      category: "General",
      date: "Upcoming",
      desc: "Event description..."
    };
    setFormData({ ...formData, announcements: [newAnn, ...formData.announcements] });
  };

  const removeAnnouncement = (id: string) => {
    setFormData({ ...formData, announcements: formData.announcements.filter(a => a.id !== id) });
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    setFormData({
      ...formData,
      announcements: formData.announcements.map(a => a.id === id ? { ...a, ...updates } : a)
    });
  };

  const addScripture = () => {
    const newScripture: Scripture = {
      id: Date.now().toString(),
      text: "New Scripture text here...",
      reference: "Book 1:1"
    };
    setFormData({ ...formData, scriptures: [newScripture, ...formData.scriptures] });
  };

  const removeScripture = (id: string) => {
    setFormData({ ...formData, scriptures: formData.scriptures.filter(s => s.id !== id) });
  };

  const updateScripture = (id: string, updates: Partial<Scripture>) => {
    setFormData({
      ...formData,
      scriptures: formData.scriptures.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
        <button 
          onClick={() => setActiveSubTab('info')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeSubTab === 'info' ? 'bg-slate-950 dark:bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          General
        </button>
        <button 
          onClick={() => setActiveSubTab('announcements')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeSubTab === 'announcements' ? 'bg-slate-950 dark:bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Feed
        </button>
        <button 
          onClick={() => setActiveSubTab('scriptures')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeSubTab === 'scriptures' ? 'bg-slate-950 dark:bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Bible
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'info' ? (
          <motion.div 
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {[
              { label: 'Church Name', key: 'name' },
              { label: 'Pastor Name', key: 'pastor' },
              { label: 'Service Time', key: 'serviceTime' },
              { label: 'Phone Number', key: 'phone' },
              { label: 'Church Email', key: 'email' },
              { label: 'Church Address', key: 'address' },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
                <input 
                  type="text"
                  value={formData[field.key as keyof ChurchSettings] as string}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm dark:text-white"
                />
              </div>
            ))}
          </motion.div>
        ) : activeSubTab === 'announcements' ? (
          <motion.div 
            key="announcements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-left"
          >
            <button 
              onClick={addAnnouncement}
              className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Event to Feed
            </button>
            {formData.announcements.map((ann) => (
              <div key={ann.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 space-y-4 relative overflow-hidden">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Title</label>
                    <input 
                        className="w-full font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl focus:outline-none text-sm"
                        value={ann.title}
                        onChange={(e) => updateAnnouncement(ann.id, { title: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={() => removeAnnouncement(ann.id)}
                    className="p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl mt-5 h-11"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category</label>
                    <input 
                        className="w-full text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2.5 rounded-xl focus:outline-none"
                        value={ann.category}
                        onChange={(e) => updateAnnouncement(ann.id, { category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</label>
                    <input 
                        className="w-full text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl focus:outline-none"
                        value={ann.date}
                        onChange={(e) => updateAnnouncement(ann.id, { date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea 
                        className="w-full text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl focus:outline-none leading-relaxed resize-none h-20"
                        value={ann.desc}
                        onChange={(e) => updateAnnouncement(ann.id, { desc: e.target.value })}
                        rows={2}
                    />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="scriptures"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-left"
          >
            <button 
              onClick={addScripture}
              className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400 dark:text-slate-500 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Daily Scripture
            </button>
            {formData.scriptures.map((script) => (
              <div key={script.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reference</label>
                    <input 
                        className="w-full font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl focus:outline-none text-sm"
                        value={script.reference}
                        onChange={(e) => updateScripture(script.id, { reference: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={() => removeScripture(script.id)}
                    className="p-3 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl mt-5 h-11"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Scripture Text</label>
                    <textarea 
                        className="w-full text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl focus:outline-none leading-relaxed resize-none h-24"
                        value={script.text}
                        onChange={(e) => updateScripture(script.id, { text: e.target.value })}
                        rows={3}
                    />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saveStatus !== 'idle'}
        className={`w-full py-4 rounded-xl font-bold shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all ${
          saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-slate-950 dark:bg-indigo-600 text-white hover:opacity-90'
        }`}
      >
        {saveStatus === 'idle' && <><Settings className="w-5 h-5" /> Deploy Latest Changes</>}
        {saveStatus === 'saving' && <><Loader2 className="w-5 h-5 animate-spin" /> Synchronizing...</>}
        {saveStatus === 'saved' && <><CheckCircle2 className="w-5 h-5" /> Changes Deployed</>}
      </motion.button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [settings, setSettings] = useState<ChurchSettings>(DEFAULT_SETTINGS);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('church_theme') === 'dark' || 
           (!('church_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('church_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('church_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('church_theme', 'light');
    }
  }, [darkMode]);

  const pageTitles: Record<Tab, string> = {
    home: 'Welcome',
    notes: 'Sermon Notes',
    news: 'Announcements',
    prayer: 'Prayer Wall',
    contact: 'Connect',
    admin: 'Admin Console'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-32 select-none overflow-x-hidden transition-colors duration-500">
      <AnimatePresence>
        {loading && <SplashScreen onFinish={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Header 
            title={pageTitles[activeTab]} 
            churchName={settings.name} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            onAdminClick={() => setActiveTab('admin')}
          />
          
          <main className="max-w-md mx-auto p-4 -mt-8 relative z-10 safe-area-bottom">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="min-h-[65vh]"
              >
                {activeTab === 'home' && <HomePage settings={settings} />}
                {activeTab === 'notes' && <NotesPage />}
                {activeTab === 'news' && <NewsPage announcements={settings.announcements} />}
                {activeTab === 'prayer' && <PrayerPage />}
                {activeTab === 'contact' && <ContactPage settings={settings} />}
                {activeTab === 'admin' && <AdminPage settings={settings} setSettings={setSettings} />}
              </motion.div>
            </AnimatePresence>
          </main>

          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>
      )}
    </div>
  );
}

