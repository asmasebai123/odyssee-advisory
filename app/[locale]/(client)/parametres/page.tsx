"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Navbar } from "@/components/layout/Navbar";
import {
  SettingsForm,
  type SettingsFormUser,
} from "@/components/settings/SettingsForm";

export default function ClientParametresPage(): React.ReactElement {
  const supabase = React.useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [user, setUser] = React.useState<SettingsFormUser | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const sessionUser = session?.session?.user;
        if (!sessionUser) {
          if (!cancelled)
            setUser({
              id: "mock-client-id",
              email: "client@test.com",
              prenom: "Jean",
              nom: "Dupont",
              telephone: "+33 6 12 34 56 78",
              langue: "fr",
            });
          return;
        }
        const { data } = await supabase
          .from("users")
          .select("id, email, prenom, nom, telephone, langue")
          .eq("id", sessionUser.id)
          .single();
        if (!cancelled) setUser((data as SettingsFormUser) ?? null);
      } catch {
        // fallback already set
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <>
      <Navbar
        title="Paramètres"
        breadcrumb="Espace client"
        switchRoleHref="/admin"
        switchRoleLabel="Vue cabinet"
      />

      <div className="page-fade page-pad" style={{ maxWidth: 880 }}>
        <SettingsForm user={user} role="client" />
      </div>
    </>
  );
}
