<script>
  let { modalConfig, locale } = $props();

  function handleModalKeydown(event) {
    const modalDialog = document.querySelector('#modal-root [role="dialog"]');
    if (!modalDialog) return;
    const focusables = [...modalDialog.querySelectorAll('button:not([disabled])')];
    if (event.key === 'Escape') {
      event.preventDefault();
      modalDialog.querySelector('[data-modal-focus="cancel"]')?.click();
      return;
    }
    if (event.key === 'Enter' && modalDialog.contains(event.target)) {
      event.preventDefault();
      modalDialog.querySelector('[data-modal-focus="confirm"]')?.click();
      return;
    }
    if (event.key === 'Tab' && focusables.length) {
      const first = focusables[0];
      const last = focusables.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
</script>

<div id="modal-root">
  {#if modalConfig}
    <div class="modal-backdrop">
      <div
        class="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        tabindex="-1"
        onkeydown={handleModalKeydown}
      >
        <h2 id="modal-title">{modalConfig.title}</h2>
        <p id="modal-description">{modalConfig.description}</p>
        <div class="button-row confirmation-actions">
          <button
            type="button"
            class="button button-secondary"
            data-action={modalConfig.cancelAction}
            data-modal-focus="cancel"
            onclick={modalConfig.onCancel}
          >{locale.t('modal.cancel')}</button>
          <button
            type="button"
            class="button button-danger"
            data-action={modalConfig.confirmAction}
            data-modal-focus="confirm"
            onclick={modalConfig.onConfirm}
          >{modalConfig.confirmLabel}</button>
        </div>
      </div>
    </div>
  {/if}
</div>
