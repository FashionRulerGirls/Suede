// Shared selection/navigation state, replacing the prototype's window.__* globals.
export const appState: Record<string, any> = {
  brand: null,
  member: null,
  inquiry: null,
  review: null,
  profileView: null,
  lookbookTab: null,
  capsuleDrop: null,
  reviewBrand: null,
  inquiryBrand: null,
  claimBrand: null,
  capsuleBrands: null, // cached Capsule directory so returning renders instantly
  lookbookReviews: null, lookbookInquiries: null, lookbookUser: undefined, // cached Lookbook feed (per viewer)
  collectiveMembers: null, collectiveUser: undefined, // cached Collective directory (per viewer)
};
