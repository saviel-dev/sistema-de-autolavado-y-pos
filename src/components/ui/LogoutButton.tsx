import React, { useState } from 'react';
import './logout-button.css';
import { IoLogOutOutline } from "react-icons/io5";
import { useToast } from "@/components/ui/use-toast";

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className, onClick, ...props }) => {
  const [isClosing, setIsClosing] = useState(false);
  const { toast } = useToast();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent multiple clicks
    if (isClosing) return;
    
    // 1. Feedback visual inmediato en el botón
    setIsClosing(true);

    // 2. Simular petición al servidor (1.5 segundos de espera como en el ejemplo)
    setTimeout(() => {
        // Mostrar notificación de éxito
        toast({
            title: "Sesión cerrada correctamente",
            className: "bg-[#2c3e50] text-white border-none",
            duration: 3000,
        });

        // Ejecutar la acción real (navegación)
        if (onClick) {
            onClick(e);
        }
        
        // Reset state (though we likely navigate away)
        // setIsClosing(false); 
    }, 1500);
  };

  return (
    <button 
      className={`logout-btn ${className || ''}`} 
      onClick={handleClick}
      disabled={isClosing}
      {...props}
    >
      <IoLogOutOutline />
      <span>{isClosing ? "Cerrando..." : "Cerrar Sesión"}</span>
    </button>
  );
};
