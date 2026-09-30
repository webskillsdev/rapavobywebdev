import { setUser } from "../store/authSlice";
import { userApi } from "../api/userApi";
import type { AppDispatch } from "../store";

export async function loadUserProfileIntoStore(
  dispatch: AppDispatch,
  userId: string,
  email: string
) {
  try {
    const profile: any = await dispatch(
      userApi.endpoints.getUserProfile.initiate(userId)
    ).unwrap();

    dispatch(
      setUser({
        uid: profile.id,
        email: profile.email ?? email,
        fullName: profile.full_name ?? "",
        initials: profile.full_name
          ? profile.full_name.split(" ").map((n: string) => n[0]).join("")
          : "",
        photoURL: profile.avatar_url ?? null,
        permissions: [],
        location: profile.location ?? "",
        companyName: profile.company_name ?? "",
        companyLocation: profile.company_location ?? "",
        phoneNumber: profile.phone_number ?? "",
        whatsappNumber: profile.whatsapp_number ?? "",
        areasOperate: profile.areas_operate ?? [],
        aboutMe: profile.about_me ?? "",
        currentMode: profile.current_mode ?? "buyer",
        agentProfileCompleted: profile.agent_profile_completed ?? false,
        cac: profile.cac ?? "",
        meansOfIdentification: profile.meansOfIdentification ?? "",
      })
    );
  } catch {
    // Profile row missing or failed to load — still log the person in
    // with the minimal info we have, rather than blocking them entirely.
    dispatch(
      setUser({
        uid: userId,
        email,
        fullName: "",
        initials: "",
        photoURL: null,
        permissions: [],
        location: "",
        companyName: "",
        companyLocation: "",
        phoneNumber: "",
        whatsappNumber: "",
        areasOperate: [],
        aboutMe: "",
        currentMode: "buyer",
        agentProfileCompleted: false,
        cac: "",
        meansOfIdentification: "",
      })
    );
  }
}