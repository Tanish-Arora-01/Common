import { useState, useRef, useEffect } from "react";

/**
 * useAudioPlayer hook for managing audio playback
 * @param {string} audioUrl - The URL of the audio file to play
 * @returns {object} - { isPlaying, duration, currentTime, play, pause, togglePlayPause }
 */
export const useAudioPlayer = (audioUrl) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [audioUrl]);

  // Smooth time tracking using requestAnimationFrame
  useEffect(() => {
    let animationFrameId;
    
    const updateTime = () => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameId = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      // Ensure time is perfectly aligned when pausing
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return {
    isPlaying,
    duration,
    currentTime,
    play,
    pause,
    togglePlayPause,
  };
};
