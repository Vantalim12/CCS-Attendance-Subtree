import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (qrCodeData: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
  autoRestart?: boolean; // New prop to enable auto-restart
  restartDelay?: number; // Delay in milliseconds before allowing next scan (default: 3000ms)
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
  isActive,
  autoRestart = true, // Default to true for continuous scanning
  restartDelay = 3000, // Default 3 second delay before next scan is allowed
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScanRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [isActive]);

  const startScanner = () => {
    if (scannerRef.current) {
      stopScanner();
    }

    setScanMessage("");
    setIsProcessing(false);

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
        const now = Date.now();

        // Prevent scanning the same code or scanning too quickly
        if (
          isProcessing ||
          (lastScanRef.current === decodedText &&
            now - lastScanTimeRef.current < restartDelay)
        ) {
          return;
        }

        // Update last scan info
        lastScanRef.current = decodedText;
        lastScanTimeRef.current = now;
        setIsProcessing(true);

        // Show success message
        setScanMessage("QR Code scanned successfully! Ready for next scan...");

        // Call the success handler
        onScanSuccess(decodedText);

        if (autoRestart) {
          // Clear processing state after delay to allow next scan
          processingTimeoutRef.current = setTimeout(() => {
            setIsProcessing(false);
            setScanMessage("");
          }, restartDelay);
        } else {
          // If auto-restart is disabled, stop the scanner
          stopScanner();
        }
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
    setIsProcessing(false);
    setScanMessage("");

    // Clear any pending timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  };

  const manualRestart = () => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    setIsProcessing(false);
    setScanMessage("");
    lastScanRef.current = "";
    lastScanTimeRef.current = 0;

    if (!isScanning) {
      startScanner();
    }
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

          {scanMessage && (
            <div className="text-center p-3 bg-green-100 border border-green-300 rounded-md">
              <p className="text-green-700 text-sm">{scanMessage}</p>
            </div>
          )}

          {isProcessing && autoRestart && (
            <div className="text-center p-3 bg-blue-100 border border-blue-300 rounded-md">
              <p className="text-blue-700 text-sm">
                Processing... Next scan will be available in{" "}
                {Math.ceil(restartDelay / 1000)} seconds
              </p>
            </div>
          )}

          <div className="text-center space-x-2">
            <button onClick={stopScanner} className="btn-secondary">
              Stop Scanner
            </button>
            {(!isScanning || isProcessing) && (
              <button onClick={manualRestart} className="btn-primary">
                {isScanning ? "Scan Again" : "Restart Scanner"}
              </button>
            )}
          </div>

          {autoRestart && isScanning && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                📷 Camera is running continuously - point at QR codes to scan
              </p>
            </div>
          )}
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
