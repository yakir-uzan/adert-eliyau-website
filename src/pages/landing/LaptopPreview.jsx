import Stack from '@mui/material/Stack';
import css from './LaptopPreview.module.css';

const ZMANIM = [
  ['שחרית', '06:15'],
  ['מנחה', '13:30'],
  ['מנחה ב׳', '19:10'],
  ['ערבית', '20:20'],
];

const NOTICES = [
  {
    title: 'שיעור תורה השבוע',
    text: 'יום חמישי אחרי ערבית עם הרב.',
  },
  {
    title: 'הודעה לקראת שבת',
    text: 'קבלת שבת מוקדמת בשעה 18:45.',
  },
];

export default function LaptopPreview() {
  return (
    <div className={css.frame}>
      <div className={css.camera} />

      <div className={css.screen}>
        <div className={css.screenOverlay} />

        <div className={css.screenContent}>
          <div className={css.navbar}>
            <span className={css.navBrand}>בית</span>
            <Stack direction="row" spacing={{ xs: 1, sm: 2.2 }}>
              {['צור קשר', 'תרומות', 'גלריה', 'הודעות', 'זמני תפילה'].map((item) => (
                <span key={item} className={css.navItem}>{item}</span>
              ))}
            </Stack>
            <span className={css.navCrown}>♛</span>
          </div>

          <div className={css.mainGrid}>
            <div className={css.noticeColumn}>
              <div className={css.noticePanel}>
                <div className={css.noticePanelTitle}>הודעות בית הכנסת</div>
                <Stack spacing={1}>
                  {NOTICES.map((notice) => (
                    <div key={notice.title} className={css.noticeCard}>
                      <div className={css.noticeCardTitle}>{notice.title}</div>
                      <div className={css.noticeCardText}>{notice.text}</div>
                    </div>
                  ))}
                </Stack>
              </div>
            </div>

            <div className={css.infoColumn}>
              <div className={css.infoLabel}>בית הכנסת</div>
              <div className={css.infoName}>משכנות יוסף</div>
              <div className={css.infoTagline}>קהילה • תורה • תפילה • חסד</div>

              <div className={css.zmanimPanel}>
                <div className={css.zmanimTitle}>זמני תפילה - היום</div>
                {ZMANIM.map(([label, time]) => (
                  <div key={label} className={css.zmanimRow}>
                    <span className={css.zmanimText}>{label}</span>
                    <span className={css.zmanimText}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={css.shadow} />
    </div>
  );
}
