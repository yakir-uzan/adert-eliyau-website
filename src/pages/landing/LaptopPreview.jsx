import Stack from '@mui/material/Stack';
import css from './LaptopPreview.module.css';

const ACTIVITY = [
  ['פעילות קהילה', '10:00'],
  ['שיעור / מפגש', '13:30'],
  ['פרויקט תרומה', '18:00'],
  ['עדכון יומי', '20:20'],
];

const NOTICES = [
  {
    title: 'פעילות חדשה השבוע',
    text: 'עדכון חשוב לקהילה ולצוות הפעילות.',
  },
  {
    title: 'פרויקט תרומה פתוח',
    text: 'אפשר להצטרף ולתרום דרך האתר.',
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
            <span className={css.navBrand}>אתר</span>
            <Stack direction="row" spacing={{ xs: 1, sm: 2.2 }}>
              {['צור קשר', 'תרומות', 'גלריה', 'עדכונים', 'פעילות'].map((item) => (
                <span key={item} className={css.navItem}>{item}</span>
              ))}
            </Stack>
            <span className={css.navCrown}>♛</span>
          </div>

          <div className={css.mainGrid}>
            <div className={css.noticeColumn}>
              <div className={css.noticePanel}>
                <div className={css.noticePanelTitle}>עדכוני הארגון</div>
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
              <div className={css.infoLabel}>הארגון שלכם</div>
              <div className={css.infoName}>חסדי דוד</div>
              <div className={css.infoTagline}>קהילה • נתינה • פעילות • קשר</div>

              <div className={css.zmanimPanel}>
                <div className={css.zmanimTitle}>לוח פעילות - היום</div>
                {ACTIVITY.map(([label, time]) => (
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
