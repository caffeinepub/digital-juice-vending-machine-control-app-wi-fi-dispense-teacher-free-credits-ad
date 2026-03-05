import { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  JuicePrice,
  StripeConfiguration,
  Transaction,
  UserProfile,
  VendingConfig,
} from "../backend";
import { getDispenseDuration } from "../lib/vendingCatalog";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Vending Config
export function useGetVendingConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VendingConfig | null>({
    queryKey: ["vendingConfig"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVendingConfig();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateVendingConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: VendingConfig) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateVendingConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendingConfig"] });
    },
  });
}

// Pricing
export function useGetPrices() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JuicePrice[]>({
    queryKey: ["prices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPrices();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetPrices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prices: JuicePrice[]) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setPrices(prices);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prices"] });
    },
  });
}

export function useGetJuicePrice(juice: string, size: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["juicePrice", juice, size],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getJuicePrice({ juice, size: BigInt(size) });
    },
    enabled: !!actor && !actorFetching && !!juice && !!size,
  });
}

// Teacher Access
export function useGetTeacherFreeChances() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ["teacherFreeChances", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getTeacherFreeChances();
      } catch (_error) {
        return BigInt(0);
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCanTeacherDispenseForFree() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: [
      "canTeacherDispenseForFree",
      identity?.getPrincipal().toString(),
    ],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.canTeacherDispenseForFree();
      } catch (_error) {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useInitializeTeacherAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacherPrincipal: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.initializeTeacherAccount(
        Principal.fromText(teacherPrincipal),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherFreeChances"] });
    },
  });
}

// Transactions
export function useGetMyTransactions() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Transaction[]>({
    queryKey: ["myTransactions", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyTransactions();
      } catch (_error) {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetTransactionRange() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ start, end }: { start: number; end: number }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTransactionRange(BigInt(start), BigInt(end));
    },
  });
}

// Stripe
export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isStripeConfigured"] });
    },
  });
}

// WiFi Dispense
export function useDispenseViaWifi() {
  const { data: vendingConfig } = useGetVendingConfig();

  return useMutation({
    mutationFn: async ({ juice, size }: { juice: string; size: number }) => {
      const url = vendingConfig?.vendingUrl;
      if (!url)
        throw new Error(
          "Vending machine URL not configured. Please ask your admin to set it in Admin > Configuration.",
        );
      const durationSeconds = getDispenseDuration(size);
      const response = await fetch(`${url}/dispense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juice, size, durationSeconds }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Vending machine error: ${response.status} ${text}`);
      }
      return true;
    },
  });
}
