import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { IoChevronBack } from "react-icons/io5";
import { cn } from "@/lib/utils";

export function SidebarToggle({ className }: { className?: string }) {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Button
      variant="ghost"
      onClick={toggleSidebar}
      className={cn(
        "h-auto w-auto p-0 hover:bg-transparent",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#FF8040] transition-colors group">
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          <IoChevronBack className="h-5 w-5 text-white" />
        </motion.div>
        <span className="text-white font-medium text-sm">
          {isCollapsed ? "Abrir" : "Minimizar"}
        </span>
      </div>
    </Button>
  );
}
