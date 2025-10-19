import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { type AppRouter, createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createQueryClient } from "./query-client";

/**
 * tRPC 服务器端配置
 *
 * 这个文件专门用于配置 tRPC 在 React Server Components (RSC) 环境中的服务器端设置。
 * 它提供了在服务器端渲染时使用 tRPC 的必要工具和上下文。
 */

/**
 * 创建 tRPC 上下文
 *
 * 这个函数包装了 `createTRPCContext` 帮助器，为 tRPC API 提供所需的上下文，
 * 特别是在处理来自 React Server Component 的 tRPC 调用时。
 *
 * 使用 `cache` 包装确保在同一个渲染过程中多次调用时返回相同的结果，
 * 避免不必要的重复计算。
 *
 * @returns {Promise<TRPCContext>} 配置好的 tRPC 上下文对象
 */
const createContext = cache(async () => {
	// 获取 Next.js 请求头信息
	const heads = new Headers(await headers());

	// 设置 tRPC 来源标识，用于调试和追踪
	heads.set("x-trpc-source", "rsc");

	// 创建并返回 tRPC 上下文
	return createTRPCContext({
		headers: heads,
	});
});

/**
 * 获取查询客户端
 *
 * 使用缓存包装查询客户端创建函数，确保在同一个渲染过程中
 * 多次调用时返回相同的查询客户端实例。
 */
const getQueryClient = cache(createQueryClient);

/**
 * 创建 tRPC 调用器
 *
 * 使用配置好的上下文创建 tRPC 调用器，用于在服务器端执行 tRPC 操作。
 */
const caller = createCaller(createContext);

/**
 * 导出 tRPC 服务器端工具
 *
 * 使用 `createHydrationHelpers` 创建在 RSC 环境中使用的 tRPC 工具：
 *
 * - `api`: tRPC 客户端实例，用于在服务器组件中调用 tRPC 过程
 * - `HydrateClient`: 用于在客户端组件中预填充数据的组件
 *
 * @type {{ trpc: TRPCClient<AppRouter>, HydrateClient: React.ComponentType<HydrateClientProps> }}
 */
export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
	caller,
	getQueryClient,
);
