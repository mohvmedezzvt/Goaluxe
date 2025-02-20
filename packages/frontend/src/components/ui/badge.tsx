import React, { useState } from "react";
import { CircleX } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Type definition for filter keys used in the Badge component.
 */
type FilterKey = "status" | "sortBy";

/**
 * Props for the Badge component.
 */
interface BadgeProps {
  /** The key associated with the filter (e.g., "status", "sortBy"). */
  filterKey: FilterKey;

  /** The value of the filter (e.g., "Active", "Due Date", null). */
  filterValue: string | null;

  /** Callback function to remove the filter when the badge is clicked. */
  onRemove: () => void;
}

/**
 * A reusable Badge component that displays a filter with an animated remove effect.
 *
 * - On hover, the text blurs out, and a red remove icon appears.
 * - Clicking the badge removes the corresponding filter.
 * - Uses `framer-motion` for smooth animations.
 *
 * @component
 * @param {BadgeProps} props - Component props.
 * @returns {JSX.Element | null} The rendered badge or null if `filterValue` is empty.
 */
const Badge = ({ filterKey, filterValue, onRemove }: BadgeProps) => {
  // State to track hover effect
  const [hovered, setHovered] = useState(false);

  // Prevent rendering if filter value is null or empty
  if (!filterValue) return null;

  return (
    <motion.div
      className="text-xs flex justify-center items-center bg-default-200 px-3 min-w-fit min-h-[28px] 
      rounded-full cursor-pointer overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:shadow-default-300"
      initial={{ opacity: 0, y: 2 }} // Fades in and moves up slightly when added
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 2 }} // Fades out and moves down slightly when removed
      transition={{ duration: 0.2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => {
        onRemove();
        setHovered(false);
      }}
      role="button"
      aria-label={`Remove filter: ${filterKey} - ${filterValue}`}
    >
      {/* Display filter key and value with hover effect */}
      <motion.span
        initial={{ opacity: 1, filter: "blur(0px)" }}
        animate={{
          opacity: hovered ? 0 : 1,
          filter: hovered ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ duration: 0.2 }}
        className="font-medium relative"
      >
        {`${filterKey}: ${filterValue}`}
      </motion.span>

      {/* Remove icon appears on hover */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{
          opacity: hovered ? 1 : 0,
          filter: hovered ? "blur(0px)" : "blur(4px)",
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <CircleX size={18} color="red" />
      </motion.div>
    </motion.div>
  );
};

export default Badge;
