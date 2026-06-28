// Calls the /api/fetch-product route to read product metadata from a URL.
export type FetchedProduct = {
  title: string | null;
  image: string | null;
  brand: string | null;
  price: string | null;
  url: string;
};

export async function fetchProduct(url: string): Promise<FetchedProduct> {
  const res = await fetch('/api/fetch-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  let data: any = {};
  try { data = await res.json(); } catch { /* non-JSON response */ }
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Something went wrong fetching that link.');
  }
  return data.product as FetchedProduct;
}
