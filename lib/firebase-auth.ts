"use client";

import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

export function getFirebaseAuth() {
  return getAuth(firebaseApp);
}
