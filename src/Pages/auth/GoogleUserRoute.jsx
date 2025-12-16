import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../Supabase/supabaseClient";
import GoogleUserSetup from "./GoogleUserSetup";
import Loading from "../../Components/globalComonents/loading";

const GoogleUserRoute = () => {
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserInDB = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setShowSetup(true); // لم يتم تسجيل الدخول
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);

      if (error || !data || data.length === 0) {
        console.error("Database error:", error?.message || "No data");
        setShowSetup(true);
        setLoading(false);
        return;
      }

      const currentUser = data[0];
      if (currentUser.isBlocked) {
        
        alert("You are blocked. Please contact us.");
        navigate("/"); // رجوع للصفحة الرئيسية
        return;
      }

      // المستخدم مسموح له
      sessionStorage.setItem("userID", currentUser.id);
      navigate("/Dashboard/Charts"); // التوجيه بعد التحقق
    };

    checkUserInDB();
  }, [navigate]);

  if (loading) return <Loading />;
  return showSetup ? <GoogleUserSetup /> : null;
};

export default GoogleUserRoute;
