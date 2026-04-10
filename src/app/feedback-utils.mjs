export const TOAST_VARIANTS = {
  success: { label: 'Success', icon: '✅', live: 'polite' },
  info: { label: 'Info', icon: 'ℹ️', live: 'polite' },
  warning: { label: 'Warning', icon: '⚠️', live: 'assertive' },
  error: { label: 'Error', icon: '⛔', live: 'assertive' }
};

export function createToastRecord({ id, variant, message }) {
  const meta = TOAST_VARIANTS[variant] || TOAST_VARIANTS.info;
  return {
    id,
    variant: meta === TOAST_VARIANTS[variant] ? variant : 'info',
    label: meta.label,
    icon: meta.icon,
    live: meta.live,
    message
  };
}

export function pushToast(toasts, toast, maxToasts = 4) {
  return [...toasts, toast].slice(-maxToasts);
}

export function removeToast(toasts, id) {
  return toasts.filter((toast) => toast.id !== id);
}

