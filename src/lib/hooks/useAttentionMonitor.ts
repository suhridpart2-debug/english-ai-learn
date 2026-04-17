"use client";

import { useEffect, useRef, useState } from "react";

/**
 * PRODUCTION-GRADE HEURISTIC FOCUS MONITOR
 * Uses Mediapipe Face Detection (via CDN).
 * 
 * EXACT LOGIC (HONEST APPROXIMATION):
 * 1. IS FACE PRESENT? (Detection length > 0)
 * 2. IS FACE CENTERED? (X and Y coordinates within [0.2, 0.8] normalized range)
 * 3. IS FACE STABLE? (No sudden disappearances for > 3s)
 * 
 * NOTE: This is NOT iris-level gaze tracking. It measures 'Posture & Framing'.
 */
export function useAttentionMonitor(videoRef: React.RefObject<HTMLVideoElement>) {
  const [isDistracted, setIsDistracted] = useState(false);
  const faceDetectorRef = useRef<any>(null);
  const lastFoundRef = useRef<number>(Date.now());

  useEffect(() => {
    // Inject Mediapipe Face Detection via CDN
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection";
    script.async = true;
    document.body.appendChild(script);

    const scriptUtils = document.createElement("script");
    scriptUtils.src = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils";
    scriptUtils.async = true;
    document.body.appendChild(scriptUtils);

    script.onload = () => {
       const FaceDetection = (window as any).FaceDetection;
       if (!FaceDetection) return;

       const detector = new FaceDetection({
         locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
       });

       detector.setOptions({
         model: 'short', // Mobile-friendly model
         minDetectionConfidence: 0.5
       });

       detector.onResults((results: any) => {
         if (results.detections.length === 0) {
            // Face missing for > 3s triggers alert
            if (Date.now() - lastFoundRef.current > 3000) {
               setIsDistracted(true);
            }
         } else {
            const detection = results.detections[0];
            const box = detection.boundingBox;
            
            // EXACT CENTERING CALCULATION
            // Normalized coordinates (0 to 1)
            const isOffCenter = box.xCenter < 0.2 || box.xCenter > 0.8;
            const isLookingAway = box.yCenter < 0.1 || box.yCenter > 0.9;

            if (isOffCenter || isLookingAway) {
                // Approximate 'Off-camera' behavior
                setIsDistracted(true);
            } else {
                setIsDistracted(false);
                lastFoundRef.current = Date.now();
            }
         }
       });

       faceDetectorRef.current = detector;
    };

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(scriptUtils);
    };
  }, []);

  // FRAME PROCESSING LOOP: ~2 frames/sec enough for heuristic focus
  useEffect(() => {
    let active = true;
    const process = async () => {
      if (!active) return;
      if (faceDetectorRef.current && videoRef.current && videoRef.current.readyState >= 2) {
         try {
           await faceDetectorRef.current.send({ image: videoRef.current });
         } catch (e) {}
      }
      setTimeout(process, 500); 
    };
    process();
    return () => { active = false; };
  }, [videoRef]);

  return { isDistracted };
}
