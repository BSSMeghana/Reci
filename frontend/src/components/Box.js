import React from "react";
import "./Box.css";
import ThreeModel from "./ThreeModel";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Mousewheel, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const Box = () => {
  const foodBoxes = [
    {
      className: "box1",
      image: "/rec2.gif",
      alt: "Ramen animation",
      modelPath: "/model6.glb",
      scale: 9.2,
      position: [0, 0, 1],
      title: "Ramen",
    },
    {
      className: "box2",
      image: "/rec1.gif",
      alt: "Cake animation",
      modelPath: "/model2.glb",
      scale: 0.75,
      position: [0, 0.5, -0.4],
      title: "Cake",
    },
    {
      className: "box3",
      image: "/rec3.gif",
      alt: "Hot dog animation",
      modelPath: "/model3.glb",
      scale: 0.4,
      position: [0, 1.3, 0],
      title: "Hot Dog",
    },
    {
      className: "box4",
      image: "/rec4.gif",
      alt: "Cake animation",
      modelPath: "/model1.glb",
      scale: 2,
      position: [0, 1.4, 0],
      title: "Samosa",
    },
    {
      className: "box5",
      image: "/rec21.gif",
      alt: "Ramen animation",
      modelPath: "/model61.glb",
      scale: 9.2,
      position: [0, 0, 1],
      title: "Ramen",
    },
    {
      className: "box6",
      image: "/rec11.gif",
      alt: "Dessert animation",
      modelPath: "/model21.glb",
      scale: 0.75,
      position: [0, 0.5, -0.4],
      title: "Cake",
    },
  ];

  const renderFoodBox = (item) => (
    <div className={item.className} key={item.title}>
      <div className="food-card">
        <img src={item.image} alt={item.alt} className="gif-image" />
        <div className="three-overlay">
          <ThreeModel
            modelPath={item.modelPath}
            scale={item.scale}
            position={item.position}
          />
        </div>
      </div>
      <h2 className="model-label">{item.title}</h2>
    </div>
  );

  return (
    <div className="box-container">
      <Swiper
  modules={[Navigation, Keyboard, Mousewheel, Autoplay]}
  navigation={false}
  keyboard={{ enabled: true }}
  mousewheel={{
    forceToAxis: true,
    sensitivity: 0.35,
    thresholdDelta: 80,
    releaseOnEdges: true,
  }}
  loop={true}
  speed={1200}
  slidesPerView={1.11}  
  spaceBetween={10}
  threshold={8}
  resistanceRatio={0.65}
  longSwipesRatio={0.45}
  touchRatio={1}
  followFinger={true}
  autoplay={{
    delay: 4500, // 2 seconds
    disableOnInteraction: false, // keeps autoplay running even if user interacts
  }}
  className="swiper-container"
>
  <SwiperSlide>
    <div className="Box">
      {foodBoxes.slice(0, 3).map(renderFoodBox)}
    </div>
  </SwiperSlide>

  <SwiperSlide>
  <div className="Box1">
    {foodBoxes.slice(3).map(renderFoodBox)}
    </div>
</SwiperSlide>
</Swiper>
    </div>
  );
};

export default Box;
