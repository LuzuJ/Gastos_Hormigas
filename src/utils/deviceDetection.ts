/**
 * Utility to detect if the user is on a mobile device
 * Mobile devices should use signInWithRedirect instead of signInWithPopup
 * for better compatibility and user experience
 */
export const isMobileDevice = (): boolean => {
  // Check for mobile user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for common mobile patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
  const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
  
  // Check for touch support (additional indicator)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check for small screen size (typically mobile)
  const isSmallScreen = window.innerWidth <= 768;
  
  // Device is considered mobile if it matches UA pattern OR (has touch AND small screen)
  return isMobileUA || (hasTouch && isSmallScreen);
};
