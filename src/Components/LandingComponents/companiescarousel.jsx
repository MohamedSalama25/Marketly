import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import './companiescarousel.css';
import SwiperCore from 'swiper';
import { Autoplay } from 'swiper/modules';
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanies } from './../../Redux/slices/CompaniesSlice';



function CompaniesCarousel() {
  SwiperCore.use([Autoplay]);
  const dispatch = useDispatch();
  const companies = useSelector((state) => state.Companies.companies);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  if (!companies?.length) return null;

  return (
    <div className="companies-carousel-section"  id="companies-section" >
      <div className="swiper-container">
        <Swiper
          slidesPerView={5}
          spaceBetween={20}
          autoplay={{ delay: 2000 }}
          loop={true}
          breakpoints={{
            320: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
        >
          {companies.slice(1,9).map((company) => (
            <SwiperSlide key={company.id}>
              <div className="company-logo-wrapper">
                <img
                  src={company.image}
                  alt={company.name}
                  className="company-logo"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default CompaniesCarousel;
