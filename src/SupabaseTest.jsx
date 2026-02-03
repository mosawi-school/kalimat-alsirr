import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function SupabaseTest() {
  const [msg, setMsg] = useState("checking...");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("seasons").select("id").limit(1);
      if (error) setMsg("❌ " + error.message);
      else setMsg("✅ Supabase connected. seasons rows: " + (data?.length ?? 0));
    })();
  }, []);

  return <div style={{ padding: 16, fontSize: 18 }}>{msg}</div>;
}
