// import { PublicTrip } from "@/store/trip/joiner/types";
// import { Trip } from "@/store/trip/privateTrip/types";
// import { generatePhotoUrlBasedOnEnv } from "@/utils";

// export const addMeta = (name: string, value: string) => {
//   const link = document.createElement("meta");
//   link.setAttribute("property", name);
//   link.setAttribute("content", value);
//   document.head.appendChild(link);
// };

// export const addPageTitle = (title: string) => {
//   document.title = title;
// };

// export const addTripDetailsMeta = (trip: Trip | PublicTrip) => {
//   addPageTitle(trip.name);
//   //for common platform
//   addMeta("title", trip.name);
//   addMeta("description", trip.info_to_travellers);
//   addMeta("image", generatePhotoUrlBasedOnEnv(trip.image_url));
//   //for open graph protocol maintain sites
//   addMeta("og:title", trip.name);
//   addMeta("og:description", trip.info_to_travellers);
//   addMeta("og:image", generatePhotoUrlBasedOnEnv(trip.image_url));
//   //for twitter specific
//   addMeta("twitter:title", trip.name);
//   addMeta("twitter:description", trip.info_to_travellers);
//   addMeta("twitter:image", generatePhotoUrlBasedOnEnv(trip.image_url));
// };
