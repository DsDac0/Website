import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Menu, X, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store";

export default function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getTotalItems } = useCartStore();
  
  const totalItems = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const navigation = [
    { name: "Почетна", href: "/" },
    { name: "Производи", href: "/products" },
    { name: "За нас", href: "/about" },
    { name: "Контакт", href: "/contact" }
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-auto-red" />
            <span className="text-2xl font-bold text-auto-red">MEGA AUTO PARTS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors ${
                  location === item.href
                    ? "text-auto-red"
                    : "text-gray-700 hover:text-auto-red"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Пребарај делови..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64 focus:ring-2 focus:ring-auto-red focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>

            {/* Cart Button */}
            <Link href="/cart">
              <Button className="relative bg-auto-red hover:bg-auto-dark-red text-white">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Кошничка ({totalItems})
              </Button>
            </Link>

            {/* Admin Login Button */}
            <Link href="/admin/login">
              <Button variant="outline" className="border-auto-red text-auto-red hover:bg-auto-red hover:text-white">
                Најави се
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition-colors ${
                    location === item.href
                      ? "text-auto-red"
                      : "text-gray-700 hover:text-auto-red"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4 relative">
              <Input
                type="text"
                placeholder="Пребарај делови..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 focus:ring-2 focus:ring-auto-red focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
