import { transliterate as transliterateHebrewAcademic } from 'hebrew-transliteration';

const HEBREW_SLUG_DICTIONARY = {
  'אהבה': 'ahava',
  'אהבת': 'ahavat',
  'אהל': 'ohel',
  'אוהל': 'ohel',
  'אור': 'or',
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

const HEBREW_WORD_OVERRIDES = {
  'אור': 'or',
  'התורה': 'hatora',
  'תורה': 'torah',
  'שערי': 'shaarei',
  'שער': 'shaar',
  'זריזות': 'zerizut',
  'זריזים': 'zerizim',
  'חסדי': 'hasdei',
  'חסד': 'chesed',
  'דוד': 'david',
  'בית': 'beit',
  'כנסת': 'knesset',
  'ישיבה': 'yeshiva',
  'ישיבת': 'yeshivat',
  'עמותה': 'amuta',
  'עמותת': 'amutat',
  'ארגון': 'organization',
  'מרכז': 'merkaz',
  'קהילתי': 'kehilati',
  'קהילה': 'kehila',
  'קהילת': 'kehilat',
  'הדר': 'hadar',
  'שלום': 'shalom',
  'יוסף': 'yosef',
  'יעקב': 'yaakov',
  'משה': 'moshe',
  'יצחק': 'yitzchak',
  'אברהם': 'avraham',
  'ישראל': 'yisrael',
  'חיים': 'chaim',
  'מאיר': 'meir',
  'רפאל': 'refael',
  'שמואל': 'shmuel',
  'שמעון': 'shimon',
  'ציון': 'tzion',
  'ברכה': 'bracha',
  'ברכת': 'birkat',
  'נועם': 'noam',
  'נתיבות': 'netivot',
  'תפארת': 'tiferet',
  'עטרת': 'ateret',
  'אהבת': 'ahavat',
  'אהבה': 'ahava',
  'תותים': 'tutim',
};

const HEBREW_PREFIXES = {
  'ל': 'le',
  'ב': 'be',
  'כ': 'ke',
  'מ': 'me',
  'ה': 'ha',
  'ו': 've',
};

const LEGACY_WORD_OVERRIDES = {
  'שערי': 'shaarei',
  'חסדי': 'hasdei',
  'אור': 'or',
  'התורה': 'hatora',
  'דוד': 'david',
  'בית': 'beit',
  'כנסת': 'knesset',
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

export function readableHebrewSlugify(text = '') {
  const map = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'u', 'ז': 'z',
    'ח': 'ch', 'ט': 't', 'י': 'i', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
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

function academicHebrewSlugify(text = '') {
  try {
    return cleanSlug(
      transliterateHebrewAcademic(text)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[ʾʿ`']/g, '')
        .replace(/š/g, 'sh')
        .replace(/ḥ/g, 'ch')
        .replace(/ṣ/g, 'tz')
        .replace(/ś/g, 's')
    );
  } catch {
    return '';
  }
}

function countReadableVowels(value = '') {
  return (value.match(/[aeiou]/g) || []).length;
}

function bestHebrewFallback(word = '') {
  const readable = readableHebrewSlugify(word);
  const academic = academicHebrewSlugify(word);
  if (!academic) return readable;
  if (!readable) return academic;
  return countReadableVowels(readable) >= countReadableVowels(academic) ? readable : academic;
}

export function transliterateHebrewWord(word = '') {
  const normalized = word.trim().replace(/["׳״']/g, '');
  if (!normalized) return '';
  if (HEBREW_WORD_OVERRIDES[normalized]) return HEBREW_WORD_OVERRIDES[normalized];
  const prefix = normalized[0];
  const rest = normalized.slice(1);
  if (HEBREW_PREFIXES[prefix] && HEBREW_WORD_OVERRIDES[rest]) {
    return `${HEBREW_PREFIXES[prefix]}${HEBREW_WORD_OVERRIDES[rest]}`;
  }
  if (HEBREW_SLUG_DICTIONARY[normalized]) return HEBREW_SLUG_DICTIONARY[normalized];
  return bestHebrewFallback(normalized);
}

export function stripSynagoguePrefix(name = '') {
  return name.replace(/^בית\s+כנסת\s*/u, '').trimStart();
}

export function stripOrganizationPrefix(name = '') {
  return stripSynagoguePrefix(name)
    .replace(/^(עמותה|עמותת|ישיבה|ישיבת|ארגון)\s+/u, '')
    .trimStart();
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

export function extractSlugFromUrlInput(value = '', baseUrl = '', siteType = '') {
  let next = String(value || '').trim();
  const normalizedBase = String(baseUrl || '').replace(/\/+$/g, '');
  if (normalizedBase && next.startsWith(`${normalizedBase}/`)) {
    next = next.slice(`${normalizedBase}/`.length);
  }
  next = next.replace(/^https?:\/\/[^/]+\//i, '');
  if (siteType && next.startsWith(`${siteType}/`)) {
    next = next.slice(siteType.length + 1);
  }
  return normalizeSlugInput(next);
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
    stripOrganizationPrefix(name)
      .split(/[\s־-]+/)
      .filter(Boolean)
      .map(transliterateHebrewWord)
      .join('-')
  );
}

export function buildLegacySlugFromName(name = '') {
  return cleanSlug(
    stripSynagoguePrefix(name)
      .split(/[\s־-]+/)
      .filter(Boolean)
      .map(word => LEGACY_WORD_OVERRIDES[word.replace(/["׳״']/g, '')] || latinSlugify(word))
      .join('-')
  );
}

export function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}
