import { Link } from "wouter";
import { Car, Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-auto-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 text-2xl font-bold text-auto-red mb-4">
              <Car className="h-8 w-8" />
              <span>MEGA AUTO PARTS</span>
            </div>
            <p className="text-gray-300 mb-4">
              Вашиот партнер за квалитетни автомобилски делови и професионална услуга.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-auto-red transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-auto-red transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-auto-red transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Брзи врски</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Почетна
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                  Производи
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  За нас
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Контакт
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Категории</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=engine-parts" className="text-gray-300 hover:text-white transition-colors">
                  Делови за мотор
                </Link>
              </li>
              <li>
                <Link href="/products?category=brakes" className="text-gray-300 hover:text-white transition-colors">
                  Кочници
                </Link>
              </li>
              <li>
                <Link href="/products?category=electrical" className="text-gray-300 hover:text-white transition-colors">
                  Електрика
                </Link>
              </li>
              <li>
                <Link href="/products?category=filters" className="text-gray-300 hover:text-white transition-colors">
                  Филтери
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Услуги</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Достава
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Гаранција
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Поврат
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Поддршка
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">© 2024 MEGA AUTO PARTS. Сите права задржани.</p>
        </div>
      </div>
    </footer>
  );
}
