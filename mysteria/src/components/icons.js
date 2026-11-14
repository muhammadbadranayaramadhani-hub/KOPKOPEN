// Peta ikon Lucide yang dipakai data kasus (nama string -> komponen).
// Dipetakan eksplisit agar bundel tetap kecil (tree-shaking).
import {
  Archive, Award, BookOpen, BookText, Brain, Cable, CalendarDays, Calculator, Check,
  ChevronLeft, ChevronRight, Circle, CircleCheck, CircleX, ClipboardCheck, ClipboardList,
  Droplets, Eye, FileCheck, FileText, FlaskConical, Gauge, Hammer, House, Image, Info,
  Lightbulb, Link2, Lock, Mail, MapPin, Megaphone, Menu, MessageSquareQuote, Network, Pin,
  Play, RotateCcw, Save, Scale, Search, Settings, Sparkles, Sprout, Star, StickyNote, Target,
  Trash2, TriangleAlert, UserRound, Waves, Wrench, X, Send, MessageCircle, WifiOff, Bot,
} from 'lucide-react';

export const ICONS = {
  Archive, Award, BookOpen, BookText, Brain, Cable, CalendarDays, Calculator, Check,
  ChevronLeft, ChevronRight, Circle, CircleCheck, CircleX, ClipboardCheck, ClipboardList,
  Droplets, Eye, FileCheck, FileText, FlaskConical, Gauge, Hammer, House, Image, Info,
  Lightbulb, Link2, Lock, Mail, MapPin, Megaphone, Menu, MessageSquareQuote, Network, Pin,
  Play, RotateCcw, Save, Scale, Search, Settings, Sparkles, Sprout, Star, StickyNote, Target,
  Trash2, TriangleAlert, UserRound, Waves, Wrench, X, Send, MessageCircle, WifiOff, Bot,
};

export function getIcon(name) {
  return ICONS[name] || Circle;
}
