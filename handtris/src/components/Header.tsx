import { getServerSession } from "next-auth";
import Link from "next/link";
import LoginBtn from "./LoginBtn";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header
      className="flex fixed top-0 left-0 w-full items-center justify-between p-4 text-white border-b-2 border-green-500
    gradient-to-r from-green-400 to-blue-500 shadow-md z-10"
    >
      <nav className="flex space-x-4">
        <Link href="/" className="hover:text-green-500">
          Home
        </Link>
        {session && (
          <Link href="/profile" className="hover:text-green-500">
            Profile
          </Link>
        )}
      </nav>
      <div className="flex items-center space-x-4">
        {session ? (
          <>
            <span className="text-sm">{session?.user.name}</span>
            <Link href="/api/auth/signout" className="hover:text-green-500">
              Logout
            </Link>
          </>
        ) : (
          <LoginBtn />
        )}
      </div>
    </header>
  );
}

export default Header;
