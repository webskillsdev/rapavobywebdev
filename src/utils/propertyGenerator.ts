export const propertyTitles = [
  "3 Bedroom Duplex in Lekki",
  "2 Bedroom Apartment in Victoria Island",
  "4 Bedroom Penthouse in Ikoyi",
  "1 Bedroom Studio in Yaba",
  "5 Bedroom Mansion in Banana Island",
  "Modern 2 Bedroom Flat in Ajah",
  "Luxury 3 Bedroom in Bukit Jalil",
  "Cozy 1 Bedroom in Ikeja",
  "Spacious 4 Bedroom Villa in Chevron",
  "Contemporary 2 Bedroom in Oniru",
];

export const propertyDescriptions = [
  "This beautiful apartment features modern amenities, free WiFi, fully equipped kitchen, bathtub, and 24/7 security.",
  "Located in a prime area with easy access to schools, hospitals, and shopping centers. Well-maintained building with excellent facilities.",
  "Newly renovated property with ceramic tiles, air conditioning, modern bathroom fixtures, and dedicated parking space.",
  "Serene environment perfect for families. Includes garden space, laundry room, and backup power supply.",
  "Smart home features, high-speed internet, modern kitchen appliances, spacious living area, and premium finishes throughout.",
  "Close to transportation hub with excellent neighborhood amenities. Includes gym access, swimming pool, and 24/7 concierge.",
  "Tastefully furnished with quality furniture, natural lighting, well-ventilated rooms, and secure gated environment.",
  "Move-in ready property featuring ceramic floors, painted walls, window bars, and accessible to major roads.",
  "Luxury apartment with Italian finishing, state-of-the-art kitchen, premium bathroom, and panoramic views.",
  "Well-built structure with reinforced walls, quality plumbing, electrical fixtures, and excellent security features.",
];

export const priceRanges = [
  2500000, 3500000, 4500000, 5500000, 6500000, 7500000, 8500000, 9500000,
  10500000, 15000000, 20000000, 25000000, 30000000, 45000000, 60000000,
  75000000, 85000000, 100000000, 150000000, 200000000,
];

export const generateRandomProperty = () => {
  const randomTitle =
    propertyTitles[Math.floor(Math.random() * propertyTitles.length)];
  const randomDescription =
    propertyDescriptions[
      Math.floor(Math.random() * propertyDescriptions.length)
    ];
  const randomPrice =
    priceRanges[Math.floor(Math.random() * priceRanges.length)];

  return {
    title: randomTitle,
    description: randomDescription,
    price: randomPrice,
  };
};

export const formatCurrencyToNumber = (value?: string | number): number => {
  if (!value) return 0;

  return Number(String(value).replace(/,/g, ""));
};

export const getInitials = (fullName?: string) => {
  if (!fullName) return "";

  const names = fullName.trim().split(" ");

  if (names.length === 1) {
    return names[0][0].toUpperCase();
  }

  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

// export const getYoutubeEmbedUrl = (url: string) => {
//   if (!url) return "";

//   // youtu.be/VIDEO_ID
//   if (url.includes("youtu.be")) {
//     const videoId = url.split("/").pop();
//     return `https://www.youtube.com/embed/${videoId}`;
//   }

//   // youtube.com/watch?v=VIDEO_ID
//   const regExp =
//     /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;

//   const match = url.match(regExp);

//   const videoId = match && match[7].length === 11 ? match[7] : null;

//   return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
// };

export const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return "";

  let videoId = null;

  // youtu.be/VIDEO_ID
  if (url.includes("youtu.be")) {
    videoId = url.split("/").pop()?.split("?")[0];
  } else {
    // youtube.com/watch?v=VIDEO_ID
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;
    const match = url.match(regExp);
    videoId = match && match[7].length === 11 ? match[7] : null;
  }

  if (!videoId) return "";

  // Add these params to make embedding work
  return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&showinfo=0`;
};

// Renamed to getYoutubeVideoId since we now return just the ID not the full URL
export const getYoutubeVideoId = (url: string): string => {
  if (!url) return "";

  // youtu.be/VIDEO_ID
  if (url.includes("youtu.be")) {
    return url.split("/").pop()?.split("?")[0] || "";
  }

  // youtube.com/watch?v=VIDEO_ID
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : "";
};
