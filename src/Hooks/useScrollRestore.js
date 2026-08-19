import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function useScrollRestore() {
  const location = useLocation();

  useEffect(() => {
    const savedPosition = sessionStorage.getItem(location.pathname);

    if (savedPosition) {
      window.scrollTo({
        top: Number(savedPosition),
        behavior: "instant",
      });
    }

    return () => {
      sessionStorage.setItem(
        location.pathname,
        window.scrollY
      );
    };
  }, [location.pathname]);
}

export default useScrollRestore;