import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScanRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track the last fully processed QR code - only reset on manual restart or different QR
  const lastProcessedQrRef = useRef<string>("");
  const [cameraId, setCameraId] = useState<string>("");
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>(
    []
  );

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        // Check if scanner is running before stopping
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        // Clear the scanner instance
        await scannerRef.current.clear();
      } catch (error) {
        console.warn("Error stopping scanner:", error);
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
  }, []);

  const startScanner = useCallback(async () => {
    // Stop any existing scanner first
    if (scannerRef.current) {
      await stopScanner();
    }

    if (!cameraId) {
      onScanError?.("No camera selected");
      return;
    }

    setScanMessage("");
    setIsProcessing(false);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          disableFlip: true, // Disable mirroring for front camera on laptops
          videoConstraints: {
            facingMode: "environment", // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        (decodedText: string) => {
          // Skip if currently processing
          if (isProcessing) {
            return;
          }

          // Skip if this is the same QR code that was already processed
          // Only allow re-scanning if:
          // 1. This is a different QR code than the last processed one, OR
          // 2. Manual restart was triggered (which clears lastProcessedQrRef)
          if (lastProcessedQrRef.current === decodedText) {
            return;
          }

          // This is either a new QR code or manual restart was triggered
          lastScanRef.current = decodedText;
          lastScanTimeRef.current = Date.now();
          lastProcessedQrRef.current = decodedText; // Mark this QR as processed
          setIsProcessing(true);
          setScanMessage(
            "QR Code scanned successfully! Ready for next scan..."
          );
          onScanSuccess(decodedText);

          if (autoRestart) {
            processingTimeoutRef.current = setTimeout(() => {
              setIsProcessing(false);
              setScanMessage("");
              // Note: We do NOT clear lastProcessedQrRef here
              // This prevents re-scanning the same QR until a different one is scanned
            }, restartDelay);
          } else {
            stopScanner();
          }
        },
        (errorMessage: string) => {
          // Ignore common "no QR code found" errors and canvas errors - these are normal
          if (
            errorMessage.includes("NotFoundException") ||
            errorMessage.includes("No MultiFormat Readers") ||
            errorMessage.includes("No barcode detected") ||
            errorMessage.includes("IndexSizeError") ||
            errorMessage.includes("source width is 0")
          ) {
            return;
          }

          // Only log and report actual scanning errors
          console.warn("QR Scanner warning:", errorMessage);

          // Don't report every scanning attempt as an error
          // Only report if it's a real configuration or permission issue
          if (
            errorMessage.includes("permission") ||
            errorMessage.includes("NotAllowedError") ||
            errorMessage.includes("camera") ||
            errorMessage.includes("device")
          ) {
            onScanError?.(errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Error starting scanner:", error);
      onScanError?.(error instanceof Error ? error.message : String(error));
      scannerRef.current = null;
    }
  }, [cameraId, onScanSuccess, autoRestart, restartDelay, stopScanner, onScanError, isProcessing]);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(
          devices.map((device) => ({
            id: device.id,
            label: device.label || `Camera ${device.id}`,
          }))
        );
        if (devices.length > 0) {
          setCameraId(devices[0].id);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras", err);
        if (onScanError) {
          onScanError(err.toString());
        }
      });
  }, [onScanError]);

  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      if (isActive && !isScanning && mounted && cameraId) {
        await startScanner();
      } else if (!isActive && isScanning && mounted) {
        await stopScanner();
      }
    };

    initScanner();

    return () => {
      mounted = false;
      // Cleanup on unmount
      if (scannerRef.current) {
        const cleanup = async () => {
          try {
            if (scannerRef.current?.isScanning) {
              await scannerRef.current.stop();
            }
            await scannerRef.current?.clear();
          } catch (error) {
            // Ignore errors during cleanup
          }
        };
        cleanup();
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, cameraId]);

  const manualRestart = () => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    setIsProcessing(false);
    setScanMessage("");
    lastScanRef.current = "";
    lastScanTimeRef.current = 0;
    // Clear the last processed QR to allow re-scanning the same code
    lastProcessedQrRef.current = "";

    if (!isScanning) {
      startScanner();
    }
  };

  return (
    <div className="qr-scanner">
      {isActive ? (
        <div className="space-y-4">
          {cameras.length > 0 && (
            <div className="mb-4">
              <select
                className="form-select block w-full mt-1"
                value={cameraId}
                onChange={async (e) => {
                  const newCameraId = e.target.value;
                  // Stop current scanner before changing camera
                  if (isScanning) {
                    await stopScanner();
                  }
                  setCameraId(newCameraId);
                }}
                disabled={isProcessing}
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div
            id="qr-reader"
            className="mx-auto max-w-lg"
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
              <p className="text-xs text-gray-500 font-mono">
                [CAMERA_ACTIVE] Point at QR codes to scan
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
