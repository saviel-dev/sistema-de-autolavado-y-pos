import { useCallback, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/contexts/AuthContext';

export const useTour = () => {
  const { isAdmin } = useAuth();

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '✓ Finalizar',
      progressText: '{{current}} de {{total}}',
      popoverClass: 'driver-popover-custom',
      onDestroyStarted: () => {
        driverObj.destroy();
      },
      steps: [
        {
          element: '[data-tour="dashboard-header"]',
          popover: {
            title: '¡Bienvenido a Autolavado Gochi! 🚗',
            description: 'Este tour te guiará por todas las funcionalidades del sistema administrativo. Aprende a gestionar tu negocio de forma eficiente.',
            side: 'bottom' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-dashboard"]',
          popover: {
            title: '📊 Dashboard',
            description: 'Vista general de tu negocio con métricas clave: servicios del día, pedidos pendientes, tasa del dólar y actividad reciente.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        ...(isAdmin ? [{
          element: '[data-tour="nav-workers"]',
          popover: {
            title: '👷 Trabajadores',
            description: 'Administra tu equipo de trabajo. Solo visible para administradores. Crea, edita y elimina perfiles de empleados.',
            side: 'right' as const,
            align: 'start' as const
          }
        }] : []),
        {
          element: '[data-tour="nav-products"]',
          popover: {
            title: '📦 Productos',
            description: 'Gestiona tu inventario con tres submódulos: Inventario de productos, Insumos consumibles y Movimientos de stock.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-inventory"]',
          popover: {
            title: '📋 Inventario',
            description: 'Control de productos con códigos de barras. Agrega, edita y elimina productos. Recibe alertas de stock bajo.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-consumables"]',
          popover: {
            title: '🧴 Insumos',
            description: 'Administra consumibles como shampoo, cera, etc. Controla costos y cantidades disponibles.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-movements"]',
          popover: {
            title: '🔄 Movimientos',
            description: 'Registra entradas y salidas de inventario e insumos. Mantén un historial completo de movimientos de stock.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-autolavado"]',
          popover: {
            title: '🚙 Autolavado',
            description: 'Módulo principal del negocio con tres secciones: Clientes, Servicios y Pedidos.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-customers"]',
          popover: {
            title: '👥 Clientes',
            description: 'Gestión completa de clientes con múltiples teléfonos y vehículos. Sube fotos de vehículos y mantén perfiles detallados.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-services"]',
          popover: {
            title: '🧽 Servicios',
            description: 'Catálogo de servicios disponibles: lavado básico, encerado, pulido, etc. Define precios y descripciones.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-appointments"]',
          popover: {
            title: '📅 Pedidos',
            description: 'Sistema de agendamiento de citas. Visualiza y gestiona pedidos programados con estado y detalles.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-pos"]',
          popover: {
            title: '💰 Punto de Venta (POS)',
            description: 'Interfaz principal de ventas. Busca clientes, selecciona servicios, genera facturas PDF y registra pagos.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        {
          element: '[data-tour="nav-reports"]',
          popover: {
            title: '📊 Reportes',
            description: 'Analiza el rendimiento de tu negocio con gráficos interactivos, estadísticas y exportación de datos.',
            side: 'right' as const,
            align: 'start' as const
          }
        },
        ...(isAdmin ? [{
          element: '[data-tour="nav-settings"]',
          popover: {
            title: '⚙️ Configuración',
            description: 'Personaliza el sistema: datos de la empresa, horarios laborables, parámetros del POS. Solo para administradores.',
            side: 'right' as const,
            align: 'start' as const
          }
        }] : []),
        {
          element: '[data-tour="user-profile"]',
          popover: {
            title: '👤 Perfil de Usuario',
            description: 'Aquí puedes ver tu información de usuario y acceder a las notificaciones del sistema.',
            side: 'top' as const,
            align: 'end' as const
          }
        },
        {
          popover: {
            title: '✅ ¡Tour Completado!',
            description: 'Ya conoces las principales funcionalidades del sistema. Puedes volver a iniciar este tour en cualquier momento desde el botón "¿Cómo usar?" en el Dashboard.',
          }
        }
      ]
    });

    driverObj.drive();
  }, [isAdmin]);

  // Auto-start tour for new users (optional)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    
    // Uncomment to auto-start tour on first visit
    // if (!hasSeenTour) {
    //   setTimeout(() => {
    //     startTour();
    //     localStorage.setItem('hasSeenTour', 'true');
    //   }, 1000);
    // }
  }, [startTour]);

  return { startTour };
};
