import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (qrCodeData: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  isActive,
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isActive && !isScanning) {
      startScanner();
    } else if (!isActive && isScanning) {
      stopScanner();
    }

    return () => {
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [isActive]);

  const startScanner = () => {
    if (scannerRef.current) {
      stopScanner();
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        stopScanner();
      },
      (error) => {
        // Only log actual errors, not "No QR code found"
        if (error.includes("NotFoundException")) {
          return;
        }
        onScanError?.(error);
      }
    );

    scannerRef.current = scanner;
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.warn("Error clearing scanner:", error);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <div className="qr-scanner">
      {isActive ? (
        <div className="space-y-4">
          <div
            id="qr-reader"
            className="mx-auto max-w-sm"
            style={{ width: "100%" }}
          />
          <div className="text-center">
            <button onClick={stopScanner} className="btn-secondary">
              Stop Scanner
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4m-4 0v1m-6-1v4"
              />
            </svg>
          </div>
          <p className="text-gray-600">QR Scanner is not active</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
