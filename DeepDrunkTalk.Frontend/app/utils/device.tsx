export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  if (/iPhone|iPad|iPod/.test(userAgent) && !(window as any).MSStream) {
    return true;
  }

  if (/Android/.test(userAgent)) {
    return true;
  }

  if (/Mobi|BlackBerry|IEMobile|Opera Mini|Windows Phone|webOS/.test(userAgent)) {
    return true;
  }

  return false;
};
