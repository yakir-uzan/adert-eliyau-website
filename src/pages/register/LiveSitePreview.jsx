import Box from '@mui/material/Box';
import css from './LiveSitePreview.module.css';

export default function LiveSitePreview({ previewUrl, publicUrl, iframeRef, onLoad }) {
  return (
    <Box className={css.root} sx={{ height: { lg: 590, xl: 590 } }}>
      <div className={css.toolbar}>
        <span className={css.urlText}>{publicUrl}</span>
        <span className={css.titleText}>תצוגה מקדימה</span>
      </div>
      <div className={css.iframeWrap}>
        <iframe
          ref={iframeRef}
          src={previewUrl}
          title="תצוגה מקדימה של האתר"
          onLoad={onLoad}
          className={css.iframe}
        />
      </div>
    </Box>
  );
}
