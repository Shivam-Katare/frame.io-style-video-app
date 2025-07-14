// "use client";
// import { useIdentify } from "@veltdev/react";
// import { useState, useRef, useEffect } from "react"; // Import useRef and useEffect
// import Image from 'next/image';

// export default function AuthComponent() {
//   // Define multiple user profiles
//   const userProfiles = {
//     johnDoe: {
//       uid: "123",
//       organizationId: "organizationId123",
//       displayName: "John Doe",
//       email: "johndoe@gmail.com",
//       photoURL: "/video/profile-pic.jpeg", // Make sure this path is correct or accessible
//       color: "#008000",
//       textColor: "#FFFFFF",
//     },
//     janeSmith: {
//       uid: "456",
//       organizationId: "organizationId123",
//       displayName: "Jane Smith",
//       email: "janesmith@example.com",
//       photoURL: "/video/profile-pic-jane.png", // Ensure you have this image or change to a valid path
//       color: "#FF5733",
//       textColor: "#FFFFFF",
//     },
//     // Add more user profiles here if needed
//   };

//   // State to manage which user is currently "logged in"
//   const [currentUserKey, setCurrentUserKey] = useState<'johnDoe' | 'janeSmith'>('johnDoe');
//   // State to manage dropdown visibility
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   // Ref for the dropdown container to detect clicks outside
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const yourAuthenticatedUser = userProfiles[currentUserKey];

//   // 2) Fetch the relevant User info from yourAuthenticatedUser
//   const {
//     uid,
//     displayName,
//     email,
//     photoURL,
//     organizationId,
//     color,
//     textColor,
//   } = yourAuthenticatedUser;

//   // Create the Velt user object
//   const veltUser = {
//     userId: uid,
//     organizationId: organizationId,
//     name: displayName,
//     email: email,
//     photoUrl: photoURL,
//     color: color,
//     textColor: textColor,
//   };

//   //3) Pass the user object to the SDK
//   useIdentify(veltUser);

//   // Function to switch between users
//   const switchUser = (key: 'johnDoe' | 'janeSmith') => {
//     setCurrentUserKey(key);
//     setIsDropdownOpen(false); // Close dropdown after selection
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={dropdownRef}>
//       {/* Clickable user display */}
//       <div
//         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "10px",
//           cursor: "pointer", // Add cursor pointer
//           padding: "5px", // Add some padding for better click area
//           borderRadius: "5px",
//           // You can add hover effects here if you want
//         }}
//       >
//         <span>{yourAuthenticatedUser?.displayName}</span>
//         <Image
//           src={yourAuthenticatedUser?.photoURL}
//           alt={yourAuthenticatedUser?.displayName}
//           width={50}
//           height={50}
//           style={{
//             border: "1px solid black",
//             borderRadius: "50%",
//             objectFit: "cover",
//           }}
//         />
//       </div>

//       {/* Dropdown menu */}
//       {isDropdownOpen && (
//         <div className="text-black"
//           style={{
//             position: 'absolute',
//             top: 'calc(100% + 10px)', // Position below the user display
//             right: 0, // Align to the right
//             backgroundColor: 'white',
//             border: '1px solid #ccc',
//             borderRadius: '5px',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//             zIndex: 1000, // Ensure it's above other content
//             minWidth: '180px',
//             padding: '5px 0',
//           }}
//         >
//           {Object.entries(userProfiles).map(([key, user]) => (
//             <div
//               key={key}
//               onClick={() => switchUser(key as 'johnDoe' | 'janeSmith')} // Cast key to the union type
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px',
//                 padding: '8px 15px',
//                 cursor: 'pointer',
//                 backgroundColor: currentUserKey === key ? '#f0f0f0' : 'transparent', // Highlight active user
//               }}
//               onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
//               onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = currentUserKey === key ? '#f0f0f0' : 'transparent')}
//             >
//               <Image
//                 src={user.photoURL}
//                 alt={user.displayName}
//                 width={30}
//                 height={30}
//                 style={{
//                   borderRadius: "50%",
//                   objectFit: "cover",
//                 }}
//               />
//               <span>{user.displayName}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// ======
"use client";
import { useIdentify, useVeltClient } from "@veltdev/react";
import { useState, useRef, useEffect } from "react";
import Image from 'next/image';

export default function AuthComponent() {
  const userProfiles = {
    davidDoe: {
      uid: "123",
      organizationId: "organizationId123",
      displayName: "David Doe",
      email: "daviddoe@gmail.com",
      photoURL: "/video/profile-pic.jpeg",
      color: "#008000",
      textColor: "#FFFFFF",
    },
    saraSmith: {
      uid: "456",
      organizationId: "organizationId123",
      displayName: "Sara Smith",
      email: "sarasmith@example.com",
      photoURL: "/video/profile-pic-jane.png",
      color: "#FF5733",
      textColor: "#FFFFFF",
    },
  };

  const [currentUserKey, setCurrentUserKey] = useState<"davidDoe" | "saraSmith">(
    "davidDoe"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { client } = useVeltClient();

  const yourAuthenticatedUser = userProfiles[currentUserKey];

  const {
    uid,
    displayName,
    email,
    photoURL,
    organizationId,
    color,
    textColor,
  } = yourAuthenticatedUser;

  const veltUser = {
    userId: uid,
    organizationId: organizationId,
    name: displayName,
    email: email,
    photoUrl: photoURL,
    color: color,
    textColor: textColor,
  };

  useIdentify(veltUser);

  const switchUser = (key: "davidDoe" | "saraSmith") => {
    setCurrentUserKey(key);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (client) {
      const contactElement = client.getContactElement();

      const allUsersForMentions = Object.values(userProfiles).map(
        (profile) => ({
          userId: profile.uid,
          name: profile.displayName,
          email: profile.email,
          photoUrl: profile.photoURL,
        })
      );

      contactElement.updateContactList(allUsersForMentions);
    }
  }, [client]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
      ref={dropdownRef}
    >
      {/* Clickable user display */}
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          padding: "5px",
          borderRadius: "5px",
        }}
      >
        <span>{yourAuthenticatedUser?.displayName}</span>
        <Image
          src={yourAuthenticatedUser?.photoURL}
          alt={yourAuthenticatedUser?.displayName}
          width={50}
          height={50}
          style={{
            border: "1px solid black",
            borderRadius: "50%",
            objectFit: "cover",
          }}
          // **FIX 1: Add `priority` prop to the main avatar**
          // This tells Next.js to prioritize loading this image.
          priority
        />
      </div>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div
          className="text-black"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 1000,
            minWidth: "180px",
            padding: "5px 0",
          }}
        >
          {Object.entries(userProfiles).map(([key, user]) => (
            <div
              key={key}
              onClick={() => switchUser(key as "davidDoe" | "saraSmith")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 15px",
                cursor: "pointer",
                backgroundColor:
                  currentUserKey === key ? "#f0f0f0" : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0e0e0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  currentUserKey === key ? "#f0f0f0" : "transparent")
              }
            >
              <Image
                src={user.photoURL}
                alt={user.displayName}
                width={30}
                height={30}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                // **FIX 2: Add `loading="eager"` to dropdown images**
                // This tells the browser to load these images immediately.
                loading="eager"
                // **FIX 3: Optionally add `priority` for critical images (use sparingly)**
                // If these images are very important, you could add `priority`, but `loading="eager"`
                // is usually sufficient for images within a dropdown that appear on user interaction.
              />
              <span>{user.displayName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
