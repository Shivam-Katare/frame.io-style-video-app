"use client";
import {
  Search,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import AuthComponent from "./AuthComponent";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  VeltCommentsSidebar,
  VeltCommentPlayerTimeline,
  VeltSidebarButton,
  VeltComments,
  useCommentModeState,
  useVeltClient,
} from "@veltdev/react";
import VeltDocument from "./VeltDocument";

interface CommentClickDetail {
  commentId: string;
  location?: {
    currentMediaPosition?: number;
    [key: string]: any;
  };
}

interface HTMLVideoElementWithCurrentTime extends HTMLVideoElement {
  currentTime: number;
  pause: () => void;
  paused: boolean;
  play: () => Promise<void>;
  duration: number;
  muted: boolean;
  volume: number;
}

interface VeltLocation {
  id: string;
  locationName: string;
  currentMediaPosition: number;
  videoPlayerId: string;
  [key: string]: any;
}

export default function VideoComponent() {
  const { client } = useVeltClient();
  const videoRef = useRef<HTMLVideoElementWithCurrentTime | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const timePassedDivRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(144); // Manually set duration
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const commentModeState = useCommentModeState();

  // Removed: useSetDocumentId("video-collaboration-document"); // Now handled by YourDocument

  const updateCustomTimeline = useCallback(() => {
    if (videoRef.current && timePassedDivRef.current) {
      const seekPercent =
        (videoRef.current.currentTime / videoRef.current.duration) * 100 - 1.5;
      timePassedDivRef.current.style.width = `${seekPercent}%`;
    }
  }, [videoRef]);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        if (client) {
          client.removeLocation();
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [client]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      setVolume(videoRef.current.muted ? 0 : videoRef.current.volume);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) return;

      const newVolume = parseFloat(e.target.value) / 100;
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    },
    []
  );

  const handleVideoClick = useCallback(() => {
    togglePlayPause();
  }, [togglePlayPause]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true");

      if (event.code === "Space" && !isInputFocused) {
        event.preventDefault();
        togglePlayPause();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [togglePlayPause]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
      setCurrentTime(video.currentTime);
      updateCustomTimeline();
    };

    const handleVolumeChangeNative = () => {
      if (video) {
        setVolume(video.volume);
        setIsMuted(video.muted);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("pause", () => setIsPlaying(false));
    video.addEventListener("play", () => setIsPlaying(true));
    video.addEventListener("volumechange", handleVolumeChangeNative);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("pause", () => setIsPlaying(false));
      video.removeEventListener("play", () => setIsPlaying(false));
      video.removeEventListener("volumechange", handleVolumeChangeNative);
    };
  }, [videoRef, updateCustomTimeline]);

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
    setLocation();
  };

  function secondsToReadableTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const secs: number = Math.floor(seconds % 60);

    return [
      hours > 0 ? String(hours).padStart(2, "0") : null,
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ]
      .filter(Boolean)
      .join(":");
  }

  const setLocation = useCallback(() => {
    if (videoRef.current && client) {
      const location: VeltLocation = {
        id: secondsToReadableTime(videoRef.current.currentTime),
        locationName: secondsToReadableTime(videoRef.current.currentTime),
        currentMediaPosition: videoRef.current.currentTime,
        videoPlayerId: "videoPlayerId",
      };
      client.setLocation(location);
    }
  }, [client, videoRef]);

  useEffect(() => {
    if (commentModeState && videoRef.current && client) {
      videoRef.current.pause();
      setIsPlaying(false);
      setLocation();
    }
  }, [commentModeState, client, setLocation]);

  const handleCommentClick = useCallback(
    (
      event: React.MouseEvent<HTMLElement> & {
        detail?: CommentClickDetail;
      }
    ) => {
      const video = videoRef.current;
      const customDetail = (event as any).detail as
        | CommentClickDetail
        | undefined;

      if (customDetail?.location?.currentMediaPosition !== undefined && video) {
        if (video?.currentTime !== customDetail.location.currentMediaPosition) {
          (video as HTMLVideoElementWithCurrentTime).currentTime =
            customDetail.location.currentMediaPosition;
          setLocation();
          updateCustomTimeline();
        }
      }
    },
    [videoRef, setLocation, updateCustomTimeline]
  );

  const onTimelineCommentClick = useCallback(
    (
      event: React.MouseEvent<HTMLElement> & {
        detail?: CommentClickDetail;
        location: VeltLocation;
      }
    ) => {
      if (!!event) {
        // Destructure location from the event detail
        const { location } = event;

        const video =
          videoRef.current as HTMLVideoElementWithCurrentTime | null;
        if (video && location) {
          console.log(location);
          video.pause();
        }

        if (video?.paused) {
          (video as HTMLVideoElementWithCurrentTime).currentTime =
            location.currentMediaPosition;

          if (location && client) {
            client.setLocation(location as VeltLocation);
          }
        }
      }
    },
    [client, videoRef]
  );

  useEffect(() => {
    const commentSidebar = document.querySelector<HTMLElement>(
      "velt-comments-sidebar"
    );
    if (!commentSidebar) return;

    const wrappedHandleCommentClick = (event: MouseEvent) => {
      const customEvent: React.MouseEvent<HTMLElement> & {
        detail?: CommentClickDetail;
      } = event as any;

      handleCommentClick(customEvent);
    };

    commentSidebar.addEventListener(
      "onCommentClick",
      wrappedHandleCommentClick as EventListener
    );

    return () => {
      commentSidebar.removeEventListener(
        "onCommentClick",
        wrappedHandleCommentClick as EventListener
      );
    };
  }, [handleCommentClick]);

  const handleVideoContainerMouseMove = () => {
    setShowControls(true);
    clearTimeout((window as any).controlsTimeout);

    (window as any).controlsTimeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      clearTimeout((window as any).controlsTimeout);
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center justify-between w-full p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              VideoSync
            </h1>
            <div className="relative w-[400px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
          <AuthComponent />
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        <div
          ref={videoContainerRef}
          className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg"
          onMouseMove={handleVideoContainerMouseMove}
          onClick={handleVideoClick}
          id="videoPlayerId"
        >
          <video
            ref={videoRef}
            src="/video/main-video.mp4"
            className="w-full h-full object-contain"
            poster="/video/video-cover.png"
          >
            <source src="/video/main-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <VeltComments allowedElementQuerySelectors={["#videoPlayerId"]} />

          <div
            className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="mb-4">
              <div
                className="relative h-1 bg-gray-700/50 cursor-pointer"
                ref={progressBarRef}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSeek(e);
                }}
              >
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${progress}%` }}
                ></div>
                <div
                  className="absolute bottom-0 left-0 h-full bg-red-500"
                  ref={timePassedDivRef}
                  style={{ width: `0%` }}
                ></div>

                <div className="relative h-full">
                  <VeltCommentPlayerTimeline
                    videoPlayerId="videoPlayerId"
                    totalMediaLength={duration}
                    onCommentClick={onTimelineCommentClick}
                    shadowDom={true}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="text-white hover:text-blue-400 transition-colors duration-200"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume * 100}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                        isMuted ? 0 : volume * 100
                      }%, #4B5563 ${
                        isMuted ? 0 : volume * 100
                      }%, #4B5563 100%)`,
                    }}
                  />
                </div>

                <div className="text-white text-sm font-mono">
                  {secondsToReadableTime(currentTime)} /{" "}
                  {secondsToReadableTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <VeltDocument />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6">
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Big Buck Bunny
                  </h1>
                  <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>123,456 views</span>
                    <span className="mx-2">•</span>
                    <span>Published on Apr 15, 2023</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                    <ThumbsUp className="h-5 w-5" />
                    <span>1.2K</span>
                  </button>
                  <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                    <Bookmark className="h-5 w-5" />
                    <span>Save</span>
                  </button>
                  <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  Big Buck Bunny is a short animated film by the Blender
                  Institute, part of the Blender Foundation. The film features a
                  large and lovable rabbit who takes on three rodent bullies.
                </p>
                <button className="mt-2 text-blue-500 font-medium hover:underline">
                  Show more
                </button>
              </div>
            </div>

            <div id="comment-section" className="mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments
                </h2>
                <VeltCommentsSidebar onCommentClick={handleCommentClick} />
                <VeltSidebarButton />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Up Next</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex gap-2">
                  <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0">
                    <Image
                      src="/video/video-cover.png"
                      width={500}
                      height={500}
                      alt="video-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">
                      Related Video {item}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Channel Name
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      5K views • 3 days ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 VideoSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
