"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Navbar } from "@/components/layout/Navbar";
import {
  SettingsForm,
  type SettingsFormUser,
} from "@/components/settings/SettingsForm";

export default function AvocatParametresPage(): React.ReactElement {
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
              id: "mock-avocat-id",
              email: "avocat@test.com",
              prenom: "Pierre",
              nom: "Debuisson",
              telephone: "+971 4 123 4567",
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
        // fallback déjà chargé
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
        breadcrumb="Cabinet"
        switchRoleHref="/dashboard"
        switchRoleLabel="Vue client"
        initials="PD"
      />

      <div className="page-fade page-pad" style={{ maxWidth: 880 }}>
        <SettingsForm user={user} role="avocat" />
      </div>
    </>
  );
}
