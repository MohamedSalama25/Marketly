import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import TestimonialCard from "./TestimonialCard";
import { fetchTestimonials } from "./../../Redux/slices/testimonialsSlice";
import "./testimonials.css"; 
function TestimonialsSection() {
  const dispatch = useDispatch();
  const { testimonials, loading } = useSelector((state) => state.Testimonials);

  useEffect(() => {
    dispatch(fetchTestimonials());
  }, [dispatch]);

  const publishedTestimonials =
    testimonials?.filter((t) => t.isPublished===true) || [];

  if (loading || publishedTestimonials.length < 5) return null;
  return (
    <div className="testimonials-section">
      <h2 className="testimonials-title">آراء عملائنا</h2>
      <div className="swiper-container">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={3}
          spaceBetween={30}
          loop={true}
          autoplay={{ delay: 4000 }}
          breakpoints={{
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {publishedTestimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <TestimonialCard testimonial={testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default TestimonialsSection;