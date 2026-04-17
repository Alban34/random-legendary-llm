export function focusActionButton(actionName) {
  if (!actionName) return;
  queueMicrotask(() => {
    [...document.querySelectorAll(`[data-action="${actionName}"]`)]
      .find((el) => !el.hidden && el.offsetParent !== null)
      ?.focus();
  });
}

export function focusSelector(selector) {
  if (!selector) return;
  queueMicrotask(() => {
    [...document.querySelectorAll(selector)]
      .find((el) => !el.hidden && el.offsetParent !== null)
      ?.focus();
  });
}

export function focusModalCancelButton() {
  queueMicrotask(() => {
    document.querySelector('#modal-root [data-modal-focus="cancel"]')?.focus();
  });
}
