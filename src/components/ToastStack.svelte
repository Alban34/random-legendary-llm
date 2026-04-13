<script>
  let { toasts, locale, onDismiss, onPause, onResume } = $props();
</script>

<div class="toast-stack" role="region" aria-label={locale.t('toast.region')}>
  {#each toasts as toast, i (toast.id)}
    {@const actionLabel = toast.isPersistent ? locale.t('toast.acknowledge') : locale.t('toast.dismiss')}
    <article
      class={"toast toast-" + toast.variant + " toast-" + toast.behavior}
      role={toast.live === 'assertive' ? 'alert' : 'status'}
      aria-live={toast.live}
      data-toast-id={toast.id}
      data-toast-dismiss-on-click={toast.dismissOnClick ? 'true' : 'false'}
      data-toast-auto-dismiss={toast.autoDismissMs ? 'true' : 'false'}
      data-toast-behavior={toast.behavior}
      onmouseenter={() => { if (toast.autoDismissMs) onPause(toast.id); }}
      onmouseleave={() => { if (toast.autoDismissMs) onResume(toast.id); }}
      onfocusin={() => { if (toast.autoDismissMs) onPause(toast.id); }}
      onfocusout={() => { if (toast.autoDismissMs) onResume(toast.id); }}
      onclick={(e) => {
        if (toast.dismissOnClick && !e.target.closest('[data-action="dismiss-toast"]')) {
          onDismiss(toast.id);
        }
      }}
    >
      <div class="toast-copy">
        <div class="toast-title">{toast.icon} {toast.label}</div>
        {#if toast.isPersistent}
          <div class="toast-meta">{locale.t('toast.persistent')}</div>
        {/if}
        <div>{toast.message}</div>
      </div>
      {#if toast.dismissible}
        <button
          type="button"
          class="button button-secondary toast-dismiss"
          data-action="dismiss-toast"
          data-toast-id={toast.id}
          aria-label={actionLabel + " " + toast.label + " notification"}
          onclick={() => {
            const fallback = toasts[i + 1] || toasts[i - 1] || null;
            onDismiss(toast.id, { focusToastId: fallback?.id ?? null });
          }}
        >{actionLabel}</button>
      {/if}
    </article>
  {/each}
</div>
