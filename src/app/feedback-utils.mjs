export const TOAST_VARIANTS = {
  success: { label: 'Success', icon: '✅', live: 'polite' },
  info: { label: 'Info', icon: 'ℹ️', live: 'polite' },
  warning: { label: 'Warning', icon: '⚠️', live: 'assertive' },
  error: { label: 'Error', icon: '⛔', live: 'assertive' }
};

export const TOAST_BEHAVIORS = {
  transient: {
    autoDismissMs: 4000,
    dismissible: true,
    dismissOnClick: true,
    isPersistent: false
  },
  persistent: {
    autoDismissMs: null,
    dismissible: true,
    dismissOnClick: false,
    isPersistent: true
  }
};

export function createToastRecord({ id, variant, message, behavior = 'transient' }) {
  const meta = TOAST_VARIANTS[variant] || TOAST_VARIANTS.info;
  const behaviorMeta = TOAST_BEHAVIORS[behavior] || TOAST_BEHAVIORS.transient;
  return {
    id,
    variant: meta === TOAST_VARIANTS[variant] ? variant : 'info',
    behavior: behaviorMeta === TOAST_BEHAVIORS[behavior] ? behavior : 'transient',
    label: meta.label,
    icon: meta.icon,
    live: meta.live,
    autoDismissMs: behaviorMeta.autoDismissMs,
    dismissible: behaviorMeta.dismissible,
    dismissOnClick: behaviorMeta.dismissOnClick,
    isPersistent: behaviorMeta.isPersistent,
    message
  };
}

export function pushToast(toasts, toast, maxToasts = 4) {
  const nextToasts = [...toasts, toast];
  if (nextToasts.length <= maxToasts) {
    return nextToasts;
  }

  const trimmedToasts = [...nextToasts];
  while (trimmedToasts.length > maxToasts) {
    const removableIndex = trimmedToasts.findIndex((entry) => !entry.isPersistent);
    if (removableIndex >= 0) {
      trimmedToasts.splice(removableIndex, 1);
      continue;
    }
    trimmedToasts.shift();
  }

  return trimmedToasts;
}

export function removeToast(toasts, id) {
  return toasts.filter((toast) => toast.id !== id);
}

export function shouldAutoDismissToast(toast) {
  return Number.isFinite(toast?.autoDismissMs) && toast.autoDismissMs > 0;
}

