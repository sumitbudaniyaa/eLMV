import React from "react";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

export const Icons = {
  Scale: (props: IconProps) => <MaterialCommunityIcons name="scale-balance" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  ShieldCheck: (props: IconProps) => <MaterialCommunityIcons name="shield-check" size={props.size ?? 20} color={props.color ?? "#059669"} style={props.style} />,
  CheckCircle2: (props: IconProps) => <Feather name="check-circle" size={props.size ?? 20} color={props.color ?? "#059669"} style={props.style} />,
  XCircle: (props: IconProps) => <Feather name="x-circle" size={props.size ?? 20} color={props.color ?? "#e11d48"} style={props.style} />,
  Clock: (props: IconProps) => <Feather name="clock" size={props.size ?? 20} color={props.color ?? "#0284c7"} style={props.style} />,
  MapPin: (props: IconProps) => <Feather name="map-pin" size={props.size ?? 16} color={props.color ?? "#71717a"} style={props.style} />,
  Building: (props: IconProps) => <Feather name="home" size={props.size ?? 16} color={props.color ?? "#71717a"} style={props.style} />,
  Phone: (props: IconProps) => <Feather name="phone" size={props.size ?? 16} color={props.color ?? "#71717a"} style={props.style} />,
  Camera: (props: IconProps) => <Feather name="camera" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  QrCode: (props: IconProps) => <MaterialCommunityIcons name="qrcode-scan" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  Search: (props: IconProps) => <Feather name="search" size={props.size ?? 18} color={props.color ?? "#71717a"} style={props.style} />,
  Filter: (props: IconProps) => <Feather name="filter" size={props.size ?? 16} color={props.color ?? "#71717a"} style={props.style} />,
  Calendar: (props: IconProps) => <Feather name="calendar" size={props.size ?? 16} color={props.color ?? "#71717a"} style={props.style} />,
  Play: (props: IconProps) => <Feather name="play" size={props.size ?? 16} color={props.color ?? "#ffffff"} style={props.style} />,
  LogOut: (props: IconProps) => <Feather name="log-out" size={props.size ?? 18} color={props.color ?? "#ef4444"} style={props.style} />,
  RefreshCw: (props: IconProps) => <Feather name="refresh-cw" size={props.size ?? 18} color={props.color ?? "#18181b"} style={props.style} />,
  Globe: (props: IconProps) => <Feather name="globe" size={props.size ?? 18} color={props.color ?? "#18181b"} style={props.style} />,
  User: (props: IconProps) => <Feather name="user" size={props.size ?? 18} color={props.color ?? "#18181b"} style={props.style} />,
  FileText: (props: IconProps) => <Feather name="file-text" size={props.size ?? 18} color={props.color ?? "#71717a"} style={props.style} />,
  Award: (props: IconProps) => <Feather name="award" size={props.size ?? 18} color={props.color ?? "#059669"} style={props.style} />,
  ChevronRight: (props: IconProps) => <Feather name="chevron-right" size={props.size ?? 18} color={props.color ?? "#a1a1aa"} style={props.style} />,
  ChevronLeft: (props: IconProps) => <Feather name="chevron-left" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  ArrowLeft: (props: IconProps) => <Feather name="arrow-left" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  X: (props: IconProps) => <Feather name="x" size={props.size ?? 20} color={props.color ?? "#71717a"} style={props.style} />,
  Sliders: (props: IconProps) => <Feather name="sliders" size={props.size ?? 18} color={props.color ?? "#71717a"} style={props.style} />,
  Info: (props: IconProps) => <Feather name="info" size={props.size ?? 16} color={props.color ?? "#71717a"} style={props.style} />,
  AlertCircle: (props: IconProps) => <Feather name="alert-circle" size={props.size ?? 18} color={props.color ?? "#ef4444"} style={props.style} />,
  Copy: (props: IconProps) => <Feather name="copy" size={props.size ?? 16} color={props.color ?? "#18181b"} style={props.style} />,
  Eye: (props: IconProps) => <Feather name="eye" size={props.size ?? 18} color={props.color ?? "#71717a"} style={props.style} />,
  EyeOff: (props: IconProps) => <Feather name="eye-off" size={props.size ?? 18} color={props.color ?? "#71717a"} style={props.style} />,
  Layers: (props: IconProps) => <Feather name="layers" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  Flashlight: (props: IconProps) => <Ionicons name="flashlight" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  FlashlightOff: (props: IconProps) => <Ionicons name="flashlight-outline" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  Settings: (props: IconProps) => <Feather name="settings" size={props.size ?? 20} color={props.color ?? "#18181b"} style={props.style} />,
  Lock: (props: IconProps) => <Feather name="lock" size={props.size ?? 16} color={props.color ?? "#71717a"} style={props.style} />,
  Edit: (props: IconProps) => <Feather name="edit-2" size={props.size ?? 16} color={props.color ?? "#18181b"} style={props.style} />,
  Pencil: (props: IconProps) => <Feather name="edit-3" size={props.size ?? 16} color={props.color ?? "#18181b"} style={props.style} />,
};

