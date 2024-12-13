import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-center min-h-screen">
      {!session ? (
        <button
          className="p-4 bg-blue-500 text-white rounded"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          <p>Welcome, {session.user.name}</p>
          <button
            className="p-4 bg-red-500 text-white rounded"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
