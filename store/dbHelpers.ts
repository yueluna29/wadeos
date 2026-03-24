/**
 * dbHelpers.ts — 数据库安全工具函数
 * 
 * 所有Supabase写入操作的安全封装
 * 处理schema不匹配时的自动降级重试
 * 
 * 🗄️ 被以下模块依赖: useMessages, useMemories
 */

import { supabase } from '../services/supabase';
import { ChatMode } from '../types';

// 根据聊天模式返回对应的Supabase消息表名
export const getTableName = (mode: ChatMode): string => {
  if (mode === 'sms') return 'messages_sms';
  if (mode === 'roleplay') return 'messages_roleplay';
  return 'messages_deep';
};

// 安全插入：如果schema不匹配（比如缺少variants_thinking列），自动降级重试
export const safeDbInsert = async (table: string, payload: any) => {
  console.log(`[DB] Inserting into ${table}:`, payload);
  const { data, error } = await supabase.from(table).insert(payload).select();

  if (error) {
    if (error.code === '42703' || error.message.toLowerCase().includes('column')) {
      console.warn("DB Schema Mismatch: Retrying insert without 'variants_thinking'.");
      const { variants_thinking, ...fallback } = payload;
      const { data: retryData, error: retryError } = await supabase.from(table).insert(fallback).select();
      if (retryError) {
        console.error("Retry Insert Failed", retryError);
      } else {
        console.log(`[DB] Insert successful (retry):`, retryData);
      }
    } else {
      console.error("DB Insert Error", error);
    }
  } else {
    console.log(`[DB] Insert successful:`, data);
  }
};

// 安全更新：同样处理schema不匹配的降级
export const safeDbUpdate = async (table: string, id: string, payload: any) => {
  const { error } = await supabase.from(table).update(payload).eq('id', id);

  if (error) {
    if (error.code === '42703' || error.message.toLowerCase().includes('column')) {
      console.warn("DB Schema Mismatch: Retrying update without 'variants_thinking'.");
      const { variants_thinking, ...fallback } = payload;
      const { error: retryError } = await supabase.from(table).update(fallback).eq('id', id);
      if (retryError) console.error("Retry Update Failed", retryError);
    } else {
      console.error("DB Update Error", error);
    }
  }
};