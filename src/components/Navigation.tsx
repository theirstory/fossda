import { SearchInput } from "@/components/SearchInput";
import Link from "next/link";

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          FOSSDA
        </Link>
        <div className="flex-1 max-w-xl mx-8">
          <SearchInput />
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/ask" className="hover:text-primary">
            Ask
          </Link>
          <Link href="/about" className="hover:text-primary">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
} 