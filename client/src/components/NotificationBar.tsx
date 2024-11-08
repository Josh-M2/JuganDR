import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { Transition } from "@headlessui/react";
import bell from "./../assets/bell.svg";
import notifBellSound from "./../assets/sound-bell.mp4";

interface NotificationData {
  id: number;
  timestamp: string;
  isVisible: boolean;
}

const NotificationBar = React.forwardRef((props, ref) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const MAX_NOTIFICATIONS = 5;

  // Function to add a new notification
  const addNotification = () => {
    const timestamp = new Date().toLocaleTimeString();
    const newNotification = {
      id: Date.now(),
      timestamp,
      isVisible: true,
    };

    setNotifications((prev) => {
      const updatedNotifications = [...prev, newNotification].slice(
        0,
        MAX_NOTIFICATIONS
      );

      setTimeout(() => {
        setNotifications((current) =>
          current.map((n) =>
            n.id === newNotification.id ? { ...n, isVisible: false } : n
          )
        );
      }, 60000); // 1 minute

      setTimeout(() => {
        setNotifications((current) =>
          current.filter((n) => n.id !== newNotification.id)
        );
      }, 60000 + 500); // 1 minute + transition time (0.5s)
      playNotificationSound();
      return updatedNotifications;
    });
  };

  const removeNotification = (id: number) => {
    // First, set `isVisible` to false to trigger fade-out transition
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isVisible: false } : n))
    );

    // Remove from state after transition completes (0.5s)
    setTimeout(() => {
      setNotifications((current) => current.filter((n) => n.id !== id));
    }, 500); // Transition duration
  };

  const playNotificationSound = () => {
    const audio = new Audio(notifBellSound);
    // Attempt to play the audio and handle potential autoplay errors
    audio
      .play()
      .then(() => {
        console.log("Notification sound played");
      })
      .catch((error) => {
        console.error("Playback failed:", error);
        // Optionally, you could prompt the user to interact with the page
      });
  };

  // Expose addNotification to parent via ref
  useImperativeHandle(ref, () => ({
    addNotification,
    playNotificationSound,
  }));

  return (
    <div className="relative">
      {/* Button is still here, but we'll trigger it externally now */}
      <button
        onClick={addNotification}
        className="absolute top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none hidden"
      >
        Add Notification
      </button>
      <button onClick={playNotificationSound} className="hidden">
        Play Notification Sound
      </button>

      {/* Notification Stack */}
      <div className="fixed bottom-[75px] right-5 space-y-2 w-80 z-10 flex flex-col-reverse gap-1">
        {notifications.map((notification) => (
          <Transition
            key={notification.id}
            show={notification.isVisible}
            enter="transition-opacity duration-500 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-500 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-white border border-gray-200 shadow-md rounded-lg p-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <img src={bell} alt="bell" className="w-auto h-8" />
                <div>
                  <span className="text-gray-800 font-semibold">
                    New incoming request!
                  </span>
                  <p className="text-sm text-gray-500">
                    Check the request in dashboard now!
                  </p>
                  <p className="text-xs text-gray-400">
                    Time: {notification.timestamp}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none ml-4"
              >
                &times;
              </button>
            </div>
          </Transition>
        ))}
      </div>
    </div>
  );
});

export default NotificationBar;
