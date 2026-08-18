import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaBriefcase, FaComments, FaUser } from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);

  useEffect(() => {
    // Escuta contagem de mensagens da comunidade
    const unsubMessages = onSnapshot(collection(db, "mensagens_comunidade"), (snapshot) => {
      setUnreadMessages(snapshot.docs.length);
    });

    // Escuta contagem de vagas
    const unsubJobs = onSnapshot(collection(db, "vagas"), (snapshot) => {
      setJobsCount(snapshot.docs.length);
    });

    return () => {
      unsubMessages();
      unsubJobs();
    };
  }, []);

  const navItems = [
    { label: "Feed", path: "/", icon: <FaHome size={20} />, badge: 0 },
    { label: "Empregos", path: "/jobs", icon: <FaBriefcase size={20} />, badge: jobsCount },
    { label: "Mensagens", path: "/messages", icon: <FaComments size={20} />, badge: unreadMessages },
    { label: "Perfil", path: "/profile", icon: <FaUser size={20} />, badge: 0 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-md mx-auto flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center flex-1 py-1 text-xs font-medium transition ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <div className="relative mb-0.5">
                {item.icon}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}