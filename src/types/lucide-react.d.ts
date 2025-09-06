declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  
  export type Icon = ComponentType<IconProps>;
  
  // Dashboard and Navigation icons
  export const BarChart3: Icon;
  export const FileText: Icon;
  export const Users: Icon;
  export const Settings: Icon;
  export const Activity: Icon;
  export const HelpCircle: Icon;
  export const Search: Icon;
  export const LogOut: Icon;
  export const Menu: Icon;
  export const X: Icon;
  export const Shield: Icon;
  export const Bell: Icon;
  export const Plus: Icon;
  export const Send: Icon;
  export const Check: Icon;
  export const Mail: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const RotateCcw: Icon;
  export const List: Icon;
  export const LogIn: Icon;
  export const User: Icon;
  export const Clock: Icon;
  export const CheckCircle: Icon;
  export const AlertTriangle: Icon;
  export const Building: Icon;
  export const Info: Icon;
  export const SortAsc: Icon;
  export const SortDesc: Icon;
  export const Download: Icon;
  
  // Additional icons from other components
  export const Globe: Icon;
  export const Save: Icon;
  export const SearchCheck: Icon;
  export const Phone: Icon;
  export const RefreshCw: Icon;
  export const Edit: Icon;
  export const Trash2: Icon;
  export const Calendar: Icon;
  export const TrendingUp: Icon;
  export const ShoppingCart: Icon;
  export const Target: Icon;
  export const Heart: Icon;
  export const Edit2: Icon;
  export const ExternalLink: Icon;
  
  // Icons needed for fixes
  export const MessageSquare: Icon;
  export const Star: Icon;
  export const Package: Icon;
  export const CreditCard: Icon;
  export const Filter: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const AlertCircle: Icon;
  export const Award: Icon;
  export const Ban: Icon;
  export const ArrowLeft: Icon;
  export const XCircle: Icon;
  export const Timer: Icon;
  export const MoreHorizontal: Icon;
  export const Lock: Icon;
  export const UserCheck: Icon;
  export const XIcon: Icon;
  export const CheckIcon: Icon;
  export const ChevronDownIcon: Icon;
  export const ChevronUpIcon: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
}
