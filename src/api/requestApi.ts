import { supabase } from "../lib/supabase";
import { api } from "../store/base";
import type { CreateRequestPayload } from "../utils/type";

export const requestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRequest: builder.mutation<
      { success: boolean; data: Request },
      { requestData: CreateRequestPayload }
    >({
      async queryFn({ requestData }, api) {
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

          const payload: Omit<Request, "id" | "created_at"> = {
            ...requestData,
            user_id: user?.uid!,
            approval_status: "pending",
          };

          const { data, error } = await supabase
            .from("requests")
            .insert(payload)
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
      invalidatesTags: ["Requests", "Feeds"],
    }),
    getAllRequests: builder.query({
      async queryFn({ page = 1, limit = 10 }) {
        try {
          const from = (page - 1) * limit;
          const to = from + limit - 1;

          const { data, error } = await supabase
            .from("requests")
            .select("*")
            .eq("approval_status", "approved")
            .order("created_at", { ascending: false })
            .range(from, to);

          if (error) {
            return { error: { success: false, message: error.message } };
          }

          return {
            data: { success: true, data },
          };
        } catch (err: any) {
          return {
            error: { success: false, message: err.message },
          };
        }
      },
      providesTags: ["Requests"],
    }),
    getUserRequests: builder.query({
      async queryFn({ userId, page = 1, limit = 10 }) {
        try {
          const from = (page - 1) * limit;
          const to = from + limit - 1;

          const { data, error } = await supabase
            .from("requests")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .range(from, to);

          if (error) {
            return { error: { success: false, message: error.message } };
          }

          return {
            data: { success: true, data },
          };
        } catch (err: any) {
          return {
            error: { success: false, message: err.message },
          };
        }
      },
      providesTags: ["Requests"],
    }),
    getSingleRequest: builder.query({
      async queryFn(id: string) {
        try {
          const { data, error } = await supabase
            .from("requests")
            .select("*")
            .eq("id", id)
            .single();

          if (error) {
            return { error: { success: false, message: error.message } };
          }

          return {
            data: { success: true, data },
          };
        } catch (err: any) {
          return {
            error: { success: false, message: err.message },
          };
        }
      },
    }),
    SaveRequest: builder.mutation({
      async queryFn({ request_id }, api) {
        console.log("??????????", request_id);

        try {
          const state = api.getState() as any;
          const user = state.auth.user;

          if (!user) {
            return {
              error: { success: false, message: "Unauthorized" },
            };
          }

          const { data, error } = await supabase
            .from("saved_requests")
            .insert({
              user_id: user?.uid,
              request_id,
            })
            .select()
            .single();

          if (error) {
            return {
              error: { success: false, message: error.message },
            };
          }

          return {
            data: { success: true, data },
          };
        } catch (err: any) {
          return {
            error: { success: false, message: err.message },
          };
        }
      },

      invalidatesTags: ["SavedRequests"],
    }),
    getSavedRequests: builder.query({
      async queryFn({ page = 1, limit = 10 }, api) {
        try {
          const state = api.getState() as any;
          const user = state.auth.user;

          if (!user) {
            return {
              error: { success: false, message: "Unauthorized" },
            };
          }

          const from = (page - 1) * limit;
          const to = from + limit - 1;

          const { data, error } = await supabase
            .from("saved_requests")
            .select(
              `
          id,
          created_at,
          request:requests (
            id,
            title,
            short_text,
            description,
            budget,
            preferred_location,
            contact_option,
            approval_status,
            created_at
          )
        `,
            )
            .eq("user_id", user?.uid)
            .order("created_at", { ascending: false })
            .range(from, to);

          if (error) {
            return {
              error: { success: false, message: error.message },
            };
          }

          // 🔥 FLATTEN for UI
          const formatted = (data || []).map((item: any) => ({
            saved_id: item.id,
            request_id: item.request?.id,
            title: item.request?.title,
            short_text: item.request?.short_text,
            description: item.request?.description,
            budget: item.request?.budget,
            preferred_location: item.request?.preferred_location,
            contact_option: item.request?.contact_option,
            approval_status: item.request?.approval_status,
            created_at: item.request?.created_at,
          }));

          return {
            data: {
              success: true,
              data: formatted,
            },
          };
        } catch (err: any) {
          return {
            error: { success: false, message: err.message },
          };
        }
      },

      providesTags: ["SavedRequests"],
    }),
    getMyRequests: builder.query<
      {
        success: boolean;
        data: Request[];
      },
      void
    >({
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
            .from("requests")
            .select("*")
            .eq("user_id", user?.uid)
            .order("created_at", { ascending: false });

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
              data: data || [],
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

      providesTags: ["Requests"],
    }),
  }),
});

export const {
  useCreateRequestMutation,
  useGetAllRequestsQuery,
  useGetUserRequestsQuery,
  useGetSingleRequestQuery,
  useSaveRequestMutation,
  useGetSavedRequestsQuery,
  useGetMyRequestsQuery,
} = requestApi;
