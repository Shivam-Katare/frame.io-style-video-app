import { Search } from "lucide-react";
import AuthComponent from "./AuthComponent";
import React, {
  useEffect,
  useState,
  useRef,
  MouseEvent as ReactMouseEvent,
} from "react";
import {
  VeltCommentsSidebar,
  VeltCommentPlayerTimeline,
  VeltSidebarButton,
  VeltComments,
  useCommentModeState,
  useVeltClient,
} from "@veltdev/react";
import VeltDocument from "./VeltDocument";

interface HTMLVideoElementWithCurrentTime extends HTMLVideoElement {
  currentTime: number;
  pause: () => void;
  paused: boolean;
  play: () => void;
  duration: number;
}

interface TimelineCommentDetail {
  location?: {
    currentMediaPosition?: number;
    // Add other properties of your 'location' object if they exist
    [key: string]: any; // To allow other potential properties
  };
}

interface VeltLocation {
  id: string;
  locationName: string;
  currentMediaPosition: number;
  videoPlayerId: string;
  [key: string]: any; // To allow other potential properties
}

export default function VideoComponent() {
  const { client } = useVeltClient();
  const videoRef = useRef<HTMLVideoElementWithCurrentTime | null>(null);
  const commentPlayerTimelineRef = useRef<VeltCommentPlayerTimeline | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const timePassedDivRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const commentModeState = useCommentModeState();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
      updateCustomTimeline();
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("pause", () => setIsPlaying(false));
    video.addEventListener("play", () => setIsPlaying(true));

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("pause", () => setIsPlaying(false));
      video.removeEventListener("play", () => setIsPlaying(false));
    };
  }, [videoRef]);

  const handleSeek = (
    event: ReactMouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const newTime = (offsetX / rect.width) * video.duration;
    video.currentTime = newTime;
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

  const setLocation = () => {
    if (videoRef.current && client) {
      const location: VeltLocation = {
        id: secondsToReadableTime(videoRef.current.currentTime),
        locationName: secondsToReadableTime(videoRef.current.currentTime),
        currentMediaPosition: videoRef.current.currentTime,
        videoPlayerId: "videoPlayerId",
      };
      client.setLocation(location);
    }
  };

  useEffect(() => {
    if (commentModeState && videoRef.current && client) {
      togglePlayPause();
      setLocation();
    }
  }, [commentModeState, videoRef.current, client]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const updateCustomTimeline = () => {
    if (videoRef.current && timePassedDivRef.current) {
      const seekPercent =
        (videoRef.current.currentTime / videoRef.current.duration) * 100 - 1.5;
      timePassedDivRef.current.style.width = `${seekPercent}%`;
    }
  };

  const handleCommentClick = (
    event: ReactMouseEvent<HTMLElement, MouseEvent> & {
      detail?: TimelineCommentDetail;
    }
  ) => {
    const video = videoRef.current;
    const customDetail = (event as any).detail as TimelineCommentDetail | undefined;

    if (customDetail?.location?.currentMediaPosition !== undefined && video) {
      if (video.currentTime !== customDetail.location.currentMediaPosition) {
        (video as HTMLVideoElementWithCurrentTime).currentTime =
          customDetail.location.currentMediaPosition;
        setLocation();
        updateCustomTimeline();
      }
    }
  };

  const onTimelineCommentClick = (
    event: ReactMouseEvent<HTMLElement, MouseEvent> & {
      detail?: TimelineCommentDetail;
    }
  ) => {
    if (event) {
      const { location } = (event as any).detail || {};

      const video = videoRef.current;
      if (video) {
        video.pause();
      }

      if (location?.currentMediaPosition !== undefined && video?.paused) {
        // Seek to the given comment media position
        (video as HTMLVideoElementWithCurrentTime).currentTime =
          location.currentMediaPosition;

        // Set the Velt Location to the clicked comment location
        if (location) {
          client.setLocation(location as VeltLocation);
        }
      }
    }
  };

  useEffect(() => {
    const commentSidebar = document.querySelector<HTMLElement>("velt-comments-sidebar");
    if (!commentSidebar) return;

    commentSidebar.addEventListener("onCommentClick", handleCommentClick as EventListener);

    if (!commentPlayerTimelineRef.current) return;

    commentPlayerTimelineRef.current.addEventListener(
      "onCommentClick",
      handleCommentClick as EventListener
    );

    return () => {
      if (commentSidebar) {
        commentSidebar.removeEventListener("onCommentClick", handleCommentClick as EventListener);
      }
      if (commentPlayerTimelineRef.current) {
        commentPlayerTimelineRef.current.removeEventListener(
          "onCommentClick",
          handleCommentClick as EventListener
        );
      }
    };
  }, [handleCommentClick, commentPlayerTimelineRef]);

  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between w-full p-4">
        <div className="relative w-[75%]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full pl-12 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          />
        </div>
        <AuthComponent />
      </div>

      <div className="w-full mt-6 px-4">
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            id="videoPlayerId"
            ref={videoRef}
            src="/video/main-video.mp4"
            className="w-full h-full object-cover border"
            controls
            poster="/video/video-cover.png"
          >
            <source src="/video/main-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div
            className="absolute bottom-0 left-0 w-full h-2 bg-gray-200 cursor-pointer"
            ref={progressBarRef}
            onClick={handleSeek}
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
          </div>

          <VeltCommentPlayerTimeline
            videoPlayerId="videoPlayerId"
            totalMediaLength={144}
            ref={commentPlayerTimelineRef}
            onTimelineCommentClick={onTimelineCommentClick}
          />
        </div>
        <div className="mt-4 flex">
          <h1 className="text-xl font-bold">Big Buck Bunny</h1>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <span>123,456 views</span>
            <span className="mx-2">•</span>
            <span>Published on Apr 15, 2023</span>
          </div>
        </div>
        <>
          {" "}
          {/* Changed here */}
          <div id="comment-section" className="pl-16 pb-6">
            <VeltComments
              mode="stream"
              allowedElementQuerySelectors={["#videoPlayerId"]}
              defaultIsOpen={true}
            />
            <VeltDocument />
            <VeltCommentsSidebar onCommentClick={handleCommentClick} />
            <VeltSidebarButton />
          </div>
          {isPlaying ? <p>Video is playing</p> : <p>Video is paused</p>}
        </>{" "}
        {/* and here */}
      </div>
    </div>
  );
}