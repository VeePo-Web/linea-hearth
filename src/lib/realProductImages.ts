// Real product image URLs from Supabase storage.
// Used as decorative/editorial fallbacks across marketing surfaces so we never
// reference ghost products that don't exist in the live catalogue.

const BASE =
  "https://harckavibhmimndfvnyo.supabase.co/storage/v1/object/public/product-images";

export const REAL_PRODUCT_IMAGES = {
  youNeedJesus: `${BASE}/1a3c22e9-5e13-4dca-acc3-234fcc088b29/738b269e-4457-45a8-88f6-d774477bf63c.png`,
  adamGod: `${BASE}/04d9e2cc-f8e9-4098-8ba7-3bfe43b8cb4b/4d27e4c9-37db-481a-a97b-18f68db17c55.png`,
  adamGodAlt: `${BASE}/04d9e2cc-f8e9-4098-8ba7-3bfe43b8cb4b/01d09388-4f2d-4426-adc4-f5bc3b53a5dc.png`,
  burningLove: `${BASE}/23b49cdc-7be6-4de7-a546-83484c2b4e6f/4d1a2e86-4ad0-40f5-9e04-2a1ccc9ec8e9.png`,
  burningLoveAlt: `${BASE}/23b49cdc-7be6-4de7-a546-83484c2b4e6f/3d8f7505-7ebe-46cf-af44-8bab03da2828.png`,
  faithInFear: `${BASE}/f407e223-692a-4fd9-a986-ff0c5dc01f25/7a08c3b9-b7d5-479c-887a-3d9756923d0a.png`,
  ichthysFish: `${BASE}/ca610da6-5d97-4573-b57f-8036d6d2ee26/a7100734-e878-4250-9cbf-3825c7a6b724.png`,
  inJesusName: `${BASE}/c004bfb5-f5a6-41ec-a26a-f8ef6ae7f02f/8510c633-87ca-4495-a786-bfa111cac402.png`,
  firstLoveSnow: `${BASE}/93e7bbcc-be82-4844-a220-3f6e1386269b/1c291813-5315-4779-b575-4e79cf796fac.png`,
  godBlessSweater: `${BASE}/35e15ec0-6fca-4e54-b697-391b766234f9/643b4860-2497-45fa-81ca-2b828e783b9a.png`,
  namesOfGod: `${BASE}/5da79569-7f75-40bf-a091-15a9a52a4f0c/1433aeea-7066-4f80-8165-17b9bf4a36b4.png`,
  revelation320: `${BASE}/6fbfd32f-951d-4808-951a-16a39e29c684/fd670ee1-dd66-44ce-9c59-fff02a98b6fb.png`,
} as const;
