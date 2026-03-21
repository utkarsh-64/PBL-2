import { Play, FileText, Image, BookOpen } from "lucide-react";

const iconMap = {
  video: Play,
  article: FileText,
  infographic: Image,
  interactive: BookOpen,
};

const getContentIcon = (type) => {
  const Icon = iconMap[type] || FileText;
  return <Icon className="w-4 h-4" />;
};

export { getContentIcon };
