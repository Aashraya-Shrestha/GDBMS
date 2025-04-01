import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, message, Spin } from "antd";
import QrScanner from "qr-scanner";
import "qr-scanner/qr-scanner-worker.min.js";

const QRScannerModal = ({ visible, onClose, onScanSuccess }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null);

  // List available cameras and select front-facing by default
  const listCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length === 0) {
        setCameraError("No cameras found");
        return [];
      }

      // Try to find front-facing camera
      const frontCamera = videoDevices.find(
        (device) =>
          device.label.toLowerCase().includes("front") ||
          device.label.includes("face") ||
          device.label.includes("user")
      );

      return {
        cameras: videoDevices,
        preferredCamera: frontCamera || videoDevices[0],
      };
    } catch (err) {
      setCameraError("Error detecting cameras: " + err.message);
      return [];
    }
  };

  const startScanner = async () => {
    try {
      if (!videoRef.current) return;

      setLoading(true);
      setCameraError(null);

      // Get camera list and select preferred one
      const { cameras, preferredCamera } = await listCameras();
      if (!preferredCamera) {
        setCameraError("No usable camera found");
        return;
      }

      setActiveCamera(preferredCamera);

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            const data = JSON.parse(result.data);
            onScanSuccess(data);
            stopScanner();
            onClose();
          } catch (err) {
            message.error("Invalid QR code format");
          }
        },
        {
          preferredCamera: preferredCamera.deviceId,
          maxScansPerSecond: 5,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          onDecodeError: (error) => {
            if (error !== "No QR code found") {
              console.error("Decoding error:", error);
            }
          },
        }
      );

      // Set video source to play inline for mobile browsers
      videoRef.current.setAttribute("playsinline", true);
      videoRef.current.setAttribute("webkit-playsinline", true);

      await qrScannerRef.current.start();
      setLoading(false);
    } catch (err) {
      console.error("Scanner error:", err);
      setCameraError("Failed to start camera: " + err.message);
      setLoading(false);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const switchCamera = async () => {
    if (!qrScannerRef.current) return;

    try {
      setLoading(true);
      const { cameras } = await listCameras();
      if (cameras.length < 2) {
        message.warning("No other camera available");
        return;
      }

      const currentIndex = cameras.findIndex(
        (cam) => cam.deviceId === activeCamera?.deviceId
      );
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamera = cameras[nextIndex];

      await qrScannerRef.current.setCamera(nextCamera.deviceId);
      setActiveCamera(nextCamera);
      message.success(`Switched to ${nextCamera.label || "camera"}`);
    } catch (err) {
      message.error("Failed to switch camera: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      // Double check permissions when modal opens
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
          setHasPermission(true);
          startScanner();
        })
        .catch((err) => {
          setCameraError("Camera access denied: " + err.message);
          setHasPermission(false);
        });
    } else {
      stopScanner();
    }

    return () => stopScanner();
  }, [visible]);

  return (
    <Modal
      title="Scan Member QR Code"
      open={visible}
      onCancel={() => {
        stopScanner();
        onClose();
      }}
      footer={null}
      width={500}
      centered
      destroyOnClose
    >
      {cameraError ? (
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">{cameraError}</p>
          <div className="space-y-2">
            <p className="text-gray-600">Troubleshooting steps:</p>
            <ul className="text-left text-sm text-gray-600 list-disc pl-5">
              <li>Refresh the page and allow camera access when prompted</li>
              <li>
                Check your browser settings to ensure camera access is allowed
              </li>
              <li>Make sure no other application is using the camera</li>
              <li>Try in Chrome or Firefox if using Safari</li>
              <li>
                Ensure your site is served over HTTPS (required for camera
                access)
              </li>
            </ul>
          </div>
          <Button
            type="primary"
            className="mt-4"
            onClick={() => {
              setCameraError(null);
              startScanner();
            }}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div style={{ position: "relative", width: "100%", height: "300px" }}>
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
                backgroundColor: "#000",
                transform: activeCamera?.label?.toLowerCase().includes("front")
                  ? "scaleX(-1)"
                  : "none",
              }}
              playsInline
              muted
            />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <Spin size="large" tip="Initializing camera..." />
                <p className="mt-4 text-white">Please wait...</p>
              </div>
            )}
            {!loading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "70%",
                  height: "70%",
                  border: "4px solid rgba(0, 255, 0, 0.5)",
                  borderRadius: "4px",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
          <div className="text-center mt-4 space-x-2">
            <Button type="primary" onClick={switchCamera} disabled={loading}>
              Switch Camera
            </Button>
            <p className="mt-2 text-gray-600">
              {activeCamera?.label || "Camera ready"}
            </p>
          </div>
        </>
      )}
    </Modal>
  );
};

export default QRScannerModal;
