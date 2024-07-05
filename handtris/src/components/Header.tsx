import Link from "next/link";

async function Header() {
  return (
    <header className="flex w-full items-center justify-between p-4 text-green-400">
      <Link href="/" className="hover:text-green-500">
        HANDTRIS
      </Link>
      <div className="flex items-center space-x-4"></div>
    </header>
  );
}

export default Header;
