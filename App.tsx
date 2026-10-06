// ascend v1.1
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get('window');

const LANG_VOICE: Record<string, string> = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', zh: 'zh-CN',
  fa: 'fa-IR', it: 'it-IT', ru: 'ru-RU', ar: 'ar-SA', tr: 'tr-TR',
  de: 'de-DE', ja: 'ja-JP', ko: 'ko-KR', hi: 'hi-IN', pt: 'pt-BR',
  nl: 'nl-NL', pl: 'pl-PL', sv: 'sv-SE', he: 'he-IL', ur: 'ur-PK',
  vi: 'vi-VN', id: 'id-ID', uk: 'uk-UA', el: 'el-GR',
};

const RTL_LANGS = new Set(['fa', 'ar', 'he', 'ur']);

// D1 — Per-scenario atmosphere colours
const SCENE_COLOR: Record<string, string> = {
  business: '#4A7FA5',  // cold steel blue
  survival: '#D97706',  // urgent amber
  social:   '#C47B8A',  // warm rose-gold
};

const C = {
  bg: '#07050F',
  surface: '#12101E',
  surface2: '#1A1830',
  gold: '#C8981E',
  goldBright: '#E8C040',
  cream: '#EDE0CC',
  muted: '#6B6490',
};

// ─── Guides ──────────────────────────────────────────────────────
const GUIDES: Record<string, Record<string, { name: string; role: string; avatar: string }>> = {
  business: {
    es: { name: 'Carlos', role: 'CEO', avatar: '👨‍💼' },
    fr: { name: 'Sophie', role: 'PDG', avatar: '👩‍💼' },
    zh: { name: '明明', role: '总裁', avatar: '👨‍💼' },
    fa: { name: 'دانیار', role: 'مدیرعامل', avatar: '👨‍💼' },
    it: { name: 'Marco', role: 'Amministratore', avatar: '👨‍💼' },
    ru: { name: 'Алексей', role: 'Генеральный директор', avatar: '👨‍💼' },
    ar: { name: 'أحمد', role: 'المدير التنفيذي', avatar: '👨‍💼' },
    tr: { name: 'Mehmet', role: 'Genel Müdür', avatar: '👨‍💼' },
  },
  survival: {
    es: { name: 'Rosa', role: 'Local guide', avatar: '👩' },
    fr: { name: 'Pierre', role: 'Passant', avatar: '👨' },
    zh: { name: '梅', role: '当地人', avatar: '👩' },
    fa: { name: 'نرگس', role: 'راهنمای محلی', avatar: '👩' },
    it: { name: 'Giulia', role: 'Guida locale', avatar: '👩' },
    ru: { name: 'Наташа', role: 'Местный житель', avatar: '👩' },
    ar: { name: 'فاطمة', role: 'دليل محلي', avatar: '👩' },
    tr: { name: 'Ayşe', role: 'Yerel rehber', avatar: '👩' },
  },
  social: {
    es: { name: 'Isabella', role: 'New friend', avatar: '👩' },
    fr: { name: 'Camille', role: 'Nouvelle amie', avatar: '👩' },
    zh: { name: '雪', role: '新朋友', avatar: '👩' },
    fa: { name: 'شیرین', role: 'دوست جدید', avatar: '👩' },
    it: { name: 'Valentina', role: 'Nuova amica', avatar: '👩' },
    ru: { name: 'Катя', role: 'Новый друг', avatar: '👩' },
    ar: { name: 'ليلى', role: 'صديقة جديدة', avatar: '👩' },
    tr: { name: 'Zeynep', role: 'Yeni arkadaş', avatar: '👩' },
  },
};

// ─── Conversation data ───────────────────────────────────────────
type Exchange = {
  ai: string;
  ai_t: string;
  vocab: { w: string; m: string; ph?: string }[];
  choices: { t: string; tr: string; vocab?: { w: string; m: string }[] }[];
};

const CONVOS: Record<string, Record<string, Exchange[]>> = {
  business: {
    es: [
      { ai: '¡Buenos días! Soy Carlos, el CEO. Bienvenido a la empresa.', ai_t: 'Good morning! I\'m Carlos, the CEO. Welcome to the company.', vocab: [{ w: 'buenos días', m: 'good morning' }, { w: 'soy', m: 'I am' }, { w: 'Carlos', m: 'Carlos' }, { w: 'el CEO', m: 'the CEO' }, { w: 'bienvenido', m: 'welcome' }, { w: 'a', m: 'to' }, { w: 'la empresa', m: 'the company' }], choices: [{ t: 'Mucho gusto, Carlos.', tr: 'Nice to meet you, Carlos.' }, { t: 'Gracias. ¿Dónde está mi oficina?', tr: 'Thank you. Where is my office?' }] },
      { ai: '¿Habla usted español con fluidez?', ai_t: 'Do you speak Spanish fluently?', vocab: [{ w: 'habla', m: 'speak' }, { w: 'usted', m: 'you' }, { w: 'español', m: 'Spanish' }, { w: 'con', m: 'with' }, { w: 'fluidez', m: 'fluency' }], choices: [{ t: 'Estoy aprendiendo.', tr: 'I am learning.' }, { t: 'Un poco, pero quiero mejorar.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Tenemos una reunión importante hoy a las tres.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'tenemos', m: 'we have' }, { w: 'una', m: 'a' }, { w: 'reunión', m: 'meeting' }, { w: 'importante', m: 'important' }, { w: 'hoy', m: 'today' }, { w: 'a las tres', m: 'at three' }], choices: [{ t: 'Perfecto. Estaré listo.', tr: 'Perfect. I will be ready.' }, { t: '¿Quién más va a estar?', tr: 'Who else will be there?' }] },
      { ai: 'Los empleados necesitan su aprobación para el presupuesto.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'los empleados', m: 'the employees' }, { w: 'necesitan', m: 'need' }, { w: 'su', m: 'your' }, { w: 'aprobación', m: 'approval' }, { w: 'para', m: 'for' }, { w: 'el presupuesto', m: 'the budget' }], choices: [{ t: 'Voy a revisar los números primero.', tr: 'I will review the numbers first.' }, { t: '¿Cuánto dinero necesitamos?', tr: 'How much money do we need?' }] },
      { ai: '¡Excelente! Usted aprende muy rápido. La empresa está en buenas manos.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'excelente', m: 'excellent' }, { w: 'aprende', m: 'you learn' }, { w: 'muy', m: 'very' }, { w: 'rápido', m: 'fast' }, { w: 'la empresa', m: 'company' }, { w: 'está', m: 'is' }, { w: 'en', m: 'in' }, { w: 'buenas manos', m: 'good hands' }], choices: [{ t: 'Gracias por su confianza.', tr: 'Thank you for your trust.' }, { t: 'Trabajaremos juntos.', tr: 'We will work together.' }] },
    ],
    fr: [
      { ai: 'Bonjour! Je suis Sophie, la PDG. Bienvenue dans l\'entreprise.', ai_t: 'Good morning! I\'m Sophie, the CEO. Welcome to the company.', vocab: [{ w: 'bonjour', m: 'good morning' }, { w: 'je suis', m: 'I am' }, { w: 'Sophie', m: 'Sophie' }, { w: 'la PDG', m: 'the CEO' }, { w: 'bienvenue', m: 'welcome' }, { w: 'dans', m: 'in' }, { w: "l'entreprise", m: 'the company' }], choices: [{ t: 'Enchantée, Sophie.', tr: 'Nice to meet you, Sophie.' }, { t: 'Merci. Où est mon bureau?', tr: 'Thank you. Where is my office?' }] },
      { ai: 'Parlez-vous français couramment?', ai_t: 'Do you speak French fluently?', vocab: [{ w: 'parlez-vous', m: 'do you speak' }, { w: 'français', m: 'French' }, { w: 'couramment', m: 'fluently' }], choices: [{ t: 'J\'apprends.', tr: 'I am learning.' }, { t: 'Un peu, mais je veux progresser.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Nous avons une réunion importante aujourd\'hui à quinze heures.', ai_t: 'We have an important meeting today at three o\'clock.', vocab: [{ w: 'nous avons', m: 'we have' }, { w: 'une', m: 'a' }, { w: 'réunion', m: 'meeting' }, { w: 'importante', m: 'important' }, { w: "aujourd'hui", m: 'today' }, { w: 'à quinze heures', m: 'at three' }], choices: [{ t: 'Parfait. Je serai prêt.', tr: 'Perfect. I will be ready.' }, { t: 'Qui d\'autre sera là?', tr: 'Who else will be there?' }] },
      { ai: 'Les employés ont besoin de votre approbation pour le budget.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'les employés', m: 'the employees' }, { w: 'ont besoin', m: 'need' }, { w: 'de votre', m: 'your' }, { w: 'approbation', m: 'approval' }, { w: 'pour', m: 'for' }, { w: 'le budget', m: 'the budget' }], choices: [{ t: 'Je vais examiner les chiffres d\'abord.', tr: 'I will review the numbers first.' }, { t: 'De combien avons-nous besoin?', tr: 'How much do we need?' }] },
      { ai: 'Excellent! Vous apprenez très vite. L\'entreprise est en de bonnes mains.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'vous apprenez', m: 'you learn' }, { w: 'très', m: 'very' }, { w: 'vite', m: 'fast' }, { w: "l'entreprise", m: 'company' }, { w: 'est', m: 'is' }, { w: 'en', m: 'in' }, { w: 'bonnes mains', m: 'good hands' }], choices: [{ t: 'Merci pour votre confiance.', tr: 'Thank you for your trust.' }, { t: 'Nous travaillerons ensemble.', tr: 'We will work together.' }] },
    ],
    zh: [
      { ai: '早上好！我是明明，总裁。欢迎来到公司。', ai_t: 'Good morning! I\'m Mingming, the President. Welcome to the company.', vocab: [{ w: '早上好', m: 'good morning' }, { w: '我', m: 'I' }, { w: '是', m: 'am' }, { w: '明明', m: 'Mingming' }, { w: '总裁', m: 'President' }, { w: '欢迎', m: 'welcome' }, { w: '来到', m: 'to' }, { w: '公司', m: 'company' }], choices: [{ t: '很高兴认识您，明明。', tr: 'Nice to meet you, Mingming.' }, { t: '谢谢。我的办公室在哪里？', tr: 'Thank you. Where is my office?' }] },
      { ai: '您说中文流利吗？', ai_t: 'Do you speak Chinese fluently?', vocab: [{ w: '您说', m: 'do you speak' }, { w: '中文', m: 'Chinese' }, { w: '流利', m: 'fluently' }, { w: '吗', m: 'question' }], choices: [{ t: '我在学习。', tr: 'I am learning.' }, { t: '一点点，但我想进步。', tr: 'A little, but I want to improve.' }] },
      { ai: '今天下午三点我们有一个重要的会议。', ai_t: 'We have an important meeting at three o\'clock this afternoon.', vocab: [{ w: '今天', m: 'today' }, { w: '下午三点', m: 'at three' }, { w: '我们', m: 'we' }, { w: '有', m: 'have' }, { w: '重要', m: 'important' }, { w: '的', m: 'particle' }, { w: '会议', m: 'meeting' }], choices: [{ t: '好的。我会准备好的。', tr: 'OK. I will be ready.' }, { t: '还有谁会参加？', tr: 'Who else will attend?' }] },
      { ai: '员工需要您批准预算。', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: '员工', m: 'employees' }, { w: '需要', m: 'need' }, { w: '您', m: 'your' }, { w: '批准', m: 'approve' }, { w: '预算', m: 'budget' }], choices: [{ t: '我先检查一下数字。', tr: 'I will check the numbers first.' }, { t: '我们需要多少钱？', tr: 'How much money do we need?' }] },
      { ai: '太好了！您学得很快。公司在您的领导下一定会成功。', ai_t: 'Excellent! You learn very fast. The company will surely succeed under your leadership.', vocab: [{ w: '太好了', m: 'excellent' }, { w: '您学得', m: 'you learn' }, { w: '很快', m: 'very fast' }, { w: '公司', m: 'company' }, { w: '一定会', m: 'will surely' }, { w: '成功', m: 'succeed' }], choices: [{ t: '谢谢您的信任。', tr: 'Thank you for your trust.' }, { t: '我们一起合作。', tr: 'We will work together.' }] },
    ],
    fa: [
      { ai: 'صبح بخیر! من دانیار هستم، مدیرعامل. به شرکت خوش آمدید.', ai_t: 'Good morning! I am Daniyar, the CEO. Welcome to the company.', vocab: [{ w: 'صبح بخیر', m: 'good morning' }, { w: 'من', m: 'I' }, { w: 'دانیار', m: 'Daniyar' }, { w: 'هستم', m: 'am' }, { w: 'مدیرعامل', m: 'CEO' }, { w: 'به', m: 'to' }, { w: 'شرکت', m: 'company' }, { w: 'خوش آمدید', m: 'welcome' }], choices: [{ t: 'از آشنایی با شما خوشوقتم، دانیار.', tr: 'Nice to meet you, Daniyar.', vocab: [{ w: 'از', m: 'of' }, { w: 'آشنایی', m: 'meeting' }, { w: 'با', m: 'with' }, { w: 'شما', m: 'you' }, { w: 'خوشوقتم،', m: "I'm pleased" }, { w: 'دانیار.', m: 'Daniyar' }] }, { t: 'ممنون. دفتر من کجاست؟', tr: 'Thank you. Where is my office?', vocab: [{ w: 'ممنون.', m: 'thanks' }, { w: 'دفتر', m: 'office' }, { w: 'من', m: 'my' }, { w: 'کجاست؟', m: 'where is' }] }] },
      { ai: 'آیا فارسی را روان صحبت میکنید؟', ai_t: 'Do you speak Persian fluently?', vocab: [{ w: 'آیا', m: 'do' }, { w: 'فارسی', m: 'Persian' }, { w: 'روان', m: 'fluently' }, { w: 'صحبت', m: 'speak' }, { w: 'میکنید', m: 'you' }], choices: [{ t: 'کمی، ولی میخواهم پیشرفت کنم.', tr: 'A little, but I want to improve.', vocab: [{ w: 'کمی،', m: 'a little' }, { w: 'ولی', m: 'but' }, { w: 'میخواهم', m: 'I want' }, { w: 'پیشرفت', m: 'to improve' }, { w: 'کنم.', m: 'to do' }] }, { t: 'دارم یاد میگیرم.', tr: 'I am learning.', vocab: [{ w: 'دارم', m: 'I am' }, { w: 'یاد', m: 'learning' }, { w: 'میگیرم.', m: 'ongoing' }] }] },
      { ai: 'امروز ساعت سه جلسه مهمی داریم.', ai_t: 'We have an important meeting today at three o\'clock.', vocab: [{ w: 'امروز', m: 'today' }, { w: 'ساعت', m: 'at' }, { w: 'سه', m: 'three' }, { w: 'جلسه', m: 'meeting' }, { w: 'مهمی', m: 'important' }, { w: 'داریم', m: 'have' }], choices: [{ t: 'عالی. آماده خواهم بود.', tr: 'Perfect. I will be ready.', vocab: [{ w: 'عالی.', m: 'perfect' }, { w: 'آماده', m: 'ready' }, { w: 'خواهم', m: 'will' }, { w: 'بود.', m: 'be' }] }, { t: 'چه کسی دیگری حضور دارد؟', tr: 'Who else will be there?', vocab: [{ w: 'چه', m: 'who' }, { w: 'کسی', m: 'person' }, { w: 'دیگری', m: 'else' }, { w: 'حضور', m: 'presence' }, { w: 'دارد؟', m: 'is there' }] }] },
      { ai: 'کارمندان برای تصویب بودجه به شما نیاز دارند.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'کارمندان', m: 'employees' }, { w: 'برای', m: 'for' }, { w: 'تصویب', m: 'approval' }, { w: 'بودجه', m: 'budget' }, { w: 'شما', m: 'your' }, { w: 'نیاز', m: 'need' }, { w: 'دارند', m: 'need' }], choices: [{ t: 'اول اعداد را بررسی میکنم.', tr: 'I will review the numbers first.', vocab: [{ w: 'اول', m: 'first' }, { w: 'اعداد', m: 'numbers' }, { w: 'را', m: '(marker)' }, { w: 'بررسی', m: 'review' }, { w: 'میکنم.', m: 'I will' }] }, { t: 'چقدر پول نیاز داریم؟', tr: 'How much money do we need?', vocab: [{ w: 'چقدر', m: 'how much' }, { w: 'پول', m: 'money' }, { w: 'نیاز', m: 'need' }, { w: 'داریم؟', m: 'do we' }] }] },
      { ai: 'عالی! خیلی سریع یاد میگیرید. شرکت در دستان خوبی است.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'عالی', m: 'Excellent' }, { w: 'خیلی', m: 'very' }, { w: 'سریع', m: 'fast' }, { w: 'یاد', m: 'learn' }, { w: 'میگیرید', m: 'you' }, { w: 'شرکت', m: 'company' }, { w: 'در', m: 'in' }, { w: 'دستان', m: 'hands' }, { w: 'خوبی', m: 'good' }, { w: 'است', m: 'is' }], choices: [{ t: 'ممنون از اعتمادتان.', tr: 'Thank you for your trust.', vocab: [{ w: 'ممنون', m: 'thank you' }, { w: 'از', m: 'for' }, { w: 'اعتمادتان.', m: 'your trust' }] }, { t: 'با هم کار خواهیم کرد.', tr: 'We will work together.', vocab: [{ w: 'با', m: 'with' }, { w: 'هم', m: 'together' }, { w: 'کار', m: 'work' }, { w: 'خواهیم', m: 'we will' }, { w: 'کرد.', m: 'do' }] }] },
    ],
    it: [
      { ai: 'Buongiorno! Sono Marco, l\'amministratore. Benvenuto in azienda.', ai_t: 'Good morning! I am Marco, the CEO. Welcome to the company.', vocab: [{ w: 'buongiorno', m: 'good morning' }, { w: 'sono', m: 'I am' }, { w: 'Marco', m: 'Marco' }, { w: "l'amministratore", m: 'the CEO' }, { w: 'benvenuto', m: 'welcome' }, { w: 'in', m: 'in' }, { w: 'azienda', m: 'company' }], choices: [{ t: 'Piacere, Marco.', tr: 'Nice to meet you, Marco.' }, { t: 'Grazie. Dov\'è il mio ufficio?', tr: 'Thank you. Where is my office?' }] },
      { ai: 'Parla italiano fluentemente?', ai_t: 'Do you speak Italian fluently?', vocab: [{ w: 'parla', m: 'speak' }, { w: 'italiano', m: 'Italian' }, { w: 'fluentemente', m: 'fluently' }], choices: [{ t: 'Sto imparando.', tr: 'I am learning.' }, { t: 'Un po\', ma voglio migliorare.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Abbiamo una riunione importante oggi alle tre.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'abbiamo', m: 'we have' }, { w: 'una', m: 'a' }, { w: 'riunione', m: 'meeting' }, { w: 'importante', m: 'important' }, { w: 'oggi', m: 'today' }, { w: 'alle tre', m: 'at three' }], choices: [{ t: 'Perfetto. Sarò pronto.', tr: 'Perfect. I will be ready.' }, { t: 'Chi altro ci sarà?', tr: 'Who else will be there?' }] },
      { ai: 'I dipendenti hanno bisogno della sua approvazione per il budget.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'i dipendenti', m: 'the employees' }, { w: 'hanno bisogno', m: 'need' }, { w: 'della sua', m: 'your' }, { w: 'approvazione', m: 'approval' }, { w: 'per', m: 'for' }, { w: 'il budget', m: 'the budget' }], choices: [{ t: 'Verificherò prima i numeri.', tr: 'I will review the numbers first.' }, { t: 'Di quanto abbiamo bisogno?', tr: 'How much do we need?' }] },
      { ai: 'Eccellente! Impara molto velocemente. L\'azienda è in buone mani.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'impara', m: 'you learn' }, { w: 'molto', m: 'very' }, { w: 'velocemente', m: 'fast' }, { w: "l'azienda", m: 'the company' }, { w: 'è', m: 'is' }, { w: 'in', m: 'in' }, { w: 'buone mani', m: 'good hands' }], choices: [{ t: 'Grazie per la sua fiducia.', tr: 'Thank you for your trust.' }, { t: 'Lavoreremo insieme.', tr: 'We will work together.' }] },
    ],
    ru: [
      { ai: 'Доброе утро! Я Алексей, генеральный директор. Добро пожаловать в компанию.', ai_t: 'Good morning! I am Aleksey, the CEO. Welcome to the company.', vocab: [{ w: 'доброе утро', m: 'good morning' }, { w: 'я', m: 'I' }, { w: 'Алексей', m: 'Aleksey' }, { w: 'генеральный директор', m: 'CEO' }, { w: 'добро пожаловать', m: 'welcome' }, { w: 'в', m: 'in' }, { w: 'компанию', m: 'the company' }], choices: [{ t: 'Очень приятно, Алексей.', tr: 'Nice to meet you, Aleksey.' }, { t: 'Спасибо. Где мой кабинет?', tr: 'Thank you. Where is my office?' }] },
      { ai: 'Вы говорите по-русски свободно?', ai_t: 'Do you speak Russian fluently?', vocab: [{ w: 'вы говорите', m: 'do you speak' }, { w: 'по-русски', m: 'Russian' }, { w: 'свободно', m: 'fluently' }], choices: [{ t: 'Я учусь.', tr: 'I am learning.' }, { t: 'Немного, но хочу совершенствоваться.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Сегодня в три часа у нас важное совещание.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'сегодня', m: 'today' }, { w: 'в три часа', m: 'at three' }, { w: 'у нас', m: 'we have' }, { w: 'важное', m: 'important' }, { w: 'совещание', m: 'meeting' }], choices: [{ t: 'Отлично. Я буду готов.', tr: 'Perfect. I will be ready.' }, { t: 'Кто ещё будет присутствовать?', tr: 'Who else will be there?' }] },
      { ai: 'Сотрудникам нужно ваше одобрение бюджета.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'сотрудникам', m: 'employees' }, { w: 'нужно', m: 'need' }, { w: 'ваше', m: 'your' }, { w: 'одобрение', m: 'approval' }, { w: 'бюджета', m: 'budget' }], choices: [{ t: 'Сначала я проверю цифры.', tr: 'I will review the numbers first.' }, { t: 'Сколько денег нам нужно?', tr: 'How much money do we need?' }] },
      { ai: 'Превосходно! Вы учитесь очень быстро. Компания в хороших руках.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'вы учитесь', m: 'you learn' }, { w: 'очень', m: 'very' }, { w: 'быстро', m: 'fast' }, { w: 'компания', m: 'company' }, { w: 'в', m: 'in' }, { w: 'хороших руках', m: 'good hands' }], choices: [{ t: 'Спасибо за доверие.', tr: 'Thank you for your trust.' }, { t: 'Мы будем работать вместе.', tr: 'We will work together.' }] },
    ],
    ar: [
      { ai: 'صباح الخير! أنا أحمد، المدير التنفيذي. أهلاً وسهلاً في الشركة.', ai_t: 'Good morning! I am Ahmed, the CEO. Welcome to the company.', vocab: [{ w: 'صباح الخير', m: 'good morning' }, { w: 'أنا', m: 'I am' }, { w: 'أحمد', m: 'Ahmed' }, { w: 'المدير التنفيذي', m: 'CEO' }, { w: 'أهلاً وسهلاً', m: 'welcome' }, { w: 'في', m: 'in' }, { w: 'الشركة', m: 'the company' }], choices: [{ t: 'تشرفت بمعرفتك، أحمد.', tr: 'Nice to meet you, Ahmed.' }, { t: 'شكراً. أين مكتبي؟', tr: 'Thank you. Where is my office?' }] },
      { ai: 'هل تتحدث العربية بطلاقة؟', ai_t: 'Do you speak Arabic fluently?', vocab: [{ w: 'هل', m: 'do' }, { w: 'تتحدث', m: 'you speak' }, { w: 'العربية', m: 'Arabic' }, { w: 'بطلاقة', m: 'fluently' }], choices: [{ t: 'أنا أتعلم.', tr: 'I am learning.' }, { t: 'قليلاً، لكنني أريد التحسن.', tr: 'A little, but I want to improve.' }] },
      { ai: 'لدينا اجتماع مهم اليوم الساعة الثالثة.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'لدينا', m: 'we have' }, { w: 'اجتماع', m: 'meeting' }, { w: 'مهم', m: 'important' }, { w: 'اليوم', m: 'today' }, { w: 'الساعة الثالثة', m: 'at three' }], choices: [{ t: 'ممتاز. سأكون مستعداً.', tr: 'Perfect. I will be ready.' }, { t: 'من سيحضر أيضاً؟', tr: 'Who else will be there?' }] },
      { ai: 'يحتاج الموظفون إلى موافقتك على الميزانية.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'يحتاج', m: 'need' }, { w: 'الموظفون', m: 'employees' }, { w: 'إلى', m: 'to' }, { w: 'موافقتك', m: 'your approval' }, { w: 'على', m: 'on' }, { w: 'الميزانية', m: 'the budget' }], choices: [{ t: 'سأراجع الأرقام أولاً.', tr: 'I will review the numbers first.' }, { t: 'كم من المال نحتاج؟', tr: 'How much money do we need?' }] },
      { ai: 'ممتاز! أنت تتعلم بسرعة كبيرة. الشركة في أيدٍ أمينة.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'أنت', m: 'you' }, { w: 'تتعلم', m: 'learn' }, { w: 'بسرعة', m: 'fast' }, { w: 'كبيرة', m: 'great' }, { w: 'الشركة', m: 'company' }, { w: 'في', m: 'in' }, { w: 'أيدٍ أمينة', m: 'good hands' }], choices: [{ t: 'شكراً على ثقتك.', tr: 'Thank you for your trust.' }, { t: 'سنعمل معاً.', tr: 'We will work together.' }] },
    ],
    tr: [
      { ai: 'Günaydın! Ben Mehmet, Genel Müdür. Şirkete hoş geldiniz.', ai_t: 'Good morning! I am Mehmet, the CEO. Welcome to the company.', vocab: [{ w: 'günaydın', m: 'good morning' }, { w: 'ben', m: 'I am' }, { w: 'Mehmet', m: 'Mehmet' }, { w: 'Genel Müdür', m: 'CEO' }, { w: 'şirkete', m: 'to the company' }, { w: 'hoş geldiniz', m: 'welcome' }], choices: [{ t: 'Tanıştığımıza memnun oldum, Mehmet.', tr: 'Nice to meet you, Mehmet.' }, { t: 'Teşekkürler. Ofisim nerede?', tr: 'Thank you. Where is my office?' }] },
      { ai: 'Türkçeyi akıcı konuşuyor musunuz?', ai_t: 'Do you speak Turkish fluently?', vocab: [{ w: 'Türkçeyi', m: 'Turkish' }, { w: 'akıcı', m: 'fluently' }, { w: 'konuşuyor', m: 'speak' }, { w: 'musunuz', m: 'do you' }], choices: [{ t: 'Öğreniyorum.', tr: 'I am learning.' }, { t: 'Biraz, ama gelişmek istiyorum.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Bugün saat üçte önemli bir toplantımız var.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'bugün', m: 'today' }, { w: 'saat üçte', m: 'at three' }, { w: 'önemli', m: 'important' }, { w: 'bir', m: 'a' }, { w: 'toplantımız', m: 'meeting' }, { w: 'var', m: 'we have' }], choices: [{ t: 'Mükemmel. Hazır olacağım.', tr: 'Perfect. I will be ready.' }, { t: 'Başka kim katılacak?', tr: 'Who else will be there?' }] },
      { ai: 'Çalışanlar bütçe onayınıza ihtiyaç duyuyor.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'çalışanlar', m: 'employees' }, { w: 'bütçe', m: 'budget' }, { w: 'onayınıza', m: 'your approval' }, { w: 'ihtiyaç', m: 'need' }, { w: 'duyuyor', m: 'they need' }], choices: [{ t: 'Önce rakamları inceleyeyim.', tr: 'I will review the numbers first.' }, { t: 'Ne kadar paraya ihtiyacımız var?', tr: 'How much money do we need?' }] },
      { ai: 'Mükemmel! Çok hızlı öğreniyorsunuz. Şirket iyi ellerde.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'çok', m: 'very' }, { w: 'hızlı', m: 'fast' }, { w: 'öğreniyorsunuz', m: 'you learn' }, { w: 'şirket', m: 'company' }, { w: 'iyi', m: 'good' }, { w: 'ellerde', m: 'hands' }], choices: [{ t: 'Güveniniz için teşekkürler.', tr: 'Thank you for your trust.' }, { t: 'Birlikte çalışacağız.', tr: 'We will work together.' }] },
    ],
  },
  survival: {
    es: [
      { ai: '¡Oye! ¿Estás perdido? ¿Necesitas ayuda?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'oye', m: 'hey' }, { w: 'estás', m: 'are you' }, { w: 'perdido', m: 'lost' }, { w: 'necesitas', m: 'do you need' }, { w: 'ayuda', m: 'help' }], choices: [{ t: 'Sí, estoy perdido. ¿Puedes ayudarme?', tr: 'Yes, I am lost. Can you help me?' }, { t: '¿Dónde estamos exactamente?', tr: 'Where are we exactly?' }] },
      { ai: 'Estás en el mercado central. ¿Adónde quieres ir?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'estás', m: 'you are' }, { w: 'en', m: 'at' }, { w: 'el mercado', m: 'the market' }, { w: 'central', m: 'central' }, { w: 'adónde', m: 'where' }, { w: 'quieres', m: 'want' }, { w: 'ir', m: 'to go' }], choices: [{ t: 'Necesito ir al hospital.', tr: 'I need to go to the hospital.' }, { t: 'Busco la embajada.', tr: 'I am looking for the embassy.' }] },
      { ai: 'El hospital está a dos kilómetros. ¿Tienes dinero para un taxi?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'el hospital', m: 'the hospital' }, { w: 'está', m: 'is' }, { w: 'a dos', m: 'two' }, { w: 'kilómetros', m: 'kilometres' }, { w: 'tienes', m: 'do you have' }, { w: 'dinero', m: 'money' }, { w: 'para un', m: 'for a' }, { w: 'taxi', m: 'taxi' }], choices: [{ t: 'No tengo dinero. ¿Puedo caminar?', tr: 'I have no money. Can I walk?' }, { t: 'Sí, tengo algo de dinero.', tr: 'Yes, I have some money.' }] },
      { ai: 'Claro, puedes caminar. Sigue recto y dobla a la izquierda.', ai_t: 'Of course, you can walk. Go straight and turn left.', vocab: [{ w: 'claro', m: 'of course' }, { w: 'puedes', m: 'you can' }, { w: 'caminar', m: 'walk' }, { w: 'sigue', m: 'go' }, { w: 'recto', m: 'straight' }, { w: 'dobla', m: 'turn' }, { w: 'a la izquierda', m: 'left' }], choices: [{ t: '¿Cuánto tiempo tarda?', tr: 'How long does it take?' }, { t: 'Gracias. Eres muy amable.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Unos veinte minutos. ¡Buena suerte! Espero que llegues bien.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'unos', m: 'about' }, { w: 'veinte', m: 'twenty' }, { w: 'minutos', m: 'minutes' }, { w: 'buena suerte', m: 'good luck' }, { w: 'espero', m: 'I hope' }, { w: 'que llegues', m: 'you arrive' }, { w: 'bien', m: 'safely' }], choices: [{ t: 'Muchas gracias por tu ayuda.', tr: 'Thank you very much for your help.' }, { t: '¡Hasta luego!', tr: 'Goodbye!' }] },
    ],
    fr: [
      { ai: 'Hé! Vous êtes perdu? Vous avez besoin d\'aide?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'hé', m: 'hey' }, { w: 'vous êtes', m: 'are you' }, { w: 'perdu', m: 'lost' }, { w: 'vous avez besoin', m: 'do you need' }, { w: "d'aide", m: 'help' }], choices: [{ t: 'Oui, je suis perdu. Pouvez-vous m\'aider?', tr: 'Yes, I am lost. Can you help me?' }, { t: 'Où sommes-nous exactement?', tr: 'Where are we exactly?' }] },
      { ai: 'Vous êtes au marché central. Où voulez-vous aller?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'vous êtes', m: 'you are' }, { w: 'au', m: 'at the' }, { w: 'marché', m: 'market' }, { w: 'central', m: 'central' }, { w: 'où', m: 'where' }, { w: 'voulez-vous', m: 'do you want' }, { w: 'aller', m: 'to go' }], choices: [{ t: 'J\'ai besoin d\'aller à l\'hôpital.', tr: 'I need to go to the hospital.' }, { t: 'Je cherche l\'ambassade.', tr: 'I am looking for the embassy.' }] },
      { ai: 'L\'hôpital est à deux kilomètres. Avez-vous de l\'argent pour un taxi?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: "l'hôpital", m: 'the hospital' }, { w: 'est', m: 'is' }, { w: 'à deux', m: 'two' }, { w: 'kilomètres', m: 'kilometres' }, { w: 'avez-vous', m: 'do you have' }, { w: "l'argent", m: 'money' }, { w: 'pour un', m: 'for a' }, { w: 'taxi', m: 'taxi' }], choices: [{ t: 'Je n\'ai pas d\'argent. Puis-je marcher?', tr: 'I have no money. Can I walk?' }, { t: 'Oui, j\'ai un peu d\'argent.', tr: 'Yes, I have some money.' }] },
      { ai: 'Bien sûr, vous pouvez marcher. Allez tout droit puis tournez à gauche.', ai_t: 'Of course, you can walk. Go straight then turn left.', vocab: [{ w: 'bien sûr', m: 'of course' }, { w: 'vous pouvez', m: 'you can' }, { w: 'marcher', m: 'walk' }, { w: 'allez', m: 'go' }, { w: 'tout droit', m: 'straight' }, { w: 'puis', m: 'then' }, { w: 'tournez', m: 'turn' }, { w: 'à gauche', m: 'left' }], choices: [{ t: 'Combien de temps faut-il?', tr: 'How long does it take?' }, { t: 'Merci. Vous êtes très aimable.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Une vingtaine de minutes. Bonne chance! J\'espère que vous arriverez bien.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'une vingtaine', m: 'about twenty' }, { w: 'de minutes', m: 'minutes' }, { w: 'bonne chance', m: 'good luck' }, { w: "j'espère", m: 'I hope' }, { w: 'que vous arriverez', m: 'you arrive' }, { w: 'bien', m: 'safely' }], choices: [{ t: 'Merci beaucoup pour votre aide.', tr: 'Thank you very much for your help.' }, { t: 'Au revoir!', tr: 'Goodbye!' }] },
    ],
    zh: [
      { ai: '嘿！你迷路了吗？需要帮忙吗？', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: '嘿', m: 'hey' }, { w: '你', m: 'you' }, { w: '迷路', m: 'lost' }, { w: '了吗', m: 'question' }, { w: '需要', m: 'need' }, { w: '帮忙', m: 'help' }], choices: [{ t: '是的，我迷路了。你能帮我吗？', tr: 'Yes, I am lost. Can you help me?' }, { t: '我们在哪里？', tr: 'Where are we?' }] },
      { ai: '你在中央市场。你想去哪里？', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: '你在', m: 'you are at' }, { w: '中央', m: 'central' }, { w: '市场', m: 'market' }, { w: '你想', m: 'you want' }, { w: '去', m: 'to go' }, { w: '哪里', m: 'where' }], choices: [{ t: '我需要去医院。', tr: 'I need to go to the hospital.' }, { t: '我在找大使馆。', tr: 'I am looking for the embassy.' }] },
      { ai: '医院距离这里两公里。你有钱打车吗？', ai_t: 'The hospital is two kilometres from here. Do you have money for a taxi?', vocab: [{ w: '医院', m: 'hospital' }, { w: '距离', m: 'from here' }, { w: '两', m: 'two' }, { w: '公里', m: 'kilometres' }, { w: '你有', m: 'do you have' }, { w: '钱', m: 'money' }, { w: '打车', m: 'for a taxi' }], choices: [{ t: '我没有钱。我可以走路去吗？', tr: 'I have no money. Can I walk?' }, { t: '是的，我有一些钱。', tr: 'Yes, I have some money.' }] },
      { ai: '当然可以走路。一直往前走，然后左转。', ai_t: 'Of course you can walk. Go straight ahead, then turn left.', vocab: [{ w: '当然', m: 'of course' }, { w: '可以', m: 'you can' }, { w: '走路', m: 'walk' }, { w: '一直', m: 'straight ahead' }, { w: '往前走', m: 'go forward' }, { w: '然后', m: 'then' }, { w: '左转', m: 'turn left' }], choices: [{ t: '需要多长时间？', tr: 'How long does it take?' }, { t: '谢谢你，你真好。', tr: 'Thank you, you are very kind.' }] },
      { ai: '大约二十分钟。祝你好运！希望你能平安到达。', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: '大约', m: 'about' }, { w: '二十分钟', m: 'twenty minutes' }, { w: '祝你', m: 'good' }, { w: '好运', m: 'luck' }, { w: '希望', m: 'I hope' }, { w: '平安到达', m: 'arrive safely' }], choices: [{ t: '非常感谢你的帮助。', tr: 'Thank you very much for your help.' }, { t: '再见！', tr: 'Goodbye!' }] },
    ],
    fa: [
      { ai: 'هی! گم شدید؟ کمک میخواهید؟', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'هی', m: 'hey' }, { w: 'گم شدید', m: 'are you lost' }, { w: 'کمک', m: 'help' }, { w: 'میخواهید', m: 'do you want' }], choices: [{ t: 'بله، گم شدهام. میتوانید کمکم کنید؟', tr: 'Yes, I am lost. Can you help me?' }, { t: 'دقیقاً کجا هستیم؟', tr: 'Where are we exactly?' }] },
      { ai: 'شما در بازار مرکزی هستید. کجا میخواهید بروید؟', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'شما', m: 'you' }, { w: 'در', m: 'at' }, { w: 'بازار', m: 'market' }, { w: 'مرکزی', m: 'central' }, { w: 'هستید', m: 'are' }, { w: 'کجا', m: 'where' }, { w: 'میخواهید', m: 'want' }, { w: 'بروید', m: 'to go' }], choices: [{ t: 'باید به بیمارستان بروم.', tr: 'I need to go to the hospital.' }, { t: 'دنبال سفارتخانه میگردم.', tr: 'I am looking for the embassy.' }] },
      { ai: 'بیمارستان دو کیلومتر دور است. پول تاکسی دارید؟', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'بیمارستان', m: 'hospital' }, { w: 'دو', m: 'two' }, { w: 'کیلومتر', m: 'kilometre' }, { w: 'دور است', m: 'away' }, { w: 'پول', m: 'money' }, { w: 'تاکسی', m: 'taxi' }, { w: 'دارید', m: 'do you have' }], choices: [{ t: 'پول ندارم. میتوانم پیاده بروم؟', tr: 'I have no money. Can I walk?' }, { t: 'بله، کمی پول دارم.', tr: 'Yes, I have some money.' }] },
      { ai: 'البته میتوانید پیاده بروید. مستقیم بروید بعد به چپ بپیچید.', ai_t: 'Of course you can walk. Go straight then turn left.', vocab: [{ w: 'البته', m: 'of course' }, { w: 'میتوانید', m: 'you can' }, { w: 'پیاده بروید', m: 'walk' }, { w: 'مستقیم', m: 'straight' }, { w: 'بروید', m: 'go' }, { w: 'بعد', m: 'then' }, { w: 'به چپ', m: 'left' }, { w: 'بپیچید', m: 'turn' }], choices: [{ t: 'چقدر طول میکشد؟', tr: 'How long does it take?' }, { t: 'ممنون. خیلی مهربان هستید.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'حدود بیست دقیقه. موفق باشید! امیدوارم سالم برسید.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'حدود', m: 'about' }, { w: 'بیست دقیقه', m: 'twenty minutes' }, { w: 'موفق باشید', m: 'good luck' }, { w: 'امیدوارم', m: 'I hope' }, { w: 'سالم برسید', m: 'arrive safely' }], choices: [{ t: 'خیلی ممنون از کمکتان.', tr: 'Thank you very much for your help.' }, { t: 'خداحافظ!', tr: 'Goodbye!' }] },
    ],
    it: [
      { ai: 'Ehi! Sei perso? Hai bisogno di aiuto?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'ehi', m: 'hey' }, { w: 'sei', m: 'are you' }, { w: 'perso', m: 'lost' }, { w: 'hai bisogno', m: 'do you need' }, { w: 'di aiuto', m: 'help' }], choices: [{ t: 'Sì, sono perso. Puoi aiutarmi?', tr: 'Yes, I am lost. Can you help me?' }, { t: 'Dove siamo esattamente?', tr: 'Where are we exactly?' }] },
      { ai: 'Sei al mercato centrale. Dove vuoi andare?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'sei', m: 'you are' }, { w: 'al', m: 'at the' }, { w: 'mercato', m: 'market' }, { w: 'centrale', m: 'central' }, { w: 'dove', m: 'where' }, { w: 'vuoi', m: 'do you want' }, { w: 'andare', m: 'to go' }], choices: [{ t: 'Ho bisogno di andare all\'ospedale.', tr: 'I need to go to the hospital.' }, { t: 'Sto cercando l\'ambasciata.', tr: 'I am looking for the embassy.' }] },
      { ai: 'L\'ospedale è a due chilometri. Hai i soldi per un taxi?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: "l'ospedale", m: 'the hospital' }, { w: 'è', m: 'is' }, { w: 'a due', m: 'two' }, { w: 'chilometri', m: 'kilometres' }, { w: 'hai', m: 'do you have' }, { w: 'i soldi', m: 'money' }, { w: 'per un', m: 'for a' }, { w: 'taxi', m: 'taxi' }], choices: [{ t: 'Non ho soldi. Posso camminare?', tr: 'I have no money. Can I walk?' }, { t: 'Sì, ho un po\' di soldi.', tr: 'Yes, I have some money.' }] },
      { ai: 'Certo, puoi camminare. Va\' dritto e poi gira a sinistra.', ai_t: 'Of course, you can walk. Go straight and then turn left.', vocab: [{ w: 'certo', m: 'of course' }, { w: 'puoi', m: 'you can' }, { w: 'camminare', m: 'walk' }, { w: 'va', m: 'go' }, { w: 'dritto', m: 'straight' }, { w: 'e poi', m: 'then' }, { w: 'gira', m: 'turn' }, { w: 'a sinistra', m: 'left' }], choices: [{ t: 'Quanto tempo ci vuole?', tr: 'How long does it take?' }, { t: 'Grazie. Sei molto gentile.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Una ventina di minuti. Buona fortuna! Spero che tu arrivi bene.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'una ventina', m: 'about twenty' }, { w: 'di minuti', m: 'minutes' }, { w: 'buona fortuna', m: 'good luck' }, { w: 'spero', m: 'I hope' }, { w: 'che tu arrivi', m: 'you arrive' }, { w: 'bene', m: 'safely' }], choices: [{ t: 'Grazie mille per il tuo aiuto.', tr: 'Thank you very much for your help.' }, { t: 'Arrivederci!', tr: 'Goodbye!' }] },
    ],
    ru: [
      { ai: 'Эй! Вы заблудились? Нужна помощь?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'эй', m: 'hey' }, { w: 'вы заблудились', m: 'are you lost' }, { w: 'нужна', m: 'do you need' }, { w: 'помощь', m: 'help' }], choices: [{ t: 'Да, я заблудился. Можете помочь?', tr: 'Yes, I am lost. Can you help me?' }, { t: 'Где мы точно находимся?', tr: 'Where are we exactly?' }] },
      { ai: 'Вы на центральном рынке. Куда хотите попасть?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'вы', m: 'you are' }, { w: 'на', m: 'at' }, { w: 'центральном', m: 'central' }, { w: 'рынке', m: 'market' }, { w: 'куда', m: 'where' }, { w: 'хотите', m: 'do you want' }, { w: 'попасть', m: 'to go' }], choices: [{ t: 'Мне нужно в больницу.', tr: 'I need to go to the hospital.' }, { t: 'Я ищу посольство.', tr: 'I am looking for the embassy.' }] },
      { ai: 'До больницы два километра. У вас есть деньги на такси?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'до больницы', m: 'to the hospital' }, { w: 'два', m: 'two' }, { w: 'километра', m: 'kilometres' }, { w: 'у вас есть', m: 'do you have' }, { w: 'деньги', m: 'money' }, { w: 'на такси', m: 'for a taxi' }], choices: [{ t: 'У меня нет денег. Я могу пешком?', tr: 'I have no money. Can I walk?' }, { t: 'Да, немного денег есть.', tr: 'Yes, I have some money.' }] },
      { ai: 'Конечно, можно пешком. Идите прямо, потом налево.', ai_t: 'Of course, you can walk. Go straight, then turn left.', vocab: [{ w: 'конечно', m: 'of course' }, { w: 'можно', m: 'you can' }, { w: 'пешком', m: 'walk' }, { w: 'идите', m: 'go' }, { w: 'прямо', m: 'straight' }, { w: 'потом', m: 'then' }, { w: 'налево', m: 'left' }], choices: [{ t: 'Сколько времени это займёт?', tr: 'How long does it take?' }, { t: 'Спасибо. Вы очень добры.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Минут двадцать. Удачи! Надеюсь, доберётесь благополучно.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'минут двадцать', m: 'about twenty minutes' }, { w: 'удачи', m: 'good luck' }, { w: 'надеюсь', m: 'I hope' }, { w: 'доберётесь', m: 'you arrive' }, { w: 'благополучно', m: 'safely' }], choices: [{ t: 'Большое спасибо за помощь.', tr: 'Thank you very much for your help.' }, { t: 'До свидания!', tr: 'Goodbye!' }] },
    ],
    ar: [
      { ai: 'مرحباً! هل أنت ضائع؟ هل تحتاج مساعدة؟', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'مرحباً', m: 'hey' }, { w: 'هل أنت', m: 'are you' }, { w: 'ضائع', m: 'lost' }, { w: 'هل تحتاج', m: 'do you need' }, { w: 'مساعدة', m: 'help' }], choices: [{ t: 'نعم، أنا ضائع. هل يمكنك مساعدتي؟', tr: 'Yes, I am lost. Can you help me?' }, { t: 'أين نحن بالضبط؟', tr: 'Where are we exactly?' }] },
      { ai: 'أنت في السوق المركزي. إلى أين تريد الذهاب؟', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'أنت', m: 'you are' }, { w: 'في', m: 'at' }, { w: 'السوق', m: 'the market' }, { w: 'المركزي', m: 'central' }, { w: 'إلى أين', m: 'where' }, { w: 'تريد', m: 'want' }, { w: 'الذهاب', m: 'to go' }], choices: [{ t: 'أحتاج إلى الذهاب إلى المستشفى.', tr: 'I need to go to the hospital.' }, { t: 'أبحث عن السفارة.', tr: 'I am looking for the embassy.' }] },
      { ai: 'المستشفى على بعد كيلومترين. هل معك نقود للتاكسي؟', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'المستشفى', m: 'the hospital' }, { w: 'على بعد', m: 'away' }, { w: 'كيلومترين', m: 'two kilometres' }, { w: 'هل معك', m: 'do you have' }, { w: 'نقود', m: 'money' }, { w: 'للتاكسي', m: 'for a taxi' }], choices: [{ t: 'ليس معي نقود. هل يمكنني المشي؟', tr: 'I have no money. Can I walk?' }, { t: 'نعم، معي بعض النقود.', tr: 'Yes, I have some money.' }] },
      { ai: 'بالطبع يمكنك المشي. اسر مستقيماً ثم اتجه إلى اليسار.', ai_t: 'Of course you can walk. Go straight then turn left.', vocab: [{ w: 'بالطبع', m: 'of course' }, { w: 'يمكنك', m: 'you can' }, { w: 'المشي', m: 'walk' }, { w: 'اسر', m: 'go' }, { w: 'مستقيماً', m: 'straight' }, { w: 'ثم', m: 'then' }, { w: 'اتجه', m: 'turn' }, { w: 'إلى اليسار', m: 'left' }], choices: [{ t: 'كم من الوقت سيستغرق؟', tr: 'How long does it take?' }, { t: 'شكراً. أنت لطيف جداً.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'حوالي عشرين دقيقة. حظاً موفقاً! أتمنى أن تصل بسلامة.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'حوالي', m: 'about' }, { w: 'عشرين دقيقة', m: 'twenty minutes' }, { w: 'حظاً موفقاً', m: 'good luck' }, { w: 'أتمنى', m: 'I hope' }, { w: 'أن تصل', m: 'you arrive' }, { w: 'بسلامة', m: 'safely' }], choices: [{ t: 'شكراً جزيلاً على مساعدتك.', tr: 'Thank you very much for your help.' }, { t: 'مع السلامة!', tr: 'Goodbye!' }] },
    ],
    tr: [
      { ai: 'Hey! Kayboldu musunuz? Yardıma ihtiyacınız var mı?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'hey', m: 'hey' }, { w: 'kayboldu', m: 'are you lost' }, { w: 'musunuz', m: 'question' }, { w: 'yardıma', m: 'help' }, { w: 'ihtiyacınız var mı', m: 'do you need' }], choices: [{ t: 'Evet, kayboldum. Yardım edebilir misiniz?', tr: 'Yes, I am lost. Can you help me?' }, { t: 'Tam olarak neredeyiz?', tr: 'Where are we exactly?' }] },
      { ai: 'Merkez pazardasınız. Nereye gitmek istiyorsunuz?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'merkez', m: 'central' }, { w: 'pazardasınız', m: 'you are at the market' }, { w: 'nereye', m: 'where' }, { w: 'gitmek', m: 'to go' }, { w: 'istiyorsunuz', m: 'do you want' }], choices: [{ t: 'Hastaneye gitmem gerekiyor.', tr: 'I need to go to the hospital.' }, { t: 'Büyükelçiliği arıyorum.', tr: 'I am looking for the embassy.' }] },
      { ai: 'Hastane iki kilometre uzakta. Taksi için paran var mı?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'hastane', m: 'hospital' }, { w: 'iki', m: 'two' }, { w: 'kilometre', m: 'kilometre' }, { w: 'uzakta', m: 'away' }, { w: 'taksi', m: 'taxi' }, { w: 'için', m: 'for' }, { w: 'paran', m: 'money' }, { w: 'var mı', m: 'do you have' }], choices: [{ t: 'Param yok. Yürüyebilir miyim?', tr: 'I have no money. Can I walk?' }, { t: 'Evet, biraz param var.', tr: 'Yes, I have some money.' }] },
      { ai: 'Tabii ki yürüyebilirsiniz. Düz gidin, sonra sola dönün.', ai_t: 'Of course you can walk. Go straight, then turn left.', vocab: [{ w: 'tabii', m: 'of course' }, { w: 'yürüyebilirsiniz', m: 'you can walk' }, { w: 'düz', m: 'straight' }, { w: 'gidin', m: 'go' }, { w: 'sonra', m: 'then' }, { w: 'sola', m: 'left' }, { w: 'dönün', m: 'turn' }], choices: [{ t: 'Ne kadar sürer?', tr: 'How long does it take?' }, { t: 'Teşekkürler. Çok kibarsınız.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Yaklaşık yirmi dakika. İyi şanslar! Umarım sağ salim varırsınız.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'yaklaşık', m: 'about' }, { w: 'yirmi dakika', m: 'twenty minutes' }, { w: 'iyi şanslar', m: 'good luck' }, { w: 'umarım', m: 'I hope' }, { w: 'sağ salim', m: 'safely' }, { w: 'varırsınız', m: 'you arrive' }], choices: [{ t: 'Yardımınız için çok teşekkürler.', tr: 'Thank you very much for your help.' }, { t: 'Hoşça kalın!', tr: 'Goodbye!' }] },
    ],
  },
  social: {
    es: [
      { ai: '¡Hola! ¿Eres nuevo aquí? Nunca te había visto antes.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'hola', m: 'hi' }, { w: 'eres', m: 'are you' }, { w: 'nuevo', m: 'new' }, { w: 'aquí', m: 'here' }, { w: 'nunca', m: 'never' }, { w: 'te había visto', m: 'seen you' }, { w: 'antes', m: 'before' }], choices: [{ t: 'Sí, acabo de llegar.', tr: 'Yes, I just arrived.' }, { t: '¡Hola! Soy nuevo en la ciudad.', tr: 'Hi! I am new in the city.' }] },
      { ai: '¡Qué interesante! ¿De dónde eres?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'qué', m: 'how' }, { w: 'interesante', m: 'interesting' }, { w: 'de dónde', m: 'from where' }, { w: 'eres', m: 'are you' }], choices: [{ t: 'Soy de Canadá. ¿Y tú?', tr: 'I am from Canada. And you?' }, { t: 'Vengo de muy lejos.', tr: 'I come from very far away.' }] },
      { ai: 'Soy de aquí. ¿Te gusta la música?', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'soy', m: 'I am' }, { w: 'de aquí', m: 'from here' }, { w: 'te gusta', m: 'do you like' }, { w: 'la música', m: 'music' }], choices: [{ t: '¡Me encanta! ¿Tocas algún instrumento?', tr: 'I love it! Do you play any instrument?' }, { t: 'Sí, especialmente el jazz.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Toco la guitarra. Hay un concierto mañana. ¿Quieres venir?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'toco', m: 'I play' }, { w: 'la guitarra', m: 'guitar' }, { w: 'hay', m: 'there is' }, { w: 'un concierto', m: 'a concert' }, { w: 'mañana', m: 'tomorrow' }, { w: 'quieres', m: 'want' }, { w: 'venir', m: 'to come' }], choices: [{ t: '¡Me encantaría! ¿A qué hora?', tr: 'I would love to! What time?' }, { t: '¡Suena genial! ¿Dónde es?', tr: 'Sounds great! Where is it?' }] },
      { ai: 'A las ocho de la noche. ¡Va a ser una noche increíble!', ai_t: 'At eight in the evening. It\'s going to be an incredible night!', vocab: [{ w: 'a las ocho', m: 'at eight' }, { w: 'de la noche', m: 'in the evening' }, { w: 'va a ser', m: 'it will be' }, { w: 'una noche', m: 'a night' }, { w: 'increíble', m: 'incredible' }], choices: [{ t: '¡No puedo esperar! Hasta mañana.', tr: 'I can\'t wait! See you tomorrow.' }, { t: '¡Perfecto! Allí estaré.', tr: 'Perfect! I\'ll be there.' }] },
    ],
    fr: [
      { ai: 'Bonjour! Tu es nouveau ici? Je ne t\'avais jamais vu.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'bonjour', m: 'hi' }, { w: 'tu es', m: 'are you' }, { w: 'nouveau', m: 'new' }, { w: 'ici', m: 'here' }, { w: 'jamais', m: 'never' }, { w: 'vu', m: 'seen' }, { w: 'avant', m: 'before' }], choices: [{ t: 'Oui, je viens d\'arriver.', tr: 'Yes, I just arrived.' }, { t: 'Salut! Je suis nouveau en ville.', tr: 'Hi! I am new in the city.' }] },
      { ai: 'Comme c\'est intéressant! Tu viens d\'où?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'comme', m: 'how' }, { w: 'c\'est', m: 'it is' }, { w: 'intéressant', m: 'interesting' }, { w: 'd\'où', m: 'from where' }, { w: 'tu viens', m: 'are you from' }], choices: [{ t: 'Je viens du Canada. Et toi?', tr: 'I am from Canada. And you?' }, { t: 'Je viens de très loin.', tr: 'I come from very far away.' }] },
      { ai: 'Je suis d\'ici. Tu aimes la musique?', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'je suis', m: 'I am' }, { w: "d'ici", m: 'from here' }, { w: 'tu aimes', m: 'do you like' }, { w: 'la musique', m: 'music' }], choices: [{ t: 'J\'adore! Tu joues d\'un instrument?', tr: 'I love it! Do you play an instrument?' }, { t: 'Oui, surtout le jazz.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Je joue de la guitare. Il y a un concert demain. Tu veux venir?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'je joue', m: 'I play' }, { w: 'de la guitare', m: 'guitar' }, { w: 'il y a', m: 'there is' }, { w: 'un concert', m: 'a concert' }, { w: 'demain', m: 'tomorrow' }, { w: 'tu veux', m: 'want' }, { w: 'venir', m: 'to come' }], choices: [{ t: 'J\'adorerais! À quelle heure?', tr: 'I would love to! What time?' }, { t: 'Super! C\'est où?', tr: 'Great! Where is it?' }] },
      { ai: 'À vingt heures. Ça va être une nuit incroyable!', ai_t: 'At eight o\'clock. It\'s going to be an incredible night!', vocab: [{ w: 'à vingt heures', m: 'at eight' }, { w: 'ça va être', m: 'it will be' }, { w: 'une nuit', m: 'a night' }, { w: 'incroyable', m: 'incredible' }], choices: [{ t: 'J\'ai hâte! À demain.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'Parfait! J\'y serai.', tr: 'Perfect! I\'ll be there.' }] },
    ],
    zh: [
      { ai: '你好！你是新来的吗？我以前从没见过你。', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: '你好', m: 'hi' }, { w: '你是', m: 'are you' }, { w: '新来的', m: 'new here' }, { w: '从没', m: 'never' }, { w: '见过', m: 'seen' }, { w: '你', m: 'you' }, { w: '以前', m: 'before' }], choices: [{ t: '是的，我刚到。', tr: 'Yes, I just arrived.' }, { t: '你好！我是这座城市的新人。', tr: 'Hi! I am new in this city.' }] },
      { ai: '真有趣！你从哪里来？', ai_t: 'How interesting! Where are you from?', vocab: [{ w: '真', m: 'how' }, { w: '有趣', m: 'interesting' }, { w: '你', m: 'you' }, { w: '从', m: 'from' }, { w: '哪里', m: 'where' }, { w: '来', m: 'come' }], choices: [{ t: '我来自加拿大。你呢？', tr: 'I am from Canada. And you?' }, { t: '我来自很远的地方。', tr: 'I come from very far away.' }] },
      { ai: '我是本地人。你喜欢音乐吗？', ai_t: 'I am a local. Do you like music?', vocab: [{ w: '我是', m: 'I am' }, { w: '本地人', m: 'local' }, { w: '你喜欢', m: 'do you like' }, { w: '音乐', m: 'music' }, { w: '吗', m: 'question' }], choices: [{ t: '我很喜欢！你会演奏乐器吗？', tr: 'I love it! Do you play an instrument?' }, { t: '喜欢，尤其是爵士乐。', tr: 'Yes, especially jazz.' }] },
      { ai: '我会弹吉他。明天有一场音乐会。你想来吗？', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: '我会弹', m: 'I play' }, { w: '吉他', m: 'guitar' }, { w: '明天', m: 'tomorrow' }, { w: '有', m: 'there is' }, { w: '一场', m: 'a' }, { w: '音乐会', m: 'concert' }, { w: '你想', m: 'want' }, { w: '来吗', m: 'to come' }], choices: [{ t: '太好了！几点开始？', tr: 'Great! What time does it start?' }, { t: '听起来不错！在哪里？', tr: 'Sounds great! Where is it?' }] },
      { ai: '晚上八点。一定会是个美好的夜晚！', ai_t: 'At eight in the evening. It will definitely be a wonderful night!', vocab: [{ w: '晚上八点', m: 'at eight' }, { w: '一定会', m: 'will be' }, { w: '是个', m: 'a' }, { w: '美好', m: 'wonderful' }, { w: '的', m: 'particle' }, { w: '夜晚', m: 'night' }], choices: [{ t: '我等不及了！明天见。', tr: 'I can\'t wait! See you tomorrow.' }, { t: '太棒了！我一定到。', tr: 'Excellent! I\'ll definitely be there.' }] },
    ],
    fa: [
      { ai: 'سلام! اینجا تازهواردی؟ قبلاً ندیده بودمت.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'سلام', m: 'hi' }, { w: 'اینجا', m: 'here' }, { w: 'تازهواردی', m: 'are you new' }, { w: 'قبلاً', m: 'before' }, { w: 'ندیده بودمت', m: 'seen you' }], choices: [{ t: 'بله تازه سیدم.', tr: 'Yes, I just arrived.' }, { t: 'سلام! تازه به این شهر آمدم.', tr: 'Hi! I am new in this city.' }] },
      { ai: 'چه جالب! اهل کجایی؟', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'چه', m: 'how' }, { w: 'جالب', m: 'interesting' }, { w: 'اهل', m: 'from' }, { w: 'کجایی', m: 'where are you from' }], choices: [{ t: 'از کانادا اومدم', tr: 'I am from Canada. And you?' }, { t: 'از خیلی دور آمدهام.', tr: 'I come from very far away.' }] },
      { ai: 'من اینجایی هستم. موسیقی دوست داری؟', ai_t: 'I am local. Do you like music?', vocab: [{ w: 'من', m: 'I am' }, { w: 'اینجایی', m: 'local' }, { w: 'هستم', m: 'am' }, { w: 'موسیقی', m: 'music' }, { w: 'دوست داری', m: 'do you like' }], choices: [{ t: 'خیلی دوست دارم! ساز میزنی؟', tr: 'I love it! Do you play an instrument?' }, { t: 'بله به خصوص جاز.', tr: 'Yes, especially jazz.' }] },
      { ai: 'گیتار میزنم. فردا کنسرت داریم. میخواهی بیایی؟', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'گیتار', m: 'guitar' }, { w: 'میزنم', m: 'I play' }, { w: 'فردا', m: 'tomorrow' }, { w: 'کنسرت', m: 'concert' }, { w: 'داریم', m: 'there is' }, { w: 'میخواهی', m: 'want' }, { w: 'بیایی', m: 'to come' }], choices: [{ t: 'عاشقانه ساعت چنده؟', tr: 'I would love to! What time?' }, { t: 'عالیه کجاست', tr: 'Sounds great! Where is it?' }] },
      { ai: 'ساعت هشت شب. شب فراموشنشدنی خواهد بود!', ai_t: 'At eight in the evening. It will be an unforgettable night!', vocab: [{ w: 'ساعت هشت', m: 'at eight' }, { w: 'شب', m: 'night' }, { w: 'فراموشنشدنی', m: 'unforgettable' }, { w: 'خواهد بود', m: 'will be' }], choices: [{ t: 'تا فردا نمیتونم صبر کنم.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'عالی حتما میام.', tr: 'Perfect! I\'ll definitely be there.' }] },
    ],
    it: [
      { ai: 'Ciao! Sei nuovo qui? Non ti avevo mai visto prima.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'ciao', m: 'hi' }, { w: 'sei', m: 'are you' }, { w: 'nuovo', m: 'new' }, { w: 'qui', m: 'here' }, { w: 'mai', m: 'never' }, { w: 'visto', m: 'seen' }, { w: 'prima', m: 'before' }], choices: [{ t: 'Sì, sono appena arrivato.', tr: 'Yes, I just arrived.' }, { t: 'Ciao! Sono nuovo in città.', tr: 'Hi! I am new in the city.' }] },
      { ai: 'Che interessante! Di dove sei?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'che', m: 'how' }, { w: 'interessante', m: 'interesting' }, { w: 'di dove', m: 'from where' }, { w: 'sei', m: 'are you' }], choices: [{ t: 'Sono canadese. E tu?', tr: 'I am Canadian. And you?' }, { t: 'Vengo da molto lontano.', tr: 'I come from very far away.' }] },
      { ai: 'Sono di qui. Ti piace la musica?', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'sono', m: 'I am' }, { w: 'di qui', m: 'from here' }, { w: 'ti piace', m: 'do you like' }, { w: 'la musica', m: 'music' }], choices: [{ t: 'Moltissimo! Suoni qualche strumento?', tr: 'Very much! Do you play any instrument?' }, { t: 'Sì, soprattutto il jazz.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Suono la chitarra. C\'è un concerto domani. Vuoi venire?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'suono', m: 'I play' }, { w: 'la chitarra', m: 'guitar' }, { w: "c'è", m: 'there is' }, { w: 'un concerto', m: 'a concert' }, { w: 'domani', m: 'tomorrow' }, { w: 'vuoi', m: 'want' }, { w: 'venire', m: 'to come' }], choices: [{ t: 'Mi piacerebbe! A che ora?', tr: 'I would love to! What time?' }, { t: 'Fantastico! Dove?', tr: 'Fantastic! Where is it?' }] },
      { ai: 'Alle otto di sera. Sarà una notte incredibile!', ai_t: 'At eight in the evening. It\'s going to be an incredible night!', vocab: [{ w: 'alle otto', m: 'at eight' }, { w: 'di sera', m: 'in the evening' }, { w: 'sarà', m: 'it will be' }, { w: 'una notte', m: 'a night' }, { w: 'incredibile', m: 'incredible' }], choices: [{ t: 'Non vedo l\'ora! A domani.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'Perfetto! Ci sarò.', tr: 'Perfect! I\'ll be there.' }] },
    ],
    ru: [
      { ai: 'Привет! Ты новенький здесь? Я никогда раньше тебя не видел.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'привет', m: 'hi' }, { w: 'ты новенький', m: 'are you new' }, { w: 'здесь', m: 'here' }, { w: 'никогда', m: 'never' }, { w: 'раньше', m: 'before' }, { w: 'тебя не видел', m: 'seen you' }], choices: [{ t: 'Да, я только что приехал.', tr: 'Yes, I just arrived.' }, { t: 'Привет! Я новый в этом городе.', tr: 'Hi! I am new in this city.' }] },
      { ai: 'Как интересно! Откуда ты?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'как', m: 'how' }, { w: 'интересно', m: 'interesting' }, { w: 'откуда', m: 'from where' }, { w: 'ты', m: 'are you' }], choices: [{ t: 'Я из Канады. А ты?', tr: 'I am from Canada. And you?' }, { t: 'Я приехал издалека.', tr: 'I come from very far away.' }] },
      { ai: 'Я местный. Ты любишь музыку?', ai_t: 'I am local. Do you like music?', vocab: [{ w: 'я', m: 'I am' }, { w: 'местный', m: 'local' }, { w: 'ты любишь', m: 'do you like' }, { w: 'музыку', m: 'music' }], choices: [{ t: 'Очень люблю! Играешь на инструменте?', tr: 'I love it! Do you play an instrument?' }, { t: 'Да, особенно джаз.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Я играю на гитаре. Завтра концерт. Хочешь пойти?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to go?', vocab: [{ w: 'я играю', m: 'I play' }, { w: 'на гитаре', m: 'guitar' }, { w: 'завтра', m: 'tomorrow' }, { w: 'концерт', m: 'concert' }, { w: 'хочешь', m: 'want' }, { w: 'пойти', m: 'to go' }], choices: [{ t: 'С удовольствием! В котором часу?', tr: 'I would love to! What time?' }, { t: 'Звучит здорово! Где?', tr: 'Sounds great! Where is it?' }] },
      { ai: 'В восемь вечера. Это будет незабываемая ночь!', ai_t: 'At eight in the evening. It\'s going to be an unforgettable night!', vocab: [{ w: 'в восемь', m: 'at eight' }, { w: 'вечера', m: 'in the evening' }, { w: 'это будет', m: 'it will be' }, { w: 'незабываемая', m: 'unforgettable' }, { w: 'ночь', m: 'night' }], choices: [{ t: 'Не могу дождаться! До завтра.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'Отлично! Обязательно приду.', tr: 'Perfect! I\'ll definitely be there.' }] },
    ],
    ar: [
      { ai: 'مرحباً! أنت جديد هنا؟ لم أرَك من قبل.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'مرحباً', m: 'hi' }, { w: 'أنت', m: 'are you' }, { w: 'جديد', m: 'new' }, { w: 'هنا', m: 'here' }, { w: 'لم أرَك', m: 'never seen you' }, { w: 'من قبل', m: 'before' }], choices: [{ t: 'نعم، وصلت للتو.', tr: 'Yes, I just arrived.' }, { t: 'مرحباً! أنا جديد في هذه المدينة.', tr: 'Hi! I am new in this city.' }] },
      { ai: 'يا لها من مفاجأة! من أين أنت؟', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'يا لها', m: 'how' }, { w: 'من مفاجأة', m: 'interesting' }, { w: 'من أين', m: 'from where' }, { w: 'أنت', m: 'are you' }], choices: [{ t: 'أنا من كندا. وأنت؟', tr: 'I am from Canada. And you?' }, { t: 'أنا قادم من بعيد جداً.', tr: 'I come from very far away.' }] },
      { ai: 'أنا من هنا. هل تحب الموسيقى؟', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'أنا', m: 'I am' }, { w: 'من هنا', m: 'from here' }, { w: 'هل تحب', m: 'do you like' }, { w: 'الموسيقى', m: 'music' }], choices: [{ t: 'أحبها كثيراً! هل تعزف آلة موسيقية؟', tr: 'I love it! Do you play an instrument?' }, { t: 'نعم، خاصةً الجاز.', tr: 'Yes, especially jazz.' }] },
      { ai: 'أعزف على الغيتار. هناك حفلة موسيقية غداً. هل تريد المجيء؟', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'أعزف', m: 'I play' }, { w: 'على الغيتار', m: 'guitar' }, { w: 'هناك', m: 'there is' }, { w: 'حفلة موسيقية', m: 'concert' }, { w: 'غداً', m: 'tomorrow' }, { w: 'هل تريد', m: 'want' }, { w: 'المجيء', m: 'to come' }], choices: [{ t: 'بكل سرور! في أي ساعة؟', tr: 'I would love to! What time?' }, { t: 'يبدو رائعاً! أين؟', tr: 'Sounds great! Where is it?' }] },
      { ai: 'في الثامنة مساءً. ستكون ليلة لا تُنسى!', ai_t: 'At eight in the evening. It\'s going to be an unforgettable night!', vocab: [{ w: 'في الثامنة', m: 'at eight' }, { w: 'مساءً', m: 'in the evening' }, { w: 'ستكون', m: 'it will be' }, { w: 'ليلة', m: 'a night' }, { w: 'لا تُنسى', m: 'unforgettable' }], choices: [{ t: 'لا أستطيع الانتظار! أراك غداً.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'رائع! سأكون هناك.', tr: 'Perfect! I\'ll be there.' }] },
    ],
    tr: [
      { ai: 'Merhaba! Buraya yeni mi geldiniz? Sizi daha önce hiç görmedim.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'merhaba', m: 'hi' }, { w: 'buraya', m: 'here' }, { w: 'yeni', m: 'new' }, { w: 'mi geldiniz', m: 'are you new' }, { w: 'hiç', m: 'never' }, { w: 'görmedim', m: 'seen you' }], choices: [{ t: 'Evet, yeni geldim.', tr: 'Yes, I just arrived.' }, { t: 'Merhaba! Bu şehre yeniyim.', tr: 'Hi! I am new in this city.' }] },
      { ai: 'Ne ilginç! Nerelisiniz?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'ne', m: 'how' }, { w: 'ilginç', m: 'interesting' }, { w: 'nerelisiniz', m: 'where are you from' }], choices: [{ t: 'Kanadalıyım. Ya siz?', tr: 'I am from Canada. And you?' }, { t: 'Çok uzaktan geliyorum.', tr: 'I come from very far away.' }] },
      { ai: 'Ben buralıyım. Müzik sever misiniz?', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'ben', m: 'I am' }, { w: 'buralıyım', m: 'from here' }, { w: 'müzik', m: 'music' }, { w: 'sever misiniz', m: 'do you like' }], choices: [{ t: 'Çok severim! Enstrüman çalıyor musunuz?', tr: 'I love it! Do you play an instrument?' }, { t: 'Evet, özellikle caz.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Gitar çalıyorum. Yarın bir konser var. Gelmek ister misiniz?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'gitar', m: 'guitar' }, { w: 'çalıyorum', m: 'I play' }, { w: 'yarın', m: 'tomorrow' }, { w: 'bir konser', m: 'a concert' }, { w: 'var', m: 'there is' }, { w: 'gelmek', m: 'to come' }, { w: 'ister misiniz', m: 'want' }], choices: [{ t: 'Çok isterim! Saat kaçta?', tr: 'I would love to! What time?' }, { t: 'Harika! Nerede?', tr: 'Sounds great! Where is it?' }] },
      { ai: 'Akşam sekizde. İnanılmaz bir gece olacak!', ai_t: 'At eight in the evening. It\'s going to be an incredible night!', vocab: [{ w: 'akşam', m: 'evening' }, { w: 'sekizde', m: 'at eight' }, { w: 'inanılmaz', m: 'incredible' }, { w: 'bir', m: 'a' }, { w: 'gece', m: 'night' }, { w: 'olacak', m: 'it will be' }], choices: [{ t: 'Sabırsızlanıyorum! Yarın görüşürüz.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'Mükemmel! Orada olacağım.', tr: 'Perfect! I\'ll be there.' }] },
    ],
  },
};

// ─── Types & constants ───────────────────────────────────────────
type Screen = 'splash' | 'scenario' | 'language' | 'guide' | 'convo' | 'done' | 'translate';

const SCENARIOS = [
  { id: 'business', icon: '💼', title: 'Business Immersion', subtitle: 'You just inherited a company — everyone speaks a foreign language.' },
  { id: 'survival', icon: '🗺️', title: 'Survival', subtitle: 'Stranded abroad. Navigate to safety using only the local tongue.' },
  { id: 'social', icon: '✨', title: 'Social Game', subtitle: 'Surrounded by stunning company who only speak another language.' },
];

const LANGUAGES = [
  { code: 'es', flag: '🇪🇸', name: 'Spanish' },
  { code: 'fr', flag: '🇫🇷', name: 'French' },
  { code: 'zh', flag: '🇨🇳', name: 'Mandarin' },
  { code: 'fa', flag: '🇮🇷', name: 'Persian' },
  { code: 'it', flag: '🇮🇹', name: 'Italian' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish' },
];

// ─── App ─────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [scenario, setScenario] = useState('');
  const [lang, setLang] = useState('');
  const [step, setStep] = useState(0);
  const [vocab, setVocab] = useState<{ w: string; m: string; ph?: string }[]>([]);
  const [trSourceLang, setTrSourceLang] = useState<string>('en');
  const [trTargetLang, setTrTargetLang] = useState<string>('en');
  const [trInput, setTrInput] = useState<string>('');
  const [trOutput, setTrOutput] = useState<string>('');
  const [trLoading, setTrLoading] = useState<boolean>(false);
  const [chosen, setChosen] = useState('');
  const [history, setHistory] = useState<{ ai: string; vocab: { w: string; m: string; ph?: string }[]; chosen: string }[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [tappedWord, setTappedWord] = useState('');
  const [tappedIndex, setTappedIndex] = useState(-1);
  const [dariushId, setDariushId] = useState('');
  const [nargessId, setNargessId] = useState('');
  const [bilingualTap, setBilingualTap] = useState(true);
  const [reverseFlow, setReverseFlow] = useState(false);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const convoScrollRef = useRef<any>(null);
  const convoFadeAnim = useRef(new Animated.Value(1)).current;
  const advanceRef = useRef<(() => void) | null>(null);
  const touchStartY = useRef(0);
    useEffect(() => { setTimeout(() => convoScrollRef.current?.scrollToEnd({ animated: false }), 80); }, [step]);
  useEffect(() => { setChosen(c => c === '' ? '' : ''); }, [step]);
  const screenOrderRef = useRef(['splash', 'scenario', 'language', 'guide', 'convo', 'done']);
  const currentScreenRef = useRef<Screen>('splash');

  function navigate(to: Screen) {
    const order = screenOrderRef.current;
    const fromIdx = order.indexOf(currentScreenRef.current);
    const toIdx = order.indexOf(to);
    const dir = toIdx >= fromIdx ? 1 : -1;
    slideAnim.setValue(dir * width);
    currentScreenRef.current = to;
    setScreen(to);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (screen === 'splash') {
      fadeAnim.setValue(0); riseAnim.setValue(30); glowAnim.setValue(0);
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(riseAnim, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.delay(400),
        Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    }
    if (screen !== 'convo') Speech.stop();
  }, [screen]);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then(voices => {
      const dariush = voices.find(v => (v.name ?? '').toLowerCase().includes('dariush'));
      const nargess = voices.find(v => (v.name ?? '').toLowerCase().includes('nargess'));
      const faFallback = (!dariush && !nargess) ? voices.find(v => v.language?.startsWith('fa')) : null;
      if (dariush) setDariushId(dariush.identifier); else if (faFallback) setDariushId(faFallback.identifier);
      if (nargess) setNargessId(nargess.identifier); else if (faFallback) setNargessId(faFallback.identifier);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (screen === 'convo') {
      const ex = CONVOS[scenario]?.[lang]?.[step];
      if (ex) {
        Speech.stop();
        const _o1: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.88 };
        if (lang === 'fa' && dariushId) _o1.voice = dariushId;
        Speech.speak(ex.ai, _o1);
      }
    }
  }, [screen, step]);

  function startSession(sc: string, lg: string) {
    setScenario(sc); setLang(lg); setStep(0); setVocab([]); setChosen(''); setShowTranslation(false); setHistory([]);
    navigate('guide');
  }

  function speakWord(word: string, index: number) {
    const clean = word.replace(/[.,!?;:،؟]/g, '').trim();
    if (!clean) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTappedWord(clean);
    setTappedIndex(index);
    setShowTranslation(true);
    Speech.stop();
    // Speak foreign word, then optionally English translation
    const _o3: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82, onDone: () => {
      if (bilingualTap) {
        const ex = CONVOS[scenario]?.[lang]?.[step];
        const enWords = ex?.ai_t.split(' ') ?? [];
        const enWord = (enWords[index] ?? '').replace(/[.,!?;:]/g, '').trim();
        if (enWord) {
          setTimeout(() => {
            Speech.speak(enWord === 'I' ? 'I.' : enWord, { language: 'en-US', rate: 0.82 });
          }, 300);
        }
      }
    }};
    if (lang === 'fa' && dariushId) _o3.voice = dariushId;
    Speech.speak(clean, _o3);
    setTimeout(() => { setTappedWord(''); setTappedIndex(-1); }, bilingualTap ? 2200 : 1200);
  }

  function handleChoice(choice: string) {
    const exchange = CONVOS[scenario]?.[lang]?.[step];
    if (!exchange) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setChosen(choice);
    const newVocab = [...vocab, ...exchange.vocab.filter(v => !vocab.find(ev => ev.w === v.w))];
    setVocab(newVocab);
    const advance = () => {
      if (step + 1 >= (CONVOS[scenario]?.[lang]?.length ?? 0)) {
        navigate('done');
      } else {
        setHistory(h => [...h, { ai: exchange.ai, vocab: exchange.vocab, chosen: choice, chosen_tr: exchange.choices.find(ch => ch.t === choice)?.tr ?? '', chosen_vocab: (exchange.choices.find(ch => ch.t === choice) as any)?.vocab ?? [] }]);
        setStep(step + 1); setChosen(''); setShowTranslation(false);
        setTimeout(() => convoScrollRef.current?.scrollToEnd({ animated: false }), 80);
      }
    };
    advanceRef.current = advance;
    Speech.stop();
    const _cOpts: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82 };
    if (lang === 'fa' && (nargessId || dariushId)) _cOpts.voice = nargessId || dariushId;
    Speech.speak(choice, _cOpts);
  }

  const exchange = CONVOS[scenario]?.[lang]?.[step];
  const guide = GUIDES[scenario]?.[lang];
  const total = CONVOS[scenario]?.[lang]?.length ?? 5;
  const accent = SCENE_COLOR[scenario] ?? C.gold;

  if (screen === 'splash') return (
    <Animated.View style={[s.root, { transform: [{ translateX: slideAnim }] }, { backgroundColor: '#0A1628' }]}>
      <Animated.View style={[s.center, { opacity: fadeAnim, transform: [{ translateY: riseAnim }] }]}>
        <Image source={require('./assets/ascend-logo.jpg')} style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 20 }} />
        <Text style={s.wordmark}>ASCEND</Text>
        <Text style={s.tagline}>Learn any language.{'\n'}Rise to any moment.</Text>
        <View style={{ marginTop: 24, backgroundColor: C.gold, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12, shadowColor: C.gold, shadowOpacity: 0.6, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 10 }}>
          <Text style={{ color: '#000', fontSize: 22, fontWeight: '900', letterSpacing: 3, textAlign: 'center' }}>v1.3</Text>
          <Text style={{ color: '#000', fontSize: 12, fontWeight: '700', letterSpacing: 4, textAlign: 'center', marginTop: 2 }}>OCT 2 · NEW BUILD</Text>
        </View>
        <Animated.View style={{ opacity: glowAnim, marginTop: 56 }}>
          <Pressable style={({ pressed }) => [s.ctaBtn, pressed && s.ctaBtnP]} onPress={() => navigate('scenario')}>
            <Text style={s.ctaText}>Begin Your Journey</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
      <Pressable onPress={() => navigate('translate')} style={{ position: 'absolute', bottom: 40, right: 24, backgroundColor: C.surface2, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: C.gold + '44' }}>
        <Text style={{ color: C.gold, fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>🌐 Translate</Text>
      </Pressable>
      <Animated.Text style={[s.bottomNote, { opacity: glowAnim }]}>Immersive · Scenario-driven · No rote drilling</Animated.Text>
    </Animated.View>
  );

  if (screen === 'scenario') return (
    <Animated.View style={[s.root, { transform: [{ translateX: slideAnim }] }]}>
      <View style={s.header}><Text style={s.eyebrow}>STEP 1 OF 2</Text><Text style={s.headTitle}>Choose Your{'\n'}Mission</Text></View>
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {SCENARIOS.map(sc => (
          <Pressable key={sc.id} style={({ pressed }) => [s.card, pressed && s.cardP]} onPress={() => { setScenario(sc.id); navigate('language'); }}>
            <Text style={s.cardIcon}>{sc.icon}</Text>
            <View style={s.cardBody}><Text style={s.cardTitle}>{sc.title}</Text><Text style={s.cardSub}>{sc.subtitle}</Text></View>
            <Text style={s.arrow}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={s.backBtn} onPress={() => navigate('splash')}><Text style={s.backTxt}>← Back</Text></Pressable>
    </Animated.View>
  );

  if (screen === 'language') return (
    <Animated.View style={[s.root, { transform: [{ translateX: slideAnim }] }]}>
      <View style={s.header}><Text style={s.eyebrow}>STEP 2 OF 2</Text><Text style={s.headTitle}>Choose Your{'\n'}Language</Text></View>
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map(lg => (
          <Pressable key={lg.code} style={({ pressed }) => [s.card, pressed && s.cardP]} onPress={() => startSession(scenario, lg.code)}>
            <Text style={{ fontSize: 36 }}>{lg.flag}</Text>
            <Text style={[s.cardTitle, { flex: 1, fontSize: 20 }]}>{lg.name}</Text>
            <Text style={s.arrow}>›</Text>
          </Pressable>
        ))}

      </ScrollView>
      <Pressable style={s.backBtn} onPress={() => navigate('scenario')}><Text style={s.backTxt}>← Back</Text></Pressable>
    </Animated.View>
  );

  if (screen === 'guide') return (
    <Animated.View style={[s.root, s.center, { transform: [{ translateX: slideAnim }] }]}>
      {/* Scenario atmosphere glow */}
      <View pointerEvents="none" style={{ position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: accent + '18', top: '15%', alignSelf: 'center' }} />
      <View pointerEvents="none" style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: accent + '14', top: '22%', alignSelf: 'center' }} />
      <Pressable style={[s.backBtn, { position: 'absolute', top: 60, left: 24 }]} onPress={() => navigate('language')}>
        <Text style={s.backTxt}>← Back</Text>
      </Pressable>
      <Text style={{ fontSize: 80, marginBottom: 16 }}>{guide?.avatar}</Text>
      <Text style={s.guideName}>{guide?.name}</Text>
      <Text style={s.guideRole}>{guide?.role}</Text>
      <View style={s.guideDivider} />
      {showVoicePrompt && (
        <View style={{ backgroundColor: '#1A1830', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#C9A84C' }}>
          <Text style={{ color: '#C9A84C', fontWeight: '700', marginBottom: 6 }}>🔊 Persian Voice Not Installed</Text>
          <Text style={{ color: '#EDE8D8', fontSize: 13, lineHeight: 20 }}>{"To hear Persian spoken, install the Dariush voice:\nSettings → Accessibility → Read & Speak → Voices → Persian"}</Text>
          <Pressable onPress={() => setShowVoicePrompt(false)} style={{ marginTop: 10 }}>
            <Text style={{ color: '#C9A84C', fontSize: 13 }}>Dismiss ✕</Text>
          </Pressable>
        </View>
      )}
      <Text style={s.guideIntro}>Your guide for this mission.{'\n'}They only speak the target language.{'\n'}Listen, read, respond.</Text>
      <Pressable style={[s.ctaBtn, { marginTop: 40 }]} onPress={() => { setStep(0); setChosen(''); setShowTranslation(false); setHistory([]); convoFadeAnim.setValue(1); navigate('convo'); }}>
        <Text style={s.ctaText}>Start Conversation</Text>
      </Pressable>
    </Animated.View>
  );

  if (screen === 'convo' && exchange) {
    const _wClean = (w: string) => w.replace(/[.,!?;:،؟‌‍]/g, '').trim();
    const _aiWords = exchange.ai.split(' ').filter((w: string) => w.trim());
    const _wordRows = _aiWords.map((w: string) => {
      const _wc = _wClean(w);
      const _match = exchange.vocab.find((v: { w: string; m: string }) => v.w.split(' ').some((vw: string) => _wClean(vw) === _wc));
      return { w, m: _match?.m ?? '' };
    });
    return (
    <Animated.View style={[s.root, { transform: [{ translateX: slideAnim }] }]}>
      {/* D4 — Pinned guide header */}
      <View style={[s.convoHeader, { borderBottomColor: accent + '40' }]}>
        <Pressable style={s.convoBack} onPress={() => { Speech.stop(); setChosen(''); convoFadeAnim.setValue(1); navigate('guide'); }}>
          <Text style={s.backTxt}>←</Text>
        </Pressable>
        <View style={s.convoGuideInfo}>
          <Text style={s.convoAvatar}>{guide?.avatar}</Text>
          <View>
            <Text style={s.convoGuideName}>{guide?.name}</Text>
            <Text style={s.convoGuideRole}>{guide?.role}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Pressable onPress={() => setBilingualTap(b => !b)} style={[s.toggleBtn, bilingualTap && s.toggleBtnOn]}>
            <Text style={[s.toggleTxt, bilingualTap && s.toggleTxtOn]}>{bilingualTap ? '🔊 EN' : '🔇 EN'}</Text>
          </Pressable>
          <Pressable onPress={() => setReverseFlow(r => !r)} style={[s.toggleBtn, reverseFlow && s.toggleBtnOn]}>
            <Text style={[s.toggleTxt, reverseFlow && s.toggleTxtOn]}>{reverseFlow ? '→EN' : 'EN→'}</Text>
          </Pressable>
          <Pressable style={s.replayBtn} onPress={() => {
            Speech.stop();
            if (exchange) { const _o2: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.88 }; if (lang === 'fa' && dariushId) _o2.voice = dariushId; Speech.speak(exchange.ai, _o2); }
          }}>
            <Text style={s.replayTxt}>🔊</Text>
          </Pressable>
        </View>
      </View>
      {/* Step counter + progress */}
      <ScrollView ref={convoScrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <View style={[s.progressBar, { flex: 1, marginBottom: 0 }]}><View style={[s.progressFill, { width: `${(step / total) * 100}%`, backgroundColor: accent }]} /></View>
        <Text style={{ fontSize: 10, color: C.muted, letterSpacing: 1, minWidth: 32, textAlign: 'right' }}>{step + 1}/{total}</Text>
      </View>
      {history.map((h, hi) => {
        const _hClean = (w: string) => w.replace(/[.,!?;:،؟‌‍]/g, '').trim();
        const _hWords = h.ai.split(' ').filter((w: string) => w.trim());
        const _hRows = _hWords.map((w: string) => {
          const wc = _hClean(w);
          const match = h.vocab.find((v: { w: string; m: string }) => v.w.split(' ').some((vw: string) => _hClean(vw) === wc));
          return { w, m: match?.m ?? '' };
        });
        const _chosenTrH = (h as any).chosen_tr ?? '';
        const _hChosenVocab = (h as any).chosen_vocab as { w: string; m: string }[] | undefined;
        const _cWords = _hChosenVocab && _hChosenVocab.length > 0 ? _hChosenVocab : h.chosen.split(' ').filter((w: string) => w.trim()).map((w: string) => ({ w, m: '' }));
        return (
          <View key={hi} style={{ marginBottom: 16, opacity: 0.75 }}>
            <View style={{ gap: 2, marginBottom: 6 }}>
              {_hRows.map((v: { w: string; m: string }, i: number) => (
                <View key={i} style={{ flexDirection: RTL_LANGS.has(lang) ? 'row-reverse' : 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden' }}>
                  <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); const _o: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82 }; if (lang === 'fa' && (nargessId || dariushId)) _o.voice = nargessId || dariushId; Speech.stop(); Speech.speak(v.w, _o); }} style={{ flex: 1, padding: 7 }}>
                    <Text style={{ color: C.gold, fontSize: 13, fontWeight: '600', textAlign: RTL_LANGS.has(lang) ? 'right' : 'left' }}>{v.w}</Text>
                    {(v as any).ph ? <Text style={{ color: C.muted, fontSize: 11 }}>{(v as any).ph}</Text> : null}
                  </Pressable>
                  {v.m ? <Pressable onPress={() => { Speech.stop(); Speech.speak(v.m === 'I' ? 'I.' : v.m, { language: 'en-US', rate: 0.82 }); }} style={{ padding: 6, justifyContent: 'center' }}><Text style={{ color: C.muted, fontSize: 12 }}>{v.m}</Text></Pressable> : null}
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 9, letterSpacing: 2, color: C.muted, marginBottom: 3 }}>YOU SAID</Text>
            <View style={{ gap: 2, marginBottom: 10 }}>
              {_cWords.map((v: { w: string; m: string }, i: number) => (
                <View key={i} style={{ flexDirection: RTL_LANGS.has(lang) ? 'row-reverse' : 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden' }}>
                  <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); const _o: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82 }; if (lang === 'fa' && (nargessId || dariushId)) _o.voice = nargessId || dariushId; Speech.stop(); Speech.speak(v.w, _o); }} style={{ flex: 1, padding: 7 }}>
                    <Text style={{ color: C.gold, fontSize: 13, fontWeight: '600', textAlign: RTL_LANGS.has(lang) ? 'right' : 'left' }}>{v.w}</Text>
                  </Pressable>
                  {v.m ? <Pressable onPress={() => { Speech.stop(); Speech.speak(v.m === 'I' ? 'I.' : v.m, { language: 'en-US', rate: 0.82 }); }} style={{ padding: 6, justifyContent: 'center' }}><Text style={{ color: C.muted, fontSize: 11 }}>{v.m}</Text></Pressable> : null}
                </View>
              ))}
            </View>
            {(h as any).chosen_tr ? <Text style={{ color: C.muted, fontSize: 11, fontStyle: 'italic', marginBottom: 8, textAlign: RTL_LANGS.has(lang) ? 'right' : 'left' }}>{(h as any).chosen_tr}</Text> : <View style={{ marginBottom: 8 }} />}
          <View style={{ height: 1, backgroundColor: C.surface2 }} />
          </View>
        );
      })}
      <View style={s.bubbleRow}>
        <View style={[s.guidePip, { borderWidth: 1, borderColor: accent + '55' }]}><Text style={{ fontSize: 20 }}>{guide?.avatar}</Text></View>
        <View style={[s.aiBubble, { borderLeftWidth: 3, borderLeftColor: accent + '88' }]}>
          <View style={{ flexDirection: RTL_LANGS.has(lang) ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 4 }}>
            {(reverseFlow ? exchange.ai_t : exchange.ai).split(' ').map((word, i) => {
              const clean = word.replace(/[.,!?;:،؟]/g, '').trim();
              const isActive = tappedIndex === i && clean.length > 0;
              return (
                <Pressable key={i} onPress={() => speakWord(word, i)} style={[s.wordChip, isActive && s.wordChipActive]}>
                  <Text style={[s.wordChipTxt, isActive && s.wordChipTxtActive]}>{word}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable onPress={() => setShowTranslation(!showTranslation)} style={{ marginTop: 10 }}>
            {showTranslation ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
                {exchange.ai_t.split(' ').map((word, i) => {
                  const _faWords = exchange.ai.split(' ');
                  const _enWords = exchange.ai_t.split(' ');
                  // Position-based vocab highlight: find vocab FA phrase in sentence, map each FA idx → EN idx
                  const _cleanFA = (s: string) => s.replace(/[.,!?;:،؟\u200c\u200d\u200e\u200f]/g, '').trim();
                  const _tappedClean = tappedIndex >= 0 ? _cleanFA(_faWords[tappedIndex] ?? '') : '';
                  const _matchedVocab = _tappedClean ? exchange.vocab.find((v: { w: string; m: string }) =>
                    v.w.split(' ').map((w: string) => _cleanFA(w)).includes(_tappedClean)
                  ) : null;
                  const mappedIdx = tappedIndex >= 0
                    ? Math.round(tappedIndex * (_enWords.length - 1) / Math.max(_faWords.length - 1, 1))
                    : -1;
                  let _vocabHighlight = false;
                  if (_matchedVocab && tappedIndex >= 0) {
                    const _vocabFAWords = _matchedVocab.w.split(' ').map((w: string) => _cleanFA(w));
                    const _faClean = _faWords.map((w: string) => _cleanFA(w));
                    let _startIdx = -1;
                    for (let _fi = 0; _fi <= _faClean.length - _vocabFAWords.length; _fi++) {
                      if (_vocabFAWords.every((vw: string, vi: number) => _faClean[_fi + vi] === vw)) { _startIdx = _fi; break; }
                    }
                    if (_startIdx >= 0) {
                      const _phraseLen = _vocabFAWords.length;
                      const _tappedVocabPos = tappedIndex - _startIdx;
                      const _meaningWords = _matchedVocab.m.toLowerCase().split(' ');
                      // RTL: reverse phrase order — صبح(pos 0)→meaning[1]="morning", بخیر(pos 1)→meaning[0]="good"
                      const _mIdx = RTL_LANGS.has(lang) ? _phraseLen - 1 - _tappedVocabPos : _tappedVocabPos;
                      const _targetM = _meaningWords[Math.min(_mIdx, _meaningWords.length - 1)];
                      // Find target meaning word in EN sentence by string match (accurate, position-independent)
                      const _enClean = _enWords.map((w: string) => w.replace(/[.,!?;:،؟]/g, '').toLowerCase());
                      const _enMatchIdx = _enClean.indexOf(_targetM);
                      if (_enMatchIdx >= 0 && i === _enMatchIdx) _vocabHighlight = true;
                    }
                  }
                  // RTL fallback: if no exact EN match found, glow entire EN sentence
                  const _rtlFallback = RTL_LANGS.has(lang) && tappedIndex >= 0 && !_vocabHighlight && _matchedVocab !== null;
                  const isActive = tappedIndex >= 0 && (_vocabHighlight || _rtlFallback || (!_matchedVocab && !RTL_LANGS.has(lang) && mappedIdx === i));
                  const cleanEn = word.replace(/[.,!?;:]/g, '').trim();
                  return (
                    <Pressable key={i} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (cleanEn) Speech.speak(cleanEn === 'I' ? 'I.' : cleanEn, { language: 'en-US', rate: 0.82 }); }}>
                      <Text style={[{ fontSize: 13, lineHeight: 20 }, isActive ? { color: C.goldBright, fontWeight: '700' } : { color: C.gold }]}>{word} </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: C.gold, fontSize: 13 }}>👁 Show translation</Text>
            )}
          </Pressable>
        </View>
      </View>
      <View style={{ marginBottom: 20 }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); const _sOpts: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82 }; if (lang === 'fa' && (nargessId || dariushId)) _sOpts.voice = nargessId || dariushId; Speech.stop(); Speech.speak(exchange.ai, _sOpts); }} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 6 }}>
          <Text style={{ color: C.gold, fontSize: 16, fontWeight: '700', textAlign: RTL_LANGS.has(lang) ? 'right' : 'left' }}>{exchange.ai}</Text>
        </Pressable>
        <View style={{ gap: 2 }}>
        {_wordRows.map((v: { w: string; m: string }, _i: number) => (
          <View key={_i} style={{ flexDirection: RTL_LANGS.has(lang) ? 'row-reverse' : 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); const _vOpts: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82 }; if (lang === 'fa' && (nargessId || dariushId)) _vOpts.voice = nargessId || dariushId; Speech.stop(); Speech.speak(v.w, _vOpts); }} style={{ flex: 1, padding: 7 }}>
              <Text style={{ color: C.gold, fontSize: 13, fontWeight: '600', textAlign: RTL_LANGS.has(lang) ? 'right' : 'left' }}>{v.w}</Text>
              {(v as any).ph ? <Text style={{ color: C.muted, fontSize: 11 }}>{(v as any).ph}</Text> : null}
            </Pressable>
            {v.m ? (
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Speech.stop(); Speech.speak(v.m === 'I' ? 'I.' : v.m, { language: 'en-US', rate: 0.82 }); }} style={{ padding: 6, justifyContent: 'center' }}>
                <Text style={{ color: C.muted, fontSize: 12 }}>{v.m}</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        </View>
      </View>
      {vocab.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 8 }}>LEARNED · {vocab.length} word{vocab.length !== 1 ? 's' : ''}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {vocab.map(v => (
              <View key={v.w} style={{ gap: 4, alignItems: 'center', minWidth: 70 }}>
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Speech.stop(); Speech.speak(v.w, { language: LANG_VOICE[lang] ?? lang, rate: 0.82 }); }} style={{ backgroundColor: C.surface2, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', width: '100%' }}>
                  <Text style={{ color: C.gold, fontSize: 13, fontWeight: '600' }}>{v.w}</Text>
                </Pressable>
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Speech.stop(); Speech.speak(v.m === 'I' ? 'I.' : v.m, { language: 'en-US', rate: 0.82 }); }} style={{ backgroundColor: C.surface2, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', width: '100%' }}>
                  <Text style={{ color: C.muted, fontSize: 12 }}>{v.m}</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {!!chosen && (() => {
        const _chosenCh = exchange.choices.find((ch: any) => ch.t === chosen);
        const _cTrFull = _chosenCh?.tr ?? '';
        const _chosenVocab: { w: string; m: string }[] = (_chosenCh as any)?.vocab ?? [];
        return (
          <View style={{ marginTop: 12, marginBottom: 8, gap: 4 }}>
            <Text style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 4 }}>YOU SAID</Text>
            <View style={{ gap: 3 }}>
              {(_chosenVocab.length > 0 ? _chosenVocab : chosen.split(' ').filter((w: string) => w.trim()).map((w: string) => ({ w, m: '' }))).map((v: { w: string; m: string }, _i: number) => (
                <View key={_i} style={{ flexDirection: RTL_LANGS.has(lang) ? 'row-reverse' : 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden' }}>
                  <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); const _o: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82 }; if (lang === 'fa' && (nargessId || dariushId)) _o.voice = nargessId || dariushId; Speech.stop(); Speech.speak(v.w, _o); }} style={{ flex: 1, padding: 10 }}>
                    <Text style={{ color: C.gold, fontSize: 14, fontWeight: '600', textAlign: RTL_LANGS.has(lang) ? 'right' : 'left' }}>{v.w}</Text>
                  </Pressable>
                  {v.m ? <Pressable onPress={() => { Speech.stop(); Speech.speak(v.m === 'I' ? 'I.' : v.m, { language: 'en-US', rate: 0.82 }); }} style={{ padding: 8, justifyContent: 'center' }}><Text style={{ color: C.muted, fontSize: 12 }}>{v.m}</Text></Pressable> : null}
                </View>
              ))}
            </View>
            {(() => { const _cTr = exchange.choices.find((ch: any) => ch.t === chosen)?.tr ?? ''; return _cTr ? <Text style={{ color: C.muted, fontSize: 13, fontStyle: 'italic', marginTop: 6, textAlign: RTL_LANGS.has(lang) ? 'right' : 'left' }}>{_cTr}</Text> : null; })()}

          </View>
        );
      })()}

      </ScrollView>
      <View style={{ gap: 10, paddingTop: 8 }}>
        <Text style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 4 }}>YOUR RESPONSE</Text>
        {exchange.choices.map((ch, i) => (
          <Pressable key={`${step}-${i}`} style={[s.choiceBtn, chosen === ch.t && s.choiceBtnChosen]} onPress={() => { handleChoice(ch.t); }}>
            <Text style={[s.choiceTxt, chosen === ch.t && { color: C.gold }]}>{reverseFlow ? ch.tr : ch.t}</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{reverseFlow ? ch.t : ch.tr}</Text>
          </Pressable>
        ))}
      </View>
      {!!chosen && (
        <Pressable onPress={() => { advanceRef.current?.(); }} style={{ alignSelf: 'flex-end', marginTop: 8, backgroundColor: C.gold, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={{ color: '#000', fontWeight: '700', fontSize: 15 }}>Next →</Text>
        </Pressable>
      )}
    </Animated.View>
  );
  }

  if (screen === 'translate') {
    const LANG_LABELS: Record<string, string> = {
      en: 'English', fa: 'فارسی', es: 'Español', fr: 'Français',
      zh: '中文', it: 'Italiano', ru: 'Русский', ar: 'العربية', tr: 'Türkçe',
      de: 'Deutsch', ja: '日本語', ko: '한국어', hi: 'हिन्दी', pt: 'Português',
      nl: 'Nederlands', pl: 'Polski', sv: 'Svenska', he: 'עברית', ur: 'اردو',
      vi: 'Tiếng Việt', id: 'Bahasa', bn: 'বাংলা', uk: 'Українська', el: 'Ελληνικά'
    };
    const ALL_LANGS = ['en','fa','es','fr','zh','it','ru','ar','tr','de','ja','ko','hi','pt','nl','pl','sv','he','ur','vi','id','bn','uk','el'];
    const doTranslate = async () => {
      if (!trInput.trim()) return;
      setTrLoading(true);
      setTrOutput('');
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${trSourceLang}&tl=${trTargetLang}&dt=t&q=${encodeURIComponent(trInput)}`;
        const res = await fetch(url);
        const json = await res.json();
        const translated = json?.[0]?.map((item: any) => item?.[0]).filter(Boolean).join('') ?? 'Translation unavailable';
        setTrOutput(translated);
      } catch {
        setTrOutput('Connection error — try again');
      }
      setTrLoading(false);
    };
    const swapLangs = () => {
      const tmp = trSourceLang;
      setTrSourceLang(trTargetLang);
      setTrTargetLang(tmp);
      setTrInput(trOutput);
      setTrOutput('');
    };
    return (
      <View style={[s.root, { backgroundColor: C.bg, paddingTop: 60, paddingHorizontal: 20 }]}>
        <Pressable onPress={() => navigate('splash')} style={{ marginBottom: 24 }}>
          <Text style={{ color: C.gold, fontSize: 15 }}>← Back</Text>
        </Pressable>
        <Text style={{ color: C.cream, fontSize: 22, fontWeight: '800', letterSpacing: 2, marginBottom: 24 }}>TRANSLATE</Text>

        {/* Language selector */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {ALL_LANGS.filter(l => l !== trTargetLang).map(l => (
                <Pressable key={l} onPress={() => setTrSourceLang(l)} style={{ backgroundColor: trSourceLang === l ? C.gold : C.surface2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: trSourceLang === l ? '#000' : C.muted, fontSize: 12, fontWeight: '700' }}>{LANG_LABELS[l]}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Pressable onPress={swapLangs} style={{ backgroundColor: C.surface2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: C.gold, fontSize: 16 }}>⇄</Text>
          </Pressable>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {ALL_LANGS.filter(l => l !== trSourceLang).map(l => (
                <Pressable key={l} onPress={() => setTrTargetLang(l)} style={{ backgroundColor: trTargetLang === l ? C.gold : C.surface2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: trTargetLang === l ? '#000' : C.muted, fontSize: 12, fontWeight: '700' }}>{LANG_LABELS[l]}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Input */}
        <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 16, marginBottom: 12, minHeight: 100 }}>
          <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>YOU</Text>
          <TextInput
            value={trInput}
            onChangeText={setTrInput}
            placeholder={`Type in ${LANG_LABELS[trSourceLang]}...`}
            placeholderTextColor={C.muted}
            style={{ color: C.cream, fontSize: 16, textAlign: RTL_LANGS.has(trSourceLang) ? 'right' : 'left' }}
            multiline
            autoCorrect={false}
          />
        </View>

        {/* Translate button */}
        <Pressable onPress={doTranslate} style={{ backgroundColor: C.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#000', fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>{trLoading ? 'Translating...' : 'Translate'}</Text>
        </Pressable>

        {/* Output */}
        {trOutput ? (
          <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 16, minHeight: 100 }}>
            <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>TRANSLATION</Text>
            <Text style={{ color: C.gold, fontSize: 16, textAlign: RTL_LANGS.has(trTargetLang) ? 'right' : 'left' }}>{trOutput}</Text>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Speech.stop(); Speech.speak(trOutput, { language: LANG_VOICE[trTargetLang] ?? trTargetLang, rate: 0.82 }); }} style={{ marginTop: 12, alignSelf: 'flex-end', backgroundColor: C.surface2, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ color: C.gold, fontSize: 13 }}>🔊 Hear it</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  if (screen === 'done') return (
    <Animated.View style={[s.root, s.center, { transform: [{ translateX: slideAnim }] }]}>
      {/* Scenario glow */}
      <View pointerEvents="none" style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: accent + '15', top: '8%', alignSelf: 'center' }} />
      <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: accent + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: accent + '44' }}>
        <Text style={{ fontSize: 48 }}>🏆</Text>
      </View>
      <Text style={s.doneTitle}>Mission Complete</Text>
      <Text style={{ color: C.muted, fontSize: 15, marginTop: 8, marginBottom: 24 }}>You mastered {vocab.length} words</Text>
      <ScrollView style={{ width: '100%', maxHeight: 300 }} contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
        {vocab.map(v => (
          <View key={v.w} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Speech.stop(); Speech.speak(v.w, { language: LANG_VOICE[lang] ?? lang, rate: 0.82 }); }} style={{ flex: 1, padding: 14 }}>
              <Text style={{ color: C.gold, fontSize: 15, fontWeight: '600' }}>{v.w}</Text>
            </Pressable>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Speech.stop(); Speech.speak(v.m === 'I' ? 'I.' : v.m, { language: 'en-US', rate: 0.82 }); }} style={{ padding: 14 }}>
              <Text style={{ color: C.muted, fontSize: 14 }}>{v.m}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <Pressable style={[s.ctaBtn, { marginTop: 28 }]} onPress={() => { setVocab([]); navigate('splash'); }}>
        <Text style={s.ctaText}>New Mission</Text>
      </Pressable>
      <Pressable style={s.backBtn} onPress={() => startSession(scenario, lang)}>
        <Text style={s.backTxt}>↺ Replay</Text>
      </Pressable>
    </Animated.View>
  );

  return null;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoMark: { width: 80, height: 80, borderRadius: 20, borderWidth: 2, borderColor: C.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logoA: { fontSize: 44, color: C.gold, fontWeight: '700', letterSpacing: 2 },
  wordmark: { fontSize: 36, letterSpacing: 12, color: C.cream, fontWeight: '700', marginBottom: 16 },
  tagline: { fontSize: 16, color: C.muted, textAlign: 'center', lineHeight: 24 },
  ctaBtn: { backgroundColor: C.gold, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30 },
  ctaBtnP: { backgroundColor: C.goldBright },
  ctaText: { color: C.bg, fontSize: 17, fontWeight: '700' },
  bottomNote: { textAlign: 'center', color: C.muted, fontSize: 12, letterSpacing: 1.5, marginBottom: 8 },
  header: { marginBottom: 28 },
  eyebrow: { fontSize: 11, letterSpacing: 3, color: C.gold, marginBottom: 8, fontWeight: '600' },
  headTitle: { fontSize: 32, color: C.cream, fontWeight: '700', lineHeight: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2740', gap: 16 },
  cardP: { borderColor: C.gold, backgroundColor: C.surface2 },
  cardIcon: { fontSize: 32 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 17, color: C.cream, fontWeight: '600', marginBottom: 4 },
  cardSub: { fontSize: 13, color: C.muted, lineHeight: 18 },
  arrow: { fontSize: 24, color: C.gold },
  comingSoon: { padding: 16, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: '#2A2740' },
  comingSoonTxt: { color: C.muted, fontSize: 13, textAlign: 'center' },
  backBtn: { marginTop: 28, alignSelf: 'flex-start' },
  backTxt: { color: C.gold, fontSize: 16, fontWeight: '600' },
  guideName: { fontSize: 32, color: C.cream, fontWeight: '700', letterSpacing: 2 },
  guideRole: { fontSize: 14, color: C.gold, letterSpacing: 2, marginTop: 4, textTransform: 'uppercase' },
  guideDivider: { width: 48, height: 1, backgroundColor: C.gold, marginVertical: 24, opacity: 0.5 },
  guideIntro: { color: C.muted, fontSize: 15, textAlign: 'center', lineHeight: 24 },
  progressBar: { height: 3, backgroundColor: C.surface2, borderRadius: 2, marginBottom: 24 },
  progressFill: { height: 3, backgroundColor: C.gold, borderRadius: 2 },
  bubbleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  guidePip: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 },
  aiBubble: { flex: 1, backgroundColor: C.surface, borderRadius: 16, borderTopLeftRadius: 4, padding: 16 },
  aiText: { color: C.cream, fontSize: 17, lineHeight: 26 },
  vocabChip: { backgroundColor: C.surface2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.gold + '44' },
  vocabRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.gold + '22' },
  vocabWord: { color: C.gold, fontSize: 13, fontWeight: '700' },
  vocabMean: { color: C.muted, fontSize: 11, marginTop: 2 },
  choiceBtn: { backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2A2740' },
  choiceBtnChosen: { borderColor: C.gold, backgroundColor: C.surface2 },
  choiceTxt: { color: C.cream, fontSize: 16, fontWeight: '500' },
  vocabPill: { backgroundColor: C.surface2, color: C.gold, fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  doneTitle: { fontSize: 28, color: C.cream, fontWeight: '700', marginTop: 16 },
  wordChip: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6, borderBottomWidth: 1, borderBottomColor: C.muted + '44' },
  wordChipActive: { backgroundColor: C.gold + '33', borderBottomColor: C.gold },
  wordChipTxt: { color: C.cream, fontSize: 17, lineHeight: 26 },
  wordChipTxtActive: { color: C.goldBright },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: C.muted + '66', backgroundColor: C.surface },
  toggleBtnOn: { borderColor: C.gold, backgroundColor: C.surface2 },
  toggleTxt: { color: C.muted, fontSize: 12, fontWeight: '600' },
  replayBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: C.muted + '66', backgroundColor: C.surface },
  replayTxt: { fontSize: 16 },
  convoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, marginBottom: 4, borderBottomWidth: 1 },
  convoBack: { paddingRight: 8 },
  convoGuideInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' },
  convoAvatar: { fontSize: 26 },
  convoGuideName: { color: C.cream, fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  convoGuideRole: { color: C.muted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  toggleTxtOn: { color: C.gold },
});
