"use client";

import {withBasePath} from "@canopy-iiif/app/base-path";
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

const INSTALL_IMAGE_PATHS = Array.from(
  {length: 9},
  (_, idx) => `/displaying-empire/install-${idx + 1}.jpeg`,
);

const defaultSlides: DisplayingEmpireSlide[] = INSTALL_IMAGE_PATHS.map(
  (src) => ({
    src,
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
  const resolvedSlides = useMemo(
    () =>
      mergedSlides.map((slide) => ({
        ...slide,
        src: withBasePath(slide.src),
      })),
    [mergedSlides],
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
        {resolvedSlides.map((slide) => (
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
