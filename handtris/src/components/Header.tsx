import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex justify-between items-center border-b text-green-400 w-full p-4">
      <Link href="/" className="hover:text-green-500">
        HANDTRIS
      </Link>
      <div className="flex items-center space-x-4">
        {/* {session ? (
          <>
            <span className="text-sm">{session.user?.name}</span>
            <Link href="/api/auth/signout" className="hover:text-green-500">
              Logout
            </Link>
          </>
        ) : (
          <LoginBtn />
        )} */}
      </div>
    </header>
  );
}

export default Header;
