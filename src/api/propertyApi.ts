import { supabase } from "../lib/supabase";
import { uploadMultipleMedia, validateMediaItems, type PropertyCreationError, type UploadedMedia } from "../lib/uploadMedia";
import { api } from "../store/base";
import { HIGH_PRIORITY_SCORE, scoreMatch } from "../utils/matchingEngine";
import { extractPricePrefix, isPriceQuery, parsePrice } from "../utils/priceFormatter";
import type { FeedItem, GetFeedsParams, MatchingBuyerRequest } from "../utils/type";


export const propertyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeeds: builder.query<
      {
        success: boolean;
        data: FeedItem[];
      },
      GetFeedsParams
    >({
      async queryFn(
        {
          page = 1,
          limit = 10,
          search = "",
          propertyType,
          listingType,
          itemType = "all",
          status,
          sortBy = "newest",
          minPrice,
          maxPrice,
        },
        api,
      ) {
        try {
          const parsedMin = parsePrice(minPrice);
          const parsedMax = parsePrice(maxPrice);

          const from = (page - 1) * limit;
          const to = from + limit - 1;

          const state = api.getState() as any;
          const currentUser = state.auth.user;

          let query = supabase.from("feed_view").select("*").range(from, to);

          /**
           * 🔍 SEARCH (works across both properties + requests)
           * If the query looks like a price (e.g. "1200", "5m", "₦5,000,000"),
           * also match it as a prefix against price_text, in addition to the
           * normal text search — so a numeric-looking search never loses recall
           * on titles/descriptions that happen to contain those digits.
           */
          if (search) {
            const textSearchTerm = search.replace(/[₦#]/g, "").trim();

            const baseOr = `title.ilike.%${textSearchTerm}%,description.ilike.%${textSearchTerm}%,location.ilike.%${textSearchTerm}%`;

            if (isPriceQuery(search)) {
              const pricePrefix = extractPricePrefix(search);

              // Guard against over-matching on very short numeric queries
              // (e.g. "3" matching every price starting with 3).
              if (pricePrefix) {
                query = query.or(`${baseOr},price_text.ilike.${pricePrefix}%`);
              } else {
                query = query.or(baseOr);
              }
            } else {
              query = query.or(baseOr);
            }
          }

          if (sortBy === "price_desc") {
            query = query.order("price", { ascending: false });
          } else if (sortBy === "price_asc") {
            query = query.order("price", { ascending: true });
          } else {
            // newest (default) or oldest
            query = query.order("created_at", {
              ascending: sortBy === "oldest",
            });
          }

          /**
           * 🏠 FILTER: property type (only affects properties)
           */
          if (propertyType) {
            query = query.eq("property_type", propertyType);
          }

          if (listingType) {
            query = query.eq("listing_type", listingType);
          }

          if (status) {
            query = query.eq("status", status);
          }

          if (itemType !== "all") {
            query = query.eq("item_type", itemType);
          }

          if (parsedMin !== null) {
            query = query.gte("price", parsedMin);
          }

          if (parsedMax !== null) {
            query = query.lte("price", parsedMax);
          }

          let savedPropertyIds = new Set<string>();

          if (currentUser?.uid) {
            const { data: savedProperties } = await supabase
              .from("saved_properties")
              .select("property_id")
              .eq("user_id", currentUser?.uid);

            savedPropertyIds = new Set(
              savedProperties?.map((item) => item.property_id) ?? [],
            );
          }

          const { data, error } = await query;

          const enrichedData = data?.map((item) => ({
            ...item,
            saved:
              currentUser?.uid && item.item_type === "property"
                ? savedPropertyIds.has(item.id)
                : false,
          }));

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
              data: enrichedData as FeedItem[],
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

      providesTags: ["Feeds"],
    }),

    getMyFeeds: builder.query<
      {
        success: boolean;
        data: FeedItem[];
      },
      GetFeedsParams
    >({
      async queryFn(
        {
          page = 1,
          limit = 10,
          search = "",
          propertyType,
          listingType,
          itemType = "all",
          status,
          sortBy = "newest",
          userId,
          minPrice,
          maxPrice,
        },
        api,
      ) {
        try {
          const state = api.getState() as any;
          const user = state.auth.user;

          const parsedMin = parsePrice(minPrice);
          const parsedMax = parsePrice(maxPrice);

          if (!user) {
            return {
              error: {
                success: false,
                message: "Unauthorized",
              },
            };
          }

          const from = (page - 1) * limit;
          const to = from + limit - 1;

          const targetUserId = userId || user?.uid;

          let query = supabase
            .from("my_feed_view")
            .select("*")
            .eq("profile_id", targetUserId)
            .range(from, to);

          if (search) {
            const textSearchTerm = search.replace(/[₦#]/g, "").trim();

            const baseOr = `title.ilike.%${textSearchTerm}%,description.ilike.%${textSearchTerm}%,location.ilike.%${textSearchTerm}%`;

            if (isPriceQuery(search)) {
              const pricePrefix = extractPricePrefix(search);

              // Guard against over-matching on very short numeric queries
              // (e.g. "3" matching every price starting with 3).
              if (pricePrefix) {
                query = query.or(`${baseOr},price_text.ilike.${pricePrefix}%`);
              } else {
                query = query.or(baseOr);
              }
            } else {
              query = query.or(baseOr);
            }
          }

          if (sortBy === "price_desc") {
            query = query.order("price", { ascending: false });
          } else if (sortBy === "price_asc") {
            query = query.order("price", { ascending: true });
          } else {
            // newest (default) or oldest
            query = query.order("created_at", {
              ascending: sortBy === "oldest",
            });
          }

          if (propertyType) {
            query = query.eq("property_type", propertyType);
          }

          if (listingType) {
            query = query.eq("listing_type", listingType);
          }

          if (status) {
            query = query.eq("status", status);
          }

          if (itemType !== "all") {
            query = query.eq("item_type", itemType);
          }

          if (parsedMin !== null) {
            query = query.gte("price", parsedMin);
          }

          if (parsedMax !== null) {
            query = query.lte("price", parsedMax);
          }

          const { data, error } = await query;

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

      providesTags: ["Feeds"],
    }),


  createProperty: builder.mutation({
  async queryFn(
    { propertyData, mediaItems, onProgress },
    api,
  ) {
    try {
      // --------------------------------
      // 1. Get current user
      // --------------------------------

      const state = api.getState() as any;
      const currentUser = state.auth.user;

      if (!currentUser) {
        return {
          error: {
            success: false,
            code: "UNAUTHORIZED",
            title: "Unable to create property",
            message:
              "You need to be logged in to create a property.",
          } satisfies PropertyCreationError,
        };
      }

      // --------------------------------
      // 2. Validate images FIRST
      // --------------------------------

      try {
        await validateMediaItems(mediaItems);
      } catch (error: any) {
        return {
          error: error as PropertyCreationError,
        };
      }

      const uploadId = crypto.randomUUID();
      let uploadedMedia: UploadedMedia[];

      try {
        uploadedMedia = await uploadMultipleMedia(
          mediaItems,
          uploadId,
          onProgress,
        );
      } catch (uploadError: any) {
        console.error(
          "Property media upload failed:",
          uploadError,
        );

        return {
          error: {
            success: false,
            code:
              uploadError?.code ||
              "CLOUDINARY_ERROR",
            title:
              uploadError?.title ||
              "Property not created",
            message:
              uploadError?.message ||
              "We couldn't finish uploading your property images. Your property information is safe. Please try uploading the images again.",
          } satisfies PropertyCreationError,
        };
      }

      // --------------------------------
      // 5. Prepare media for Edge Function
      // --------------------------------

      const media = uploadedMedia.map((item) => ({
        url: item.url,
        type: item.type,
        publicId: item.publicId,
      }));

      // --------------------------------
      // 6. Call create-property Edge Function
      // --------------------------------

      const {
        data: result,
        error: functionError,
      } = await supabase.functions.invoke(
        "create-property",
        {
          body: {
            propertyData,
            media,
          },
        },
      );

      // --------------------------------
      // 7. Handle Edge Function error
      // --------------------------------

      if (functionError) {
        console.error(
          "Create property function failed:",
          functionError,
        );

        let errorResponse: any = null;

        try {
          const context = (functionError as any).context;

          if (context) {
            errorResponse = await context.json();
          }
        } catch (parseError) {
          console.error(
            "Could not parse Edge Function error:",
            parseError,
          );
        }

        return {
          error: {
            success: false,
            code:
              errorResponse?.code ||
              "DATABASE_ERROR",
            title:
              errorResponse?.title ||
              "Property not created",
            message:
              errorResponse?.message ||
              "We couldn't finish creating your property. Your information has been saved. Please try again.",
          } satisfies PropertyCreationError,
        };
      }

      // --------------------------------
      // 8. Handle unsuccessful response
      // --------------------------------

      if (!result?.success) {
        console.error(
          "Create property returned an error:",
          result,
        );

        return {
          error: {
            success: false,
            code:
              result?.code ||
              "UNKNOWN_ERROR",
            title:
              result?.title ||
              "Property not created",
            message:
              result?.message ||
              "Something prevented us from finishing your property listing. Your information has been saved. Please try again.",
          } satisfies PropertyCreationError,
        };
      }

      // --------------------------------
      // 9. SUCCESS
      // --------------------------------

      return {
        data: {
          success: true,
          message:
            result.message ||
            "Property created successfully",
          data: result.data,
        },
      };
    } catch (error: any) {
      console.error(
        "Unexpected error during property creation:",
        error,
      );

      return {
        error: {
          success: false,
          code: "UNKNOWN_ERROR",
          title: "Property not created",
          message:
            "Something prevented us from finishing your property listing. Your information has been saved. Please try again.",
        } satisfies PropertyCreationError,
      };
    }
  },

  invalidatesTags: [
    "Properties",
    "Feeds",
    "BuyersMatch",
  ],
}),

    updateProperty: builder.mutation({
      async queryFn(
        { propertyId, updates, mediaItems = [], removedImages = [] },
        api,
      ) {
        try {
          const state = api.getState() as any;
          const currentUser = state.auth.user;

          /**
           * STEP 1
           * Remove deleted images
           */
          if (removedImages.length > 0) {
            await supabase
              .from("property_media")
              .delete()
              .eq("property_id", propertyId)
              .in("media_url", removedImages);
          }

          /**
           * STEP 2
           * Get current media
           */
          const { data: existingMedia, error: mediaError } = await supabase
            .from("property_media")
            .select("*")
            .eq("property_id", propertyId);

          if (mediaError) {
            return {
              error: {
                success: false,
                message: mediaError.message,
              },
            };
          }

          const existingUrls = new Set(
            existingMedia?.map((m) => m.media_url) || [],
          );

          /**
           * STEP 3
           * Find newly added images
           */
          const newImages = mediaItems.filter(
            (item: any) => !existingUrls.has(item.uri),
          );

          /**
           * STEP 4
           * Upload only newly added images
           */
          if (newImages.length > 0) {
            const uploadedMedia = await uploadMultipleMedia(
              newImages,
              propertyId,
            );

            if (uploadedMedia?.length) {
              await supabase.from("property_media").insert(
                uploadedMedia.map((media: any, index: number) => ({
                  property_id: propertyId,
                  media_url: media.media_url,
                  media_type: media.media_type,
                  is_cover: false,
                  sort_order: (existingMedia?.length || 0) + index,
                })),
              );
            }
          }

          /**
           * STEP 5
           * Refresh media after upload/delete
           */
          const { data: refreshedMedia } = await supabase
            .from("property_media")
            .select("*")
            .eq("property_id", propertyId);

          /**
           * STEP 6
           * Detect cover image
           */
          let coverUrl = updates.cover_url;

          if (mediaItems.length > 0) {
            const firstImage = mediaItems[0];

            const matchingMedia = refreshedMedia?.find(
              (m) =>
                m.media_url === firstImage.uri ||
                m.media_url.includes(firstImage.uri.split("/").pop() ?? ""),
            );

            coverUrl = matchingMedia?.media_url ?? firstImage.uri;
          }

          /**
           * STEP 7
           * Reset cover flags
           */
          await supabase
            .from("property_media")
            .update({ is_cover: false })
            .eq("property_id", propertyId);

          await supabase
            .from("property_media")
            .update({ is_cover: true })
            .eq("property_id", propertyId)
            .eq("media_url", coverUrl);

          /**
           * STEP 8
           * Update property
           */
          const payload = {
            ...updates,
            cover_url: coverUrl,
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from("properties")
            .update(payload)
            .eq("id", propertyId)
            .eq("owner_id", currentUser?.uid)
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
              message: "Property updated successfully",
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

      invalidatesTags: ["Properties", "MyFeeds", "Feeds"],
    }),

    deleteProperty: builder.mutation({
      async queryFn(propertyId) {
        try {
          const { error } = await supabase
            .from("properties")
            .delete()
            .eq("id", propertyId);

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
              message: "Property deleted",
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

      invalidatesTags: ["Properties", "Feeds"],
    }),
    toggleSavedProperty: builder.mutation({
      async queryFn(propertyId, api) {
        console.log(">>>>>>propertyId from api", propertyId);

        try {
          const state = api.getState() as any;

          const currentUser = state.auth.user;

          const { data: existing } = await supabase
            .from("saved_properties")
            .select("id")
            .eq("user_id", currentUser?.uid)
            .eq("property_id", propertyId)
            .maybeSingle();

          let saved = false;

          if (existing) {
            await supabase
              .from("saved_properties")
              .delete()
              .eq("id", existing.id);

            saved = false;
          } else {
            await supabase.from("saved_properties").insert({
              user_id: currentUser?.uid,
              property_id: propertyId,
            });

            saved = true;
          }

          return {
            data: {
              success: true,
              saved,
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

      invalidatesTags: ["SavedProperties", "Properties"],
    }),
    getProperties: builder.query({
      async queryFn({
        page = 1,
        limit = 10,
        search = "",
        propertyType,
        listingType,
        minPrice,
        maxPrice,
      }) {
        try {
          const from = (page - 1) * limit;
          const to = from + limit - 1;

          let query = supabase
            .from("properties")
            .select(`*, property_media(*), profiles(*)`)
            .eq("status", "pending")
            .range(from, to)
            .order("created_at", { ascending: false });

          if (search) {
            query = query.or(
              `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`,
            );
          }

          if (propertyType) query = query.eq("property_type", propertyType);
          if (listingType) query = query.eq("listing_type", listingType);
          if (minPrice) query = query.gte("price", minPrice);
          if (maxPrice) query = query.lte("price", maxPrice);

          const { data, error } = await query;

          console.log(">>>>getProperties", { data, error });

          if (error) {
            return { error: { success: false, message: error.message } };
          }

          const formatted = (data || []).map((property: any) => {
            const media: any[] = property.property_media || [];
            const profile = property.profiles || {};

            const coverUrl =
              media.find((m: any) => m.is_cover)?.media_url ||
              media[0]?.media_url ||
              property.cover_url ||
              null;

            const primaryMedia = coverUrl
              ? coverUrl.replace(
                  "/upload/",
                  "/upload/w_600,h_400,c_fill,q_auto,f_auto/",
                )
              : null;

            const mediaUrls = media
              .sort((a: any) => (a.is_cover ? -1 : 1))
              .map((m: any) =>
                m.media_url.replace("/upload/", "/upload/w_800,q_auto,f_auto/"),
              );

            return {
              ...property, // ← spread everything
              item_type: "property",
              user_id: property.owner_id,
              primary_media: primaryMedia,
              media_urls: mediaUrls,
              cover_url: coverUrl,
              user_name: profile.full_name ?? null,
              user_photo: profile.avatar_url ?? null,
              agent_phone: profile.phone_number ?? null,
              agent_email: profile.email ?? null,
              company_name: profile.company_name ?? null,
              whatsapp_number: profile.whatsapp_number ?? null,
              saved: false,
            };
          });

          return { data: { success: true, data: formatted } };
        } catch (err: any) {
          return { error: { success: false, message: err.message } };
        }
      },

      providesTags: ["Properties"],
    }),
    getSingleProperty: builder.query({
      async queryFn(propertyId, api) {
        try {
          const state = api.getState() as any;
          const currentUser = state.auth.user;

          const { data, error } = await supabase
            .from("properties")
            .select(
              `
            *,
            property_media(*)
          `,
            )
            .eq("id", propertyId)
            .single();

          let saved = false;

          if (currentUser) {
            const { data: favorite } = await supabase
              .from("favorite_properties")
              .select("id")
              .eq("property_id", propertyId)
              .eq("user_id", currentUser?.uid)
              .maybeSingle();

            saved = !!favorite;
          }

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
              data: {
                ...data,
                saved,
              },
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

      providesTags: ["Properties"],
    }),
    getSavedProperties: builder.query({
      async queryFn(_, api) {
        try {
          const state = api.getState() as any;

          const currentUser = state.auth.user;

          if (!currentUser) {
            return {
              error: {
                success: false,

                message: "Unauthorized",
              },
            };
          }

          const { data, error } = await supabase
            .from("saved_properties")
            .select(
              `
              *,
              properties (
                *,
                profiles (
                  full_name,
                  avatar_url,
                  email
                ),
                property_media (*)
              )
            `,
            )
            .eq("user_id", currentUser?.uid)
            .order("created_at", {
              ascending: false,
            });

          if (error) {
            return {
              error: {
                success: false,
                message: error.message,
              },
            };
          }

          // flatten structure
          // const favorites = data.map((item: any) => item.properties);

          const savedProperties = data.map((item: any) => ({
            ...item.properties,
            agent_name: item.properties.profiles?.full_name,
            agent_photo: item.properties.profiles?.avatar_url,
            agent_email: item.properties.profiles?.email,
            media_urls:
              item.properties.property_media
                ?.sort(
                  (a: any, b: any) => Number(b.is_cover) - Number(a.is_cover),
                )
                .map((m: any) => m.media_url) || [],
          }));

          return {
            data: {
              success: true,
              data: savedProperties,
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

      providesTags: ["SavedProperties"],
    }),
    getMyProperties: builder.query({
      async queryFn(_, api) {
        try {
          const state = api.getState() as any;

          const currentUser = state.auth.user;

          console.log(">>>>>>currentUser", currentUser?.uid);

          if (!currentUser) {
            return {
              error: {
                success: false,
                message: "Unauthorized",
              },
            };
          }

          const { data, error } = await supabase
            .from("properties")
            .select(
              `
            *,
            property_media(*)
          `,
            )
            .eq("owner_id", currentUser?.uid)
            .order("created_at", {
              ascending: false,
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

      providesTags: ["Properties"],
    }),

    getUserProperties: builder.query({
      async queryFn({ user_id }, api) {
        try {
          const state = api.getState() as any;

          if (!user_id) {
            return {
              error: {
                success: false,
                message: "Unauthorized",
              },
            };
          }

          const { data, error } = await supabase
            .from("properties")
            .select(
              `
            *,
            property_media(*)
          `,
            )
            .eq("owner_id", user_id)
            .order("created_at", {
              ascending: false,
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

      providesTags: ["Properties"],
    }),

    getPropertiesByDashboardCategory: builder.query({
      async queryFn({ category, limit = 10, latitude, longitude }, api) {
        try {
          const state = api.getState() as any;
          const currentUser = state.auth.user;

          let query = supabase
            .from("feed_view")
            .select("*")
            .eq("item_type", "property")
            .eq("status", "pending");

          switch (category) {
            case "recent":
            case "newDeals":
              query = query
                .order("created_at", { ascending: false })
                .limit(limit);
              break;

            case "featured":
              // Requires an `is_featured` boolean column on properties/feed_view
              query = query
                .eq("is_featured", true)
                .order("created_at", { ascending: false })
                .limit(limit);
              break;

            case "nearby": {
              // Requires lat/lng on the property and the caller passing the
              // user's current coordinates. Without real geo filtering this
              // can never be meaningfully different from "recent" — it needs
              // actual distance calculation (see note below).
              if (latitude != null && longitude != null) {
                const { data: nearbyData, error: nearbyError } =
                  await supabase.rpc("properties_nearby", {
                    lat: latitude,
                    lng: longitude,
                    result_limit: limit,
                  });
                if (nearbyError) throw nearbyError;
                return {
                  data: {
                    success: true,
                    data: nearbyData,
                  },
                };
              }
              // Fallback if no coordinates provided — still ordered, not random
              query = query
                .order("created_at", { ascending: false })
                .limit(limit);
              break;
            }

            default:
              query = query
                .order("created_at", { ascending: false })
                .limit(limit);
              break;
          }

          const { data, error } = await query;
          if (error) throw error;

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

    getMatchingBuyerRequests: builder.query<
      {
        success: boolean;
        total: number;
        data: MatchingBuyerRequest[];
      },
      void
    >({
      async queryFn(_, api) {
        try {
          const state = api.getState() as any;
          const currentUser = state.auth.user;

          if (!currentUser) {
            return { error: { success: false, message: "Unauthorized" } };
          }

          const { data: properties, error: propertyError } = await supabase
            .from("properties")
            .select(
              `
          id,
          title,
          location,
          price,
          property_type,
          bedrooms,
          property_media(media_url, is_cover)
        `,
            )
            .eq("owner_id", currentUser?.uid)
            .eq("status", "pending");

          if (propertyError) throw propertyError;

          if (!properties?.length) {
            return { data: { success: true, total: 0, data: [] } };
          }

          const { data: requests, error: requestError } = await supabase
            .from("requests")
            .select(
              `
          id, user_id, short_text, description, budget,
          preferred_location, contact_option, contact_phone,
          approval_status, created_at
        `,
            )
            .eq("approval_status", "pending")
            .neq("user_id", currentUser?.uid)
            .order("created_at", { ascending: false })
            .limit(50);

          if (requestError) throw requestError;

          const requestMatchMap = new Map<
            string,
            {
              request: any;
              propertyMatches: {
                property: any;
                score: number;
                matchedFields: string[];
              }[];
            }
          >();

          properties.forEach((property: any) => {
            requests?.forEach((request: any) => {
              if (request.user_id === currentUser?.uid) return;

              const requestText = `${request.short_text ?? ""} ${request.description ?? ""}`;

              const result = scoreMatch({
                propertyLocation: property.location,
                propertyPrice: property.price,
                propertyType: property.property_type,
                propertyBedrooms: property.bedrooms,
                propertyTitle: property.title,
                requestLocation: request.preferred_location,
                requestBudget: request.budget,
                requestText,
              });

              if (!result) return;

              const existing = requestMatchMap.get(request.id);
              const entry: {
                property: any;
                score: number;
                matchedFields: string[];
              } = {
                property,
                score: result.score,
                matchedFields: result.matchedFields,
              };
              if (existing) {
                existing.propertyMatches.push(entry);
              } else {
                requestMatchMap.set(request.id, {
                  request,
                  propertyMatches: [entry],
                });
              }
            });
          });

          const matches: MatchingBuyerRequest[] = Array.from(
            requestMatchMap.values(),
          ).map(({ request, propertyMatches }) => {
            const best = propertyMatches.reduce((top, current) =>
              current.score > top.score ? current : top,
            );

            const coverImage =
              best.property.property_media?.find((m: any) => m.is_cover)
                ?.media_url ??
              best.property.property_media?.[0]?.media_url ??
              null;

            return {
              ...request,
              score: best.score,
              matchedFields: best.matchedFields,
              highPriority: best.score >= HIGH_PRIORITY_SCORE, // 👈 new
              matchedListingsCount: propertyMatches.length,
              matchedProperty: {
                id: best.property.id,
                title: best.property.title,
                location: best.property.location,
                price: best.property.price,
                image: coverImage,
              },
            };
          });

          const sorted = matches.sort((a, b) => b.score - a.score);

          return {
            data: {
              success: true,
              total: sorted.length, // 👈 true total, not capped
              data: sorted.slice(0, 20), // cap payload size, not the reported count
            },
          };
        } catch (err: any) {
          return { error: { success: false, message: err.message } };
        }
      },
      providesTags: ["BuyersMatch"],
    }),

    getMatchingPropertiesForMyRequests: builder.query<
      {
        success: boolean;
        total: number;
        data: FeedItem[];
      },
      void
    >({
      async queryFn(_, api) {
        try {
          const state = api.getState() as any;
          const currentUser = state.auth.user;

          if (!currentUser) {
            return { error: { success: false, message: "Unauthorized" } };
          }

          const { data: myRequests, error: requestError } = await supabase
            .from("requests")
            .select(
              `
          id, short_text, description, budget,
          preferred_location, approval_status, created_at
        `,
            )
            .eq("user_id", currentUser?.uid)
            .eq("approval_status", "pending");

          if (requestError) throw requestError;

          if (!myRequests?.length) {
            return { data: { success: true, total: 0, data: [] } };
          }

          // Fetch full property fields — enough to build a complete PropertyItem
          const { data: properties, error: propertyError } = await supabase
            .from("properties")
            .select(
              `
          id, owner_id, title, description, price, location,
          property_type, listing_type, status, bedrooms, bathrooms, sqm,
          price_duration, created_at,
          property_media(media_url, is_cover),
          profiles!properties_owner_id_fkey(full_name, avatar_url)
        `,
            )
            .eq("status", "pending")
            .neq("owner_id", currentUser?.uid)
            .order("created_at", { ascending: false })
            .limit(50);

          if (propertyError) throw propertyError;

          const propertyMatchMap = new Map<
            string,
            {
              property: any;
              requestMatches: {
                request: any;
                score: number;
                matchedFields: string[];
              }[];
            }
          >();

          myRequests.forEach((request: any) => {
            const requestText = `${request.short_text ?? ""} ${request.description ?? ""}`;

            properties?.forEach((property: any) => {
              const result = scoreMatch({
                propertyLocation: property.location,
                propertyPrice: property.price,
                propertyType: property.property_type,
                propertyBedrooms: property.bedrooms,
                propertyTitle: property.title,
                requestLocation: request.preferred_location,
                requestBudget: request.budget,
                requestText,
              });

              if (!result) return;

              const existing = propertyMatchMap.get(property.id);
              const entry = {
                request,
                score: result.score,
                matchedFields: result.matchedFields,
              };
              if (existing) {
                existing.requestMatches.push(entry);
              } else {
                propertyMatchMap.set(property.id, {
                  property,
                  requestMatches: [entry],
                });
              }
            });
          });

          const matches: FeedItem[] = Array.from(propertyMatchMap.values()).map(
            ({ property, requestMatches }) => {
              const best = requestMatches.reduce((top, current) =>
                current.score > top.score ? current : top,
              );

              const mediaUrls =
                property.property_media?.map((m: any) => m.media_url) ?? [];
              const coverImage =
                property.property_media?.find((m: any) => m.is_cover)
                  ?.media_url ??
                mediaUrls[0] ??
                null;

              return {
                id: property.id,
                profile_id: property.owner_id,
                price_duration: property.price_duration,
                title: property.title,
                description: property.description,
                price: property.price,
                location: property.location,
                media_urls: mediaUrls,
                primary_media: coverImage,
                item_type: "property",
                property_type: property.property_type,
                listing_type: property.listing_type,
                status: property.status,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                sqm: property.sqm,
                user_name: property.profiles?.full_name ?? null,
                user_photo: property.profiles?.avatar_url ?? null,
                created_at: property.created_at,
                // extra match metadata — not part of PropertyItem but harmless to include
                score: best.score,
                matchedFields: best.matchedFields,
                highPriority: best.score >= HIGH_PRIORITY_SCORE,
                matchedRequestsCount: requestMatches.length,
              } as FeedItem & {
                score: number;
                matchedFields: string[];
                highPriority: boolean;
                matchedRequestsCount: number;
              };
            },
          );

          const sorted = matches.sort((a: any, b: any) => b.score - a.score);

          return {
            data: {
              success: true,
              total: sorted.length,
              data: sorted.slice(0, 20),
            },
          };
        } catch (err: any) {
          return { error: { success: false, message: err.message } };
        }
      },
      providesTags: ["MatchingProperties"],
    }),
  }),
});

export const {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useToggleSavedPropertyMutation,
  useGetPropertiesQuery,
  useGetSinglePropertyQuery,
  useLazyGetSinglePropertyQuery,
  useGetSavedPropertiesQuery,
  useGetMyPropertiesQuery,
  useLazyGetMyFeedsQuery,
  useGetFeedsQuery,
  useGetMyFeedsQuery,
  useGetPropertiesByDashboardCategoryQuery,
  useGetMatchingBuyerRequestsQuery,
  useGetUserPropertiesQuery,
  useGetMatchingPropertiesForMyRequestsQuery,
} = propertyApi;
