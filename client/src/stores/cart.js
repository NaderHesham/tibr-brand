import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(
  persist(
    (set) => ({
      items: [],

      addItem: (product, size = null, qty = 1) =>
        set((s) => {
          const key = `${product.id}__${size ?? ""}`;
          const existing = s.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === key ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...s.items, { key, product, size, qty }] };
        }),

      removeItem: (key) =>
        set((s) => ({ items: s.items.filter((i) => i.key !== key) })),

      updateQty: (key, qty) =>
        set((s) => ({
          items:
            qty < 1
              ? s.items.filter((i) => i.key !== key)
              : s.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "rb-cart" }
  )
);
