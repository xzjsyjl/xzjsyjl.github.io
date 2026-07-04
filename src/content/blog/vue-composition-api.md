---
title: "Vue 3 Composition API 实战指南"
description: "详细介绍 Vue 3 Composition API 的核心概念和实际使用场景。"
pubDate: 2026-06-20
tags: ["vue", "frontend"]
---

## 为什么选择 Composition API

Composition API 解决了 Options API 在复杂组件中的逻辑复用问题。

## 核心 API

### ref 和 reactive

```typescript
import { ref, reactive } from "vue";

const count = ref(0);
const state = reactive({ name: "Vue" });
```

### computed 和 watch

```typescript
import { computed, watch } from "vue";

const doubled = computed(() => count.value * 2);
watch(count, (newVal) => console.log(newVal));
```

## 组合式函数

将逻辑提取到可复用的函数中：

```typescript
function useCounter(initial = 0) {
  const count = ref(initial);
  const increment = () => count.value++;
  return { count, increment };
}
```

## 总结

Composition API 让逻辑复用变得前所未有的简单。
