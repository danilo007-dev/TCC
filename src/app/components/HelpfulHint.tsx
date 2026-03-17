import { Lightbulb } from "lucide-react";
import { motion } from "motion/react";

interface HelpfulHintProps {
  children?: React.ReactNode;
  message?: string;
  title?: string;
  className?: string;
}

export function HelpfulHint({ children, message, title, className = "" }: HelpfulHintProps) {
  const content = children ?? message;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="size-4 text-blue-600" />
        </div>
        <div className="flex-1">
          {title && <p className="text-sm font-semibold text-blue-900 mb-0.5">{title}</p>}
          <p className="text-sm text-blue-800">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}
