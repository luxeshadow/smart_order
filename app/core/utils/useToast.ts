export const useToast = () => {
  const showToast = (
    text: string, 
    icon: string = 'fi-rr-info', 
    type: 'success' | 'error' | 'normal' = 'normal',
    color: string = '#1a1a1a'
  ) => {
    if (!import.meta.client) return;

    const lib = (window as any).Toastify;

    if (lib) {
      lib({
        text: `
          <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fi ${icon}" style="font-size: 20px; color: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ecc71' : color}; flex-shrink: 0;"></i>
            <span style="font-weight: 500; font-family: 'Inter', sans-serif; font-size: 14px;">${text}</span>
          </div>
        `,
        duration: 3500,
        gravity: "bottom",
        position: "center",
        stopOnFocus: true,
        escapeMarkup: false,
        style: {
          background: "white",
          color: "#1a1a1a",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          padding: "12px 20px",
         
          maxWidth: "calc(100% - 30px)",
          width: "fit-content",
          display: "inline-block" 
        }
      }).showToast();
    } else {
      setTimeout(() => showToast(text, icon, type, color), 300);
    }
  }

  return { showToast }
}