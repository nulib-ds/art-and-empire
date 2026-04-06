"use client";

import {FC, useMemo} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, Navigation, Pagination} from "swiper/modules";

export type DisplayingEmpireSlide = {
  src: string;
};

export type DisplayingEmpireSliderProps = {
  slides?: DisplayingEmpireSlide[];
  heading?: string;
};

const defaultSlides: DisplayingEmpireSlide[] = Array.from(
  {length: 9},
  (_, idx) => ({
    src: `/displaying-empire/install-${idx + 1}.jpeg`,
  }),
);

const DisplayingEmpireSlider: FC<DisplayingEmpireSliderProps> = ({
  slides,
  heading,
}) => {
  const mergedSlides = useMemo(
    () => (slides && slides.length ? slides : defaultSlides),
    [slides],
  );

  return (
    <section className="displaying-empire-slider">
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        slidesPerView={1.05}
        spaceBetween={24}
        centeredSlides
        breakpoints={{
          640: {slidesPerView: 1.1},
          1024: {slidesPerView: 1.2},
        }}
        navigation
        pagination={{clickable: true}}
        loop={mergedSlides.length > 1}
        className="displaying-empire-slider__swiper"
      >
        {mergedSlides.map((slide) => (
          <SwiperSlide
            key={slide.src}
            className="displaying-empire-slider__slide"
          >
            <figure className="displaying-empire-slider__figure">
              <img src={slide.src} loading="lazy" />
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>
      {heading ? (
        <h3 className="displaying-empire-slider__heading">{heading}</h3>
      ) : null}
    </section>
  );
};

export default DisplayingEmpireSlider;
