import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { title: "HANDTRIS 이벤트 1", color: "from-green-500 to-blue-500" },
    { title: "HANDTRIS 이벤트 2", color: "from-purple-500 to-pink-500" },
    { title: "HANDTRIS 이벤트 3", color: "from-yellow-500 to-red-500" },
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
      <Card
        className={`h-[350px] bg-gradient-to-r ${slides[currentSlide].color}`}
      >
        <CardContent className="flex h-full items-center justify-center">
          <p className="text-2xl md:text-4xl font-bold text-white">
            {slides[currentSlide].title}
          </p>
        </CardContent>
      </Card>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className={`w-3 h-3 rounded-full p-0 ${
              currentSlide === index ? "bg-white" : "bg-gray-400"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
