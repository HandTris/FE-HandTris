import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "HANDTRIS 이벤트 1",
      image: "/image/BANNERS.png",
    },
    {
      title: "HANDTRIS 이벤트 2",
      image: "/image/BANNERS.png",
    },
    {
      title: "HANDTRIS 이벤트 3",
      image: "/image/BANNERS.png",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full">
      <Card className={`h-[350px] border-2 border-white`}>
        <Image
          src={slides[currentSlide].image}
          layout="fill"
          objectFit="cover"
          className="border-4 border-green-400 rounded-lg"
          alt={slides[currentSlide].title}
        />
      </Card>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className={`w-4 h-4 rounded-full p-0 ${
              currentSlide === index ? "bg-white" : "bg-black"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
