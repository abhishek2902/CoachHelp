import Swal from 'sweetalert2';

const baseConfig = {
  background: "#f9fafb",
  color: "#1f2937",
  width: "min(90%, 500px)",
  padding: "1.5em",
  customClass: {
    popup: 'custom-swal-popup',
    title: 'custom-swal-title',
    confirmButton: 'custom-swal-confirm-button',
    htmlContainer: 'custom-swal-text',
  },
};

export const showSuccessAlert = (title = "Success!", text = "") => {
  Swal.fire({
    ...baseConfig,
    icon: "success",
    title,
    text,
    confirmButtonColor: "#10b981", // green
    iconColor: "#10b981",
  });
};

export const showErrorAlert = (title = "Oops!", text = "") => {
  Swal.fire({
    ...baseConfig,
    icon: "error",
    title,
    text,
    confirmButtonColor: "#ef4444", // red
    iconColor: "#ef4444",
  });
};

export const showWarningAlert = (title = "Warning!", text = "") => {
  Swal.fire({
    ...baseConfig,
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#f59e0b", // amber
    iconColor: "#f59e0b",
  });
};

export const showInfoAlert = (title = "Info", text = "") => {
  Swal.fire({
    ...baseConfig,
    icon: "info",
    title,
    text,
    confirmButtonColor: "#3b82f6", // blue
    iconColor: "#3b82f6",
  });
};

export const showConfirmAlert = async ({ title = "Are you sure?", text = "", confirmText = "Yes", cancelText = "Cancel" }) => {
    return Swal.fire({
      ...baseConfig,
      icon: "warning",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
    });
  };

const originalTitle = document.title;
const originalFavicon = document.querySelector("link[rel='icon']");
const originalFaviconHref = originalFavicon?.href || "/favicon.ico"; // fallback

export function grabTabAttention({ 
  title = "⚠️ Attention Needed!", 
  duration = 3000, 
  favicon = "/alert-icon.ico" // <-- your custom warning icon
}) {
  // Change the document title
  document.title = title;

  // Change the favicon
  if (favicon) {
    changeFavicon(favicon);
  }

  // Restore title and favicon after duration
  setTimeout(() => {
    document.title = originalTitle;
    changeFavicon(originalFaviconHref);
  }, duration);
}

function changeFavicon(href) {
  let link = document.querySelector("link[rel*='icon']");

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.type = 'image/x-icon';
  link.href = href;
}

export const showAlertWithRedirect = (config, navigate) => {
  Swal.fire({
    title: config.title || 'Notification',
    text: config.text || '',
    icon: config.icon || 'info',
    confirmButtonText: config.confirmButtonText || 'OK',
    confirmButtonColor: '#10B981',
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed && config.redirectPath && navigate) {
      navigate(config.redirectPath);
    }
  });
};