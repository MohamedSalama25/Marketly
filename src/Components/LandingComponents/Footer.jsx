import React from "react";

const colors = {
  primary: "#915EF6",
  accent: "#327AFF",
  background: "#FFFFFF",
  softBg: "#F9F9F9",
  text: "#1A1A1A",
  textSecondary: "#666666",
  border: "#E0E0E0",
  icon: "#7B51E4",
};

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      style={{
        background: colors.softBg,
        borderTop: `1px solid ${colors.border}`,
        marginTop: 64,
        direction: "rtl",
        fontFamily: "inherit",
      }}
    >
      <div className="container py-5 px-3">
        <div className="row gy-4 gx-5 justify-content-between align-items-start">
          <div className="col-12 col-md-4">
            <h4
              style={{
                color: colors.primary,
                fontWeight: 700,
                fontSize: "1.75rem",
                letterSpacing: "0.5px",
              }}
            >
              <img src="/Logo/Asset 1.svg"
                alt="Marketly Logo"
                style={{ width: "80px", height: "auto" }} />
            </h4>

            <p
              style={{
                color: colors.textSecondary,
                fontSize: "0.95rem",
                lineHeight: 1.8,
                marginBottom: "0.5rem",
              }}
            >
              منصة ذكية تربط بين التجار وأصحاب المحلات لتسهيل شراء المنتجات
              الغذائية بالجملة — بدون وسيط تقليدي، وبدون مخازن. وفر وقتك، واطلب
              بضغطة واحدة، والتاجر يوصّل لباب المحل.
            </p>
            <p
              style={{
                fontWeight: "bold",
                color: colors.text,
                marginTop: 4,
              }}
            >
              ماركتلي... الوسيط الذكي لتجارتك اليومية.
            </p>
            <div className="mt-3 d-flex gap-3">
              {[
                {
                  icon: "facebook",
                  label: "Facebook",
                  href: "https://facebook.com/marketly.app",
                },
                {
                  icon: "instagram",
                  label: "Instagram",
                  href: "https://instagram.com/marketly.app",
                },
                {
                  icon: "whatsapp",
                  label: "WhatsApp",
                  href: "https://wa.me/201234567890",
                },
              ].map(({ icon, label, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    color: colors.icon,
                    fontSize: "1.5rem",
                    transition: "transform 0.3s ease, color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = colors.primary;
                    e.target.style.transform = "scale(1.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = colors.icon;
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="col-12 col-md-4">
            <h5 style={{ color: colors.text, fontWeight: 600 }}>روابط مهمة</h5>
            <ul
              className="list-unstyled mt-3"
              style={{ color: colors.primary, lineHeight: 2 }}
            >
              {[
                { text: "حمل التطبيق", sectionId: "download-section" },
                { text: "شركاؤنا", sectionId: "companies-section" },
                { text: "الأسئلة الشائعة", sectionId: "faq-section" },
                { text: "آراء عملائنا", sectionId: "testimonials-section" },
              ].map(({ text, sectionId, href }, i) => (
                <li key={i} className="mb-1">
                  {sectionId ? (
                    <button
                      onClick={() => scrollToSection(sectionId)}
                      style={{
                        color: colors.primary,
                        textDecoration: "none",
                        transition: "color 0.3s",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = colors.accent)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = colors.primary)
                      }
                    >
                      {text}
                    </button>
                  ) : (
                    <a
                      href={href}
                      style={{
                        color: colors.primary,
                        textDecoration: "none",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = colors.accent)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = colors.primary)
                      }
                    >
                      {text}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h5 style={{ color: colors.text, fontWeight: 600 }}>تواصل معنا</h5>
            <ul
              className="list-unstyled mt-3"
              style={{
                color: colors.textSecondary,
                fontSize: "1.05rem",
                lineHeight: 2.2,
              }}
            >
              <li className="mb-2">
                <i className="fas fa-envelope ms-2"></i>
                support@marketly.app
              </li>
              <li>
                <i className="fas fa-phone ms-2"></i>
                01012345678
              </li>
            </ul>
          </div>
        </div>

        <div
          className="text-center mt-4 pt-3 border-top"
          style={{
            fontSize: "0.9rem",
            color: colors.textSecondary,
            borderColor: colors.border,
          }}
        >
          جميع الحقوق محفوظة © {new Date().getFullYear()} — تصميم وتجميع فريق
          ديڤ هاوس
        </div>
      </div>
    </footer>
  );
};

export default Footer;