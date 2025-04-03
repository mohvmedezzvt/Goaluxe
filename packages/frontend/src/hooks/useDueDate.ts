import { useMemo } from "react";

const useDueDate = (isoDateString: string) => {
  const parsedDate = useMemo(() => new Date(isoDateString), [isoDateString]);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Reset time to midnight
  }, []);

  // Calculate days difference
  const timeDiff = parsedDate.getTime() - today.getTime();
  const daysDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return {
    daysDue,
    isOverdue: daysDue < 0,
    daysOverdue: daysDue < 0 ? Math.abs(daysDue) : 0,
    formattedDate: parsedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
};

export default useDueDate;
