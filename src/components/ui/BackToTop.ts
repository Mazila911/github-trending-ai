/**
 * BackToTop - Vanilla JS floating button
 * Shows when scrolled > 500px, smooth scrolls to top on click.
 */

function initBackToTop() {
  const button = document.createElement('button');
  button.setAttribute('aria-label', '回到顶部');
  button.setAttribute('type', 'button');
  button.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17V3M10 3l-6 6M10 3l6 6"/></svg>`;

  Object.assign(button.style, {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    opacity: '0',
    visibility: 'hidden',
    transition: 'opacity 200ms ease-out, visibility 200ms ease-out, transform 200ms ease-out',
    zIndex: '50',
  });

  document.body.appendChild(button);

  let visible = false;

  function toggle() {
    const shouldShow = window.scrollY > 500;
    if (shouldShow === visible) return;
    visible = shouldShow;
    button.style.opacity = visible ? '1' : '0';
    button.style.visibility = visible ? 'visible' : 'hidden';
  }

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.backgroundColor = 'var(--color-bg-hover)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.backgroundColor = 'var(--color-bg-secondary)';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
  initBackToTop();
}
