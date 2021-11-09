import { useEffect, useState } from "react";

export const useLoading = (time = 1000) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), time);
    return () => clearTimeout(timer);
  }, []);
  return loading;
};
