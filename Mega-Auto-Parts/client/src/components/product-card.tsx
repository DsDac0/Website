import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  inStock?: boolean;
  brand?: string;
  partNumber?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    });

    toast({
      title: "Производот е додаден",
      description: `${product.name} е додаден во кошничката`,
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('mk-MK').format(parseFloat(price));
  };

  return (
    <Card className="overflow-hidden card-hover cursor-pointer border-2 border-transparent hover:border-auto-red">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.imageUrl || "/placeholder-product.jpg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
          {product.brand && (
            <Badge variant="secondary" className="ml-2 shrink-0">
              {product.brand}
            </Badge>
          )}
        </div>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {product.partNumber && (
          <p className="text-xs text-gray-500 mb-3">
            Број: {product.partNumber}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-auto-red">
            {formatPrice(product.price)} ден
          </span>
          <Button
            onClick={handleAddToCart}
            className="bg-auto-red hover:bg-auto-dark-red text-white"
            disabled={!product.inStock}
          >
            <Plus className="h-4 w-4 mr-1" />
            Додај
          </Button>
        </div>
        
        {!product.inStock && (
          <div className="mt-2">
            <Badge variant="destructive">Нема на залиха</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
