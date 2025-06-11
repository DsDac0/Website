import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/product-card";
import { Search, Filter } from "lucide-react";

export default function Products() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get('search') || '');
    setSelectedCategory(params.get('category') || '');
    setSelectedBrand(params.get('compatibleBrand') || '');
    setSelectedModel(params.get('compatibleModel') || '');
    setSelectedYear(params.get('compatibleYear') || '');
  }, [location]);

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const { data: carBrands = [] } = useQuery<any[]>({
    queryKey: ["/api/car-brands"],
  });

  const selectedBrandId = carBrands.find(brand => brand.name === selectedBrand)?.id;

  const { data: carModels = [] } = useQuery<any[]>({
    queryKey: ["/api/car-models", selectedBrandId],
    enabled: !!selectedBrandId,
  });

  // Build query parameters for products API
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') {
      // Find category by slug
      const category = categories.find((cat: any) => cat.slug === selectedCategory);
      if (category) params.set('categoryId', category.id.toString());
    }
    if (selectedBrand && selectedBrand !== 'all') params.set('compatibleBrand', selectedBrand);
    if (selectedModel && selectedModel !== 'all') params.set('compatibleModel', selectedModel);
    if (selectedYear && selectedYear !== 'all') params.set('compatibleYear', selectedYear);
    return params.toString();
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", buildQueryParams()],
    queryFn: async () => {
      const params = buildQueryParams();
      const response = await fetch(`/api/products${params ? `?${params}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrand) params.set('compatibleBrand', selectedBrand);
    if (selectedModel) params.set('compatibleModel', selectedModel);
    if (selectedYear) params.set('compatibleYear', selectedYear);
    
    window.location.href = `/products?${params.toString()}`;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedModel("all");
    setSelectedYear("all");
    window.location.href = "/products";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-auto-black mb-4">Автомобилски делови</h1>
        <p className="text-xl text-gray-600">Пронајдете ги деловите што ви требаат за вашиот автомобил</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Пребарување и филтри
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Пребарај производи..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Filter Selects */}
            <div className="grid md:grid-cols-4 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Сите категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите категории</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Сите марки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите марки</SelectItem>
                  {carBrands.map((brand: any) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand || selectedBrand === 'all'}>
                <SelectTrigger>
                  <SelectValue placeholder="Сите модели" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите модели</SelectItem>
                  {carModels.map((model: any) => (
                    <SelectItem key={model.id} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Сите години" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сите години</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                  <SelectItem value="2019">2019</SelectItem>
                  <SelectItem value="2018">2018</SelectItem>
                  <SelectItem value="2017">2017</SelectItem>
                  <SelectItem value="2016">2016</SelectItem>
                  <SelectItem value="2015">2015</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button type="submit" className="bg-auto-red hover:bg-auto-dark-red text-white">
                <Search className="h-4 w-4 mr-2" />
                Пребарај
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Исчисти филтри
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="mb-4">
        <p className="text-gray-600">
          {isLoading ? "Се вчитуваат производи..." : `Пронајдени се ${products?.length || 0} производи`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Нема пронајдени производи</h3>
            <p>Обидете се со различни критериуми за пребарување</p>
          </div>
        </Card>
      )}
    </div>
  );
}
