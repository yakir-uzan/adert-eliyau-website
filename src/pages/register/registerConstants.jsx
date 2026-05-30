import StorefrontIcon from '@mui/icons-material/Storefront';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import bankBranchesData from '../../data/bankBranches.json';

export const STEPS = [
  { label: 'פרטים', icon: <StorefrontIcon /> },
  { label: 'יצירת קשר', icon: <ContactPhoneIcon /> },
];

export const BANK_OPTIONS = bankBranchesData.banks;
export const BRANCH_OPTIONS = bankBranchesData.branches;

export const LIVE_PREVIEW_SLUG = 'register-live-preview';
export const LIVE_PREVIEW_MESSAGE_TYPE = 'tenant-preview-update';
