//Warning: Make sure this is a child component to VeltProvider
//and not within the same file where VeltProvider is placed.

// 1) Import the useIdentify hook
"use client";
import { useIdentify } from "@veltdev/react";
import { useState } from "react";
import Image from 'next/image';

export default function AuthComponent() {
  const userService = () => {
    return {
      uid: "123",
      organizationId: "organizationId123", // this is the organization id the user belongs to. You should always use this.
      displayName: "Dalu46",
      email: "dalu46@gmail.com",
      photoURL: "/video/profile-pic.jpeg",
      color: "#008000", // Use valid Hex code value. Used in the background color of the user's avatar.
      textColor: "#FFFFFF", // Use valid Hex code value. Used in the text color of the user's intial when photoUrl is not present.
    };
  };

  const yourAuthenticatedUser = userService();

  // 2) Fetch the relevant User info from yourAuthenticatedUser
  const {
    uid,
    displayName,
    email,
    photoURL,
    organizationId,
    color,
    textColor,
  } = yourAuthenticatedUser;

  // Create the Velt user object
  const veltUser = {
    userId: uid,
    organizationId: organizationId, // this is the organization id the user belongs to. You should always use this.
    name: displayName,
    email: email,
    photoUrl: photoURL,
    color: color, // Use valid Hex code value. Used in the background color of the user's avatar.
    textColor: textColor, // Use valid Hex code value. Used in the text color of the user's intial when photoUrl is not present.
  };

  //3) Pass the user object to the SDK
  useIdentify(veltUser);

  const [user] = useState(veltUser);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span>{user?.name}</span>
      <Image
        src={user?.photoUrl}
        alt={user?.name}
        width={50}
        height={50}
        style={{
          border: "1px solid black",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
