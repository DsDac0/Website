import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/product-card";
import { Search, Phone, CheckCircle, Cog, StopCircle, Zap, Filter, Droplets, Wrench, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: carBrands } = useQuery({
    queryKey: ["/api/car-brands"],
  });

  const { data: featuredProducts } = useQuery({
    queryKey: ["/api/products/featured"],
  });

  const categoryIcons = {
    "Делови за мотор": Cog,
    "Кочници": StopCircle,
    "Електрика": Zap,
    "Филтери": Filter,
    "Масла": Droplets,
    "Додатоци": Wrench,
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedBrand) params.set('compatibleBrand', selectedBrand);
    if (selectedModel) params.set('compatibleModel', selectedModel);
    if (selectedYear) params.set('compatibleYear', selectedYear);
    if (selectedCategory) params.set('category', selectedCategory);
    
    window.location.href = `/products?${params.toString()}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-bg text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Квалитетни <span className="text-auto-red">автомобилски делови</span> за вашиот автомобил
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Најголемиот избор на оригинални и заменски делови за сите марки и модели на автомобили. Брза достава и професионална услуга.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-auto-red hover:bg-auto-dark-red text-white">
                    <Search className="h-5 w-5 mr-2" />
                    Пребарај делови
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-auto-black">
                    <Phone className="h-5 w-5 mr-2" />
                    Контактирај не
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://pixabay.com/get/g022801b2a08e0b3a64da00286a2010877f1a97adb3f42eef59c0111777cafb5fa2c31873e04db7d324d5e30e645e7c368434a25059a4b12462099805668b7824_1280.jpg"
                alt="Automotive parts workshop"
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-black mb-4">Категории на производи</h2>
            <p className="text-xl text-gray-600">Пронајдете ги деловите што ви требаат за вашиот автомобил</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories?.map((category: any) => {
              const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Cog;
              return (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <Card className="card-hover cursor-pointer border-2 border-transparent hover:border-auto-red">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <IconComponent className="h-8 w-8 text-auto-red mr-3" />
                        <h3 className="text-xl font-semibold text-auto-black">{category.name}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <div className="flex items-center text-auto-red font-semibold">
                        Погледни повеќе <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-black mb-4">Препорачани производи</h2>
            <p className="text-xl text-gray-600">Најпопуларните и најквалитетните делови од нашиот асортиман</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts?.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/products">
              <Button size="lg" className="bg-auto-black text-white hover:bg-auto-gray">
                Погледни ги сите производи
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-black mb-4">Пронајди делови за твојот автомобил</h2>
            <p className="text-xl text-gray-600">Користи ги филтрите за да ги пронајдеш точните делови што ти требаат</p>
          </div>

          <Card className="p-8">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Марка</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Избери марка" />
                  </SelectTrigger>
                  <SelectContent>
                    {carBrands?.map((brand: any) => (
                      <SelectItem key={brand.id} value={brand.name}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Модел</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Избери модел" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-series">3 Series</SelectItem>
                    <SelectItem value="5-series">5 Series</SelectItem>
                    <SelectItem value="c-class">C-Class</SelectItem>
                    <SelectItem value="e-class">E-Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Година</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Избери година" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                    <SelectItem value="2019">2019</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категорија</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Сите категории" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-center">
              <Button 
                onClick={handleSearch}
                size="lg" 
                className="bg-auto-red hover:bg-auto-dark-red text-white"
              >
                <Search className="h-5 w-5 mr-2" />
                Пребарај делови
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-auto-black mb-6">За MEGA AUTO PARTS</h2>
              <p className="text-lg text-gray-600 mb-6">
                Веќе повеќе од 15 години сме лидери на македонскиот пазар за автомобилски делови. 
                Нашата мисија е да обезбедиме квалитетни, оригинални и заменски делови за сите марки автомобили.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-auto-red mr-4" />
                  <span className="text-lg">Над 50,000 различни производи во асортиман</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-auto-red mr-4" />
                  <span className="text-lg">Брза достава низ цела Македонија</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-auto-red mr-4" />
                  <span className="text-lg">Професионални совети од наши експерти</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-auto-red mr-4" />
                  <span className="text-lg">Гаранција на сите производи</span>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://pixabay.com/get/g02efa66d1c2fe9220208f9dedc8879de9497dafadf9195320c7f7a0679ac2f156e1ed678c044692b0da4267618d55633bbca6c83e8c8d7714e87950b893b7551_1280.jpg"
                alt="Automotive service center"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
