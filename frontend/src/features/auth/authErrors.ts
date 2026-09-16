/**
 * Firebase throws errors shaped like `{ code: "auth/wrong-password", ... }`.
 * Never show that raw code/message to the user — translate the ones we
 * expect to actually hit, and fall back to a generic message otherwise.
 */
export function getAuthErrorMessage(err: unknown): string {
  const code = typeof err === "object" && err !== null && "code" in err ? String(err.code) : "";

  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
