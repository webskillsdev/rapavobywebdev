import { supabase } from "../lib/supabase";
import { uploadProfileImage } from "../lib/uploadMedia";
import { setUser } from "../store/authSlice";
import { api } from "../store/base";
import type { GetUserProfileResponse, SubmitDocumentVerificationPayload, SubmitIdVerificationPayload, UpdateProfilePayload } from "../utils/type";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<any, UpdateProfilePayload>({
      async queryFn(
        {
          fullName,
          avatarUri,
          aboutMe,
          whatsappNumber,
          phoneNumber,
          location,
          areasOperate,
          companyName,
          companyLocation,
          cac,
          meansOfIdentification,
          currentMode,
          agentProfileCompleted,
        }: UpdateProfilePayload,
        api,
      ) {
        try {
          const state = api.getState() as any;
          const currentUser = state.auth.user;

          if (!currentUser) {
            return {
              error: {
                success: false,
                message: "User not authenticated",
              },
            };
          }

          let avatarUrl = currentUser?.photoURL;

          // Upload avatar if changed
                  if (avatarUri) {
            avatarUrl =
              typeof avatarUri === "string"
                ? avatarUri
                : await uploadProfileImage(avatarUri, currentUser?.uid);
          }

          const updatePayload = {
            full_name: fullName,
            avatar_url: avatarUrl,
            about_me: aboutMe,
            whatsapp_number: whatsappNumber,
            phone_number: phoneNumber,
            location: location,
            areas_operate: areasOperate,
            company_name: companyName,
            company_location: companyLocation,
            cac_document_url: cac,
            means_of_identification_url: meansOfIdentification,
            updated_at: new Date().toISOString(),
            current_mode: currentMode,
            agent_profile_completed: agentProfileCompleted,
          };

          const { data: profile, error } = await supabase
            .from("profiles")
            .update(updatePayload)
            .eq("id", currentUser?.uid)
            .select()
            .single();

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          api.dispatch(
            setUser({
              ...currentUser,

              uid: profile.id,
              email: profile.email,

              fullName: profile.full_name,

              initials: profile.full_name
                ?.split(" ")
                ?.map((n: string) => n[0])
                ?.join(""),

              photoURL: profile.avatar_url,

              aboutMe: profile.about_me,

              whatsappNumber: profile.whatsapp_number,
              phoneNumber: profile.phone_number,

              location: profile.location,

              areasOperate: profile.areas_operate,

              companyName: profile.company_name,
              companyLocation: profile.company_location,

              currentMode: profile.current_mode, // <-- Missing
              agentProfileCompleted: profile.agent_profile_completed,
            }),
          );

          return {
            data: {
              success: true,
              message: "Profile updated successfully",
              data: profile,
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err?.message || "Something went wrong",
            },
          };
        }
      },
      invalidatesTags: ["Profile"],
    }),

    getUserProfile: builder.query<GetUserProfileResponse, string>({
      async queryFn(userId: string) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          const { count: activeListings } = await supabase
            .from("properties")
            .select("*", { count: "exact", head: true })
            .eq("owner_id", userId)
            .eq("status", "approved");

          const { count: profileViews } = await supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", userId);

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          return {
            data: {
              ...data,
              active_listings: activeListings ?? 0,
              profile_views: profileViews ?? 0,
              success: true,
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err.message,
            },
          };
        }
      },

      providesTags: ["Profile"],
    }),

    submitIdVerification: builder.mutation<any, SubmitIdVerificationPayload>({
      async queryFn(payload, api) {
        try {
          const state = api.getState() as any;
          const user = state.auth.user;

          if (!user) {
            return {
              error: {
                success: false,
                message: "Unauthorized",
              },
            };
          }

          const { data, error } = await supabase
            .from("user_id_verifications")
            .insert({
              user_id: user?.uid,
              document_type: payload.document_type,
              document_number: payload.document_number,
              front_image: payload.front_image,
              back_image: payload.back_image,
              status: "pending",
            })
            .select()
            .single();

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          return {
            data: {
              success: true,
              data,
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err.message,
            },
          };
        }
      },
    }),

    submitDocumentVerification: builder.mutation<
      any,
      SubmitDocumentVerificationPayload
    >({
      async queryFn(payload, api) {
        try {
          const state = api.getState() as any;
          const user = state.auth.user;

          if (!user) {
            return {
              error: {
                success: false,
                message: "Unauthorized",
              },
            };
          }

          const { data, error } = await supabase
            .from("user_documents")
            .insert({
              user_id: user?.uid,
              document_name: payload.document_name,
              document_url: payload.document_url,
              status: "pending",
            })
            .select()
            .single();

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          return {
            data: {
              success: true,
              data,
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err.message,
            },
          };
        }
      },
    }),

    // admin
    approveIdVerification: builder.mutation<any, string>({
      async queryFn(verificationId) {
        try {
          const { data: verification, error } = await supabase
            .from("user_id_verifications")
            .update({
              status: "approved",
              reviewed_at: new Date().toISOString(),
            })
            .eq("id", verificationId)
            .select()
            .single();

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          await supabase
            .from("profiles")
            .update({
              id_verified: true,
            })
            .eq("id", verification.user_id);

          return {
            data: {
              success: true,
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err.message,
            },
          };
        }
      },
    }),

    approveDocumentVerification: builder.mutation<any, string>({
      async queryFn(documentId) {
        try {
          const { data: document, error } = await supabase
            .from("user_documents")
            .update({
              status: "approved",
              reviewed_at: new Date().toISOString(),
            })
            .eq("id", documentId)
            .select()
            .single();

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          await supabase
            .from("profiles")
            .update({
              document_verified: true,
            })
            .eq("id", document.user_id);

          return {
            data: {
              success: true,
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err.message,
            },
          };
        }
      },
    }),

    getMyDocumentVerification: builder.query({
      async queryFn(_, api) {
        try {
          const state = api.getState() as any;
          const user = state.auth.user;

          if (!user) {
            return {
              error: {
                success: false,
                message: "Unauthorized",
              },
            };
          }

          const { data, error } = await supabase
            .from("user_documents")
            .select("*")
            .eq("user_id", user?.uid)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          return {
            data: {
              success: true,
              data,
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err.message,
            },
          };
        }
      },

      //   providesTags: ["DocumentVerification"],
    }),

    getMyIdVerification: builder.query({
      async queryFn(_, api) {
        try {
          const state = api.getState() as any;
          const user = state.auth.user;

          if (!user) {
            return {
              error: {
                success: false,
                message: "Unauthorized",
              },
            };
          }

          const { data, error } = await supabase
            .from("user_id_verifications")
            .select("*")
            .eq("user_id", user?.uid)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          return {
            data: {
              success: true,
              data,
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err.message,
            },
          };
        }
      },

      //   providesTags: ["IdVerification"],
    }),

    switchAccountMode: builder.mutation({
      queryFn: async (mode: "buyer" | "agent", api) => {
        // const currentUser = await getCurrentUser();
        const state = api.getState() as any;
        const currentUser = state.auth.user;

        if (!currentUser?.uid) {
          return {
            error: {
              status: 401,
              data: "Unauthorized",
            },
          };
        }

        const { data, error } = await supabase
          .from("profiles")
          .update({
            current_mode: mode,
          })
          .eq("id", currentUser?.uid)
          .select()
          .single();

        if (error) {
          return {
            error: {
              status: 500,
              data: error.message,
            },
          };
        }

        return { data };
      },
      invalidatesTags: ["Profile"],
    }),
  }),
});

// const { data: idVerification } = useGetMyIdVerificationQuery({});
// const { data: documentVerification } = useGetMyDocumentVerificationQuery({});

// <Text>
//   ID Verification:{" "}
//   {idVerification?.data?.status ?? "not submitted"}
// </Text>

// <Text>
//   Document Verification:{" "}
//   {documentVerification?.data?.status ?? "not submitted"}
// </Text>

export const {
  useUpdateProfileMutation,
  useGetUserProfileQuery,
  useSwitchAccountModeMutation,
  useSubmitIdVerificationMutation,
  useSubmitDocumentVerificationMutation,
  useGetMyIdVerificationQuery,
  useGetMyDocumentVerificationQuery,
} = userApi;
