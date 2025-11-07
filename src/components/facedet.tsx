import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { toast } from "sonner";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

const FaceDetection = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isFaceVisible, setIsFaceVisible] = useState(true);
  const [hasNotified, setHasNotified] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };
  if(consecutiveFailures){
    console.log(consecutiveFailures);
  }

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setIsFaceVisible(true);
    setHasNotified(false);
    setConsecutiveFailures(0);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (
        isCameraOn &&
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        faceapi.nets.tinyFaceDetector.params
      ) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }) // improved input size
        );

        const faceDetected = detections.length > 0;

        if (faceDetected) {
          setConsecutiveFailures(0);
          setIsFaceVisible(true);
          if (hasNotified) setHasNotified(false);
        } else {
          setConsecutiveFailures((prev) => {
            const newCount = prev + 1;

            if (newCount >= 3 && !hasNotified) {
              toast.warning("Face not detected. Please stay in the frame.");
              setHasNotified(true);
              setIsFaceVisible(false);
            }

            return newCount;
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCameraOn, hasNotified]);

  return (
    <div className="flex flex-col items-center mt-4">
      <button
        onClick={isCameraOn ? stopVideo : startVideo}
        className="mb-4 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
      >
        {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
      </button>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="320"
        height="240"
        style={{ borderRadius: 15 }}
        className={`rounded-lg shadow-lg w-full min-h-11 object-cover ${isCameraOn ? "" : "hidden"}`}
      />

      {!isFaceVisible && isCameraOn && (
        <p className="mt-4 text-red-600 font-semibold">
          Face not detected. Please stay in the frame.
        </p>
      )}
    </div>
  );
};

export default FaceDetection;
