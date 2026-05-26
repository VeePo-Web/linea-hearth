import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { REAL_PRODUCT_IMAGES as IMG } from "@/lib/realProductImages";
import { formatPrice } from "@/lib/currency";

interface Product {
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  hoverImage: string;
  isNew?: boolean;
}

const products: Product[] = [
  {
    slug: "adam-god-mineral-wash-cotton-boxy-tee-shirt",
    name: '"Adam & God" Boxy Tee',
    category: "Tees",
    price: 65,
    image: IMG.adamGod,
    hoverImage: IMG.adamGodAlt,
    isNew: true,
  },
  {
    slug: "you-need-jesus-heavy-weight-sun-fade-oversized-hoodie",
    name: '"You Need Jesus" Hoodie',
    category: "Hoodies",
    price: 95,
    image: IMG.youNeedJesus,
    hoverImage: IMG.inJesusName,
    isNew: true,
  },
  {
    slug: "burning-love-boxy-tee",
    name: '"Burning Love" Boxy Tee',
    category: "Tees",
    price: 65,
    image: IMG.burningLove,
    hoverImage: IMG.burningLoveAlt,
  },
  {
    slug: "ichthys-fish-oversized-sun-fade-hoodie",
    name: '"Ichthys Fish" Sun-fade Hoodie',
    category: "Hoodies",
    price: 95,
    image: IMG.ichthysFish,
    hoverImage: IMG.firstLoveSnow,
  },
  {
    slug: "faith-in-fear-boxy-tee",
    name: '"Faith in Fear" Boxy Tee',
    category: "Tees",
    price: 65,
    image: IMG.faithInFear,
    hoverImage: IMG.namesOfGod,
  },
  {
    slug: "god-bless-line-of-judah-sweater",
    name: '"God Bless" Sweater',
    category: "Sweaters",
    price: 110,
    image: IMG.godBlessSweater,
    hoverImage: IMG.revelation320,
  },
];

const ProductCarousel = () => {
  return (
    <section className="w-full mb-16 px-6">
      <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="">
            {products.map((product) => (
               <CarouselItem
                 key={product.slug}
                 className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
               >
                 <Link to={`/product/${product.slug}`}>
                  <Card className="border-none shadow-none bg-transparent group">
                    <CardContent className="p-0">
                      <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-0"
                        />
                        <img
                          src={product.hoverImage}
                          alt={`${product.name} alternate view`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-300 opacity-0 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-black/[0.03]"></div>
                        {product.isNew && (
                          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-black">
                            NEW
                          </div>
                        )}
                      </div>
                     <div className="space-y-1">
                       <p className="text-sm font-light text-foreground">
                         {product.category}
                       </p>
                       <div className="flex justify-between items-center">
                         <h3 className="text-sm font-medium text-foreground">
                           {product.name}
                         </h3>
                         <p className="text-sm font-light text-foreground">
                           {formatPrice(product.price)}
                         </p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
                 </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
    </section>
  );
};

export default ProductCarousel;
