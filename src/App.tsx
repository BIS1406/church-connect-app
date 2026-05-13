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
  Book,
  Download,
  ChevronRight,
  Loader2,
  Trash2,
  CheckCircle2,
  Plus,
  Moon,
  Sun,
  Share2,
  Users,
  UserPlus,
  Search,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Camera,
  X,
  Edit2,
  Filter,
  MoreVertical,
  Activity,
  HelpCircle,
  ChevronLeft,
  Info,
  Bell,
  BellOff,
  Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { registerSW } from 'virtual:pwa-register';

// --- Types ---
type Tab = 'home' | 'notes' | 'news' | 'prayer' | 'contact' | 'admin' | 'assistant' | 'bible';

interface NotificationPrefs {
  announcements: boolean;
  prayerRequests: boolean;
  events: boolean;
  reminders: boolean;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'prayer' | 'event' | 'system';
  timestamp: Date;
  read: boolean;
}

interface TourStep {
  title: string;
  description: string;
  tab?: Tab;
  selector?: string;
}

const TOUR_STEPS: TourStep[] = [
  { 
    title: "Welcome to Grace!", 
    description: "Your digital spiritual companion is here. Let's take a quick look at how to navigate our church home.",
    tab: 'home'
  },
  { 
    title: "Grace AI Assistant", 
    description: "Have questions about the Word? Our Bible AI is available 24/7 to help you explore the Holy Scriptures.",
    tab: 'assistant'
  },
  { 
    title: "Spiritual Journaling", 
    description: "Capture wisdom during services. Your notes are categorized by sermon series and speaker automatically.",
    tab: 'notes'
  },
  { 
    title: "Never Miss a Moment", 
    description: "Stay updated with the latest church announcements and upcoming events in the News tab.",
    tab: 'news'
  },
  { 
    title: "The Prayer Wall", 
    description: "Share your burdens and lift others in prayer. Community prayer requests live right here.",
    tab: 'prayer'
  },
  { 
    title: "Connect & Serve", 
    description: "Join ministries, register as a member, and find our physical location to fellowship in person.",
    tab: 'contact'
  },
  { 
    title: "Church Console", 
    description: "For administrators: customize the app, manage members, and update sermons from this secure panel.",
    tab: 'admin'
  }
];

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

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

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  ministry: string;
  role: string;
  avatar?: string;
  attendanceStatus: 'active' | 'inactive' | 'on-leave';
  joinDate: string;
}

interface LiveStream {
  platform: 'youtube' | 'facebook';
  streamId: string;
  isLive: boolean;
  nextServiceDate: string; // ISO string
}

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  series: string;
  date: string;
}

interface SermonNoteEntry {
  id: string;
  sermonId?: string; // Reference to imported sermon if applicable
  title: string;
  speaker: string;
  series: string;
  content: string;
  date: string;
}

interface ChurchSettings {
  name: string;
  logoUrl?: string;
  pastor: string;
  phone: string;
  email: string;
  address: string;
  serviceTime: string;
  liveStream: LiveStream;
  announcements: Announcement[];
  scriptures: Scripture[];
  sermons: Sermon[];
}

const DEFAULT_SETTINGS: ChurchSettings = {
  name: 'Easy service',
  logoUrl: '',
  pastor: 'Pastor John Doe',
  phone: '(555) 123-4567',
  email: 'hello@churchconnect.com',
  address: '123 Grace Way, Faith City',
  serviceTime: 'Sun @ 10:00 AM',
  liveStream: {
    platform: 'youtube',
    streamId: 'dQw4w9WgXcQ', // Placeholder
    isLive: false,
    nextServiceDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
  },
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
    { id: '6', text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God with be with you wherever you go.", reference: "Joshua 1:9" },
    { id: '7', text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16" },
  ],
  sermons: [
    { id: '1', title: "The Power of Grace", speaker: "Pastor John Doe", series: "Grace Abounds", date: "2024-05-05" },
    { id: '2', title: "Walking in Faith", speaker: "Bishop Smith", series: "Foundations", date: "2024-05-12" }
  ]
};

// --- Components ---

const SplashScreen = ({ logoUrl, onFinish }: { logoUrl?: string, onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#080B13] z-[100] flex flex-col items-center justify-center text-white overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center relative"
      >
        <motion.div 
          animate={{ 
            boxShadow: ["0 0 20px rgba(99, 102, 241, 0.2)", "0 0 60px rgba(99, 102, 241, 0.4)", "0 0 20px rgba(99, 102, 241, 0.2)"] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-28 h-28 bg-indigo-600 rounded-[32px] flex items-center justify-center mb-8 relative z-10 overflow-hidden"
        >
          {logoUrl ? (
            <img src={logoUrl} className="w-full h-full object-cover" alt="logo" />
          ) : (
            <>
              <Church className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
            </>
          )}
        </motion.div>
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 font-display">Grace</h1>
        <p className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-[10px]">Connect</p>
      </motion.div>
      
      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500/50" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />
    </motion.div>
  );
};

const Header = ({ 
  title, 
  churchName, 
  logoUrl,
  darkMode, 
  setDarkMode, 
  onAdminClick,
  onNotifyClick,
  unreadCount
}: { 
  title: string, 
  churchName: string, 
  logoUrl?: string,
  darkMode: boolean, 
  setDarkMode: (v: boolean) => void, 
  onAdminClick: () => void,
  onNotifyClick: () => void,
  unreadCount: number
}) => (
  <header className="sticky top-0 z-40 px-4 pt-6 pb-2 transition-all duration-500">
    <div className="max-w-md mx-auto">
      <div className="glass shadow-premium rounded-[2rem] px-6 py-4 flex items-center justify-between border-white/40 dark:border-white/5">
        <div className="flex items-center gap-3">
          {logoUrl ? (
             <motion.img 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               src={logoUrl} 
               className="w-10 h-10 rounded-xl object-cover shadow-sm bg-white dark:bg-slate-800"
               alt="logo"
             />
          ) : (
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Church className="w-6 h-6" />
            </div>
          )}
          <motion.div
            key={title}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white leading-none mb-1">{title}</h1>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em]">{churchName}</p>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNotifyClick}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors relative group"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg">
                {unreadCount}
              </span>
            )}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAdminClick}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-950 dark:bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white"
          >
            <SettingsIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  </header>
);

const Navbar = ({ activeTab, setActiveTab }: { activeTab: Tab, setActiveTab: (tab: Tab) => void }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'bible', icon: Book, label: 'Bible' },
    { id: 'assistant', icon: Sparkles, label: 'Grace AI' },
    { id: 'news', icon: Megaphone, label: 'News' },
    { id: 'notes', icon: BookOpen, label: 'Notes' },
    { id: 'prayer', icon: Heart, label: 'Prayer' },
    { id: 'contact', icon: MapPin, label: 'Connect' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-40">
      <div className="glass shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] px-2 py-2 rounded-3xl flex justify-between items-center border-white/60 dark:border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if ('vibrate' in navigator) navigator.vibrate(10);
                setActiveTab(tab.id as Tab);
              }}
              className={`flex-1 flex flex-col items-center justify-center h-14 relative transition-all duration-300 group`}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-indigo-600 rounded-[1.25rem] shadow-lg shadow-indigo-600/30"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
              
              <motion.div
                animate={{ 
                  y: isActive ? -1 : 0,
                  scale: isActive ? 1.05 : 1
                }}
                className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <Icon className={`w-6 h-6`} />
              </motion.div>
              
              <AnimatePresence>
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-white relative z-10 mt-0.5 leading-none"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- Pages ---

const NotificationPrefsModal = ({ 
  prefs, 
  setPrefs, 
  onClose,
  requestPermission
}: { 
  prefs: NotificationPrefs, 
  setPrefs: (p: NotificationPrefs) => void, 
  onClose: () => void,
  requestPermission: () => void
}) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
    />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] shadow-premium overflow-hidden border border-white/10"
    >
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Notification Settings</h3>
          <button onClick={onClose} className="w-10 h-10 glass rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
           <button 
             onClick={requestPermission}
             className="w-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-600/20 transition-all border border-indigo-600/20"
           >
             <Bell className="w-5 h-5" />
             Enable System Notifications
           </button>

           <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] space-y-5 border border-slate-100 dark:border-white/5">
              {[
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
                { id: 'prayerRequests', label: 'Prayer Updates', icon: Heart },
                { id: 'events', label: 'Church Events', icon: Calendar },
                { id: 'reminders', label: 'Spiritual Reminders', icon: Activity },
              ].map(pref => (
                <div key={pref.id} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                         <pref.icon className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{pref.label}</span>
                   </div>
                   <button 
                     onClick={() => setPrefs({ ...prefs, [pref.id]: !prefs[pref.id as keyof NotificationPrefs] })}
                     className={`w-12 h-6 rounded-full transition-all duration-300 relative ${prefs[pref.id as keyof NotificationPrefs] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                   >
                     <motion.div 
                       animate={{ x: prefs[pref.id as keyof NotificationPrefs] ? 1 : -24 }}
                       className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                     />
                   </button>
                </div>
              ))}
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-slate-950 dark:bg-indigo-600 text-white py-4 rounded-2xl font-extrabold shadow-xl"
        >
          Save Preferences
        </button>
      </div>
    </motion.div>
  </div>
);

const NotificationCenter = ({ 
  notifications, 
  onClose, 
  onMarkAllRead,
  onOpenSettings
}: { 
  notifications: AppNotification[], 
  onClose: () => void, 
  onMarkAllRead: () => void,
  onOpenSettings: () => void
}) => (
  <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] pointer-events-auto"
    />
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-[#0F172A] shadow-2xl pointer-events-auto flex flex-col border-l border-white/10"
    >
       <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">Activity</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Spiritual Updates & Alerts</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
             <X className="w-6 h-6 text-slate-400" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                 <button 
                  onClick={onMarkAllRead}
                  className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-all"
                 >
                   <CheckCircle2 className="w-4 h-4" /> Mark All Read
                 </button>
                 <button 
                  onClick={onOpenSettings}
                  className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all"
                 >
                   <SettingsIcon className="w-4 h-4" /> Settings
                 </button>
              </div>
              {notifications.map(n => (
                <motion.div 
                  layout
                  key={n.id} 
                  className={`p-5 rounded-[2rem] border transition-all duration-300 ${
                    n.read 
                    ? 'bg-slate-50 dark:bg-white/2 border-slate-100 dark:border-white/5' 
                    : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-500/20 shadow-lg shadow-indigo-600/5'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      n.type === 'announcement' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                      n.type === 'prayer' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                      n.type === 'event' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}>
                       {n.type === 'announcement' && <Megaphone className="w-6 h-6" />}
                       {n.type === 'prayer' && <Heart className="w-6 h-6" />}
                       {n.type === 'event' && <Calendar className="w-6 h-6" />}
                       {n.type === 'system' && <Bell className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           {n.type} • {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!n.read && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-[15px] leading-tight">{n.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mt-1">{n.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full opacity-30 px-10 text-center">
                <BellOff className="w-16 h-16 text-slate-400 mb-6" />
                <p className="text-sm font-extrabold uppercase tracking-widest text-slate-500">Silence is Golden</p>
                <p className="text-xs font-medium text-slate-400 mt-2">We'll alert you when there's new spiritual activity.</p>
             </div>
          )}
       </div>

       <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20">
          <button 
            onClick={onOpenSettings}
            className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-extrabold flex items-center justify-center gap-3 shadow-xl"
          >
             <SettingsIcon className="w-5 h-5" /> Manage Notification Settings
          </button>
       </div>
    </motion.div>
  </div>
);

const DailyScriptureCard = ({ scriptures, onViewFull }: { scriptures: Scripture[], onViewFull: (ref: string) => void }) => {
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
        // Simple visual feedback could be added here
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-slate-900/50 p-7 rounded-[2.5rem] shadow-premium border border-slate-200/60 dark:border-white/5 relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white font-display text-base">Holy Word</h3>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="relative">
        <div className="absolute -left-2 top-0 text-7xl font-display text-indigo-500/10 select-none">“</div>
        <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-medium font-sans italic relative z-10 pl-2">
          {scripture.text}
        </p>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em]">{scripture.reference}</p>
        </div>
        <button 
          onClick={() => onViewFull(scripture.reference)}
          className="text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform"
        >
          Full Passage <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

const LiveStreamSection = ({ liveStream }: { liveStream: LiveStream }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    if (liveStream.isLive) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(liveStream.nextServiceDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [liveStream.nextServiceDate, liveStream.isLive]);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="overflow-hidden rounded-[2.5rem] shadow-premium border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/40"
    >
      {liveStream.isLive ? (
        <div className="flex flex-col">
          <div className="relative aspect-video bg-black group">
            {liveStream.platform === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${liveStream.streamId}?autoplay=1&mute=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe 
                src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(liveStream.streamId)}&show_text=0&width=560`} 
                className="w-full h-full"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-white text-[10px] font-bold uppercase tracking-widest shadow-xl animate-pulse z-10">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              Live Now
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white font-display text-base">Joined Broadcast</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Live from Sanctuary</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
               </div>
               <span className="text-[11px] font-bold text-slate-500">2.4k watching</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 relative min-h-[160px] flex flex-col justify-center items-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%)]" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Next Service In</span>
            </div>
            
            {timeLeft ? (
              <div className="flex gap-4 justify-center">
                {[
                  { val: timeLeft.d, label: 'Days' },
                  { val: timeLeft.h, label: 'Hrs' },
                  { val: timeLeft.m, label: 'Min' },
                  { val: timeLeft.s, label: 'Sec' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display tabular-nums leading-none mb-1">{String(item.val).padStart(2, '0')}</span>
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xl font-bold text-slate-400 animate-pulse">Stay Tuned for Glory</div>
            )}
            
            <div className="mt-8">
              <button className="glass px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                Notify Me
              </button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000">
             <Megaphone className="w-32 h-32" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const HomePage = ({ settings, onViewFull }: { settings: ChurchSettings, onViewFull: (ref: string) => void }) => {
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('church_members');
    if (saved) {
      setMemberCount(JSON.parse(saved).length);
    }
  }, []);

  return (
    <div className="space-y-6">
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-72 w-full bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/5"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-indigo-600 mix-blend-overlay" />
        <img 
          src="https://images.unsplash.com/photo-1548625361-1d5462cfdd69?auto=format&fit=crop&q=80&w=1000" 
          className="w-full h-full object-cover"
          alt="church background"
        />
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 p-4 shadow-3xl mb-4 group"
        >
          <img src="/icon.svg" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="Logo" />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-center">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-extrabold text-white font-display tracking-tight mb-1">{settings.name}</h1>
          <p className="text-indigo-200/60 text-[10px] font-bold uppercase tracking-[0.3em]">{settings.address}</p>
        </motion.div>
      </div>
    </motion.div>

    <LiveStreamSection liveStream={settings.liveStream} />

    <div className="grid grid-cols-2 gap-4">
      {[
        { label: 'Sunday Service', value: settings.serviceTime, icon: Clock, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Total Members', value: `${memberCount} Strong`, icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        { label: 'Lead Pastor', value: settings.pastor, icon: Church, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10' },
        { label: 'Connect', value: settings.phone, icon: Phone, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/10' },
      ].map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.1 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-premium border border-slate-200/50 dark:border-white/5 flex flex-col items-center text-center group"
        >
          <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6 shadow-inner`}>
            <item.icon className="w-6 h-6 hover:scale-110" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-widest">{item.label}</h3>
          <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-2 truncate w-full px-2">{item.value}</p>
        </motion.div>
      ))}
    </div>

    <DailyScriptureCard scriptures={settings.scriptures} onViewFull={onViewFull} />
  </div>
  );
};

const NotesPage = ({ sermons }: { sermons: Sermon[] }) => {
  const [entries, setEntries] = useState<SermonNoteEntry[]>(() => {
    const saved = localStorage.getItem('church_notes_v2');
    if (saved) return JSON.parse(saved);
    // Migration from old single-note system
    const old = localStorage.getItem('church_notes');
    if (old && old.trim()) {
      return [{
        id: 'legacy',
        title: 'Archived Notes',
        speaker: 'Unknown',
        series: 'General',
        content: old,
        date: new Date().toLocaleDateString()
      }];
    }
    return [];
  });

  const [activeNote, setActiveNote] = useState<SermonNoteEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'series' | 'speaker'>('all');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    localStorage.setItem('church_notes_v2', JSON.stringify(entries));
  }, [entries]);

  const addNote = (source?: Sermon) => {
    const newNote: SermonNoteEntry = {
      id: Date.now().toString(),
      sermonId: source?.id,
      title: source?.title || 'New Sermon Note',
      speaker: source?.speaker || 'Unknown Speaker',
      series: source?.series || 'Individual Sermon',
      content: '',
      date: new Date().toLocaleDateString()
    };
    setEntries([newNote, ...entries]);
    setActiveNote(newNote);
  };

  const updateNote = (id: string, updates: Partial<SermonNoteEntry>) => {
    setEntries(entries.map(e => e.id === id ? { ...e, ...updates } : e));
    if (activeNote?.id === id) {
      setActiveNote({ ...activeNote, ...updates });
    }
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this sermon note forever?")) {
      setEntries(entries.filter(e => e.id !== id));
      if (activeNote?.id === id) setActiveNote(null);
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.speaker.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'series') return matchesSearch && e.series === filterValue;
    if (filterType === 'speaker') return matchesSearch && e.speaker === filterValue;
    return matchesSearch;
  });

  const seriesOptions = Array.from(new Set(entries.map(e => e.series))).filter(Boolean);
  const speakerOptions = Array.from(new Set(entries.map(e => e.speaker))).filter(Boolean);

  if (activeNote) {
    return (
      <div className="space-y-6 flex flex-col h-[75vh]">
        <div className="flex items-center justify-between px-2">
          <button 
            onClick={() => setActiveNote(null)}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-indigo-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-xs uppercase tracking-widest">Back to Library</span>
          </button>
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Auto-Saving</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium border border-slate-200/50 dark:border-white/5 overflow-hidden flex flex-col flex-grow">
          <div className="p-7 pb-4 border-b border-slate-100 dark:border-white/5 space-y-4">
             <input 
               value={activeNote.title}
               onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
               className="w-full bg-transparent text-xl font-extrabold text-slate-900 dark:text-white focus:outline-none font-display"
               placeholder="Sermon Title"
             />
             <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Speaker</label>
                  <input 
                    value={activeNote.speaker}
                    onChange={(e) => updateNote(activeNote.id, { speaker: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
                    placeholder="Pastor Name"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Series/Category</label>
                  <input 
                    value={activeNote.series}
                    onChange={(e) => updateNote(activeNote.id, { series: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none"
                    placeholder="Sermon Series"
                  />
                </div>
             </div>
          </div>
          
          <textarea
            value={activeNote.content}
            onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
            placeholder="Type your notes from today's sermon..."
            className="flex-grow w-full p-8 focus:outline-none text-slate-700 dark:text-slate-200 leading-relaxed resize-none text-[15px] placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent font-medium"
          />
        </div>

        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const fullText = `Sermon: ${activeNote.title}\nSpeaker: ${activeNote.speaker}\nSeries: ${activeNote.series}\nDate: ${activeNote.date}\n\nNotes:\n${activeNote.content}`;
            const blob = new Blob([fullText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Sermon-Notes-${activeNote.title.replace(/\s+/g, '-')}.txt`;
            a.click();
          }}
          className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-extrabold shadow-2xl flex items-center justify-center gap-3"
        >
          Export Word Document <Send className="w-5 h-5" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
           <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Notes Library</h2>
           <button 
              onClick={() => alert("Notes are automatically categorized by speaker or series if linked to a sermon data. You can filter them by tapping the tags above yours list.")}
              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
           >
              <Info className="w-3.5 h-3.5" />
           </button>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => addNote()}
          className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>

      <div className="space-y-4">
        {/* Search & Filter UI */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search in notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 glass rounded-2xl border-white/60 dark:border-white/10 text-sm font-medium focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
             <button 
               onClick={() => { setFilterType('all'); setFilterValue(''); }}
               className={`px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-white/5'}`}
             >
               All
             </button>
             {seriesOptions.map(s => (
                <button 
                  key={s}
                  onClick={() => { setFilterType('series'); setFilterValue(s); }}
                  className={`px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-all whitespace-nowrap ${filterType === 'series' && filterValue === s ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-white/5'}`}
                >
                  Series: {s}
                </button>
             ))}
             {speakerOptions.map(s => (
                <button 
                  key={s}
                  onClick={() => { setFilterType('speaker'); setFilterValue(s); }}
                  className={`px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-all whitespace-nowrap ${filterType === 'speaker' && filterValue === s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-white/5'}`}
                >
                  Speaker: {s}
                </button>
             ))}
          </div>
        </div>

        {/* Importable Sermons (if any from admin) */}
        {sermons.length > 0 && filterType === 'all' && searchTerm === '' && (
          <div className="space-y-3">
             <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-2">Recent Sermons to Note</h3>
             <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {sermons.map(s => (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addNote(s)}
                    className="flex-shrink-0 w-64 glass p-4 rounded-3xl text-left border-white/60 dark:border-white/5 bg-gradient-to-tr from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-900/10 hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{s.date}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">{s.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{s.speaker}</p>
                  </motion.button>
                ))}
             </div>
          </div>
        )}

        {/* Notes List */}
        <div className="grid gap-4">
          {filteredEntries.length > 0 ? filteredEntries.map((note, i) => (
            <motion.div 
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveNote(note)}
              className="bg-white dark:bg-slate-900 p-6 rounded-[2.25rem] shadow-premium border border-slate-200 dark:border-white/5 relative group cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                   <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{note.date}</span>
                 </div>
                 <button 
                  onClick={(e) => deleteNote(note.id, e)}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1 group-hover:text-indigo-600 transition-colors">{note.title}</h3>
              <div className="flex gap-3 items-center">
                 <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{note.speaker}</p>
                 <div className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">{note.series}</p>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {note.content || "No content yet..."}
              </p>
            </motion.div>
          )) : (
            <div className="py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto opacity-40">
                  <BookOpen className="w-8 h-8" />
               </div>
               <p className="text-sm font-bold text-slate-400">Your spiritual journal is empty</p>
               <button 
                 onClick={() => addNote()}
                 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest hover:underline"
               >
                 Start Your First Note
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NewsPage = ({ announcements }: { announcements: Announcement[] }) => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
           <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">News Feed</h2>
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">{announcements.length} Items</span>
      </div>
      
      <div className="space-y-5">
        {announcements.map((item, i) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white dark:bg-slate-900/40 p-6 rounded-[2.25rem] shadow-premium border border-slate-200/60 dark:border-white/5 flex flex-col gap-5 relative overflow-hidden group active:scale-[0.98] transition-all"
          >
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full ${
                i % 3 === 0 ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 
                i % 3 === 1 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              }`}>
                {item.category}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <Calendar className="w-3.5 h-3.5" /> {item.date}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
               <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.1em]">View Details</span>
               <ChevronRight className="w-3 h-3 text-indigo-500" />
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-[0.04] dark:opacity-[0.08] pointer-events-none group-hover:scale-110 transition-transform duration-700">
               <Megaphone className="w-24 h-24 -rotate-12" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PrayerPage = ({ addNotification }: { addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void }) => {
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
    
    // Trigger notification
    addNotification({
      type: 'prayer',
      title: 'New Prayer Request',
      message: `${newRequest.name} just posted a prayer request on the wall.`
    });

    setSubmitted(true);
    setName('');
    setDetails('');
    if ('vibrate' in navigator) navigator.vibrate([20, 40, 20]);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="px-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">Prayer Wall</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Supporting each other through faith and intercession</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass p-12 rounded-[3rem] flex flex-col items-center text-center space-y-4 border-green-200/30 dark:border-green-500/10 shadow-[0_30px_60px_-15px_rgba(34,197,94,0.15)]"
          >
            <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 rotate: [0, 10, -10, 0] 
               }}
               className="w-20 h-20 bg-green-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-green-500/40"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">Faith Received</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-[240px] leading-relaxed font-medium">We stand in agreement with you. Your heart's cry has been heard.</p>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-5 bg-white dark:bg-slate-900/40 p-1 rounded-[2.5rem] shadow-premium"
          >
            <div className="p-7 space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Identity</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text" 
                  placeholder="Your name or Anonymous" 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Your Request</label>
                <textarea 
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="How can we stand with you in prayer today?" 
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium dark:text-white leading-relaxed resize-none"
                />
              </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-extrabold shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <span className="relative z-10">Send to Prayer Warriors</span>
                <Send className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/0 via-white/5 to-white/10" />
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4 px-2">
             <div className="h-px bg-slate-200 dark:bg-white/10 flex-grow" />
             <h3 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] whitespace-nowrap">Community Wall</h3>
             <div className="h-px bg-slate-200 dark:bg-white/10 flex-grow" />
          </div>
          
          <div className="space-y-4 px-1">
            {history.map((req, i) => (
              <motion.div 
                layout
                key={req.id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-premium group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                      <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-[15px]">{req.name}</h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">{req.date}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        const newHistory = history.filter(r => r.id !== req.id);
                        setHistory(newHistory);
                        localStorage.setItem('prayer_history', JSON.stringify(newHistory));
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-slate-50 dark:bg-slate-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="pl-1 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900/30 ml-5">
                   <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                     "{req.details}"
                   </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BiblePage = ({ initialReference }: { initialReference?: string }) => {
  const [reference, setReference] = useState(initialReference || 'John 3:16');
  const [inputRef, setInputRef] = useState(initialReference || 'John 3:16');
  const [passage, setPassage] = useState<{ text: string, reference: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBible = async (ref: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}`);
      if (!res.ok) throw new Error('Scripture not found. Try a different reference (e.g., John 3:1-21)');
      const data = await res.json();
      setPassage({
        text: data.text,
        reference: data.reference
      });
      setReference(data.reference);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBible(reference);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef) fetchBible(inputRef);
  };

  return (
    <div className="space-y-6 flex flex-col h-[75vh]">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Holy Bible</h2>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          value={inputRef}
          onChange={(e) => setInputRef(e.target.value)}
          placeholder="Search Reference (e.g. Psalm 23)"
          className="w-full pl-11 pr-4 py-4 glass rounded-2xl border-white/60 dark:border-white/10 text-sm font-medium focus:outline-none"
        />
        <button type="submit" className="hidden" />
      </form>

      <div className="flex-grow glass rounded-[2.5rem] shadow-premium overflow-y-auto no-scrollbar relative flex flex-col">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Opening the Word...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-4">
             <Info className="w-12 h-12 text-amber-500 mx-auto opacity-50" />
             <p className="text-sm font-medium text-slate-500">{error}</p>
          </div>
        ) : passage ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-2">
               <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">{passage.reference}</h3>
               <span className="text-[9px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-2 py-1 rounded-md">WEB Version</span>
            </div>
            <div className="space-y-4">
              {passage.text.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-slate-700 dark:text-slate-300 leading-[1.8] font-serif text-[17px]">
                  {para}
                </p>
              ))}
            </div>
            <div className="pt-8 flex justify-center">
               <div className="w-12 h-1 bg-slate-100 dark:bg-white/5 rounded-full" />
            </div>
          </motion.div>
        ) : null}
      </div>

      <div className="flex gap-3">
         {['John 3', 'Psalm 23', 'Romans 8', 'Hebrews 11'].map(suggest => (
            <button 
              key={suggest}
              onClick={() => { setInputRef(suggest); fetchBible(suggest); }}
              className="flex-1 py-3 glass rounded-xl text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              {suggest}
            </button>
         ))}
      </div>
    </div>
  );
};

const AssistantPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('bible_chat_history');
    return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [
      {
        id: '1',
        role: 'model',
        text: "Greetings! I'm your Bible Study Assistant. How can I help you explore the Holy Scriptures today?",
        timestamp: new Date()
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('bible_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are a wise and compassionate Bible Study Assistant for a church app. Your name is 'Grace'. Assist users with Bible questions, verse suggestions, and daily encouragement. Always use the Bible as your primary source. Be encouraging, theological but accessible, and respectful. If asked about personal advice, always suggest they also consult with their Pastor or local church community. Keep responses concise and use Markdown for formatting (bold verses, lists, etc).",
        },
        history: history.slice(-10) // Limit context to last 10 messages
      });

      const result = await chat.sendMessage({ message: input });
      const responseText = result.text;

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm sorry, I couldn't find the words right now. Let's try again or look into the Word directly.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I had a momentary disconnection. Please check your connection or try again. May peace be with you.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear our conversation history?")) {
      setMessages([
        {
          id: Date.now().toString(),
          role: 'model',
          text: "Greetings! I'm your Bible Study Assistant. How can I help you explore the Holy Scriptures today?",
          timestamp: new Date()
        }
      ]);
    }
  };

  const suggestions = [
    "Give me a verse for strength",
    "Explain Romans 8:28",
    "What does the Bible say about peace?",
    "Morning prayer suggestion"
  ];

  return (
    <div className="flex flex-col h-[75vh] space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Grace AI</h2>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              alert("Grace AI is your study companion. Ask questions about Bible verses, history, or theological concepts. We use the KJV and NIV as primary references.");
            }}
            className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Clear Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow glass rounded-[2.5rem] shadow-premium overflow-y-auto p-5 space-y-4 no-scrollbar"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-[1.5rem] ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm border border-slate-100 dark:border-white/5'
            }`}>
              <p className="text-[13px] leading-relaxed font-medium whitespace-pre-wrap">
                {msg.text}
              </p>
              <span className={`text-[8px] mt-2 block opacity-50 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm border border-slate-100 dark:border-white/5">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        {messages.length < 3 && !isLoading && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  // Trigger handleSend in next tick
                  setTimeout(() => document.getElementById('chat-send-btn')?.click(), 10);
                }}
                className="whitespace-nowrap px-4 py-2 glass rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 border-white/40 dark:border-white/5 hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about the Word..."
            className="w-full pl-6 pr-16 py-5 glass rounded-[2rem] border-white/60 dark:border-white/10 shadow-premium focus:outline-none text-sm font-medium dark:text-white"
          />
          <button
            id="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactPage = ({ settings }: { settings: ChurchSettings }) => {
  const [showReg, setShowReg] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', ministry: 'Choir' });
  const [submitted, setSubmitted] = useState(false);

  const ministries = ["Choir", "Youth", "Ushering", "Media", "Children", "Evangelism"];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      id: Date.now().toString(),
      ...formData,
      role: 'Member',
      attendanceStatus: 'active',
      joinDate: new Date().toLocaleDateString()
    };
    
    const saved = localStorage.getItem('church_members');
    const members = saved ? JSON.parse(saved) : [];
    localStorage.setItem('church_members', JSON.stringify([newMember, ...members]));
    
    setSubmitted(true);
    if ('vibrate' in navigator) navigator.vibrate([20, 40, 20]);
    setTimeout(() => {
      setSubmitted(false);
      setShowReg(false);
      setFormData({ name: '', phone: '', email: '', ministry: 'Choir' });
    }, 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col items-center justify-center text-center space-y-2 mb-4 pt-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-slate-950 dark:bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl relative group"
        >
          <Church className="w-12 h-12 text-white group-hover:scale-110 transition-all duration-500" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-full border-4 border-[#F9FBFF] dark:border-[#080B13] shadow-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] blur-xl -z-10 opacity-0 group-hover:opacity-40 transition-opacity" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display uppercase tracking-tight">{settings.name}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-500 px-12 leading-loose font-medium italic">
            "A community of faith, where every soul finds belonging and every heart finds hope."
        </p>
      </div>

      {!showReg ? (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowReg(true)}
          className="w-full bg-indigo-600 text-white p-7 rounded-[2.5rem] shadow-premium flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-lg font-display">Join a Ministry</h3>
              <p className="text-[10px] uppercase font-bold text-indigo-100 tracking-widest mt-0.5">Become part of our family</p>
            </div>
          </div>
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-5 h-5" />
          </div>
        </motion.button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900/40 p-1 rounded-[2.5rem] shadow-premium border border-slate-200/50 dark:border-white/5"
        >
          <div className="p-7 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">Registration</h3>
              <button 
                onClick={() => setShowReg(false)}
                className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest hover:text-red-500"
              >
                Cancel
              </button>
            </div>

            {submitted ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-green-600">Welcome to the Team!</h4>
                <p className="text-xs text-slate-500 font-medium max-w-xs">Your registration was successful. We will reach out soon.</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    type="tel"
                    placeholder="e.g. +1 234 567 890"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Select Ministry</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ministries.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormData({...formData, ministry: m})}
                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${formData.ministry === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-white/5'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-slate-950 dark:bg-indigo-600 text-white py-5 rounded-[1.5rem] font-extrabold shadow-xl mt-4"
                >
                  Join Ministry Now
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>
      )}
      
      <div className="space-y-4">
        {[
          { label: 'Voice Connect', value: settings.phone, icon: Phone, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Digital Mail', value: settings.email, icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
          { label: 'Our Sanctuary', value: settings.address, icon: Navigation, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-slate-900/40 p-5 rounded-[1.75rem] shadow-premium border border-slate-200/50 dark:border-white/5 flex items-center gap-5 hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all cursor-pointer group"
          >
            <div className={`w-14 h-14 ${item.bg} rounded-[1.25rem] flex items-center justify-center ${item.color} shadow-inner group-hover:scale-105 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-[0.2em] mb-1">{item.label}</p>
              <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-200">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="h-56 w-full glass rounded-[2.5rem] overflow-hidden shadow-premium border-white/40 dark:border-white/5 relative mt-4">
        <iframe 
          title="Church Location Map"
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no" 
          marginHeight={0} 
          marginWidth={0} 
          src={`https://www.openstreetmap.org/export/embed.html?bbox=-74.015,40.705,-73.995,40.715&layer=mapnik&marker=40.71,-74.005`}
          className="grayscale dark:invert contrast-125 brightness-110 dark:brightness-90 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/20 dark:to-black/40 pointer-events-none" />
        <div className="absolute bottom-4 left-4 right-4 glass px-4 py-2 rounded-xl flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Live View</span>
            <Navigation className="w-3.5 h-3.5 text-indigo-500" />
        </div>
      </div>
    </div>
  );
};const AdminPage = ({ 
  settings, 
  setSettings,
  addNotification
}: { 
  settings: ChurchSettings, 
  setSettings: (s: ChurchSettings) => void,
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void 
}) => {
  const [formData, setFormData] = useState<ChurchSettings>(settings);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'identity' | 'live' | 'announcements' | 'scriptures' | 'members' | 'sermons'>('info');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('church_members');
    if (saved) setMembers(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSettings(formData);
      localStorage.setItem('church_settings', JSON.stringify(formData));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max size 400px
          if (width > height) {
            if (width > 400) {
              height *= 400 / width;
              width = 400;
            }
          } else {
            if (height > 400) {
              width *= 400 / height;
              height = 400;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/png', 0.8);
          setFormData({ ...formData, logoUrl: compressed });
          
          addNotification({
            type: 'system',
            title: 'Visual Identity Updated',
            message: 'Your church logo has been successfully updated across the platform.'
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const syncMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    localStorage.setItem('church_members', JSON.stringify(newMembers));
  };

  const upsertMember = (member: Member) => {
    const exists = members.find(m => m.id === member.id);
    if (exists) {
      syncMembers(members.map(m => m.id === member.id ? member : m));
    } else {
      syncMembers([member, ...members]);
      addNotification({
        type: 'system',
        title: 'New Member Record',
        message: `${member.name} has been added to the administrative database.`
      });
    }
    setShowMemberModal(false);
    setEditingMember(null);
  };

  const removeMember = (id: string) => {
    if (window.confirm("Remove this member permanently?")) {
      const removedMember = members.find(m => m.id === id);
      syncMembers(members.filter(m => m.id !== id));
      if (removedMember) {
        addNotification({
          type: 'system',
          title: 'Member Record Removed',
          message: `${removedMember.name}'s data has been purged from the system.`
        });
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.phone.includes(search) || 
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.ministry.toLowerCase().includes(search.toLowerCase())
  );

  const updateLiveStream = (updates: Partial<LiveStream>) => {
    const newLiveState = { ...formData.liveStream, ...updates };
    setFormData({
      ...formData,
      liveStream: newLiveState
    });

    if (updates.isLive === true) {
      addNotification({
        type: 'event',
        title: '🔴 We are Live!',
        message: 'A live broadcast has just started. Tap to join the fellowship online.'
      });
    }
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
    
    addNotification({
      type: 'announcement',
      title: 'New Announcement',
      message: 'A new post has been added to the church feed. Stay informed!'
    });
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

  const addSermon = () => {
    const newSermon: Sermon = {
      id: Date.now().toString(),
      title: "New Sermon",
      speaker: formData.pastor,
      series: "Individual Sermon",
      date: new Date().toISOString().split('T')[0]
    };
    setFormData({ ...formData, sermons: [newSermon, ...formData.sermons || []] });

    addNotification({
      type: 'event',
      title: 'New Sermon Available',
      message: `"${newSermon.title}" by ${newSermon.speaker} is now available in your notes.`
    });
  };

  const removeSermon = (id: string) => {
    setFormData({ ...formData, sermons: formData.sermons.filter(s => s.id !== id) });
  };

  const updateSermon = (id: string, updates: Partial<Sermon>) => {
    setFormData({
      ...formData,
      sermons: formData.sermons.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  return (
    <div className="space-y-6 pb-32">
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[1.5rem] border border-slate-200/60 dark:border-white/5 shadow-inner overflow-x-auto no-scrollbar">
        {[
          { id: 'info', label: 'Info' },
          { id: 'identity', label: 'Identity' },
          { id: 'live', label: 'Stream' },
          { id: 'announcements', label: 'Feed' },
          { id: 'sermons', label: 'Sermons' },
          { id: 'scriptures', label: 'Holy' },
          { id: 'members', label: 'Members' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`min-w-[70px] flex-1 py-3 px-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xl' : 'text-slate-400 dark:text-slate-500'}`}
          >
            {tab.label}
          </button>
        ))}
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
              <div key={field.key} className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
                <input 
                   disabled={saveStatus !== 'idle'}
                  type="text"
                  value={formData[field.key as keyof ChurchSettings] as string}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="w-full px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium dark:text-white"
                />
              </div>
            ))}
          </motion.div>
        ) : activeSubTab === 'identity' ? (
          <motion.div 
            key="identity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-premium border border-slate-200/60 dark:border-white/5 flex flex-col items-center">
               <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-8">Church Logo</h3>
               
               <div className="relative group">
                 <div className="w-32 h-32 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <Church className="w-12 h-12 text-slate-300" />
                    )}
                 </div>
                 <label className="absolute bottom-[-10px] right-[-10px] w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                    <Camera className="w-6 h-6" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                 </label>
               </div>

               {formData.logoUrl && (
                 <button 
                  onClick={() => setFormData({ ...formData, logoUrl: '' })}
                  className="mt-8 text-[10px] font-extrabold text-red-500 uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-full transition-all"
                 >
                   <Trash2 className="w-4 h-4" /> Remove Logo
                 </button>
               )}

               <p className="mt-8 text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium max-w-[200px] leading-relaxed">
                 Uploaded logo will appear across the app instantly. PNG or JPG recommended.
               </p>
            </div>
          </motion.div>
        ) : activeSubTab === 'live' ? (
          <motion.div 
            key="live"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] shadow-premium border border-slate-200/60 dark:border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Status Control</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Toggle Live Feed</p>
                </div>
                <button 
                  onClick={() => updateLiveStream({ isLive: !formData.liveStream.isLive })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.liveStream.isLive ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.liveStream.isLive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Streaming Platform</label>
                <div className="grid grid-cols-2 gap-3">
                  {['youtube', 'facebook'].map((p) => (
                    <button
                      key={p}
                      onClick={() => updateLiveStream({ platform: p as any })}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${formData.liveStream.platform === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-white/5'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  {formData.liveStream.platform === 'youtube' ? 'Video ID' : 'Full Video URL'}
                </label>
                <input 
                  type="text"
                  value={formData.liveStream.streamId}
                  onChange={(e) => updateLiveStream({ streamId: e.target.value })}
                  placeholder={formData.liveStream.platform === 'youtube' ? 'e.g. dQw4w9WgXcQ' : 'https://facebook.com/watch/?v=...'}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Next Service Date/Time</label>
                <input 
                  type="datetime-local"
                  value={formData.liveStream.nextServiceDate.slice(0, 16)}
                  onChange={(e) => updateLiveStream({ nextServiceDate: new Date(e.target.value).toISOString() })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium dark:text-white [color-scheme:dark]"
                />
              </div>
            </div>
          </motion.div>
        ) : activeSubTab === 'announcements' ? (
          <motion.div 
            key="announcements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={addAnnouncement}
              className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] text-slate-400 dark:text-slate-600 font-extrabold text-xs flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all group"
            >
              <div className="w-8 h-8 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-indigo-500" />
              </div>
              Create New Feed Item
            </motion.button>
            {formData.announcements.map((ann) => (
              <div key={ann.id} className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] shadow-premium border border-slate-200/60 dark:border-white/5 space-y-5 relative overflow-hidden">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Headline</label>
                    <input 
                        className="w-full font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl focus:outline-none text-sm border border-slate-100 dark:border-white/5"
                        value={ann.title}
                        onChange={(e) => updateAnnouncement(ann.id, { title: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={() => removeAnnouncement(ann.id)}
                    className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl mt-6 active:scale-90 transition-all border border-red-200/30 dark:border-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tag</label>
                    <input 
                        className="w-full text-[11px] uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-3 rounded-xl focus:outline-none border border-indigo-100/30 dark:border-indigo-500/10"
                        value={ann.category}
                        onChange={(e) => updateAnnouncement(ann.id, { category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Timeframe</label>
                    <input 
                        className="w-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl focus:outline-none border border-slate-100 dark:border-white/5"
                        value={ann.date}
                        onChange={(e) => updateAnnouncement(ann.id, { date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea 
                        className="w-full text-[13px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl focus:outline-none leading-relaxed resize-none h-28 border border-slate-100 dark:border-white/5 font-medium"
                        value={ann.desc}
                        onChange={(e) => updateAnnouncement(ann.id, { desc: e.target.value })}
                        rows={3}
                    />
                </div>
              </div>
            ))}
          </motion.div>
        ) : activeSubTab === 'sermons' ? (
          <motion.div 
            key="sermons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={addSermon}
              className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] text-slate-400 dark:text-slate-600 font-extrabold text-xs flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all group"
            >
              <div className="w-8 h-8 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-indigo-500" />
              </div>
              Import New Sermon Data
            </motion.button>
            {formData.sermons?.map((sermon) => (
              <div key={sermon.id} className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] shadow-premium border border-slate-200/60 dark:border-white/5 space-y-4">
                 <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Title</label>
                    <input 
                        className="w-full font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl focus:outline-none text-sm border border-slate-100 dark:border-white/5"
                        value={sermon.title}
                        onChange={(e) => updateSermon(sermon.id, { title: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={() => removeSermon(sermon.id)}
                    className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl mt-6 border border-red-200/30 dark:border-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Speaker</label>
                    <input 
                        className="w-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl focus:outline-none border border-slate-100 dark:border-white/5"
                        value={sermon.speaker}
                        onChange={(e) => updateSermon(sermon.id, { speaker: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Series</label>
                    <input 
                        className="w-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl focus:outline-none border border-slate-100 dark:border-white/5"
                        value={sermon.series}
                        onChange={(e) => updateSermon(sermon.id, { series: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</label>
                  <input 
                      type="date"
                      className="w-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl focus:outline-none border border-slate-100 dark:border-white/5 [color-scheme:dark]"
                      value={sermon.date}
                      onChange={(e) => updateSermon(sermon.id, { date: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        ) : activeSubTab === 'members' ? (
           <motion.div 
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                />
              </div>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                title="Invite Member"
              >
                <Send className="w-6 h-6" />
              </button>
              <button 
                onClick={() => { setEditingMember(null); setShowMemberModal(true); }}
                className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                title="Add Member Manually"
              >
                <UserPlus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {filteredMembers.length > 0 ? filteredMembers.map((m) => (
                <div key={m.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-premium border border-slate-200 dark:border-white/5 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {m.avatar ? (
                        <img src={m.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-slate-100 dark:bg-slate-800" alt={m.name} />
                      ) : (
                        <div className="w-16 h-16 bg-slate-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Users className="w-7 h-7" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-[15px]">{m.name}</h4>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.role}</span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${
                            m.attendanceStatus === 'active' ? 'text-emerald-500' : 
                            m.attendanceStatus === 'inactive' ? 'text-red-400' : 'text-amber-500'
                          }`}>
                            {m.attendanceStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                     <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ministry</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{m.ministry}</p>
                     </div>
                     <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{m.phone}</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingMember(m); setShowMemberModal(true); }}
                      className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => removeMember(m.id)}
                      className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center text-slate-400">
                   <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                   <p className="text-sm font-bold">No spiritual companions found</p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {showInviteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowInviteModal(false)}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium overflow-hidden border border-white/10"
                  >
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Invite Member</h3>
                        <button onClick={() => setShowInviteModal(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Send a digital invitation to join our church community app.</p>
                        
                        <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
                          <button 
                            onClick={() => {}} 
                            className="flex-1 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5"
                          >
                            Digital Message
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Recipient Contact</label>
                          <input 
                            placeholder="Email or Phone number"
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 outline-none"
                            id="invite-recipient"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Message Preview</label>
                          <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5 italic text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            "Shalom! We'd love to have you in our church community. Join our digital fellowship for sermons, prayer requests, and more. Register here: {window.location.origin}"
                          </div>
                        </div>

                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const input = document.getElementById('invite-recipient') as HTMLInputElement;
                            if (input.value) {
                              addNotification({
                                type: 'system',
                                title: 'Invitation Sent',
                                message: `Divine invitation dispatched to ${input.value} successfully.`
                              });
                              setShowInviteModal(false);
                            } else {
                              alert("Please enter a contact address.");
                            }
                          }}
                          className="w-full bg-amber-500 text-white py-5 rounded-[1.5rem] font-extrabold shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3"
                        >
                          Send Invitation <Send className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Member Modal */}
            <AnimatePresence>
              {showMemberModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setShowMemberModal(false)}
                     className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                   />
                   <motion.div 
                     initial={{ y: 100, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     exit={{ y: 100, opacity: 0 }}
                     className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium overflow-hidden"
                   >
                     <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                           <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                             {editingMember ? 'Edit Profile' : 'New Member'}
                           </h3>
                           <button onClick={() => setShowMemberModal(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
                              <X className="w-5 h-5" />
                           </button>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => {
                          e.preventDefault();
                          const data = new FormData(e.currentTarget);
                          const member: Member = {
                            id: editingMember?.id || Date.now().toString(),
                            name: data.get('name') as string,
                            phone: data.get('phone') as string,
                            email: data.get('email') as string,
                            ministry: data.get('ministry') as string,
                            role: data.get('role') as string,
                            attendanceStatus: data.get('attendanceStatus') as any,
                            avatar: editingMember?.avatar || '',
                            joinDate: editingMember?.joinDate || new Date().toLocaleDateString()
                          };
                          upsertMember(member);
                        }}>
                           <div className="flex justify-center mb-6">
                             <div className="relative">
                               <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                                  {editingMember?.avatar ? (
                                    <img src={editingMember.avatar} className="w-full h-full object-cover" alt="preview" />
                                  ) : (
                                    <Users className="w-8 h-8 text-slate-300" />
                                  )}
                               </div>
                               <label className="absolute bottom-[-10px] right-[-10px] w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl cursor-pointer">
                                  <Camera className="w-5 h-5" />
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setEditingMember(prev => prev ? { ...prev, avatar: reader.result as string } : {
                                           id: '', name: '', phone: '', email: '', ministry: '', role: '', attendanceStatus: 'active', joinDate: '', avatar: reader.result as string
                                        } as any);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} />
                               </label>
                             </div>
                           </div>

                           <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                             <input required name="name" defaultValue={editingMember?.name} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 text-sm" />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                <input required name="phone" defaultValue={editingMember?.phone} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 text-sm" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                                <select name="role" defaultValue={editingMember?.role || 'Member'} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 text-sm appearance-none">
                                   <option>Member</option>
                                   <option>Vocalist</option>
                                   <option>Musician</option>
                                   <option>Usher</option>
                                   <option>Admin</option>
                                   <option>Pastor</option>
                                </select>
                              </div>
                           </div>

                           <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Ministry</label>
                             <select name="ministry" defaultValue={editingMember?.ministry} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-white/5 text-sm appearance-none">
                                <option>Choir</option>
                                <option>Youth</option>
                                <option>Ushering</option>
                                <option>Media</option>
                                <option>Children</option>
                                <option>Evangelism</option>
                             </select>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                              <div className="flex gap-2">
                                 {['active', 'inactive', 'on-leave'].map(s => (
                                   <label key={s} className="flex-1">
                                      <input type="radio" name="attendanceStatus" value={s} defaultChecked={(editingMember?.attendanceStatus || 'active') === s} className="hidden peer" />
                                      <div className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-center text-[10px] font-extrabold uppercase tracking-widest cursor-pointer peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition-all">
                                         {s}
                                      </div>
                                   </label>
                                 ))}
                              </div>
                           </div>

                           <motion.button 
                             whileTap={{ scale: 0.98 }}
                             className="w-full bg-slate-950 dark:bg-indigo-600 text-white py-4 rounded-2xl font-extrabold shadow-xl mt-4"
                           >
                              {editingMember ? 'Update Profile' : 'Confirm Registration'}
                           </motion.button>
                        </form>
                     </div>
                   </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="scriptures"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={addScripture}
              className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] text-slate-400 dark:text-slate-600 font-extrabold text-xs flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all group"
            >
              <div className="w-8 h-8 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-indigo-500" />
              </div>
              New Holy Scripture
            </motion.button>
            {formData.scriptures.map((script) => (
              <div key={script.id} className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] shadow-premium border border-slate-200/60 dark:border-white/5 space-y-5">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reference</label>
                    <input 
                        className="w-full font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl focus:outline-none text-sm border border-slate-100 dark:border-white/5"
                        value={script.reference}
                        onChange={(e) => updateScripture(script.id, { reference: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={() => removeScripture(script.id)}
                    className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl mt-6 border border-red-200/30 dark:border-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Holy Text</label>
                    <textarea 
                        className="w-full text-[13px] italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl focus:outline-none leading-relaxed resize-none h-32 border border-slate-100 dark:border-white/5 font-medium"
                        value={script.text}
                        onChange={(e) => updateScripture(script.id, { text: e.target.value })}
                        rows={4}
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
        className={`fixed bottom-24 left-4 right-4 py-5 rounded-2xl font-extrabold shadow-[0_20px_50px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center gap-3 transition-all z-10 ${
          saveStatus === 'saved' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-950 dark:bg-indigo-600 text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {saveStatus === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
               <SettingsIcon className="w-5 h-5 rotate-0 group-hover:rotate-90 transition-transform" /> 
               Deploy Global Changes
            </motion.div>
          )}
          {saveStatus === 'saving' && (
            <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
               <Loader2 className="w-5 h-5 animate-spin" /> Syncing Cloud Database
            </motion.div>
          )}
          {saveStatus === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
               <CheckCircle2 className="w-5 h-5" /> System Up-to-Date
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

const OnboardingTour = ({ onFinish, onStepChange }: { onFinish: () => void, onStepChange: (tab: Tab) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (TOUR_STEPS[nextStep].tab) {
        onStepChange(TOUR_STEPS[nextStep].tab as Tab);
      }
    } else {
      localStorage.setItem('grace_tour_completed', 'true');
      onFinish();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('grace_tour_completed', 'true');
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] shadow-premium overflow-hidden border border-white/20"
      >
        <div className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/20 text-white">
            {currentStep === 0 && <Home className="w-10 h-10" />}
            {currentStep === 1 && <Sparkles className="w-10 h-10" />}
            {currentStep === 2 && <BookOpen className="w-10 h-10" />}
            {currentStep === 3 && <Megaphone className="w-10 h-10" />}
            {currentStep === 4 && <Heart className="w-10 h-10" />}
            {currentStep === 5 && <MapPin className="w-10 h-10" />}
            {currentStep === 6 && <UserPlus className="w-10 h-10" />}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">{step.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
              {step.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
             <motion.button 
               whileTap={{ scale: 0.98 }}
               onClick={handleNext}
               className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-extrabold shadow-lg"
             >
               {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next Step'}
             </motion.button>
             <button 
               onClick={handleSkip}
               className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
             >
               Skip Guidance
             </button>
          </div>

          <div className="flex justify-center gap-1.5 pt-4">
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200 dark:bg-slate-800'}`} 
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [bibleRef, setBibleRef] = useState('John 3:16');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no prompt, maybe they're on iOS or already installed
      addNotification({
        title: "Installation Guide",
        message: "To install: Tap the 'Share' icon in your browser menu and select 'Add to Home Screen'.",
        type: 'system'
      });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    registerSW({
      onNeedRefresh() {
        addNotification({
          title: "Divine Update",
          message: "A fresh version of our app is ready. Refresh for the latest features.",
          type: 'system'
        });
      },
      onOfflineReady() {
        addNotification({
          title: "Always Protected",
          message: "Church Connect is now ready for offline use. Take the Word wherever you go.",
          type: 'system'
        });
      },
    });
  }, []);

  const [settings, setSettings] = useState<ChurchSettings>(DEFAULT_SETTINGS);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('church_theme') === 'dark' || 
           (!('church_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('grace_tour_completed');
    if (!tourCompleted) {
      setTimeout(() => setShowTour(true), 3000);
    }
  }, []);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() => {
    const saved = localStorage.getItem('church_notif_prefs');
    return saved ? JSON.parse(saved) : {
      announcements: true,
      prayerRequests: true,
      events: true,
      reminders: true
    };
  });

  const sendPushNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { 
        body, 
        icon: settings.logoUrl || '/icon.png',
        badge: '/badge.png'
      });
    }
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    // Check preferences first
    const prefKey = notif.type === 'announcement' ? 'announcements' : 
                    notif.type === 'prayer' ? 'prayerRequests' : 
                    notif.type === 'event' ? 'events' : 'reminders';
                    
    if (!notifPrefs[prefKey as keyof NotificationPrefs]) return;

    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    sendPushNotification(newNotif.title, newNotif.message);
  };

  const requestNotifPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        addNotification({
          title: "Notifications Enabled!",
          message: "You will now receive spiritual updates and announcements.",
          type: 'system'
        });
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('church_notif_prefs', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

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
    bible: 'Holy Bible',
    notes: 'Sermon Notes',
    news: 'Announcements',
    prayer: 'Prayer Wall',
    contact: 'Connect',
    admin: 'Admin Console',
    assistant: 'Bible Assistant'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-32 select-none overflow-x-hidden transition-colors duration-500">
      <AnimatePresence>
        {loading && <SplashScreen logoUrl={settings.logoUrl} onFinish={() => setLoading(false)} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showTour && !loading && (
          <OnboardingTour 
            onStepChange={(tab) => setActiveTab(tab)} 
            onFinish={() => setShowTour(false)} 
          />
        )}
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
            logoUrl={settings.logoUrl}
            unreadCount={notifications.filter(n => !n.read).length}
            onNotifyClick={() => setShowNotificationCenter(true)}
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            onAdminClick={() => setActiveTab('admin')}
          />
          
          <main className="max-w-md mx-auto px-4 pb-12 pt-2 relative z-10 safe-area-bottom">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-[70vh]"
              >
                {activeTab === 'home' && (
                  <div className="space-y-6">
                    {isInstallable && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl shadow-indigo-600/20 text-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Download className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm font-display">Install App</h3>
                            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mt-0.5">Offline Access & Fast Loading</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleInstall}
                          className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                          Install
                        </button>
                      </motion.div>
                    )}
                    <HomePage 
                      settings={settings} 
                      onViewFull={(ref) => {
                        setBibleRef(ref);
                        setActiveTab('bible');
                      }} 
                    />
                    {!isInstallable && (
                       <button 
                       onClick={handleInstall}
                       className="w-full glass p-5 rounded-[2rem] border-white/60 dark:border-white/10 flex items-center justify-center gap-3 text-slate-400 hover:text-indigo-600 transition-colors"
                     >
                       <Download className="w-4 h-4" />
                       <span className="text-[10px] font-extrabold uppercase tracking-widest">Install Desktop/Mobile App</span>
                     </button>
                    )}
                  </div>
                )}
                {activeTab === 'bible' && <BiblePage initialReference={bibleRef} />}
                {activeTab === 'assistant' && <AssistantPage />}
                {activeTab === 'notes' && <NotesPage sermons={settings.sermons} />}
                {activeTab === 'news' && <NewsPage announcements={settings.announcements} />}
                {activeTab === 'prayer' && <PrayerPage addNotification={addNotification} />}
                {activeTab === 'contact' && <ContactPage settings={settings} />}
                {activeTab === 'admin' && (
                  <AdminPage 
                    settings={settings} 
                    setSettings={setSettings} 
                    addNotification={addNotification} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Floating Action Button (FAB) for Home */}
          <AnimatePresence>
            {activeTab === 'home' && (
              <motion.button
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('prayer')}
                className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] flex items-center justify-center z-50 border border-white/20"
              >
                <Plus className="w-7 h-7" />
              </motion.button>
            )}
          </AnimatePresence>

          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>
      )}

      <AnimatePresence>
        {showNotificationCenter && (
          <NotificationCenter 
            notifications={notifications}
            onMarkAllRead={() => {
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }}
            onOpenSettings={() => {
              setShowNotificationCenter(false);
              setShowPrefs(true);
            }}
            onClose={() => setShowNotificationCenter(false)}
          />
        )}
        {showPrefs && (
          <NotificationPrefsModal 
            prefs={notifPrefs}
            setPrefs={setNotifPrefs}
            onClose={() => setShowPrefs(false)}
            requestPermission={requestNotifPermission}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

