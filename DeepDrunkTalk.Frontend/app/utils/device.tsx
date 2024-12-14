export const isMobileDevice = () => {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|webOS|Mobile/i.test(navigator.userAgent);
};
