// 產生浮水印樣式物件 (支援旋轉與位置定位)
export const getWatermarkStyle = (watermarkText, watermarkPos, watermarkColor, watermarkOpacity, watermarkFontSize, watermarkRotate) => {
  const baseStyle = {
    position: 'absolute',
    color: watermarkColor,
    opacity: watermarkOpacity,
    fontWeight: 'bold',
    pointerEvents: 'none',
    zIndex: 9999,
    whiteSpace: 'nowrap',
    fontFamily: 'sans-serif',
    fontSize: `${watermarkFontSize}px`,
    transformOrigin: 'center', // 確保旋轉中心正確
  };

  if (watermarkPos === 'center') {
    return {
      ...baseStyle,
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) rotate(${watermarkRotate}deg)`,
      padding: '10px 40px',
    };
  }

  const cornerStyle = {
    ...baseStyle,
    transform: `rotate(${watermarkRotate}deg)`
  };

  if (watermarkPos.includes('top')) cornerStyle.top = '20px';
  if (watermarkPos.includes('bottom')) cornerStyle.bottom = '20px';
  if (watermarkPos.includes('left')) cornerStyle.left = '20px';
  if (watermarkPos.includes('right')) cornerStyle.right = '20px';

  return cornerStyle;
};
