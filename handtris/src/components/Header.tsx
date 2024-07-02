import Link from "next/link";

async function Header() {
  return (
    <header className="flex justify-between items-center text-green-400 w-full p-4">
      <Link href="/" className="hover:text-green-500">
        HANDTRIS
      </Link>
      <div className="flex items-center space-x-4"></div>
    </header>
  );
}

export default Header;
