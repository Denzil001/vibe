import React from 'react';
import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface NoticeAlertProps {
  type?: 'info' | 'warning' | 'caution' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const NoticeAlert: React.FC<NoticeAlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const styles = {
    info: {
      container: 'bg-navy-50 border-navy-200 text-navy-800',
      icon: <Info className="w-5 h-5 text-navy-600 shrink-0 mt-0.5" />,
      titleColor: 'text-navy-900',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      titleColor: 'text-amber-950 font-semibold',
    },
    caution: {
      container: 'bg-orange-50 border-orange-200 text-orange-950',
      icon: <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />,
      titleColor: 'text-orange-950 font-semibold',
    },
    success: {
      container: 'bg-brand-50 border-brand-200 text-brand-900',
      icon: <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />,
      titleColor: 'text-brand-950 font-semibold',
    },
  }[type];

  return (
    <div
      role="alert"
      className={`border rounded-xl p-4 flex items-start gap-3 text-sm leading-relaxed ${styles.container} ${className}`}
    >
      {styles.icon}
      <div className="flex-1">
        {title && <h4 className={`text-sm mb-1 ${styles.titleColor}`}>{title}</h4>}
        <div className="opacity-95">{children}</div>
      </div>
    </div>
  );
};
