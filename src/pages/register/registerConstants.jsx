import MosqueIcon from '@mui/icons-material/Mosque';
import CategoryIcon from '@mui/icons-material/Category';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import bankBranchesData from '../../data/bankBranches.json';

export const STEPS = [
  { label: 'סוג אתר', icon: <CategoryIcon /> },
  { label: 'פרטים', icon: <MosqueIcon /> },
  { label: 'יצירת קשר', icon: <ContactPhoneIcon /> },
];

export const BANK_OPTIONS = bankBranchesData.banks;
export const BRANCH_OPTIONS = bankBranchesData.branches;

export const LIVE_PREVIEW_SLUG = 'register-live-preview';
export const LIVE_PREVIEW_MESSAGE_TYPE = 'tenant-preview-update';
