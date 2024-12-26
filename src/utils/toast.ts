type ToastType = 'success' | 'error' | 'info';

class Toast {
  private show(message: string, type: ToastType) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `px-4 py-2 rounded-lg shadow-lg text-sm font-medium transform transition-all duration-300 opacity-0 translate-x-full ${
      type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' :
      type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
      'bg-blue-50 text-blue-600 border border-blue-100'
    }`;
    toast.textContent = message;

    // Add to container
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-x-full');
    });

    // Remove after delay
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        container.removeChild(toast);
        if (container.children.length === 0) {
          document.body.removeChild(container);
        }
      }, 300);
    }, 3000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }
}

export const toast = new Toast();