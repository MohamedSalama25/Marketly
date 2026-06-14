import React, { useEffect, useRef, useState } from 'react'
import '../../css/global.css'

function CustomMenu({id="", options=[]}) {


      // Open Menu and Close it by any Click and View Control
      const [openIndex, setOpenIndex] = useState(null);
      const popupRefs = useRef([]);
      useEffect(() => {
        const handleClickOutside = (e) => {
          const currentPopup = popupRefs.current[openIndex];
          if (currentPopup && !currentPopup.contains(e.target)) {
            setOpenIndex(null);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, [openIndex]);
      const [menuDirection, setMenuDirection] = useState("down");
      // Open Menu and Close it by any Click and View Control

  return (
    
      <label style={{ position: "relative" }} className="popup" ref={(el) => (popupRefs.current[id] = el)}>
            <input
                type="checkbox"
              checked={openIndex === id}
                onChange={() => {
                    const rect = popupRefs.current[id]?.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const spaceBelow = windowHeight - rect.bottom;
                    const menuHeight = 150;
                    setMenuDirection(spaceBelow < menuHeight ? "up" : "down");
                    setOpenIndex((prev) => (prev === id ? null : id));
                }}

            />
            <div tabIndex="0" className="burger" style={{
                width: "42px",
                height: "42px",
                border: "1px solid #EFECF3",
                borderRadius: "12px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                // zIndex:-1
            }}>
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#424047"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="5" cy="12" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                </svg>
            </div>

            <nav className="popup-window "
                style={{
                    position: "absolute",
                    width: "fit-content",
                    top: menuDirection === "down" ? "100%" : "auto",
                    bottom: menuDirection === "up" ? "100%" : "auto",
                    left: 0,
                    background: "#fff",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    zIndex: 1000,
                    marginBottom: menuDirection === "up" ? "10px" : 0,
                    marginTop: menuDirection === "down" ? "10px" : 0,
                }}
            >

                <ul style={{ position: "relative", zIndex: 999 }}>


                {options.map((option,index)=>(
                    <li key={index}>
                        <button
                            onClick={() => {
                                if (option.disabled) return;
                                option.onClick();
                                setOpenIndex(null);
                            }}
                            disabled={option.disabled}
                            className="custom-btn-menuInTbl"
                        >
                            <span style={{ color: `${option.color}`, marginLeft:"0px" }} className={option.icon}></span>
                            <span >{option.label}</span>
                        </button>
                    </li>
                ))}
                </ul>
            </nav>
        </label>
    )
}

export default CustomMenu;
