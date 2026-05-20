const HEBREW_SLUG_DICTIONARY = {
  'אדרת': 'aderet',
  'אהבה': 'ahava',
  'אהבת': 'ahavat',
  'אהל': 'ohel',
  'אוהל': 'ohel',
  'אור': 'or',
  'אליהו': 'eliyahu',
  'אריה': 'aryeh',
  'אברהם': 'avraham',
  'בית': 'beit',
  'בני': 'bnei',
  'ברוך': 'baruch',
  'גבריאל': 'gavriel',
  'דוד': 'david',
  'היכל': 'heichal',
  'היכלו': 'heichalo',
  'השלום': 'hashalom',
  'המאור': 'hamaor',
  'המאיר': 'hameir',
  'הצדיק': 'hatzadik',
  'הקדוש': 'hakadosh',
  'הקהילה': 'hakehila',
  'הרחמים': 'harachamim',
  'השם': 'hashem',
  'התקווה': 'hatikva',
  'התקוה': 'hatikva',
  'העיר': 'hair',
  'וישראל': 'veyisrael',
  'זכרון': 'zikhron',
  'זיכרון': 'zikhron',
  'חביב': 'haviv',
  'חביבי': 'havivi',
  'חכם': 'chacham',
  'חיים': 'chaim',
  'חסד': 'chesed',
  'טוב': 'tov',
  'יהודה': 'yehuda',
  'יוסף': 'yosef',
  'ירושלים': 'yerushalayim',
  'ישראל': 'yisrael',
  'ישועה': 'yeshua',
  'יצחק': 'yitzchak',
  'יעקב': 'yaakov',
  'כהן': 'cohen',
  'כנסת': 'knesset',
  'לוי': 'levi',
  'מאיר': 'meir',
  'מגן': 'magen',
  'מדרש': 'midrash',
  'מנחם': 'menachem',
  'משה': 'moshe',
  'משכן': 'mishkan',
  'משכנות': 'mishkenot',
  'נחמן': 'nachman',
  'נצח': 'netzach',
  'נתיבות': 'netivot',
  'נעם': 'noam',
  'נריה': 'neriya',
  'עובדיה': 'ovadia',
  'עטרת': 'ateret',
  'עטרתנו': 'atartenu',
  'עמנואל': 'immanuel',
  'פאר': 'peer',
  'פרץ': 'peretz',
  'צדק': 'tzedek',
  'ציון': 'tzion',
  'צמח': 'tzemach',
  'קדושים': 'kedoshim',
  'קהילה': 'kehila',
  'קהילת': 'kehilat',
  'קודש': 'kodesh',
  'קרית': 'kiryat',
  'קריית': 'kiryat',
  'רבי': 'rabbi',
  'רחל': 'rachel',
  'רפאל': 'refael',
  'שבח': 'shevach',
  'שדי': 'shaddai',
  'שושנים': 'shoshanim',
  'שלום': 'shalom',
  'שמעון': 'shimon',
  'שמחה': 'simcha',
  'שמואל': 'shmuel',
  'שער': 'shaar',
  'שערי': 'shaarei',
  'תפארת': 'tiferet',
  'תורה': 'torah',
  'תורת': 'torat',
  'תפילה': 'tefila',
  'תפלה': 'tefila',
};

export function latinSlugify(text) {
  const map = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
    'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
    'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'f',
    'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
  };

  return text
    .trim()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

export function transliterateHebrewWord(word = '') {
  const normalized = word.trim().replace(/["׳״']/g, '');
  if (!normalized) return '';
  if (HEBREW_SLUG_DICTIONARY[normalized]) return HEBREW_SLUG_DICTIONARY[normalized];
  return latinSlugify(normalized);
}

export function stripSynagoguePrefix(name = '') {
  return name.replace(/^בית\s+כנסת\s*/u, '').trimStart();
}

export function withSynagoguePrefix(name = '') {
  const stripped = stripSynagoguePrefix(name).trim();
  return stripped ? `בית כנסת ${stripped}` : '';
}

export function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

export function buildWhatsappLink(phone) {
  const digits = digitsOnly(phone);
  if (!digits) return '';
  if (digits.startsWith('972')) return `https://wa.me/${digits}`;
  if (digits.startsWith('0')) return `https://wa.me/972${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export function cleanSlug(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeSlugInput(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
}

export function sanitizeDisplayText(value = '') {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[‎‏‪-‮]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildSlugFromName(name = '') {
  return cleanSlug(
    stripSynagoguePrefix(name)
      .split(/[\s־-]+/)
      .filter(Boolean)
      .map(transliterateHebrewWord)
      .join('-')
  );
}

export function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}
