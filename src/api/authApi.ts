import { supabase } from "../lib/supabase";
import { api } from "../store/base";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // SIGNUP
    signUp: builder.mutation({
        async queryFn({ fullName, email, password }) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
              emailRedirectTo: "rapavo://auth/callback",
            },
          });

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
              message: data.session
                ? "Account created successfully"
                : "Account created. Please check your email to verify your account.",
              data,
              emailConfirmationRequired: !data.session,
            },
          };
        } catch (err: any) {
          console.log(">>>>>>errors", err);

          return {
            error: {
              success: false,
              message: err?.message || "Something went wrong",
            },
          };
        }
      },
      invalidatesTags: ["BuyersMatch", "SavedProperties", "Feeds", "MyFeeds"],
    }),

    login: builder.mutation({
         async queryFn({ email, password }) {
        try {
          // 1. Authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.log(">>>>>> login errors", error);

            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          if (!data.user) {
            return {
              error: {
                success: false,
                message: "Unable to retrieve your account.",
              },
            };
          }

          console.log(">>>>>> logged in user", data.user.id);

          // 2. Check whether the account is pending deletion
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("deletion_requested_at, scheduled_deletion_at")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            console.error(">>>>>> profile check error", profileError);

            // Don't leave the user logged in if we cannot verify their status
            await supabase.auth.signOut();

            return {
              error: {
                success: false,
                message:
                  "Unable to verify your account status. Please try again.",
              },
            };
          }

          console.log(">>>>>profile", profile);

          // 3. Block accounts pending deletion
          if (profile?.deletion_requested_at) {
            await supabase.auth.signOut();

            return {
              error: {
                success: false,
                message:
                  "This account has been scheduled for deletion and can no longer be accessed.",
              },
            };
          }

          return {
            data: {
              success: true,
              message: "Login successful",
              data,
            },
          };
        } catch (err: any) {
          console.error(">>>>>> login unexpected error", err);

          // Safety: don't leave a partially authenticated session
          await supabase.auth.signOut();

          return {
            error: {
              success: false,
              message: err?.message || "Something went wrong",
            },
          };
        }
      },

      invalidatesTags: ["BuyersMatch", "SavedProperties", "Feeds", "MyFeeds"],
    }),

    // LOGOUT
    logout: builder.mutation({
        async queryFn(_) {
        try {
          const { error } = await supabase.auth.signOut();

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          // router.replace("/(public)");
          // api.dispatch(clearUser());

          return {
            data: {
              success: true,
              message: "Logged out successfully",
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
    }),

    resendConfirmationEmail: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      { email: string }
    >({
      async queryFn({ email }) {
        try {
          const { error } = await supabase.auth.resend({
            type: "signup",
            email: email.trim().toLowerCase(),
            options: {
              emailRedirectTo: "rapavo://auth/callback",
            },
          });

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
              message: "Verification email sent.",
            },
          };
        } catch (err: any) {
          return {
            error: {
              success: false,
              message: err?.message || "Unable to resend verification email.",
            },
          };
        }
      },
    }),
  }),
});

export const {
  useSignUpMutation,
  useLoginMutation,
  useLogoutMutation,
  useResendConfirmationEmailMutation,
} = authApi;
