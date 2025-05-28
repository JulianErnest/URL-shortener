import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  url: string;
  size?: number;
}

export const QRCode = ({ url, size = 200 }: QRCodeProps) => {
  return (
    <QRCodeSVG
      value={url}
      size={size}
      bgColor="transparent"
      fgColor="white"
      level="H"
      includeMargin={false}
    />
  );
}; 