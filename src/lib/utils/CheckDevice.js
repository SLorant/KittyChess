const isUserUsingMobile = () => {
  // User agent string method
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Screen resolution method
  if (!isMobile) {
    let screenWidth = window.screen.width;
    let screenHeight = window.screen.height;
    isMobile = screenWidth < 768 || screenHeight < 768;
  }

  // CSS media queries method
  if (!isMobile) {
    let bodyElement = document.getElementsByTagName("body")[0];
    isMobile = window.getComputedStyle(bodyElement).getPropertyValue("content").indexOf("mobile") !== -1;
  }

  return isMobile;
};
export default isUserUsingMobile;
