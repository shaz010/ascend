import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

const LANG_VOICE: Record<string, string> = {
  es: 'es-ES', fr: 'fr-FR', zh: 'zh-CN',
  fa: 'fa-IR', it: 'it-IT', ru: 'ru-RU', ar: 'ar-SA', tr: 'tr-TR',
};

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
  vocab: { w: string; m: string }[];
  choices: { t: string; tr: string }[];
};

const CONVOS: Record<string, Record<string, Exchange[]>> = {
  business: {
    es: [
      { ai: '¡Buenos días! Soy Carlos, el CEO. Bienvenido a la empresa.', ai_t: 'Good morning! I\'m Carlos, the CEO. Welcome to the company.', vocab: [{ w: 'buenos días', m: 'good morning' }, { w: 'bienvenido', m: 'welcome' }], choices: [{ t: 'Mucho gusto, Carlos.', tr: 'Nice to meet you, Carlos.' }, { t: 'Gracias. ¿Dónde está mi oficina?', tr: 'Thank you. Where is my office?' }] },
      { ai: '¿Habla usted español con fluidez?', ai_t: 'Do you speak Spanish fluently?', vocab: [{ w: 'hablar', m: 'to speak' }, { w: 'fluidez', m: 'fluency' }], choices: [{ t: 'Estoy aprendiendo.', tr: 'I am learning.' }, { t: 'Un poco, pero quiero mejorar.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Tenemos una reunión importante hoy a las tres.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'reunión', m: 'meeting' }, { w: 'importante', m: 'important' }], choices: [{ t: 'Perfecto. Estaré listo.', tr: 'Perfect. I will be ready.' }, { t: '¿Quién más va a estar?', tr: 'Who else will be there?' }] },
      { ai: 'Los empleados necesitan su aprobación para el presupuesto.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'empleados', m: 'employees' }, { w: 'presupuesto', m: 'budget' }], choices: [{ t: 'Voy a revisar los números primero.', tr: 'I will review the numbers first.' }, { t: '¿Cuánto dinero necesitamos?', tr: 'How much money do we need?' }] },
      { ai: '¡Excelente! Usted aprende muy rápido. La empresa está en buenas manos.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'rápido', m: 'fast' }, { w: 'buenas manos', m: 'good hands' }], choices: [{ t: 'Gracias por su confianza.', tr: 'Thank you for your trust.' }, { t: 'Trabajaremos juntos.', tr: 'We will work together.' }] },
    ],
    fr: [
      { ai: 'Bonjour! Je suis Sophie, la PDG. Bienvenue dans l\'entreprise.', ai_t: 'Good morning! I\'m Sophie, the CEO. Welcome to the company.', vocab: [{ w: 'bonjour', m: 'good morning' }, { w: 'bienvenue', m: 'welcome' }], choices: [{ t: 'Enchantée, Sophie.', tr: 'Nice to meet you, Sophie.' }, { t: 'Merci. Où est mon bureau?', tr: 'Thank you. Where is my office?' }] },
      { ai: 'Parlez-vous français couramment?', ai_t: 'Do you speak French fluently?', vocab: [{ w: 'parler', m: 'to speak' }, { w: 'couramment', m: 'fluently' }], choices: [{ t: 'J\'apprends.', tr: 'I am learning.' }, { t: 'Un peu, mais je veux progresser.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Nous avons une réunion importante aujourd\'hui à quinze heures.', ai_t: 'We have an important meeting today at three o\'clock.', vocab: [{ w: 'réunion', m: 'meeting' }, { w: 'importante', m: 'important' }], choices: [{ t: 'Parfait. Je serai prêt.', tr: 'Perfect. I will be ready.' }, { t: 'Qui d\'autre sera là?', tr: 'Who else will be there?' }] },
      { ai: 'Les employés ont besoin de votre approbation pour le budget.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'employés', m: 'employees' }, { w: 'budget', m: 'budget' }], choices: [{ t: 'Je vais examiner les chiffres d\'abord.', tr: 'I will review the numbers first.' }, { t: 'De combien avons-nous besoin?', tr: 'How much do we need?' }] },
      { ai: 'Excellent! Vous apprenez très vite. L\'entreprise est en de bonnes mains.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'vite', m: 'fast' }, { w: 'bonnes mains', m: 'good hands' }], choices: [{ t: 'Merci pour votre confiance.', tr: 'Thank you for your trust.' }, { t: 'Nous travaillerons ensemble.', tr: 'We will work together.' }] },
    ],
    zh: [
      { ai: '早上好！我是明明，总裁。欢迎来到公司。', ai_t: 'Good morning! I\'m Mingming, the President. Welcome to the company.', vocab: [{ w: '早上好', m: 'good morning' }, { w: '欢迎', m: 'welcome' }], choices: [{ t: '很高兴认识您，明明。', tr: 'Nice to meet you, Mingming.' }, { t: '谢谢。我的办公室在哪里？', tr: 'Thank you. Where is my office?' }] },
      { ai: '您说中文流利吗？', ai_t: 'Do you speak Chinese fluently?', vocab: [{ w: '说', m: 'to speak' }, { w: '流利', m: 'fluently' }], choices: [{ t: '我在学习。', tr: 'I am learning.' }, { t: '一点点，但我想进步。', tr: 'A little, but I want to improve.' }] },
      { ai: '今天下午三点我们有一个重要的会议。', ai_t: 'We have an important meeting at three o\'clock this afternoon.', vocab: [{ w: '会议', m: 'meeting' }, { w: '重要', m: 'important' }], choices: [{ t: '好的。我会准备好的。', tr: 'OK. I will be ready.' }, { t: '还有谁会参加？', tr: 'Who else will attend?' }] },
      { ai: '员工需要您批准预算。', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: '员工', m: 'employees' }, { w: '预算', m: 'budget' }], choices: [{ t: '我先检查一下数字。', tr: 'I will check the numbers first.' }, { t: '我们需要多少钱？', tr: 'How much money do we need?' }] },
      { ai: '太好了！您学得很快。公司在您的领导下一定会成功。', ai_t: 'Excellent! You learn very fast. The company will surely succeed under your leadership.', vocab: [{ w: '快', m: 'fast' }, { w: '成功', m: 'succeed' }], choices: [{ t: '谢谢您的信任。', tr: 'Thank you for your trust.' }, { t: '我们一起合作。', tr: 'We will work together.' }] },
    ],
    fa: [
      { ai: 'صبح بخیر! من دانیار هستم، مدیرعامل. به شرکت خوش آمدید.', ai_t: 'Good morning! I am Daniyar, the CEO. Welcome to the company.', vocab: [{ w: 'صبح بخیر', m: 'good morning' }, { w: 'خوش آمدید', m: 'welcome' }], choices: [{ t: 'از آشنایی با شما خوشوقتم، دانیار.', tr: 'Nice to meet you, Daniyar.' }, { t: 'ممنون. دفتر من کجاست؟', tr: 'Thank you. Where is my office?' }] },
      { ai: 'آیا فارسی را روان صحبت میکنید؟', ai_t: 'Do you speak Persian fluently?', vocab: [{ w: 'روان', m: 'fluently' }, { w: 'صحبت کردن', m: 'to speak' }], choices: [{ t: 'دارم یاد میگیرم.', tr: 'I am learning.' }, { t: 'کمی، ولی میخواهم پیشرفت کنم.', tr: 'A little, but I want to improve.' }] },
      { ai: 'امروز ساعت سه جلسه مهمی داریم.', ai_t: 'We have an important meeting today at three o\'clock.', vocab: [{ w: 'جلسه', m: 'meeting' }, { w: 'مهم', m: 'important' }], choices: [{ t: 'عالی. آماده خواهم بود.', tr: 'Perfect. I will be ready.' }, { t: 'چه کسی دیگری حضور دارد؟', tr: 'Who else will be there?' }] },
      { ai: 'کارمندان برای تصویب بودجه به شما نیاز دارند.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'کارمندان', m: 'employees' }, { w: 'بودجه', m: 'budget' }], choices: [{ t: 'اول اعداد را بررسی میکنم.', tr: 'I will review the numbers first.' }, { t: 'چقدر پول نیاز داریم؟', tr: 'How much money do we need?' }] },
      { ai: 'عالی! خیلی سریع یاد میگیرید. شرکت در دستان خوبی است.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'سریع', m: 'fast' }, { w: 'دستان خوب', m: 'good hands' }], choices: [{ t: 'ممنون از اعتمادتان.', tr: 'Thank you for your trust.' }, { t: 'با هم کار خواهیم کرد.', tr: 'We will work together.' }] },
    ],
    it: [
      { ai: 'Buongiorno! Sono Marco, l\'amministratore. Benvenuto in azienda.', ai_t: 'Good morning! I am Marco, the CEO. Welcome to the company.', vocab: [{ w: 'buongiorno', m: 'good morning' }, { w: 'benvenuto', m: 'welcome' }], choices: [{ t: 'Piacere, Marco.', tr: 'Nice to meet you, Marco.' }, { t: 'Grazie. Dov\'è il mio ufficio?', tr: 'Thank you. Where is my office?' }] },
      { ai: 'Parla italiano fluentemente?', ai_t: 'Do you speak Italian fluently?', vocab: [{ w: 'parlare', m: 'to speak' }, { w: 'fluentemente', m: 'fluently' }], choices: [{ t: 'Sto imparando.', tr: 'I am learning.' }, { t: 'Un po\', ma voglio migliorare.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Abbiamo una riunione importante oggi alle tre.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'riunione', m: 'meeting' }, { w: 'importante', m: 'important' }], choices: [{ t: 'Perfetto. Sarò pronto.', tr: 'Perfect. I will be ready.' }, { t: 'Chi altro ci sarà?', tr: 'Who else will be there?' }] },
      { ai: 'I dipendenti hanno bisogno della sua approvazione per il budget.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'dipendenti', m: 'employees' }, { w: 'budget', m: 'budget' }], choices: [{ t: 'Verificherò prima i numeri.', tr: 'I will review the numbers first.' }, { t: 'Di quanto abbiamo bisogno?', tr: 'How much do we need?' }] },
      { ai: 'Eccellente! Impara molto velocemente. L\'azienda è in buone mani.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'velocemente', m: 'fast' }, { w: 'buone mani', m: 'good hands' }], choices: [{ t: 'Grazie per la sua fiducia.', tr: 'Thank you for your trust.' }, { t: 'Lavoreremo insieme.', tr: 'We will work together.' }] },
    ],
    ru: [
      { ai: 'Доброе утро! Я Алексей, генеральный директор. Добро пожаловать в компанию.', ai_t: 'Good morning! I am Aleksey, the CEO. Welcome to the company.', vocab: [{ w: 'доброе утро', m: 'good morning' }, { w: 'добро пожаловать', m: 'welcome' }], choices: [{ t: 'Очень приятно, Алексей.', tr: 'Nice to meet you, Aleksey.' }, { t: 'Спасибо. Где мой кабинет?', tr: 'Thank you. Where is my office?' }] },
      { ai: 'Вы говорите по-русски свободно?', ai_t: 'Do you speak Russian fluently?', vocab: [{ w: 'говорить', m: 'to speak' }, { w: 'свободно', m: 'fluently' }], choices: [{ t: 'Я учусь.', tr: 'I am learning.' }, { t: 'Немного, но хочу совершенствоваться.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Сегодня в три часа у нас важное совещание.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'совещание', m: 'meeting' }, { w: 'важное', m: 'important' }], choices: [{ t: 'Отлично. Я буду готов.', tr: 'Perfect. I will be ready.' }, { t: 'Кто ещё будет присутствовать?', tr: 'Who else will be there?' }] },
      { ai: 'Сотрудникам нужно ваше одобрение бюджета.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'сотрудники', m: 'employees' }, { w: 'бюджет', m: 'budget' }], choices: [{ t: 'Сначала я проверю цифры.', tr: 'I will review the numbers first.' }, { t: 'Сколько денег нам нужно?', tr: 'How much money do we need?' }] },
      { ai: 'Превосходно! Вы учитесь очень быстро. Компания в хороших руках.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'быстро', m: 'fast' }, { w: 'хорошие руки', m: 'good hands' }], choices: [{ t: 'Спасибо за доверие.', tr: 'Thank you for your trust.' }, { t: 'Мы будем работать вместе.', tr: 'We will work together.' }] },
    ],
    ar: [
      { ai: 'صباح الخير! أنا أحمد، المدير التنفيذي. أهلاً وسهلاً في الشركة.', ai_t: 'Good morning! I am Ahmed, the CEO. Welcome to the company.', vocab: [{ w: 'صباح الخير', m: 'good morning' }, { w: 'أهلاً وسهلاً', m: 'welcome' }], choices: [{ t: 'تشرفت بمعرفتك، أحمد.', tr: 'Nice to meet you, Ahmed.' }, { t: 'شكراً. أين مكتبي؟', tr: 'Thank you. Where is my office?' }] },
      { ai: 'هل تتحدث العربية بطلاقة؟', ai_t: 'Do you speak Arabic fluently?', vocab: [{ w: 'يتحدث', m: 'to speak' }, { w: 'بطلاقة', m: 'fluently' }], choices: [{ t: 'أنا أتعلم.', tr: 'I am learning.' }, { t: 'قليلاً، لكنني أريد التحسن.', tr: 'A little, but I want to improve.' }] },
      { ai: 'لدينا اجتماع مهم اليوم الساعة الثالثة.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'اجتماع', m: 'meeting' }, { w: 'مهم', m: 'important' }], choices: [{ t: 'ممتاز. سأكون مستعداً.', tr: 'Perfect. I will be ready.' }, { t: 'من سيحضر أيضاً؟', tr: 'Who else will be there?' }] },
      { ai: 'يحتاج الموظفون إلى موافقتك على الميزانية.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'موظفون', m: 'employees' }, { w: 'ميزانية', m: 'budget' }], choices: [{ t: 'سأراجع الأرقام أولاً.', tr: 'I will review the numbers first.' }, { t: 'كم من المال نحتاج؟', tr: 'How much money do we need?' }] },
      { ai: 'ممتاز! أنت تتعلم بسرعة كبيرة. الشركة في أيدٍ أمينة.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'بسرعة', m: 'fast' }, { w: 'أيدٍ أمينة', m: 'good hands' }], choices: [{ t: 'شكراً على ثقتك.', tr: 'Thank you for your trust.' }, { t: 'سنعمل معاً.', tr: 'We will work together.' }] },
    ],
    tr: [
      { ai: 'Günaydın! Ben Mehmet, Genel Müdür. Şirkete hoş geldiniz.', ai_t: 'Good morning! I am Mehmet, the CEO. Welcome to the company.', vocab: [{ w: 'günaydın', m: 'good morning' }, { w: 'hoş geldiniz', m: 'welcome' }], choices: [{ t: 'Tanıştığımıza memnun oldum, Mehmet.', tr: 'Nice to meet you, Mehmet.' }, { t: 'Teşekkürler. Ofisim nerede?', tr: 'Thank you. Where is my office?' }] },
      { ai: 'Türkçeyi akıcı konuşuyor musunuz?', ai_t: 'Do you speak Turkish fluently?', vocab: [{ w: 'konuşmak', m: 'to speak' }, { w: 'akıcı', m: 'fluently' }], choices: [{ t: 'Öğreniyorum.', tr: 'I am learning.' }, { t: 'Biraz, ama gelişmek istiyorum.', tr: 'A little, but I want to improve.' }] },
      { ai: 'Bugün saat üçte önemli bir toplantımız var.', ai_t: 'We have an important meeting today at three.', vocab: [{ w: 'toplantı', m: 'meeting' }, { w: 'önemli', m: 'important' }], choices: [{ t: 'Mükemmel. Hazır olacağım.', tr: 'Perfect. I will be ready.' }, { t: 'Başka kim katılacak?', tr: 'Who else will be there?' }] },
      { ai: 'Çalışanlar bütçe onayınıza ihtiyaç duyuyor.', ai_t: 'The employees need your approval for the budget.', vocab: [{ w: 'çalışanlar', m: 'employees' }, { w: 'bütçe', m: 'budget' }], choices: [{ t: 'Önce rakamları inceleyeyim.', tr: 'I will review the numbers first.' }, { t: 'Ne kadar paraya ihtiyacımız var?', tr: 'How much money do we need?' }] },
      { ai: 'Mükemmel! Çok hızlı öğreniyorsunuz. Şirket iyi ellerde.', ai_t: 'Excellent! You learn very fast. The company is in good hands.', vocab: [{ w: 'hızlı', m: 'fast' }, { w: 'iyi eller', m: 'good hands' }], choices: [{ t: 'Güveniniz için teşekkürler.', tr: 'Thank you for your trust.' }, { t: 'Birlikte çalışacağız.', tr: 'We will work together.' }] },
    ],
  },
  survival: {
    es: [
      { ai: '¡Oye! ¿Estás perdido? ¿Necesitas ayuda?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'perdido', m: 'lost' }, { w: 'ayuda', m: 'help' }], choices: [{ t: 'Sí, estoy perdido. ¿Puedes ayudarme?', tr: 'Yes, I am lost. Can you help me?' }, { t: '¿Dónde estamos exactamente?', tr: 'Where are we exactly?' }] },
      { ai: 'Estás en el mercado central. ¿Adónde quieres ir?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'mercado', m: 'market' }, { w: 'central', m: 'central' }], choices: [{ t: 'Necesito ir al hospital.', tr: 'I need to go to the hospital.' }, { t: 'Busco la embajada.', tr: 'I am looking for the embassy.' }] },
      { ai: 'El hospital está a dos kilómetros. ¿Tienes dinero para un taxi?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'kilómetros', m: 'kilometres' }, { w: 'taxi', m: 'taxi' }], choices: [{ t: 'No tengo dinero. ¿Puedo caminar?', tr: 'I have no money. Can I walk?' }, { t: 'Sí, tengo algo de dinero.', tr: 'Yes, I have some money.' }] },
      { ai: 'Claro, puedes caminar. Sigue recto y dobla a la izquierda.', ai_t: 'Of course, you can walk. Go straight and turn left.', vocab: [{ w: 'recto', m: 'straight' }, { w: 'izquierda', m: 'left' }], choices: [{ t: '¿Cuánto tiempo tarda?', tr: 'How long does it take?' }, { t: 'Gracias. Eres muy amable.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Unos veinte minutos. ¡Buena suerte! Espero que llegues bien.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'veinte', m: 'twenty' }, { w: 'buena suerte', m: 'good luck' }], choices: [{ t: 'Muchas gracias por tu ayuda.', tr: 'Thank you very much for your help.' }, { t: '¡Hasta luego!', tr: 'Goodbye!' }] },
    ],
    fr: [
      { ai: 'Hé! Vous êtes perdu? Vous avez besoin d\'aide?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'perdu', m: 'lost' }, { w: 'aide', m: 'help' }], choices: [{ t: 'Oui, je suis perdu. Pouvez-vous m\'aider?', tr: 'Yes, I am lost. Can you help me?' }, { t: 'Où sommes-nous exactement?', tr: 'Where are we exactly?' }] },
      { ai: 'Vous êtes au marché central. Où voulez-vous aller?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'marché', m: 'market' }, { w: 'central', m: 'central' }], choices: [{ t: 'J\'ai besoin d\'aller à l\'hôpital.', tr: 'I need to go to the hospital.' }, { t: 'Je cherche l\'ambassade.', tr: 'I am looking for the embassy.' }] },
      { ai: 'L\'hôpital est à deux kilomètres. Avez-vous de l\'argent pour un taxi?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'kilomètres', m: 'kilometres' }, { w: 'taxi', m: 'taxi' }], choices: [{ t: 'Je n\'ai pas d\'argent. Puis-je marcher?', tr: 'I have no money. Can I walk?' }, { t: 'Oui, j\'ai un peu d\'argent.', tr: 'Yes, I have some money.' }] },
      { ai: 'Bien sûr, vous pouvez marcher. Allez tout droit puis tournez à gauche.', ai_t: 'Of course, you can walk. Go straight then turn left.', vocab: [{ w: 'tout droit', m: 'straight ahead' }, { w: 'gauche', m: 'left' }], choices: [{ t: 'Combien de temps faut-il?', tr: 'How long does it take?' }, { t: 'Merci. Vous êtes très aimable.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Une vingtaine de minutes. Bonne chance! J\'espère que vous arriverez bien.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'vingtaine', m: 'about twenty' }, { w: 'bonne chance', m: 'good luck' }], choices: [{ t: 'Merci beaucoup pour votre aide.', tr: 'Thank you very much for your help.' }, { t: 'Au revoir!', tr: 'Goodbye!' }] },
    ],
    zh: [
      { ai: '嘿！你迷路了吗？需要帮忙吗？', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: '迷路', m: 'lost' }, { w: '帮忙', m: 'help' }], choices: [{ t: '是的，我迷路了。你能帮我吗？', tr: 'Yes, I am lost. Can you help me?' }, { t: '我们在哪里？', tr: 'Where are we?' }] },
      { ai: '你在中央市场。你想去哪里？', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: '市场', m: 'market' }, { w: '中央', m: 'central' }], choices: [{ t: '我需要去医院。', tr: 'I need to go to the hospital.' }, { t: '我在找大使馆。', tr: 'I am looking for the embassy.' }] },
      { ai: '医院距离这里两公里。你有钱打车吗？', ai_t: 'The hospital is two kilometres from here. Do you have money for a taxi?', vocab: [{ w: '公里', m: 'kilometre' }, { w: '打车', m: 'take a taxi' }], choices: [{ t: '我没有钱。我可以走路去吗？', tr: 'I have no money. Can I walk?' }, { t: '是的，我有一些钱。', tr: 'Yes, I have some money.' }] },
      { ai: '当然可以走路。一直往前走，然后左转。', ai_t: 'Of course you can walk. Go straight ahead, then turn left.', vocab: [{ w: '往前', m: 'forward' }, { w: '左转', m: 'turn left' }], choices: [{ t: '需要多长时间？', tr: 'How long does it take?' }, { t: '谢谢你，你真好。', tr: 'Thank you, you are very kind.' }] },
      { ai: '大约二十分钟。祝你好运！希望你能平安到达。', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: '二十分钟', m: 'twenty minutes' }, { w: '好运', m: 'good luck' }], choices: [{ t: '非常感谢你的帮助。', tr: 'Thank you very much for your help.' }, { t: '再见！', tr: 'Goodbye!' }] },
    ],
    fa: [
      { ai: 'هی! گم شدید؟ کمک میخواهید؟', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'گم شدن', m: 'to be lost' }, { w: 'کمک', m: 'help' }], choices: [{ t: 'بله، گم شدهام. میتوانید کمکم کنید؟', tr: 'Yes, I am lost. Can you help me?' }, { t: 'دقیقاً کجا هستیم؟', tr: 'Where are we exactly?' }] },
      { ai: 'شما در بازار مرکزی هستید. کجا میخواهید بروید؟', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'بازار', m: 'market' }, { w: 'مرکزی', m: 'central' }], choices: [{ t: 'باید به بیمارستان بروم.', tr: 'I need to go to the hospital.' }, { t: 'دنبال سفارتخانه میگردم.', tr: 'I am looking for the embassy.' }] },
      { ai: 'بیمارستان دو کیلومتر دور است. پول تاکسی دارید؟', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'کیلومتر', m: 'kilometre' }, { w: 'تاکسی', m: 'taxi' }], choices: [{ t: 'پول ندارم. میتوانم پیاده بروم؟', tr: 'I have no money. Can I walk?' }, { t: 'بله، کمی پول دارم.', tr: 'Yes, I have some money.' }] },
      { ai: 'البته میتوانید پیاده بروید. مستقیم بروید بعد به چپ بپیچید.', ai_t: 'Of course you can walk. Go straight then turn left.', vocab: [{ w: 'مستقیم', m: 'straight' }, { w: 'چپ', m: 'left' }], choices: [{ t: 'چقدر طول میکشد؟', tr: 'How long does it take?' }, { t: 'ممنون. خیلی مهربان هستید.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'حدود بیست دقیقه. موفق باشید! امیدوارم سالم برسید.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'بیست دقیقه', m: 'twenty minutes' }, { w: 'موفق باشید', m: 'good luck' }], choices: [{ t: 'خیلی ممنون از کمکتان.', tr: 'Thank you very much for your help.' }, { t: 'خداحافظ!', tr: 'Goodbye!' }] },
    ],
    it: [
      { ai: 'Ehi! Sei perso? Hai bisogno di aiuto?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'perso', m: 'lost' }, { w: 'aiuto', m: 'help' }], choices: [{ t: 'Sì, sono perso. Puoi aiutarmi?', tr: 'Yes, I am lost. Can you help me?' }, { t: 'Dove siamo esattamente?', tr: 'Where are we exactly?' }] },
      { ai: 'Sei al mercato centrale. Dove vuoi andare?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'mercato', m: 'market' }, { w: 'centrale', m: 'central' }], choices: [{ t: 'Ho bisogno di andare all\'ospedale.', tr: 'I need to go to the hospital.' }, { t: 'Sto cercando l\'ambasciata.', tr: 'I am looking for the embassy.' }] },
      { ai: 'L\'ospedale è a due chilometri. Hai i soldi per un taxi?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'chilometri', m: 'kilometres' }, { w: 'taxi', m: 'taxi' }], choices: [{ t: 'Non ho soldi. Posso camminare?', tr: 'I have no money. Can I walk?' }, { t: 'Sì, ho un po\' di soldi.', tr: 'Yes, I have some money.' }] },
      { ai: 'Certo, puoi camminare. Va\' dritto e poi gira a sinistra.', ai_t: 'Of course, you can walk. Go straight and then turn left.', vocab: [{ w: 'dritto', m: 'straight' }, { w: 'sinistra', m: 'left' }], choices: [{ t: 'Quanto tempo ci vuole?', tr: 'How long does it take?' }, { t: 'Grazie. Sei molto gentile.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Una ventina di minuti. Buona fortuna! Spero che tu arrivi bene.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'ventina', m: 'about twenty' }, { w: 'buona fortuna', m: 'good luck' }], choices: [{ t: 'Grazie mille per il tuo aiuto.', tr: 'Thank you very much for your help.' }, { t: 'Arrivederci!', tr: 'Goodbye!' }] },
    ],
    ru: [
      { ai: 'Эй! Вы заблудились? Нужна помощь?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'заблудиться', m: 'to be lost' }, { w: 'помощь', m: 'help' }], choices: [{ t: 'Да, я заблудился. Можете помочь?', tr: 'Yes, I am lost. Can you help me?' }, { t: 'Где мы точно находимся?', tr: 'Where are we exactly?' }] },
      { ai: 'Вы на центральном рынке. Куда хотите попасть?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'рынок', m: 'market' }, { w: 'центральный', m: 'central' }], choices: [{ t: 'Мне нужно в больницу.', tr: 'I need to go to the hospital.' }, { t: 'Я ищу посольство.', tr: 'I am looking for the embassy.' }] },
      { ai: 'До больницы два километра. У вас есть деньги на такси?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'километры', m: 'kilometres' }, { w: 'такси', m: 'taxi' }], choices: [{ t: 'У меня нет денег. Я могу пешком?', tr: 'I have no money. Can I walk?' }, { t: 'Да, немного денег есть.', tr: 'Yes, I have some money.' }] },
      { ai: 'Конечно, можно пешком. Идите прямо, потом налево.', ai_t: 'Of course, you can walk. Go straight, then turn left.', vocab: [{ w: 'прямо', m: 'straight' }, { w: 'налево', m: 'left' }], choices: [{ t: 'Сколько времени это займёт?', tr: 'How long does it take?' }, { t: 'Спасибо. Вы очень добры.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Минут двадцать. Удачи! Надеюсь, доберётесь благополучно.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'двадцать минут', m: 'twenty minutes' }, { w: 'удача', m: 'good luck' }], choices: [{ t: 'Большое спасибо за помощь.', tr: 'Thank you very much for your help.' }, { t: 'До свидания!', tr: 'Goodbye!' }] },
    ],
    ar: [
      { ai: 'مرحباً! هل أنت ضائع؟ هل تحتاج مساعدة؟', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'ضائع', m: 'lost' }, { w: 'مساعدة', m: 'help' }], choices: [{ t: 'نعم، أنا ضائع. هل يمكنك مساعدتي؟', tr: 'Yes, I am lost. Can you help me?' }, { t: 'أين نحن بالضبط؟', tr: 'Where are we exactly?' }] },
      { ai: 'أنت في السوق المركزي. إلى أين تريد الذهاب؟', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'سوق', m: 'market' }, { w: 'مركزي', m: 'central' }], choices: [{ t: 'أحتاج إلى الذهاب إلى المستشفى.', tr: 'I need to go to the hospital.' }, { t: 'أبحث عن السفارة.', tr: 'I am looking for the embassy.' }] },
      { ai: 'المستشفى على بعد كيلومترين. هل معك نقود للتاكسي؟', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'كيلومتر', m: 'kilometre' }, { w: 'تاكسي', m: 'taxi' }], choices: [{ t: 'ليس معي نقود. هل يمكنني المشي؟', tr: 'I have no money. Can I walk?' }, { t: 'نعم، معي بعض النقود.', tr: 'Yes, I have some money.' }] },
      { ai: 'بالطبع يمكنك المشي. اسر مستقيماً ثم اتجه إلى اليسار.', ai_t: 'Of course you can walk. Go straight then turn left.', vocab: [{ w: 'مستقيماً', m: 'straight' }, { w: 'اليسار', m: 'left' }], choices: [{ t: 'كم من الوقت سيستغرق؟', tr: 'How long does it take?' }, { t: 'شكراً. أنت لطيف جداً.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'حوالي عشرين دقيقة. حظاً موفقاً! أتمنى أن تصل بسلامة.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'عشرين دقيقة', m: 'twenty minutes' }, { w: 'حظاً موفقاً', m: 'good luck' }], choices: [{ t: 'شكراً جزيلاً على مساعدتك.', tr: 'Thank you very much for your help.' }, { t: 'مع السلامة!', tr: 'Goodbye!' }] },
    ],
    tr: [
      { ai: 'Hey! Kayboldu musunuz? Yardıma ihtiyacınız var mı?', ai_t: 'Hey! Are you lost? Do you need help?', vocab: [{ w: 'kaybolmak', m: 'to be lost' }, { w: 'yardım', m: 'help' }], choices: [{ t: 'Evet, kayboldum. Yardım edebilir misiniz?', tr: 'Yes, I am lost. Can you help me?' }, { t: 'Tam olarak neredeyiz?', tr: 'Where are we exactly?' }] },
      { ai: 'Merkez pazardasınız. Nereye gitmek istiyorsunuz?', ai_t: 'You are at the central market. Where do you want to go?', vocab: [{ w: 'pazar', m: 'market' }, { w: 'merkez', m: 'central' }], choices: [{ t: 'Hastaneye gitmem gerekiyor.', tr: 'I need to go to the hospital.' }, { t: 'Büyükelçiliği arıyorum.', tr: 'I am looking for the embassy.' }] },
      { ai: 'Hastane iki kilometre uzakta. Taksi için paran var mı?', ai_t: 'The hospital is two kilometres away. Do you have money for a taxi?', vocab: [{ w: 'kilometre', m: 'kilometre' }, { w: 'taksi', m: 'taxi' }], choices: [{ t: 'Param yok. Yürüyebilir miyim?', tr: 'I have no money. Can I walk?' }, { t: 'Evet, biraz param var.', tr: 'Yes, I have some money.' }] },
      { ai: 'Tabii ki yürüyebilirsiniz. Düz gidin, sonra sola dönün.', ai_t: 'Of course you can walk. Go straight, then turn left.', vocab: [{ w: 'düz', m: 'straight' }, { w: 'sol', m: 'left' }], choices: [{ t: 'Ne kadar sürer?', tr: 'How long does it take?' }, { t: 'Teşekkürler. Çok kibarsınız.', tr: 'Thank you. You are very kind.' }] },
      { ai: 'Yaklaşık yirmi dakika. İyi şanslar! Umarım sağ salim varırsınız.', ai_t: 'About twenty minutes. Good luck! I hope you arrive safely.', vocab: [{ w: 'yirmi dakika', m: 'twenty minutes' }, { w: 'iyi şanslar', m: 'good luck' }], choices: [{ t: 'Yardımınız için çok teşekkürler.', tr: 'Thank you very much for your help.' }, { t: 'Hoşça kalın!', tr: 'Goodbye!' }] },
    ],
  },
  social: {
    es: [
      { ai: '¡Hola! ¿Eres nuevo aquí? Nunca te había visto antes.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'nuevo', m: 'new' }, { w: 'nunca', m: 'never' }], choices: [{ t: 'Sí, acabo de llegar.', tr: 'Yes, I just arrived.' }, { t: '¡Hola! Soy nuevo en la ciudad.', tr: 'Hi! I am new in the city.' }] },
      { ai: '¡Qué interesante! ¿De dónde eres?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'interesante', m: 'interesting' }, { w: 'de dónde', m: 'from where' }], choices: [{ t: 'Soy de Canadá. ¿Y tú?', tr: 'I am from Canada. And you?' }, { t: 'Vengo de muy lejos.', tr: 'I come from very far away.' }] },
      { ai: 'Soy de aquí. ¿Te gusta la música?', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'música', m: 'music' }, { w: 'te gusta', m: 'do you like' }], choices: [{ t: '¡Me encanta! ¿Tocas algún instrumento?', tr: 'I love it! Do you play any instrument?' }, { t: 'Sí, especialmente el jazz.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Toco la guitarra. Hay un concierto mañana. ¿Quieres venir?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'guitarra', m: 'guitar' }, { w: 'concierto', m: 'concert' }], choices: [{ t: '¡Me encantaría! ¿A qué hora?', tr: 'I would love to! What time?' }, { t: '¡Suena genial! ¿Dónde es?', tr: 'Sounds great! Where is it?' }] },
      { ai: 'A las ocho de la noche. ¡Va a ser una noche increíble!', ai_t: 'At eight in the evening. It\'s going to be an incredible night!', vocab: [{ w: 'noche', m: 'night' }, { w: 'increíble', m: 'incredible' }], choices: [{ t: '¡No puedo esperar! Hasta mañana.', tr: 'I can\'t wait! See you tomorrow.' }, { t: '¡Perfecto! Allí estaré.', tr: 'Perfect! I\'ll be there.' }] },
    ],
    fr: [
      { ai: 'Bonjour! Tu es nouveau ici? Je ne t\'avais jamais vu.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'nouveau', m: 'new' }, { w: 'jamais', m: 'never' }], choices: [{ t: 'Oui, je viens d\'arriver.', tr: 'Yes, I just arrived.' }, { t: 'Salut! Je suis nouveau en ville.', tr: 'Hi! I am new in the city.' }] },
      { ai: 'Comme c\'est intéressant! Tu viens d\'où?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'intéressant', m: 'interesting' }, { w: 'd\'où', m: 'from where' }], choices: [{ t: 'Je viens du Canada. Et toi?', tr: 'I am from Canada. And you?' }, { t: 'Je viens de très loin.', tr: 'I come from very far away.' }] },
      { ai: 'Je suis d\'ici. Tu aimes la musique?', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'musique', m: 'music' }, { w: 'tu aimes', m: 'do you like' }], choices: [{ t: 'J\'adore! Tu joues d\'un instrument?', tr: 'I love it! Do you play an instrument?' }, { t: 'Oui, surtout le jazz.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Je joue de la guitare. Il y a un concert demain. Tu veux venir?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'guitare', m: 'guitar' }, { w: 'concert', m: 'concert' }], choices: [{ t: 'J\'adorerais! À quelle heure?', tr: 'I would love to! What time?' }, { t: 'Super! C\'est où?', tr: 'Great! Where is it?' }] },
      { ai: 'À vingt heures. Ça va être une nuit incroyable!', ai_t: 'At eight o\'clock. It\'s going to be an incredible night!', vocab: [{ w: 'nuit', m: 'night' }, { w: 'incroyable', m: 'incredible' }], choices: [{ t: 'J\'ai hâte! À demain.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'Parfait! J\'y serai.', tr: 'Perfect! I\'ll be there.' }] },
    ],
    zh: [
      { ai: '你好！你是新来的吗？我以前从没见过你。', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: '新来的', m: 'new here' }, { w: '从没', m: 'never' }], choices: [{ t: '是的，我刚到。', tr: 'Yes, I just arrived.' }, { t: '你好！我是这座城市的新人。', tr: 'Hi! I am new in this city.' }] },
      { ai: '真有趣！你从哪里来？', ai_t: 'How interesting! Where are you from?', vocab: [{ w: '有趣', m: 'interesting' }, { w: '哪里', m: 'where' }], choices: [{ t: '我来自加拿大。你呢？', tr: 'I am from Canada. And you?' }, { t: '我来自很远的地方。', tr: 'I come from very far away.' }] },
      { ai: '我是本地人。你喜欢音乐吗？', ai_t: 'I am a local. Do you like music?', vocab: [{ w: '本地人', m: 'local person' }, { w: '音乐', m: 'music' }], choices: [{ t: '我很喜欢！你会演奏乐器吗？', tr: 'I love it! Do you play an instrument?' }, { t: '喜欢，尤其是爵士乐。', tr: 'Yes, especially jazz.' }] },
      { ai: '我会弹吉他。明天有一场音乐会。你想来吗？', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: '吉他', m: 'guitar' }, { w: '音乐会', m: 'concert' }], choices: [{ t: '太好了！几点开始？', tr: 'Great! What time does it start?' }, { t: '听起来不错！在哪里？', tr: 'Sounds great! Where is it?' }] },
      { ai: '晚上八点。一定会是个美好的夜晚！', ai_t: 'At eight in the evening. It will definitely be a wonderful night!', vocab: [{ w: '晚上', m: 'evening' }, { w: '美好', m: 'wonderful' }], choices: [{ t: '我等不及了！明天见。', tr: 'I can\'t wait! See you tomorrow.' }, { t: '太棒了！我一定到。', tr: 'Excellent! I\'ll definitely be there.' }] },
    ],
    fa: [
      { ai: 'سلام! اینجا تازهواردی؟ قبلاً ندیده بودمت.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'تازهوارد', m: 'newcomer' }, { w: 'قبلاً', m: 'before' }], choices: [{ t: 'بله تازه سیدم.', tr: 'Yes, I just arrived.' }, { t: 'سلام! تازه به این شهر آمدم.', tr: 'Hi! I am new in this city.' }] },
      { ai: 'چه جالب! اهل کجایی؟', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'جالب', m: 'interesting' }, { w: 'اهل کجا', m: 'from where' }], choices: [{ t: 'از کانادا اومدم', tr: 'I am from Canada. And you?' }, { t: 'از خیلی دور آمدهام.', tr: 'I come from very far away.' }] },
      { ai: 'من اینجایی هستم. موسیقی دوست داری؟', ai_t: 'I am local. Do you like music?', vocab: [{ w: 'اینجایی', m: 'local' }, { w: 'موسیقی', m: 'music' }], choices: [{ t: 'خیلی دوست دارم! ساز میزنی؟', tr: 'I love it! Do you play an instrument?' }, { t: 'بله به خصوص جاز.', tr: 'Yes, especially jazz.' }] },
      { ai: 'گیتار میزنم. فردا کنسرت داریم. میخواهی بیایی؟', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'گیتار', m: 'guitar' }, { w: 'کنسرت', m: 'concert' }], choices: [{ t: 'عاشقانه ساعت چنده؟', tr: 'I would love to! What time?' }, { t: 'عالیه کجاست', tr: 'Sounds great! Where is it?' }] },
      { ai: 'ساعت هشت شب. شب فراموشنشدنی خواهد بود!', ai_t: 'At eight in the evening. It will be an unforgettable night!', vocab: [{ w: 'شب', m: 'night' }, { w: 'فراموشنشدنی', m: 'unforgettable' }], choices: [{ t: 'تا فردا نمیتونم صبر کنم.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'عالی حتما میام.', tr: 'Perfect! I\'ll definitely be there.' }] },
    ],
    it: [
      { ai: 'Ciao! Sei nuovo qui? Non ti avevo mai visto prima.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'nuovo', m: 'new' }, { w: 'mai', m: 'never' }], choices: [{ t: 'Sì, sono appena arrivato.', tr: 'Yes, I just arrived.' }, { t: 'Ciao! Sono nuovo in città.', tr: 'Hi! I am new in the city.' }] },
      { ai: 'Che interessante! Di dove sei?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'interessante', m: 'interesting' }, { w: 'di dove', m: 'from where' }], choices: [{ t: 'Sono canadese. E tu?', tr: 'I am Canadian. And you?' }, { t: 'Vengo da molto lontano.', tr: 'I come from very far away.' }] },
      { ai: 'Sono di qui. Ti piace la musica?', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'musica', m: 'music' }, { w: 'ti piace', m: 'do you like' }], choices: [{ t: 'Moltissimo! Suoni qualche strumento?', tr: 'Very much! Do you play any instrument?' }, { t: 'Sì, soprattutto il jazz.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Suono la chitarra. C\'è un concerto domani. Vuoi venire?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'chitarra', m: 'guitar' }, { w: 'concerto', m: 'concert' }], choices: [{ t: 'Mi piacerebbe! A che ora?', tr: 'I would love to! What time?' }, { t: 'Fantastico! Dove?', tr: 'Fantastic! Where is it?' }] },
      { ai: 'Alle otto di sera. Sarà una notte incredibile!', ai_t: 'At eight in the evening. It\'s going to be an incredible night!', vocab: [{ w: 'sera', m: 'evening' }, { w: 'incredibile', m: 'incredible' }], choices: [{ t: 'Non vedo l\'ora! A domani.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'Perfetto! Ci sarò.', tr: 'Perfect! I\'ll be there.' }] },
    ],
    ru: [
      { ai: 'Привет! Ты новенький здесь? Я никогда раньше тебя не видел.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'новенький', m: 'new here' }, { w: 'никогда', m: 'never' }], choices: [{ t: 'Да, я только что приехал.', tr: 'Yes, I just arrived.' }, { t: 'Привет! Я новый в этом городе.', tr: 'Hi! I am new in this city.' }] },
      { ai: 'Как интересно! Откуда ты?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'интересно', m: 'interesting' }, { w: 'откуда', m: 'from where' }], choices: [{ t: 'Я из Канады. А ты?', tr: 'I am from Canada. And you?' }, { t: 'Я приехал издалека.', tr: 'I come from very far away.' }] },
      { ai: 'Я местный. Ты любишь музыку?', ai_t: 'I am local. Do you like music?', vocab: [{ w: 'местный', m: 'local' }, { w: 'музыка', m: 'music' }], choices: [{ t: 'Очень люблю! Играешь на инструменте?', tr: 'I love it! Do you play an instrument?' }, { t: 'Да, особенно джаз.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Я играю на гитаре. Завтра концерт. Хочешь пойти?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to go?', vocab: [{ w: 'гитара', m: 'guitar' }, { w: 'концерт', m: 'concert' }], choices: [{ t: 'С удовольствием! В котором часу?', tr: 'I would love to! What time?' }, { t: 'Звучит здорово! Где?', tr: 'Sounds great! Where is it?' }] },
      { ai: 'В восемь вечера. Это будет незабываемая ночь!', ai_t: 'At eight in the evening. It\'s going to be an unforgettable night!', vocab: [{ w: 'вечер', m: 'evening' }, { w: 'незабываемая', m: 'unforgettable' }], choices: [{ t: 'Не могу дождаться! До завтра.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'Отлично! Обязательно приду.', tr: 'Perfect! I\'ll definitely be there.' }] },
    ],
    ar: [
      { ai: 'مرحباً! أنت جديد هنا؟ لم أرَك من قبل.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'جديد', m: 'new' }, { w: 'من قبل', m: 'before' }], choices: [{ t: 'نعم، وصلت للتو.', tr: 'Yes, I just arrived.' }, { t: 'مرحباً! أنا جديد في هذه المدينة.', tr: 'Hi! I am new in this city.' }] },
      { ai: 'يا لها من مفاجأة! من أين أنت؟', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'مثير', m: 'interesting' }, { w: 'من أين', m: 'from where' }], choices: [{ t: 'أنا من كندا. وأنت؟', tr: 'I am from Canada. And you?' }, { t: 'أنا قادم من بعيد جداً.', tr: 'I come from very far away.' }] },
      { ai: 'أنا من هنا. هل تحب الموسيقى؟', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'محلي', m: 'local' }, { w: 'موسيقى', m: 'music' }], choices: [{ t: 'أحبها كثيراً! هل تعزف آلة موسيقية؟', tr: 'I love it! Do you play an instrument?' }, { t: 'نعم، خاصةً الجاز.', tr: 'Yes, especially jazz.' }] },
      { ai: 'أعزف على الغيتار. هناك حفلة موسيقية غداً. هل تريد المجيء؟', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'غيتار', m: 'guitar' }, { w: 'حفلة موسيقية', m: 'concert' }], choices: [{ t: 'بكل سرور! في أي ساعة؟', tr: 'I would love to! What time?' }, { t: 'يبدو رائعاً! أين؟', tr: 'Sounds great! Where is it?' }] },
      { ai: 'في الثامنة مساءً. ستكون ليلة لا تُنسى!', ai_t: 'At eight in the evening. It\'s going to be an unforgettable night!', vocab: [{ w: 'مساءً', m: 'evening' }, { w: 'لا تُنسى', m: 'unforgettable' }], choices: [{ t: 'لا أستطيع الانتظار! أراك غداً.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'رائع! سأكون هناك.', tr: 'Perfect! I\'ll be there.' }] },
    ],
    tr: [
      { ai: 'Merhaba! Buraya yeni mi geldiniz? Sizi daha önce hiç görmedim.', ai_t: 'Hi! Are you new here? I\'ve never seen you before.', vocab: [{ w: 'yeni', m: 'new' }, { w: 'hiç', m: 'never' }], choices: [{ t: 'Evet, yeni geldim.', tr: 'Yes, I just arrived.' }, { t: 'Merhaba! Bu şehre yeniyim.', tr: 'Hi! I am new in this city.' }] },
      { ai: 'Ne ilginç! Nerelisiniz?', ai_t: 'How interesting! Where are you from?', vocab: [{ w: 'ilginç', m: 'interesting' }, { w: 'nereli', m: 'from where' }], choices: [{ t: 'Kanadalıyım. Ya siz?', tr: 'I am from Canada. And you?' }, { t: 'Çok uzaktan geliyorum.', tr: 'I come from very far away.' }] },
      { ai: 'Ben buralıyım. Müzik sever misiniz?', ai_t: 'I am from here. Do you like music?', vocab: [{ w: 'buralı', m: 'local' }, { w: 'müzik', m: 'music' }], choices: [{ t: 'Çok severim! Enstrüman çalıyor musunuz?', tr: 'I love it! Do you play an instrument?' }, { t: 'Evet, özellikle caz.', tr: 'Yes, especially jazz.' }] },
      { ai: 'Gitar çalıyorum. Yarın bir konser var. Gelmek ister misiniz?', ai_t: 'I play guitar. There\'s a concert tomorrow. Do you want to come?', vocab: [{ w: 'gitar', m: 'guitar' }, { w: 'konser', m: 'concert' }], choices: [{ t: 'Çok isterim! Saat kaçta?', tr: 'I would love to! What time?' }, { t: 'Harika! Nerede?', tr: 'Sounds great! Where is it?' }] },
      { ai: 'Akşam sekizde. İnanılmaz bir gece olacak!', ai_t: 'At eight in the evening. It\'s going to be an incredible night!', vocab: [{ w: 'akşam', m: 'evening' }, { w: 'inanılmaz', m: 'incredible' }], choices: [{ t: 'Sabırsızlanıyorum! Yarın görüşürüz.', tr: 'I can\'t wait! See you tomorrow.' }, { t: 'Mükemmel! Orada olacağım.', tr: 'Perfect! I\'ll be there.' }] },
    ],
  },
};

// ─── Types & constants ───────────────────────────────────────────
type Screen = 'splash' | 'scenario' | 'language' | 'guide' | 'convo' | 'done';

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
  const [vocab, setVocab] = useState<{ w: string; m: string }[]>([]);
  const [chosen, setChosen] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [tappedWord, setTappedWord] = useState('');
  const [tappedIndex, setTappedIndex] = useState(-1);
  const [dariushId, setDariushId] = useState('');
  const [nargessId, setNargessId] = useState('');
  const [bilingualTap, setBilingualTap] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const riseAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
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
    setScenario(sc); setLang(lg); setStep(0); setVocab([]); setChosen(''); setShowTranslation(false);
    navigate('guide');
  }

  function speakWord(word: string, index: number) {
    const clean = word.replace(/[.,!?;:،؟]/g, '').trim();
    if (!clean) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTappedWord(clean);
    setTappedIndex(index);
    Speech.stop();
    // Speak foreign word, then optionally English translation
    const _o3: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82, onDone: () => {
      if (bilingualTap) {
        const ex = CONVOS[scenario]?.[lang]?.[step];
        const enWords = ex?.ai_t.split(' ') ?? [];
        const enWord = (enWords[index] ?? '').replace(/[.,!?;:]/g, '').trim();
        if (enWord) {
          setTimeout(() => {
            Speech.speak(enWord, { language: 'en-US', rate: 0.82 });
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
    Speech.stop();
    setChosen(choice);
    const newVocab = [...vocab, ...exchange.vocab.filter(v => !vocab.find(ev => ev.w === v.w))];
    setVocab(newVocab);
    setTimeout(() => {
      if (step + 1 >= (CONVOS[scenario]?.[lang]?.length ?? 0)) {
        navigate('done');
      } else {
        setStep(step + 1); setChosen(''); setShowTranslation(false);
      }
    }, 800);
  }

  const exchange = CONVOS[scenario]?.[lang]?.[step];
  const guide = GUIDES[scenario]?.[lang];
  const total = CONVOS[scenario]?.[lang]?.length ?? 5;
  const accent = SCENE_COLOR[scenario] ?? C.gold;

  if (screen === 'splash') return (
    <Animated.View style={[s.root, { transform: [{ translateX: slideAnim }] }, { backgroundColor: '#0A1628' }]}>
      <Animated.View style={[s.center, { opacity: fadeAnim, transform: [{ translateY: riseAnim }] }]}>
        <View style={s.logoMark}><Text style={s.logoA}>A</Text></View>
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
      <Pressable style={[s.ctaBtn, { marginTop: 40 }]} onPress={() => navigate('convo')}>
        <Text style={s.ctaText}>Start Conversation</Text>
      </Pressable>
    </Animated.View>
  );

  if (screen === 'convo' && exchange) return (
    <Animated.View style={[s.root, { transform: [{ translateX: slideAnim }] }]}>
      {/* D4 — Pinned guide header */}
      <View style={[s.convoHeader, { borderBottomColor: accent + '40' }]}>
        <Pressable style={s.convoBack} onPress={() => { Speech.stop(); navigate('guide'); }}>
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
          <Pressable style={s.replayBtn} onPress={() => {
            Speech.stop();
            if (exchange) { const _o2: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.88 }; if (lang === 'fa' && dariushId) _o2.voice = dariushId; Speech.speak(exchange.ai, _o2); }
          }}>
            <Text style={s.replayTxt}>🔊</Text>
          </Pressable>
        </View>
      </View>
      {/* Step counter + progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <View style={[s.progressBar, { flex: 1, marginBottom: 0 }]}><View style={[s.progressFill, { width: `${(step / total) * 100}%`, backgroundColor: accent }]} /></View>
        <Text style={{ fontSize: 10, color: C.muted, letterSpacing: 1, minWidth: 32, textAlign: 'right' }}>{step + 1}/{total}</Text>
      </View>
      <View style={s.bubbleRow}>
        <View style={[s.guidePip, { borderWidth: 1, borderColor: accent + '55' }]}><Text style={{ fontSize: 20 }}>{guide?.avatar}</Text></View>
        <View style={[s.aiBubble, { borderLeftWidth: 3, borderLeftColor: accent + '88' }]}>
          <View style={{ flexDirection: RTL_LANGS.has(lang) ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 4 }}>
            {exchange.ai.split(' ').map((word, i) => {
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
                  const mappedIdx = tappedIndex >= 0
                    ? Math.round(tappedIndex * (_enWords.length - 1) / Math.max(_faWords.length - 1, 1))
                    : -1;
                  const isActive = tappedIndex >= 0 && mappedIdx === i;
                  const cleanEn = word.replace(/[.,!?;:]/g, '').trim();
                  return (
                    <Pressable key={i} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (cleanEn) Speech.speak(cleanEn, { language: 'en-US', rate: 0.82 }); }}>
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
      {exchange.vocab.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 20 }} contentContainerStyle={{ gap: 8 }}>
          {exchange.vocab.map(v => (
            <Pressable key={v.w} style={s.vocabChip} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const _vOpts: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82 };
              if (lang === 'fa' && (nargessId || dariushId)) _vOpts.voice = nargessId || dariushId;
              Speech.speak(v.w, _vOpts);
              setTimeout(() => Speech.speak(v.m, { language: 'en-US', rate: 0.82 }), 1000);
            }}>
              <Text style={s.vocabWord}>{v.w} 🔊</Text>
              <Text style={s.vocabMean}>{v.m}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 4 }}>YOUR RESPONSE</Text>
        {exchange.choices.map((ch, i) => (
          <Pressable key={i} style={[s.choiceBtn, chosen === ch.t && s.choiceBtnChosen]} onPress={() => {
            if (!chosen) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const _cOpts: any = { language: LANG_VOICE[lang] ?? lang, rate: 0.82 };
              if (lang === 'fa' && (nargessId || dariushId)) _cOpts.voice = nargessId || dariushId;
              Speech.speak(ch.t, _cOpts);
            }
            handleChoice(ch.t);
          }} disabled={!!chosen}>
            <Text style={[s.choiceTxt, chosen === ch.t && { color: C.gold }]}>{ch.t}</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{ch.tr}</Text>
          </Pressable>
        ))}
      </View>
      {vocab.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 10, letterSpacing: 2, color: C.muted, marginBottom: 8 }}>LEARNED · {vocab.length} word{vocab.length !== 1 ? 's' : ''}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {vocab.map(v => <Text key={v.w} style={s.vocabPill}>{v.w}</Text>)}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );

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
          <View key={v.w} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <Text style={{ color: C.gold, fontSize: 15, fontWeight: '600' }}>{v.w}</Text>
            <Text style={{ color: C.muted, fontSize: 14 }}>{v.m}</Text>
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
