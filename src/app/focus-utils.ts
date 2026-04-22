export function focusActionButton(actionName: string): void {
  if (!actionName) return;
  queueMicrotask(() => {
    [...document.querySelectorAll<HTMLElement>(`[data-action="${actionName}"]`)]
      .find((el) => !el.hidden && el.offsetParent !== null)
      ?.focus();
  });
}

export function focusSelector(selector: string): void {
  if (!selector) return;
  queueMicrotask(() => {
    [...document.querySelectorAll<HTMLElement>(selector)]
      .find((el) => !el.hidden && el.offsetParent !== null)
      ?.focus();
  });
}

export function focusModalCancelButton(): void {
  queueMicrotask(() => {
    document.querySelector<HTMLElement>('#modal-root [data-modal-focus="cancel"]')?.focus();
  });
}
