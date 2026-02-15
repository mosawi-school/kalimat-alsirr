import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("جاري الفحص...");
  const [details, setDetails] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // نطلب session الحالي (حتى لو ماكو تسجيل دخول)
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        setStatus("Connected ✅");
        setDetails(data?.session ? "Session موجود" : "Connected بدون تسجيل دخول");
      } catch (e) {
        setStatus("Failed ❌");
        setDetails(e?.message || JSON.stringify(e));
      }
    })();
  }, []);

  return (
    <div style={{ marginTop: 16, padding: 16, border: "1px solid #333", borderRadius: 12 }}>
      <h3>Supabase Test</h3>
      <p><b>Status:</b> {status}</p>
      <p style={{ opacity: 0.8 }}>{details}</p>
    </div>
  );
}
