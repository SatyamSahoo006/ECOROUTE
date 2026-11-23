import * as L from 'lucide-react'

const F = () => null

export const Landmark = L.Landmark || F
export const Mountain = L.Mountain || F
export const Trees = L.Trees || F
export const Utensils = L.Utensils || F
export const ShoppingBag = L.ShoppingBag || F
export const Waves = L.Waves || F
export const Bird = L.Bird || F
export const CloudSun = L.CloudSun || F
export const ShieldCheck = L.ShieldCheck || F
export const ShieldAlert = L.ShieldAlert || F
export const Shield = L.Shield || F
export const MapPin = L.MapPin || F
export const Navigation = L.Navigation || F
export const Leaf = L.Leaf || F
export const Globe = L.Globe || F
export const ChevronDown = L.ChevronDown || F
export const Wifi = L.Wifi || F
export const WifiOff = L.WifiOff || F
export const Sparkles = L.Sparkles || F
export const Plus = L.Plus || F
export const Minus = L.Minus || F
export const Wand2 = L.Wand2 || F
export const Loader2 = L.Loader2 || F
export const Accessibility = L.Accessibility || F
export const Users = L.Users || F
export const TrendingUp = L.TrendingUp || F
export const Clock = L.Clock || F
export const Sun = L.Sun || F
export const AlertTriangle = L.AlertTriangle || F
export const ArrowRight = L.ArrowRight || F
export const X = L.X || F
export const Flag = L.Flag || F
export const Send = L.Send || F
export const ExternalLink = L.ExternalLink || F
export const BarChart3 = L.BarChart3 || F
export const AlertCircle = L.AlertCircle || F
export const Gem = L.Gem || F
export const Route = L.Route || F
export const TriangleAlert = L.TriangleAlert || L.AlertTriangle || F
export const HandHeart = L.HandHeart || F
export const Store = L.Store || F
export const Coins = L.Coins || F
export const Building2 = L.Building2 || F
export const Wind = L.Wind || F
export const Droplets = L.Droplets || F
export const Radio = L.Radio || F
export const Phone = L.Phone || F
export const CheckSquare = L.CheckSquare || F
export const FileText = L.FileText || F
export const CalendarDays = L.CalendarDays || F
export const Mail = L.Mail || F
export const Lock = L.Lock || F
export const User = L.User || F
export const CheckCircle2 = L.CheckCircle2 || F
export const Info = L.Info || F
export const HelpCircle = L.HelpCircle || F
export const UserCheck = L.UserCheck || F
export const LogIn = L.LogIn || F
export const UserPlus = L.UserPlus || F
export const Check = L.Check || F
export const Save = L.Save || F
export const History = L.History || F

export function Icon({ name, ...props }) {
  const C = L[name] || L.Landmark || F
  return <C {...props} />
}
